import { ProcessingGoal, SyncingState } from '../@types'
import updateSyncingState from '../db/operations/statusTable/updateSyncingState'
import { REALTIME_START_REPEAT } from './constants'
import { getEthClient } from './getEthClient'
import Logger from './logger'
import processBlocks from './processBlocks'

const logger = Logger(module)

/**
 * Process transfer events as they happen in realtime.
 *
 * @remarks
 * This function allows for the monitoring server to process each mined block in realtime so that all newly created blocks are processed.
 *
 * @returns {Promise<void>} This function is not used for its return type.
 */
export default async function realtimeProcessing(): Promise<void> {
  const ethClient = await getEthClient()
  const latestBlock = await ethClient.getBlockNumber()

  // the padding ensures that we don't miss out on any blocks
  let lastProcessedBlock = latestBlock - REALTIME_START_REPEAT

  await updateSyncingState(SyncingState.REALTIME)

  logger.info(`Starting realtime processing from ${lastProcessedBlock}`)

  // listen to each mined block as they're published in realtime and process them.
  ethClient.on('block', async (blockNumber: number) => {
    logger.info(`Realtime processing: ${blockNumber}`)

    // this allows us to make use of the padding so that we can reprocess the last few blocks in case there's any hiccup while the backfill processing ended and the realtime processing started.
    const tempLastProcessedBlock = lastProcessedBlock
    lastProcessedBlock = blockNumber

    // the processBlocks function is able to handle the scenario where the fromBlock and toBlock are the same value
    await processBlocks(
      tempLastProcessedBlock,
      blockNumber,
      ProcessingGoal.REALTIME
    )
  })
}
