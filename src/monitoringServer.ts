import './lib/doom'
import express from 'express'
import { SyncingState } from './@types'
import getStatus from './db/operations/statusTable/getStatus'
import { DEFAULT_MONITORING_PORT, MONITORING_PORT } from './lib/constants'
import dbHealth from './lib/dbHealth'
import errorHandler from './lib/errorHandler'
import ethClientHealth from './lib/ethClientHealth'
import ingest from './lib/ingest'
import Logger from './lib/logger'

const app = express()
const logger = Logger(module)

// where the magic happens in the backfilling and realtime transactions processing
ingest()

app.get('/health', async (_, res) => {
  const dbConnected = await dbHealth()
  if (!dbConnected) {
    throw 'DB client not connected.'
  }

  const ethClientConnected = await ethClientHealth()
  if (!ethClientConnected) {
    throw 'Eth client not connected.'
  }

  res.send('OK.')
})

app.get('/status', async (_, res) => {
  const [status, dbConnected, ethClientConnected] = await Promise.all([
    getStatus(),
    dbHealth(),
    ethClientHealth()
  ])

  return res.json({
    dbConnection: dbConnected,
    ethClientConnection: ethClientConnected,
    highestBlock: status?.highestBlock || 0,
    syncing: status?.syncing || false,
    syncingState:
      SyncingState.BACKFILLING === status?.syncingState
        ? 'Backfilling'
        : SyncingState.REALTIME === status?.syncingState
        ? 'Realtime'
        : 'Not syncing',
    syncingFromBlock: status?.syncingBlocks[0] || 0,
    syncingToBlock: status?.syncingBlocks[1] || 0
  })
})

app.use(errorHandler)

app.listen(MONITORING_PORT || DEFAULT_MONITORING_PORT, () => {
  logger.info(
    `Monitoring server started on port ${
      MONITORING_PORT || DEFAULT_MONITORING_PORT
    }`
  )
})
