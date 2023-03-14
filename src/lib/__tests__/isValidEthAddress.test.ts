import { handleDatabaseConnections } from '../../utils/__tests__/utils'
import { isValidEthAddress } from '../isValidEthAddress'

describe('isValidEthAddress', () => {
  handleDatabaseConnections()

  it('should return true for a valid address', () => {
    const valid = isValidEthAddress(
      '0xec8C4a3644338a534940BA4858Cdb01432dec075'
    )

    expect(valid).toEqual(true)
  })

  it('should return false for an invalid address', () => {
    const valid = isValidEthAddress('1432dec075')
    expect(valid).toEqual(false)
  })
})
