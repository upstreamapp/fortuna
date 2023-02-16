import { Status } from '../../../models'

/**
 * Update the highest processed block in the cache kept in the Status table.
 *
 * @remarks
 * This function makes use of the Status table, where up-to-date processing information is cached, and allows one to set the highest block that has been processed so far.
 *
 * @param {highestBlock} highestBlock - The current highest processed block we wish to update our Status table cache to.
 *
 * @returns {Promise<number[]>} Promise<number[]> A promise that resolves to an array with a number indicating the number of records that were updated. It should only be one, the cache.
 */
export default async function updateHighestBlock(
  highestBlock: number
): Promise<number[]> {
  return Status.update(
    {
      highestBlock
    },
    {
      where: {
        id: 'status'
      }
    }
  )
}
