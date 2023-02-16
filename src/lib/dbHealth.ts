import Logger from '../lib/logger'
import { sequelize } from '../models'

const logger = Logger(module)

/**
 * Check the health of the database connection.
 *
 * @remarks
 * This function checks the connection to the database by attempting to authenticate.
 *
 * @returns {Promise<boolean>} A promise that resolves to a boolean that indicates whether the database connection is healthy, `true`, and unhealthy, `false`.
 */
export default async function dbHealth(): Promise<boolean> {
  try {
    await sequelize.authenticate()
    return true
  } catch (err) {
    logger.warn(`Failed at dbHealth: ${err}`)
    return false
  }
}
