import Logger from '../lib/logger'
import { getEthClient } from './getEthClient'

const logger = Logger(module)

/**
 * Check the health of the Eth client.
 *
 * @remarks
 * This function attempts to get the latest block through the Eth client.
 *
 * @returns {Promise<boolean>} A promise that resolves to a boolean that indicates whether the Eth client is healthy, `true`, and unhealthy, `false`.
 */
export default async function ethClientHealth() {
  try {
    const ethClient = await getEthClient()
    const blockNumber = await ethClient.getBlockNumber()
    return typeof blockNumber === 'number'
  } catch (err) {
    logger.warn(`Failed at ethClientHealth: ${err}`)
    return false
  }
}
