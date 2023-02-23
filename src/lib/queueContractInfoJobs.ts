import SQS from 'aws-sdk/clients/sqs'
import Bluebird from 'bluebird'
import { chunk, orderBy, uniqBy } from 'lodash'
import { Op } from 'sequelize'
import { CONTRACT_INFO_QUEUE_URL } from './constants'
import Logger from './logger'
import stats from './stats'
import { ContractInfo } from '@models/index'
import { ProcessingGoal } from '@types'

const logger = Logger(module)
const sqs = new SQS({
  apiVersion: 'latest'
})

export interface IContractInfoJobDetails {
  tokenAddress: string
  blockNumber?: number
  goal?: ProcessingGoal
  full?: boolean
}

export type TBackfill = {
  howMany?: number
  unproccessedOnly?: boolean
  minId?: number
}

export async function queueContractInfoBackfill({
  howMany,
  unproccessedOnly = true,
  minId
}: TBackfill) {
  const whereClause =
    minId || unproccessedOnly
      ? {
          ...(minId
            ? {
                id: {
                  [Op.gte]: minId
                }
              }
            : {}),
          ...(unproccessedOnly
            ? {
                ethBalance: { [Op.is]: null }
              }
            : undefined)
        }
      : undefined

  const contracts = await ContractInfo.findAll({
    where: whereClause,
    limit: howMany ? +howMany : undefined,
    order: [['id', 'asc']]
  })

  const queueTokens: IContractInfoJobDetails[] = contracts.map(contract => ({
    tokenAddress: contract.address
  }))

  await queueContractInfoJobs(queueTokens)
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
async function queueContractInfoJobs(
  tokens: IContractInfoJobDetails[]
): Promise<boolean> {
  try {
    if (!CONTRACT_INFO_QUEUE_URL || !tokens.length) {
      return false
    }

    stats.increment('contract_token_info_job', tokens.length)

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
              Id: `contractInfo-token-${data.tokenAddress}`,
              MessageBody: JSON.stringify(data)
            }))
          })
          .promise(),
      { concurrency: 10 }
    )

    return true
  } catch (err) {
    logger.warn(`Failed at queueTokenInfoJob: ${err}`)
    return false
  }
}

export default queueContractInfoJobs
