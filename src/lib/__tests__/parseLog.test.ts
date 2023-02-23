import { faker } from '@faker-js/faker'
import { abi } from '../../common/abi'
import { mockCreateLog, testArgs } from '../../utils/__tests__/generators/log'
import { handleDatabaseConnections } from '../../utils/__tests__/utils'
import parseLog from '../parseLog'

/**
 * The following environment variables need to be set to 1 in order for the test to work properly: BACKFILL_BATCH, BACKFILL_PARALLEL_QUERIES, REALTIME_BATCH, REALTIME_PARALLEL_QUERIES
 */
describe('parseLog', () => {
  handleDatabaseConnections()

  it('should parse correctly', async () => {
    const log = mockCreateLog()
    const parsedLog = parseLog([log], abi)[0]

    expect(parsedLog).toBeTruthy()
    expect(parsedLog).toEqual(
      expect.objectContaining({
        name: 'Transfer',
        address: log.address,
        blockNumber: log.blockNumber,
        blockHash: log.blockHash,
        transactionHash: log.transactionHash,
        logIndex: log.logIndex,
        args: testArgs,
        log
      })
    )
  })

  it('should not parse if the ABI is incorrect', async () => {
    const log = mockCreateLog()
    const parsedLog = parseLog([log], [])[0]
    expect(parsedLog).toBeUndefined()
  })

  it('should not parse if the transaction is not an ERC20, ERC721, ERC1155 transfer', async () => {
    const topics = [
      '0x9fe18e522e4e4f5421c6bc85df877f936efea110320f151af86d74d4fdd13756',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x000000000000000000000000ec8c4a3644338a534940ba4858cdb01432dec075'
    ]
    const log = mockCreateLog({ topics })
    const parsedLog = parseLog([log], abi)[0]
    expect(parsedLog).toBeUndefined()
  })
})
