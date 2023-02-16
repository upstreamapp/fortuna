import { Status } from '../../../models'

/**
 * Update the syncing boolean in the cache kept in the Status table.
 *
 * @remarks
 * This function makes use of the Status table, where up-to-date processing information is cached, and allows one to set the current syncing status.
 *
 * @param {syncing} syncing - The current syncing status we wish to update our Status table cache to.
 *
 * @returns {Promise<number[]>} Promise<number[]> A promise that resolves to an array with a number indicating the number of records that were updated. It should only be one, the cache.
 */
export default async function updateSyncing(
  syncing: boolean
): Promise<number[]> {
  return Status.update(
    {
      syncing
    },
    {
      where: {
        id: 'status'
      }
    }
  )
}
