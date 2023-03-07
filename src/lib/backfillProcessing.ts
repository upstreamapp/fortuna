import { ProcessingGoal, SyncingState } from '../@types'
import updateSyncingState from '../db/operations/statusTable/updateSyncingState'
import Logger from './logger'
import processBlocks from './processBlocks'

const logger = Logger(module)

/**
 * Backfill transfer events inclusively from the passed in block numbers.
 *
 * @remarks
 * This function allows for the monitoring server to play catch up to the current block being mined so that realtime processing can take over and monitoring can happen one block at a time.
 *
 * @param {fromBlock} fromBlock - The first block to process from
 * @param {toBlock} toBlock - The last block to process to
 *
 * @returns {Promise<void>} `Promise<void>` - This function is not used for its return type.
 */
export default async function backfillProcessing(
  fromBlock: number,
  toBlock: number
): Promise<void> {
  logger.info(`Starting backfill from ${fromBlock} to ${toBlock}`)

  // update the syncing state of the cache kept in the Status table to BACKFILLING
  await updateSyncingState(SyncingState.BACKFILLING)

  // process the blocks fromBlock-toBlock with the goal of backfilling
  await processBlocks(fromBlock, toBlock, ProcessingGoal.BACKFILL)
}
