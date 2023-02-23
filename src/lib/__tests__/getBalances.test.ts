import getBalances from '../../db/operations/getBalances'
import mockCreateTokenTransfer from '../../utils/__tests__/generators/tokenTransfer'
import { handleDatabaseConnections } from '../../utils/__tests__/utils'

describe('getBalances', () => {
  const userAddress = '0xec8C4a3644338a534940BA4858Cdb01432dec075'
  const tokenAddress = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'

  handleDatabaseConnections()

  beforeEach(async () => {
    await mockCreateTokenTransfer({
      value: '1000',
      toAddress: userAddress,
      tokenAddress
    })
    await mockCreateTokenTransfer({
      value: '500',
      toAddress: userAddress,
      tokenAddress
    })
    await mockCreateTokenTransfer({
      value: '300',
      toAddress: userAddress,
      tokenAddress
    })
    await mockCreateTokenTransfer({
      value: '200',
      toAddress: userAddress,
      tokenAddress
    })
  })

  it('should calculate wallet totals correctly', async () => {
    const result = (await getBalances({ wallets: [userAddress] }))[0]
    expect(result.tokenAddress).toBe(tokenAddress)
    expect(result.balance.toString()).toBe('2000')
    expect(result.walletAddress).toBe(userAddress)
  })

  it('should calculate contract total correctly', async () => {
    const result = (await getBalances({ contracts: [tokenAddress] }))[0]
    expect(result.tokenAddress).toBe(tokenAddress)
    expect(result.balance.toString()).toBe('2000')
    expect(result.walletAddress).toBe(userAddress)
  })

  it('should calculate the wallet and contract total correctly', async () => {
    const result = (
      await getBalances({ wallets: [userAddress], contracts: [tokenAddress] })
    )[0]
    expect(result.tokenAddress).toBe(tokenAddress)
    expect(result.balance.toString()).toBe('2000')
    expect(result.walletAddress).toBe(userAddress)
  })
})
