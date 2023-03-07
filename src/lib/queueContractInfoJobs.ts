import SQS from 'aws-sdk/clients/sqs'
import Bluebird from 'bluebird'
import { chunk, orderBy, uniqBy } from 'lodash'
import { CONTRACT_INFO_QUEUE_URL } from './constants'
import Logger from './logger'
import stats from './stats'
import { ProcessingGoal } from '@types'

const logger = Logger(module)
const sqs = new SQS({
  apiVersion: 'latest'
})

export interface IContractInfoJobDetailsByTokenAddress {
  tokenAddress: string
  transferBlockNumber?: number
  goal?: ProcessingGoal
  fullUpdate?: boolean
}

export interface IContractInfoJobDetailsByBlock {
  blockNumber: number
  goal: ProcessingGoal
}

export type TBackfill = {
  howMany?: number
  unproccessedOnly?: boolean
  minId?: number
}

/**
 * Add token contracts into the queue for further processing.
 *
 * @remarks
 * The queue where these tokens get added to is consumed by the contractInfoServer.
 *
 * @param {tokens} tokens - The tokens whose contract needs to be added into the queue for metadata extraction by the contractInfoServer.
 *
 * @returns {Promise<boolean>} `Promise<boolean>` - A boolean indicating whether the tokens have been added to the queue successfully or not.
 */
export async function queueContractInfoByTokenAddressJobs(
  tokens: IContractInfoJobDetailsByTokenAddress[]
): Promise<boolean> {
  try {
    if (!CONTRACT_INFO_QUEUE_URL || !tokens.length) {
      return false
    }
    stats.increment('contract_info_job', tokens.length)
    // there's no need to add the same contract into the queue during every round of block(s) processing. only pick latest once
    const uniqueTokens = uniqBy(
      orderBy(tokens, ['blockNumber'], ['desc']),
      token => token.tokenAddress
    )
    await Bluebird.Promise.map(
      chunk(uniqueTokens, 10),
      chunk =>
        sqs
          .sendMessageBatch({
            QueueUrl: CONTRACT_INFO_QUEUE_URL!,
            Entries: chunk.map(data => ({
              Id: `contractInfo-address-${data.tokenAddress}`,
              MessageBody: JSON.stringify(data)
            }))
          })
          .promise(),
      { concurrency: 10 }
    )

    return true
  } catch (err) {
    logger.warn(`Failed at contractTokenInfoJob: ${err}`)
    return false
  }
}

export async function queueUpdateExistingContractInfoByBlockJobs(
  tokens: IContractInfoJobDetailsByBlock[]
) {
  try {
    if (!CONTRACT_INFO_QUEUE_URL || !tokens.length) {
      return false
    }
    await Bluebird.Promise.map(
      chunk(tokens, 10),
      chunk =>
        sqs
          .sendMessageBatch({
            QueueUrl: CONTRACT_INFO_QUEUE_URL!,
            Entries: chunk.map(data => ({
              Id: `contractInfo-block-${data.blockNumber}`,
              MessageBody: JSON.stringify(data)
            }))
          })
          .promise(),
      { concurrency: 10 }
    )
    return true
  } catch (err) {
    logger.warn(`Failed at contractTokenInfoJob: ${err}`)
    return false
  }
}
