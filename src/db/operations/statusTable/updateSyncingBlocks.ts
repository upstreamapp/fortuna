import { Status } from '../../../models'

/**
 * Update the syncingBlocks array in the cache kept in the Status table.
 *
 * @remarks
 * This function makes use of the Status table, where up-to-date processing information is cached, and allows one to set the current blocks that are being synced.
 *
 * @param {syncingBlocks} syncingBlocks - The current blocks that are being synced that we wish to update our Status table cache to.
 *
 * @returns {Promise<number[]>} Promise<number[]> A promise that resolves to an array with a number indicating the number of records that were updated. It should only be one, the cache.
 */
export default async function updateSyncingBlocks(
  syncingBlocks: number[]
): Promise<number[]> {
  return Status.update(
    {
      syncingBlocks
    },
    {
      where: {
        id: 'status'
      }
    }
  )
}
