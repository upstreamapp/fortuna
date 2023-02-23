import substituteTokenID from '../../lib/substituteTokenID'
import { handleDatabaseConnections } from '../../utils/__tests__/utils'
import fetchRemoteMetadata from '../fetchRemoteMetadata'

describe('substituteTokenID', () => {
  handleDatabaseConnections()

  it('should work properly with no tokenId', () => {
    const result = substituteTokenID(
      'ipfs://QmYtsGqyv8Ti6sqAem7B87TY3pPRV51ZADVPkwYT1NMEyU',
      null
    )

    expect(result).toEqual(
      'ipfs://QmYtsGqyv8Ti6sqAem7B87TY3pPRV51ZADVPkwYT1NMEyU'
    )
  })

  it('should work with a tokenId', () => {
    const result = substituteTokenID(
      'ipfs://QmYtsGqyv8Ti6sqAem7B87TY3pPRV51ZADVPkwYT1NMEyU/{id}',
      '1'
    )

    expect(result).toEqual(
      'ipfs://QmYtsGqyv8Ti6sqAem7B87TY3pPRV51ZADVPkwYT1NMEyU/0000000000000000000000000000000000000000000000000000000000000001'
    )
  })

  it('should work with no uri', () => {
    const result = substituteTokenID(null, 'i')
    expect(result).toBeNull()
  })
})
