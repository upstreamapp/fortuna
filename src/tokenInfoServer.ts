import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import './lib/doom'
import cluster from 'cluster'
import { cpus } from 'os'
import { Consumer } from 'sqs-consumer'
import {
  TOKEN_INFO_BATCH,
  TOKEN_INFO_CLUSTER_MODE,
  TOKEN_INFO_QUEUE_URL
} from './lib/constants'
import Logger from './lib/logger'
import { ITokenInfoJobDetails } from './lib/queueTokenInfoJobs'
import updateTokenInfo from './lib/updateTokenInfo'
const logger = Logger(module)
const coreCount = cpus().length

/**
 * Consume the TokenInfo queue.
 *
 * @remarks
 * The queue that is being consumed gets its jobs from the `monitoringServer` and `queryingServer`.
 *
 * @returns {Promise<undefined>} This function does not return any useful value.
 */
async function consumeQueue(): Promise<undefined> {
  if (!TOKEN_INFO_QUEUE_URL) {
    logger.warn('Invalid value given to `SQS_URL`')
    return process.exit(1)
  }

  const app = new Consumer({
    batchSize: TOKEN_INFO_BATCH,
    queueUrl: TOKEN_INFO_QUEUE_URL,
    handleMessage: async sqsMessage => {
      const data: ITokenInfoJobDetails = JSON.parse(sqsMessage.Body!)
      await updateTokenInfo(data.tokenAddress, data.tokenId)
    }
  })

  app.on('error', err => logger.error(err.message))
  app.on('processing_error', err => logger.error(err.message))

  logger.info(`Starting token info update queue consumer...`)
  app.start()
}

// spreading the workload of consuming the queue jobs
if (cluster.isPrimary && TOKEN_INFO_CLUSTER_MODE) {
  logger.info(`Primary thread; Spinning up ${coreCount} workers...`)

  for (var i = 0; i < coreCount; i++) {
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
