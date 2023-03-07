import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import './lib/doom'
import cluster from 'cluster'
import { cpus } from 'os'
import { Consumer } from 'sqs-consumer'
import {
  CONTRACT_INFO_CLUSTER_MODE,
  CONTRACT_INFO_QUEUE_BATCH,
  CONTRACT_INFO_QUEUE_URL
} from './lib/constants'
import Logger from '@lib/logger'
import {
  IContractInfoJobDetailsByBlock,
  IContractInfoJobDetailsByTokenAddress
} from '@lib/queueContractInfoJobs'
import {
  updateContractInfoByTokenAddress,
  updateExistingContractInfoByBlock
} from '@lib/updateContractInfo'

const logger = Logger(module)
const coreCount = cpus().length

export function isContractInfoJobLatestBlockType(
  tokens: IContractInfoJobDetailsByTokenAddress | IContractInfoJobDetailsByBlock
): tokens is IContractInfoJobDetailsByBlock {
  return (tokens as IContractInfoJobDetailsByBlock).blockNumber !== undefined
}

/**
 * Consume the ContractInfo queue.
 *
 * @remarks
 * The queue that is being consumed gets its jobs from the `monitoringServer` and `queryingServer`.
 *
 * @returns {Promise<undefined>} This function does not return any useful value.
 */
async function consumeQueue(): Promise<undefined> {
  if (!CONTRACT_INFO_QUEUE_URL) {
    logger.warn('Invalid value given to `SQS_URL`')
    return process.exit(1)
  }

  const app = new Consumer({
    batchSize: CONTRACT_INFO_QUEUE_BATCH, //TODO different batch size
    queueUrl: CONTRACT_INFO_QUEUE_URL,
    handleMessage: async sqsMessage => {
      const data:
        | IContractInfoJobDetailsByTokenAddress
        | IContractInfoJobDetailsByBlock = JSON.parse(sqsMessage.Body!)
      if (isContractInfoJobLatestBlockType(data)) {
        await updateExistingContractInfoByBlock(data)
      } else {
        await updateContractInfoByTokenAddress(data)
      }
    }
  })

  app.on('error', err => logger.error(err.message))
  app.on('processing_error', err => logger.error(err.message))

  logger.info(`Starting contract info update queue consumer...`)
  app.start()
}

// spreading the workload of consuming the queue jobs
if (cluster.isPrimary && CONTRACT_INFO_CLUSTER_MODE) {
  logger.info(`Primary thread; Spinning up ${coreCount} workers...`)

  for (var i = 0; i < coreCount - 1; i++) {
    cluster.fork()
  }

  cluster.on('online', function (worker) {
    logger.info(`Worker ${worker.process.pid} is online`)
  })

  cluster.on('exit', function (worker, code, signal) {
    logger.info(
      `Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`
    )
    logger.info('Starting a new worker')
    cluster.fork()
  })
} else {
  consumeQueue()
}
