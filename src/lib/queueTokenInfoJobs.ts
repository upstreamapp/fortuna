import SQS from 'aws-sdk/clients/sqs'
import Bluebird from 'bluebird'
import { chunk, uniqBy } from 'lodash'
import { QUEUE_URL } from './constants'
import Logger from './logger'
import stats from './stats'

const logger = Logger(module)
const sqs = new SQS({
  apiVersion: 'latest'
})

export interface IJobDetails {
  tokenAddress: string
  tokenId?: Maybe<string>
}

/**
 * Add tokens into the queue for further processing.
 *
 * @remarks
 * The queue where these tokens get added to is consumed by the tokenInfoServer.
 *
 * @param {tokens} tokens - The tokens that need to be added into the queue for metadata extraction by the tokenInfoServer.
 *
 * @returns {Promise<boolean>} `Promise<boolean>` - A boolean indicating whether the tokens have been added to the queue successfully or not.
 */
async function queueTokenInfoJobs(tokens: IJobDetails[]): Promise<boolean> {
  try {
    if (!QUEUE_URL || !tokens.length) {
      return false
    }

    stats.increment('queue_token_info_job', tokens.length)

    // there's no need to add the same token into the queue during every round of block(s) processing.
    const uniqueTokens = uniqBy(
      tokens,
      token => `${token.tokenAddress}-${token.tokenId}`
    )
    await Bluebird.Promise.mapSeries(chunk(uniqueTokens, 10), chunk =>
      sqs
        .sendMessageBatch({
          QueueUrl: QUEUE_URL!,
          Entries: chunk.map((data, index) => ({
            Id: `t-${index}`,
            MessageBody: JSON.stringify(data)
          }))
        })
        .promise()
    )

    return true
  } catch (err) {
    logger.warn(`Failed at queueTokenInfoJob: ${err}`)
    return false
  }
}

export default queueTokenInfoJobs
