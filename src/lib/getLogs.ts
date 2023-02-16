import { Log } from '@ethersproject/abstract-provider'
import { transferSig, transferBatchSig, transferSingleSig } from '../common/abi'
import { getEthClient } from './getEthClient'

/**
 * Get logs from the chain that the app is connected to in the fromBlock-toBlock range.
 *
 * @remarks
 * This function makes use of the topics array, which allows filtering to be done on the Ethereum client and remove logs that are not transfer logs.
 *
 * @param {fromBlock} fromBlock - The first block to process from
 * @param {toBlock} toBlock - The last block to process to
 *
 * @returns {Promise<Log[]>} `Promise<Log[]>` - An array of all of the logs that match our transfer event signatures.
 */
export default async function getLogs(
  fromBlock: number,
  toBlock: number
): Promise<Log[]> {
  const ethClient = await getEthClient()

  return ethClient.getLogs({
    topics: [[transferSig, transferBatchSig, transferSingleSig]],
    fromBlock,
    toBlock
  })
}
