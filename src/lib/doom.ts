import updateSyncing from '../db/operations/statusTable/updateSyncing'

process.on('uncaughtException', err => {
  updateSyncing(false)
  console.error(new Date().toUTCString() + ' uncaughtException:', err.message)
  console.error(err.stack)
  process.exit(1)
})
process.on('unhandledRejection', err => {
  updateSyncing(false)
  console.error(new Date().toUTCString() + ' unhandledRejection:', err)
  console.error(err)
  process.exit(1)
})
