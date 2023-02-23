import { ethers } from 'ethers'
import { SyncingState } from '../../@types'
import getStatus from '../../db/operations/statusTable/getStatus'
import updateSyncingState from '../../db/operations/statusTable/updateSyncingState'
import { mockCreateLog, testArgs } from '../../utils/__tests__/generators/log'
import mockCreateStatus from '../../utils/__tests__/generators/status'
import { handleDatabaseConnections } from '../../utils/__tests__/utils'
import { getEthClient } from '../getEthClient'
import getLogs from '../getLogs'
import processBlocks, { ProcessingGoal } from '../processBlocks'

jest.mock('../getEthClient')
jest.mock('../getLogs')
jest.mock('../queueTokenInfoJobs')

describe('processBlocks', () => {
  handleDatabaseConnections()

  const mockedGetEthClient = getEthClient as jest.MockedFunction<
    typeof getEthClient
  >
  const mockedGetLogs = getLogs as jest.MockedFunction<typeof getLogs>

  mockedGetEthClient.mockReturnValue(
    new Promise(resolve => {
      resolve({
        getBlockNumber: async () => 2
      } as ethers.providers.JsonRpcProvider)
    })
  )

  beforeEach(() => {
    mockedGetLogs.mockReset()
    mockedGetLogs.mockReturnValue(
      new Promise(resolve => {
        resolve([mockCreateLog({ blockNumber: 2 })])
      })
    )
  })

  it('should backfill successfully', async () => {
    await mockCreateStatus()
    const status1 = await getStatus()
    await processBlocks(1, 2, ProcessingGoal.BACKFILL)
    const status2 = await getStatus()

    expect(status1?.syncing).toEqual(false)
    expect(status1?.highestBlock).toEqual(0)
    expect(status2?.syncing).toEqual(true)
    expect(status2?.highestBlock).toEqual(2)
    expect(status2?.syncingState).toEqual('BACKFILLING')
  })

  it('should process realtime successfully', async () => {
    await mockCreateStatus()
    const status1 = await getStatus()

    await updateSyncingState(SyncingState.REALTIME)
    await processBlocks(1, 2, ProcessingGoal.REALTIME)
    const status2 = await getStatus()

    expect(status1?.syncing).toEqual(false)
    expect(status1?.syncingState).toEqual('BACKFILLING')
    expect(status1?.highestBlock).toEqual(0)
    expect(status2?.syncing).toEqual(true)
    expect(status2?.highestBlock).toEqual(2)
    expect(status2?.syncingState).toEqual('REALTIME')
  })
})
