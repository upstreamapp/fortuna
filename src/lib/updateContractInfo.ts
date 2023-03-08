import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { BlockWithTransactions } from '@ethersproject/abstract-provider'
import Bluebird from 'bluebird'
import { differenceInDays, isAfter } from 'date-fns'
import { Contract, BigNumber as BN } from 'ethers'
import { Op } from 'sequelize'
import knownContracts from '../common/knownContracts'
import { CONTRACT_INFO_MAX_AGE_IN_DAYS } from './constants'
import getContractSpec from './getContractSpec'
import { getEthClient } from './getEthClient'
import Logger from './logger'
import {
  IContractInfoJobDetailsByTokenAddress,
  IContractInfoJobDetailsByBlock
} from './queueContractInfoJobs'
import safeCall from './safeCall'
import stats from './stats'
import { ContractInfo } from '@models/index'
import { ProcessingGoal } from '@types'

const abi = [
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function symbol() view returns (string)'
]

const logger = Logger(module)

export async function updateExistingContractInfoByBlock({
  blockNumber
}: IContractInfoJobDetailsByBlock): Promise<void> {
  const client = await getEthClient()
  const blockWithTransactions = await client.getBlockWithTransactions(
    blockNumber
  )

  const possibleContractAddresses = blockWithTransactions.transactions.reduce(
    (set: Set<string>, tx) => {
      if (tx.from) {
        set.add(tx.from.toLowerCase())
      }
      if (tx.to) {
        set.add(tx.to.toLowerCase())
      }
      return set
    },
    new Set<string>()
  )

  const possibleContractAddressUpdates = await ContractInfo.findAll({
    where: {
      address: {
        [Op.in]: [...possibleContractAddresses]
      }
    }
  })

  await Bluebird.Promise.map(
    possibleContractAddressUpdates,
    contractInfo =>
      updateContractInfoByTokenAddress(
        {
          tokenAddress: contractInfo.address
        },
        blockWithTransactions
      ),
    { concurrency: 5 }
  )
}

/**
 * Update, or add, a contracts's metadata into the `ContractInfo` table.
 * @remarks This function not only gets metadata from the contract in the blockchain itself.
 * @param {transferObject} transferObject - {tokenAddress: The address of the token, transferBlockNumber: Optional transfer block number, goal: Optional Current goal of the process, fullUpdate: Optional boolean whether to perform full update}
 * @param {blockWithTransactions} blockWithTransactions - The block (with transactions) when updating contractinfo by block.
 * @returns {Promise<void>} This function does not return any useful value.
 */
export async function updateContractInfoByTokenAddress(
  { tokenAddress, goal }: IContractInfoJobDetailsByTokenAddress,
  blockWithTransactions?: BlockWithTransactions
): Promise<void> {
  const address = tokenAddress.toLowerCase()
  const startTime = Date.now()
  stats.increment('update_contract_called')

  try {
    const [contractInfo, created] = await ContractInfo.findOrCreate({
      where: {
        address
      }
    })

    if (!created && goal === ProcessingGoal.BACKFILL) {
      stats.increment('update_contract_backfill')
      return
    }

    const updateSpec =
      created ||
      !contractInfo.updatedMetaInfoAt ||
      differenceInDays(Date.now(), contractInfo.updatedMetaInfoAt) >=
        CONTRACT_INFO_MAX_AGE_IN_DAYS

    const updateBlockMetrics =
      !!blockWithTransactions &&
      (!contractInfo.lastTransactionBlock ||
        blockWithTransactions.number > contractInfo.lastTransactionBlock)

    if (!updateSpec && !updateBlockMetrics && contractInfo.ethBalance) {
      stats.increment('update_contract_not_stale')
      return
    }

    const client = await getEthClient()
    const contract = new Contract(address, abi, client)

    const [contractName, symbol, decimals, tokenType, ethBalance, block] =
      await Promise.all([
        updateSpec ? safeCall<string>(contract, 'name') : contractInfo.name,
        updateSpec ? safeCall<string>(contract, 'symbol') : contractInfo.symbol,
        updateSpec ? safeCall<BN>(contract, 'decimals') : contractInfo.decimals,
        updateSpec ? getContractSpec(address) : contractInfo.tokenType,
        client.getBalance(address),
        updateBlockMetrics ? blockWithTransactions : undefined
      ])

    if (updateSpec) {
      contractInfo.name = contractName || knownContracts[address]?.name
      contractInfo.symbol = symbol || knownContracts[address]?.symbol
      contractInfo.tokenType = tokenType
      contractInfo.decimals = decimals
        ? +decimals.toString()
        : knownContracts[address]?.decimals

      contractInfo.updatedMetaInfoAt = new Date()
    }

    if (updateBlockMetrics) {
      contractInfo.lastTransactionBlock = blockWithTransactions.number
      if (block?.timestamp) {
        const blockTimestamp = new Date(block.timestamp * 1000)
        if (
          !contractInfo.lastTransactionAt ||
          isAfter(blockTimestamp, contractInfo.lastTransactionAt)
        ) {
          contractInfo.lastTransactionAt = blockTimestamp
        }
      }
    }
    contractInfo.ethBalance = BigInt(ethBalance.toString())

    await contractInfo.save()
    stats.histogram('update_contract_finished', Date.now() - startTime)
    return
  } catch (err) {
    logger.warn(`Failed at updateContractInfo(${tokenAddress}, ${err}`)
    stats.histogram('update_contract_failed', Date.now() - startTime)
    throw new Error(
      `Failed at updateContractInfo:[${tokenAddress}] block: [${blockWithTransactions?.number}]`
    )
  }
}
