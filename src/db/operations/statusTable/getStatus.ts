import Logger from '../../../lib/logger'
import { Status } from '../../../models'

const logger = Logger(module)

/**
 * Get the status cache kept in the Status table.
 *
 * @remarks
 * This function makes use of the Status table, where up-to-date processing information is cached, and allows one to get the latest status cache.
 *
 * @returns {Promise<Status | null>} Promise<Status | null> A promise that resolves to the status record or null if the status cache does not exist.
 */
export default async function getStatus(): Promise<Status | null> {
  try {
    return Status.findOne({
      where: {
        id: 'status'
      }
    })
  } catch (err) {
    logger.warn(`Failed at getStatus: ${err}`)
    return null
  }
}
