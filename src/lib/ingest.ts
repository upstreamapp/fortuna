import getHighestBlock from '../db/operations/statusTable/getHighestBlock'
import backfillProcessing from './backfillProcessing'
import { NUM_OF_BLOCKS_TO_REPROCESS } from './constants'
import { getEthClient } from './getEthClient'
import Logger from './logger'
import realtimeProcessing from './realtimeProcessing'

const logger = Logger(module)

/**
 * Ingests transfer logs in two stages, backfilling and realtime. First by backfilling from the latest processed block until the latest real-time processed block. Then it switches from backfilling to realtime processing.
 *
 * @remarks
 * This function is only called once, during the start of the monitoring server.
 *
 * @returns {Promise<void>} This function is not used for its return value.
 */
export default async function ingest(): Promise<void> {
  logger.info(`Starting ingest process...`)

  // get the Eth client that we will be using to interface with the chain we've selected
  const ethClient = await getEthClient()
  logger.info(`> Connected to eth node`)

  const network = (await ethClient.getNetwork()).name
  logger.info(`> Using chain: ${network}`)

  const latestBlock = await ethClient.getBlockNumber()
  logger.info(`> Got current block number: ${latestBlock}`)

  // get the highest block that has already been processed, so that we can start ingesting logs from that block on and not start from the beginning.
  const highestBlock = await getHighestBlock()
  logger.info(`> Got latest processed block number: ${highestBlock}`)

  // backfill until the latest block before processing transactions realtime
  if (highestBlock < latestBlock) {
    logger.info(
      `> Starting backfill for ${
        highestBlock - NUM_OF_BLOCKS_TO_REPROCESS
      } -> ${latestBlock}`
    )
    await backfillProcessing(
      highestBlock - NUM_OF_BLOCKS_TO_REPROCESS,
      latestBlock
    )
  }

  logger.info(`> Starting realtime processing`)

  // start processing realtime transactions
  await realtimeProcessing()
}
