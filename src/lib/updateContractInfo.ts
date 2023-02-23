import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { differenceInDays, isAfter } from 'date-fns'
import { Contract, BigNumber as BN } from 'ethers'
import { QueryTypes } from 'sequelize'
import knownContracts from '../common/knownContracts'
import { CONTRACT_INFO_MAX_AGE_IN_DAYS } from './constants'
import getContractSpec from './getContractSpec'
import { getEthClient } from './getEthClient'
import Logger from './logger'
import { IContractInfoJobDetails } from './queueContractInfoJobs'
import safeCall from './safeCall'
import stats from './stats'
import { ContractInfo } from '@models/ContractInfo/ContractInfo'
import { sequelize } from '@models/index'
import { ProcessingGoal } from '@types'

const abi = [
  'function decimals() view returns (uint8)',
  'function name() view returns (string)',
  'function symbol() view returns (string)'
]

const logger = Logger(module)

async function getLatestBlock(tokenAddress: string) {
  const row = await sequelize.query<{ blockNumber: number }>(
    `SELECT
      "blockNumber"
    FROM
      "TokenTransfer"
    WHERE
      "tokenAddress" = '${tokenAddress}'
    ORDER BY
      "blockNumber" DESC
    LIMIT 1;`,
    { raw: true, type: QueryTypes.SELECT, plain: true }
  )
  return row?.blockNumber
}

/**
 * Update, or add, a contracts's metadata into the `ContractInfo` table.
 *
 * @remarks
 * This function not only gets metadata from the contract in the blockchain itself.
 *
 * @param {tokenAddress} tokenAddress - The address of the token.
 * @param {latestBlockNumber} latestBlockNumber - The block number of token transfer.

 * @returns {Promise<void>} This function does not return any useful value.
 */
async function updateContractInfo({
  tokenAddress,
  blockNumber,
  goal,
  full = false
}: IContractInfoJobDetails): Promise<void> {
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
      return
    }

    // if creating new or stale, update all data no matter what
    if (
      created ||
      (contractInfo.updatedMetaInfoAt &&
        differenceInDays(Date.now(), contractInfo.updatedMetaInfoAt) >=
          CONTRACT_INFO_MAX_AGE_IN_DAYS)
    ) {
      full = true
    }

    const client = await getEthClient()
    const contract = new Contract(address, abi, client)

    const latestBlockNumber = blockNumber || (await getLatestBlock(address))

    const blockTIme = Date.now()
    const [contractName, symbol, decimals, tokenType, ethBalance, block] =
      await Promise.all([
        full ? safeCall<string>(contract, 'name') : contractInfo.name,
        full ? safeCall<string>(contract, 'symbol') : contractInfo.symbol,
        full ? safeCall<BN>(contract, 'decimals') : contractInfo.decimals,
        full ? getContractSpec(address) : contractInfo.tokenType,
        client.getBalance(address),
        latestBlockNumber ? client.getBlock(latestBlockNumber) : undefined
      ])

    console.log(
      `time take for block and eth balance = ${Date.now() - blockTIme}`
    )

    // full
    contractInfo.name = contractName || knownContracts[address]?.name
    contractInfo.symbol = symbol || knownContracts[address]?.symbol
    contractInfo.tokenType = tokenType
    contractInfo.decimals = decimals
      ? +decimals.toString()
      : knownContracts[address]?.decimals
    if (full) {
      contractInfo.updatedMetaInfoAt = new Date()
    }

    // always
    contractInfo.ethBalance = BigInt(ethBalance.toString())

    if (
      latestBlockNumber &&
      latestBlockNumber > (contractInfo.lastTransactionBlock || 0)
    ) {
      contractInfo.lastTransactionBlock = latestBlockNumber
    }

    if (block?.timestamp) {
      const blockTimestanp = new Date(block.timestamp * 1000)
      if (
        !contractInfo.lastTransactionAt ||
        isAfter(blockTimestanp, contractInfo.lastTransactionAt)
      ) {
        contractInfo.lastTransactionAt = new Date(block.timestamp * 1000)
      }
    }

    await contractInfo.save()
    stats.histogram('update_contract_called', Date.now() - startTime)
    console.log('time taken', Date.now() - startTime)
  } catch (err) {
    console.log(err)
    logger.warn(`Failed at updateContractInfo(${tokenAddress}, ${err}`)
    stats.histogram('update_contract_failed', Date.now() - startTime)
  }
}

export default updateContractInfo
