import Bluebird from 'bluebird'
import { chunk, uniqBy } from 'lodash'
import { format } from 'node-pg-format'
import { ProcessingGoal, TokenType } from '../@types'
import { abi } from '../common/abi'
import updateHighestBlock from '../db/operations/statusTable/updateHighestBlock'
import updateSyncing from '../db/operations/statusTable/updateSyncing'
import updateSyncingBlocks from '../db/operations/statusTable/updateSyncingBlocks'
import { sequelize } from '../models'
import {
  REALTIME_BATCH,
  REALTIME_PARALLEL_QUERIES,
  BACKFILL_BATCH,
  BACKFILL_PARALLEL_QUERIES
} from './constants'
import { getEthClient } from './getEthClient'
import getLogs from './getLogs'
import Logger from './logger'
import parseLog from './parseLog'
import {
  queueAllContractInfoRecordsForBackfill,
  queueUpdateExistingContractInfoByBlockJobs,
  IContractInfoJobDetailsByTokenAddress,
  IContractInfoJobDetailsByBlock
} from './queueContractInfoJobs'
import queueTokenInfoJobs, { ITokenInfoJobDetails } from './queueTokenInfoJobs'
import stats from './stats'

type FormattedTransaction = {
  tokenType: TokenType
  address: string
  from: string
  to: string
  operator?: string
  tokenId?: string
  value?: string
  transactionHash: string
  logIndex: number
  blockNumber: number
}

const logger = Logger(module)

/**
 * Process the transfer logs from fromBlock to toBlock.
 *
 * @remarks
 * This function is used by both, the backfilling and realtime, processes, with the goal of extracting transfer logs, transforming these logs into the format expected by our database, and storing these formats into our database.
 *
 * @param {fromBlock} fromBlock - The first block to process from
 * @param {toBlock} toBlock - The last block to process to
 * @param {goal} goal - The processing goal that this function should abide by as it pertains to which environment variables to use and the resetting of the toBlock.
 *
 * @returns {Promise<void>} This function does not return anything useful as its goal is to be the heartbeat of the actual processing of transfer logs and adding them directly into the database.
 */
export default async function processBlocks(
  fromBlock: number,
  toBlock: number,
  goal: ProcessingGoal
): Promise<void> {
  const ethClient = await getEthClient()
  const goalIsBackfill = goal === ProcessingGoal.BACKFILL
  const [batch, parallelQueries] = goalIsBackfill
    ? [BACKFILL_BATCH, BACKFILL_PARALLEL_QUERIES]
    : [REALTIME_BATCH, REALTIME_PARALLEL_QUERIES]

  await updateSyncing(true)

  try {
    let fromBlockStart = fromBlock

    while (fromBlockStart <= toBlock) {
      const displayFrom = fromBlockStart
      const displayTo =
        fromBlockStart + parallelQueries * batch + parallelQueries - 1

      await updateSyncingBlocks([displayFrom, displayTo])

      const gethDateStart = Date.now()

      // fetch transaction logs and parallelizing the queries to spread the load
      const logs = Array.from(Array(parallelQueries).keys()).map(() => {
        // batch each query by a certain number of blocks
        const logPromises = getLogs(fromBlockStart, fromBlockStart + batch)
        fromBlockStart = fromBlockStart + batch + 1
        return logPromises
      })

      const logsFound = (await Promise.all(logs)).flat()
      stats.gauge(`logs_size`, logsFound.length)

      const gethDateEnd = Date.now() - gethDateStart
      stats.histogram(`fetch_geth_transactions`, gethDateEnd)

      // backfill until the last published block so that the realtime processing can begin
      if (goalIsBackfill) {
        toBlock = await ethClient.getBlockNumber()
      }

      if (!logsFound.length) {
        continue
      }

      // parse the logs found into a readable format
      const parsedLogs = parseLog(logsFound, abi)

      if (!parsedLogs.length) {
        continue
      }

      // format each parsed log into a transaction that'll be stored in the database
      const formattedTransactions: FormattedTransaction[] = parsedLogs.flatMap(
        log => {
          const tokenType =
            log.name === 'Transfer'
              ? log.args.tokenId
                ? TokenType.ERC_721
                : TokenType.ERC_20
              : TokenType.ERC_1155

          if (log.name === 'TransferBatch') {
            return (log.args.ids || []).map((id, idx) => ({
              tokenType,
              address: log.address.toLowerCase(),
              from: log.args.from.toLowerCase(),
              to: log.args.to.toLowerCase(),
              operator: log.args.operator?.toLowerCase(),
              tokenId: id || log.args.tokenId,
              value: log.args.values?.[idx],
              transactionHash: log.transactionHash.toLowerCase(),
              logIndex: log.logIndex,
              blockNumber: log.blockNumber
            }))
          }

          return {
            tokenType,
            address: log.address.toLowerCase(),
            from: log.args.from.toLowerCase(),
            to: log.args.to.toLowerCase(),
            operator: log.args.operator?.toLowerCase(),
            tokenId: log.args.tokenId || log.args.id,
            value: log.args.value,
            transactionHash: log.transactionHash.toLowerCase(),
            logIndex: log.logIndex,
            blockNumber: log.blockNumber
          }
        }
      )

      // queue each token that has been transferred so that the tokenInfoServer can extract their metadata.

      stats.gauge(`insert_batch_size`, formattedTransactions.length)

      const tokenContractJobDetails: Array<
        IContractInfoJobDetailsByTokenAddress | ITokenInfoJobDetails
      > = formattedTransactions.map(tx => ({
        tokenAddress: tx.address,
        tokenId: tx.tokenId,
        transferBlockNumber: tx.blockNumber,
        goal
      }))

      await createNewContractInfoRecords(tokenContractJobDetails)
      await queueTokenInfoJobs(tokenContractJobDetails)
      await createTokenTransferRecords(formattedTransactions)

      const highestBlock = formattedTransactions.at(-1)?.blockNumber
      if (highestBlock) {
        await updateHighestBlock(highestBlock)
      }

      stats.gauge(`latest_block`, displayTo)
    }
  } catch (err) {
    // @ts-ignore
    logger.warn(err.message)
    logger.warn(err)

    await updateSyncing(false)

    throw err
  }

  if (goalIsBackfill) {
    queueAllContractInfoRecordsForBackfill() // run in background while we also start realtime (no await)
    return
  }

  // Update existing ERC20, ERC721, ERC1155 contracts on any new block that might also not be transfer events above
  const blockContractJobDetails: IContractInfoJobDetailsByBlock[] = []
  for (let block = fromBlock; block <= toBlock; block++) {
    blockContractJobDetails.push({
      blockNumber: block
    })
  }
  await queueUpdateExistingContractInfoByBlockJobs(blockContractJobDetails)
}

async function createNewContractInfoRecords(
  tokens: { tokenAddress: string }[]
) {
  const dateStart = Date.now()
  // insert each token address into the ContractInfo table if it doesn't already exist. If it exists, skip it.
  await Bluebird.Promise.mapSeries(
    chunk(
      uniqBy(tokens, token => token.tokenAddress).map(token => [
        token.tokenAddress,
        new Date()
      ]),
      1000
    ),
    tokenChunk =>
      sequelize.query(
        format(
          `INSERT INTO "ContractInfo" ("address","updatedAt") VALUES %L ON CONFLICT DO NOTHING;`,
          tokenChunk
        )
      )
  )
  const dateEndDif = Date.now() - dateStart
  stats.histogram(`submit_contractInfo_transactions_to_db`, dateEndDif)
}

async function createTokenTransferRecords(
  formattedTransactions: FormattedTransaction[]
) {
  const dateStart = Date.now()
  // insert each token transfer into the TokenTransfer table if it doesn't already exist. If it exists, skip it.
  await Bluebird.Promise.mapSeries(
    chunk(formattedTransactions.map(Object.values), 1000),
    txsChunk =>
      sequelize.query(
        format(
          `INSERT INTO "TokenTransfer" ("tokenType", "tokenAddress", "fromAddress", "toAddress", "operator", "tokenId", "value", "transactionHash", "logIndex", "blockNumber") VALUES %L ON CONFLICT DO NOTHING;`,
          txsChunk
        )
      )
  )
  const dateEndDif = Date.now() - dateStart
  stats.histogram(`submit_transactions_to_db`, dateEndDif)
}
