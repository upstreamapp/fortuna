import { EthNetwork } from '../../../@types'
import {
  MAINNET_FIRST_TRANSFER_BLOCK,
  GOERLI_FIRST_TRANSFER_BLOCK
} from '../../../lib/constants'
import { network } from '../../../lib/getEthClient'
import Logger from '../../../lib/logger'
import { Status } from '../../../models'

const logger = Logger(module)

/**
 * Get the highest processed block.
 *
 * @remarks
 * This function makes use of the Status table, where up-to-date processing information is cached.
 *
 * @returns {Promise<number>} indicating the highest block that has been processed. In case of any error while retrieving this information from the Status table or if there hasn't been any processed block yet, the return is the first block with a transfer event from either the Ethereum Mainnet or Goerli Test Network.
 */
export default async function getHighestBlock(): Promise<number> {
  try {
    const status = await Status.findOne({
      where: {
        id: 'status'
      },
      attributes: ['highestBlock']
    })
    if (!status || !status.highestBlock) {
      throw new Error(`Status record not found`)
    }

    return status.highestBlock
  } catch (err) {
    logger.warn(`Failed at getHighestBlock: ${err}`)

    return network === EthNetwork.MAINNET
      ? MAINNET_FIRST_TRANSFER_BLOCK
      : GOERLI_FIRST_TRANSFER_BLOCK
  }
}
