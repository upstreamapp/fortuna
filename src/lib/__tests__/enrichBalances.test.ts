import { faker } from '@faker-js/faker'
import { TokenType } from '../../@types'
import enrichBalances from '../../db/operations/enrichBalances'
import mockCreateTokenInfo from '../../utils/__tests__/generators/tokenInfo'
import mockCreateTokenTransfer from '../../utils/__tests__/generators/tokenTransfer'
import { handleDatabaseConnections } from '../../utils/__tests__/utils'

describe('enrichBalances', () => {
  const userAddress = '0xec8C4a3644338a534940BA4858Cdb01432dec075'
  const tokenAddress = '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
  const token1Fields = {
    contractName: faker.random.words(),
    tokenId: '1',
    tokenType: TokenType.ERC_721,
    address: tokenAddress,
    symbol: faker.random.alphaNumeric(3),
    tokenName: faker.random.words(),
    tokenDescription: faker.random.words(),
    imageUrl: faker.random.alphaNumeric(10),
    tokenUri: faker.random.alphaNumeric(10)
  }
  const token2Fields = {
    contractName: faker.random.words(),
    tokenId: '2',
    tokenType: TokenType.ERC_721,
    address: tokenAddress,
    symbol: faker.random.alphaNumeric(3),
    tokenName: faker.random.words(),
    tokenDescription: faker.random.words(),
    imageUrl: faker.random.alphaNumeric(10),
    tokenUri: faker.random.alphaNumeric(10)
  }
  const token3Fields = {
    contractName: faker.random.words(),
    tokenId: '3',
    tokenType: TokenType.ERC_721,
    address: tokenAddress,
    symbol: faker.random.alphaNumeric(3),
    tokenName: faker.random.words(),
    tokenDescription: faker.random.words(),
    imageUrl: faker.random.alphaNumeric(10),
    tokenUri: faker.random.alphaNumeric(10)
  }
  const token4Fields = {
    contractName: faker.random.words(),
    tokenId: '4',
    tokenType: TokenType.ERC_721,
    address: tokenAddress,
    symbol: faker.random.alphaNumeric(3),
    tokenName: faker.random.words(),
    tokenDescription: faker.random.words(),
    imageUrl: faker.random.alphaNumeric(10),
    tokenUri: faker.random.alphaNumeric(10)
  }

  handleDatabaseConnections()

  beforeEach(async () => {
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
    await mockCreateTokenInfo({
      tokenAddress,
      ...token1Fields
    })
    await mockCreateTokenInfo({
      tokenAddress,
      ...token2Fields
    })
    await mockCreateTokenInfo({
      tokenAddress,
      ...token3Fields
    })
    await mockCreateTokenInfo({
      tokenAddress,
      ...token4Fields
    })
  })

  it('should enrich properly', async () => {
    const result = await enrichBalances([
      {
        tokenAddress,
        walletAddress: userAddress,
        balance: '1',
        tokenId: token1Fields.tokenId
      },
      {
        tokenAddress,
        walletAddress: userAddress,
        balance: '1',
        tokenId: token2Fields.tokenId
      },
      {
        tokenAddress,
        walletAddress: userAddress,
        balance: '1',
        tokenId: token3Fields.tokenId
      },
      {
        tokenAddress,
        walletAddress: userAddress,
        balance: '1',
        tokenId: token4Fields.tokenId
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
          address: token1Fields.address,
          type: token1Fields.tokenType,
          name: token1Fields.contractName,
          symbol: token1Fields.symbol,
          decimals: null
        },
        token: {
          id: token1Fields.tokenId,
          name: token1Fields.tokenName,
          description: token1Fields.tokenDescription,
          imageUrl: token1Fields.imageUrl,
          imageData: null,
          externalUrl: null,
          animationUrl: null,
          youtubeUrl: null
        }
      })
    )
    expect(Object.keys(token2)).toEqual(
      expect.arrayContaining(['contract', 'token', 'lastUpdated'])
    )
    expect(token2).toEqual(
      expect.objectContaining({
        contract: {
          address: token2Fields.address,
          type: token2Fields.tokenType,
          name: token2Fields.contractName,
          symbol: token2Fields.symbol,
          decimals: null
        },
        token: {
          id: token2Fields.tokenId,
          name: token2Fields.tokenName,
          description: token2Fields.tokenDescription,
          imageUrl: token2Fields.imageUrl,
          imageData: null,
          externalUrl: null,
          animationUrl: null,
          youtubeUrl: null
        }
      })
    )
    expect(Object.keys(token3)).toEqual(
      expect.arrayContaining(['contract', 'token', 'lastUpdated'])
    )
    expect(token3).toEqual(
      expect.objectContaining({
        contract: {
          address: token3Fields.address,
          type: token3Fields.tokenType,
          name: token3Fields.contractName,
          symbol: token3Fields.symbol,
          decimals: null
        },
        token: {
          id: token3Fields.tokenId,
          name: token3Fields.tokenName,
          description: token3Fields.tokenDescription,
          imageUrl: token3Fields.imageUrl,
          imageData: null,
          externalUrl: null,
          animationUrl: null,
          youtubeUrl: null
        }
      })
    )
    expect(Object.keys(token4)).toEqual(
      expect.arrayContaining(['contract', 'token', 'lastUpdated'])
    )
    expect(token4).toEqual(
      expect.objectContaining({
        contract: {
          address: token4Fields.address,
          type: token4Fields.tokenType,
          name: token4Fields.contractName,
          symbol: token4Fields.symbol,
          decimals: null
        },
        token: {
          id: token4Fields.tokenId,
          name: token4Fields.tokenName,
          description: token4Fields.tokenDescription,
          imageUrl: token4Fields.imageUrl,
          imageData: null,
          externalUrl: null,
          animationUrl: null,
          youtubeUrl: null
        }
      })
    )
  })
})
