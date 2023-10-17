import { faker } from '@faker-js/faker'
import moment from 'moment'
import { TokenType } from '../../@types'
import enrichBalances from '../../db/operations/enrichBalances'
import { ContractInfo } from '../../models/ContractInfo/ContractInfo'
import { TokenInfo } from '../../models/TokenInfo/TokenInfo'
import mockCreateContractInfo from '../../utils/__tests__/generators/contractInfo'
import mockCreateTokenInfo from '../../utils/__tests__/generators/tokenInfo'
import mockCreateTokenTransfer from '../../utils/__tests__/generators/tokenTransfer'
import { handleDatabaseConnections } from '../../utils/__tests__/utils'

describe('enrichBalances', () => {
  const userAddress = '0xec8C4a3644338a534940BA4858Cdb01432dec075'
  const tokenAddress = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'

  const transactionDate = moment().subtract(1, 'days').toDate()
  let contractInfo: ContractInfo
  let tokenInfo1: TokenInfo
  let tokenInfo2: TokenInfo
  let tokenInfo3: TokenInfo
  let tokenInfo4: TokenInfo

  handleDatabaseConnections()

  beforeEach(async () => {
    contractInfo = await mockCreateContractInfo({
      address: tokenAddress,
      symbol: faker.random.alphaNumeric(3),
      name: faker.random.words(),
      tokenType: TokenType.ERC_721,
      ethBalance: BigInt(12),
      lastTransactionAt: transactionDate
    })
    await mockCreateTokenTransfer({
      tokenType: TokenType.ERC_721,
      toAddress: userAddress,
      tokenAddress
    })
    await mockCreateTokenTransfer({
      tokenType: TokenType.ERC_721,
      toAddress: userAddress,
      tokenAddress
    })
    await mockCreateTokenTransfer({
      tokenType: TokenType.ERC_721,
      toAddress: userAddress,
      tokenAddress
    })
    await mockCreateTokenTransfer({
      tokenType: TokenType.ERC_721,
      toAddress: userAddress,
      tokenAddress
    })
    tokenInfo1 = await mockCreateTokenInfo({
      tokenAddress,
      contractInfoId: contractInfo.id,
      tokenId: '1',
      address: tokenAddress,
      tokenName: faker.random.words(),
      tokenDescription: faker.random.words(),
      imageUrl: faker.random.alphaNumeric(10),
      tokenUri: faker.random.alphaNumeric(10)
    })
    tokenInfo2 = await mockCreateTokenInfo({
      tokenAddress,
      contractInfoId: contractInfo.id,

      tokenId: '2',
      address: tokenAddress,
      tokenName: faker.random.words(),
      tokenDescription: faker.random.words(),
      imageUrl: faker.random.alphaNumeric(10),
      tokenUri: faker.random.alphaNumeric(10)
    })
    tokenInfo3 = await mockCreateTokenInfo({
      tokenAddress,
      contractInfoId: contractInfo.id,
      tokenId: '3',
      address: tokenAddress,
      tokenName: faker.random.words(),
      tokenDescription: faker.random.words(),
      imageUrl: faker.random.alphaNumeric(10),
      tokenUri: faker.random.alphaNumeric(10)
    })
    tokenInfo4 = await mockCreateTokenInfo({
      tokenAddress,
      contractInfoId: contractInfo.id,
      tokenId: '4',
      address: tokenAddress,
      tokenName: faker.random.words(),
      tokenDescription: faker.random.words(),
      imageUrl: faker.random.alphaNumeric(10),
      tokenUri: faker.random.alphaNumeric(10)
    })
  })

  it('should enrich properly', async () => {
    const result = await enrichBalances([
      {
        tokenAddress,
        walletAddress: userAddress,
        balance: '1',
        tokenId: tokenInfo1.tokenId
      },
      {
        tokenAddress,
        walletAddress: userAddress,
        balance: '1',
        tokenId: tokenInfo2.tokenId
      },
      {
        tokenAddress,
        walletAddress: userAddress,
        balance: '1',
        tokenId: tokenInfo3.tokenId
      },
      {
        tokenAddress,
        walletAddress: userAddress,
        balance: '1',
        tokenId: tokenInfo4.tokenId
      }
    ])

    const token1 = result[0].token
    const token2 = result[1].token
    const token3 = result[2].token
    const token4 = result[3].token

    expect(result.length).toBe(4)
    expect(Object.keys(token1)).toEqual(
      expect.arrayContaining(['contract', 'token', 'lastUpdated'])
    )
    expect(token1).toEqual(
      expect.objectContaining({
        contract: {
          address: contractInfo.address,
          type: contractInfo.tokenType,
          name: contractInfo.name,
          symbol: contractInfo.symbol,
          decimals: null,
          ethBalance: BigInt(12),
          lastTransactionDate: transactionDate
        },
        token: {
          id: tokenInfo1.tokenId,
          name: tokenInfo1.tokenName,
          description: tokenInfo1.tokenDescription,
          imageUrl: tokenInfo1.imageUrl,
          imageData: null,
          externalUrl: null,
          animationUrl: null,
          youtubeUrl: null,
          tokenUri: tokenInfo1.tokenUri
        },
        lastUpdated: tokenInfo1.updatedAt
      })
    )
    expect(Object.keys(token2)).toEqual(
      expect.arrayContaining(['contract', 'token', 'lastUpdated'])
    )
    expect(token2).toEqual(
      expect.objectContaining({
        contract: {
          address: tokenInfo2.address,
          type: contractInfo.tokenType,
          name: contractInfo.name,
          symbol: contractInfo.symbol,
          decimals: null,
          ethBalance: BigInt(12),
          lastTransactionDate: transactionDate
        },
        token: {
          id: tokenInfo2.tokenId,
          name: tokenInfo2.tokenName,
          description: tokenInfo2.tokenDescription,
          imageUrl: tokenInfo2.imageUrl,
          imageData: null,
          externalUrl: null,
          animationUrl: null,
          youtubeUrl: null,
          tokenUri: tokenInfo2.tokenUri
        },
        lastUpdated: tokenInfo2.updatedAt
      })
    )
    expect(Object.keys(token3)).toEqual(
      expect.arrayContaining(['contract', 'token', 'lastUpdated'])
    )
    expect(token3).toEqual(
      expect.objectContaining({
        contract: {
          address: contractInfo.address,
          type: contractInfo.tokenType,
          name: contractInfo.name,
          symbol: contractInfo.symbol,
          decimals: null,
          ethBalance: BigInt(12),
          lastTransactionDate: transactionDate
        },
        token: {
          id: tokenInfo3.tokenId,
          name: tokenInfo3.tokenName,
          description: tokenInfo3.tokenDescription,
          imageUrl: tokenInfo3.imageUrl,
          imageData: null,
          externalUrl: null,
          animationUrl: null,
          youtubeUrl: null,
          tokenUri: tokenInfo3.tokenUri
        },
        lastUpdated: tokenInfo3.updatedAt
      })
    )
    expect(Object.keys(token4)).toEqual(
      expect.arrayContaining(['contract', 'token', 'lastUpdated'])
    )
    expect(token4).toEqual(
      expect.objectContaining({
        contract: {
          address: contractInfo.address,
          type: contractInfo.tokenType,
          name: contractInfo.name,
          symbol: contractInfo.symbol,
          decimals: null,
          ethBalance: BigInt(12),
          lastTransactionDate: transactionDate
        },
        token: {
          id: tokenInfo4.tokenId,
          name: tokenInfo4.tokenName,
          description: tokenInfo4.tokenDescription,
          imageUrl: tokenInfo4.imageUrl,
          imageData: null,
          externalUrl: null,
          animationUrl: null,
          youtubeUrl: null,
          tokenUri: tokenInfo4.tokenUri
        },
        lastUpdated: tokenInfo4.updatedAt
      })
    )
  })
})
