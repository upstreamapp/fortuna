import {
  checkIfConnected,
  checkIfProperDBIsBeingUsed,
  closeConnections,
  dbConnection
} from '@models/db'

export const handleDatabaseConnections = () => {
  beforeEach(async () => {
    checkIfProperDBIsBeingUsed()
    await checkIfConnected()
    await dbConnection.truncate({
      cascade: true,
      force: true
    })
  })

  afterAll(async () => {
    await closeConnections()
  })
}
