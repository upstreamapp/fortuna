import { faker } from '@faker-js/faker'
import { TokenType } from '../../../@types/index'
import { TokenInfo } from '@models/TokenInfo/TokenInfo'

export default async function mockCreateTokenInfo(
  overrides: Partial<TokenInfo> = {}
) {
  await TokenInfo.create({
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    tokenId: faker.random.numeric(2),
    tokenType: TokenType.ERC_721,
    contractName: faker.random.words(),
    symbol: faker.random.alphaNumeric(3),
    tokenName: faker.random.words(),
    tokenDescription: faker.random.words(),
    imageUrl: faker.random.alphaNumeric(10),
    tokenUri: faker.random.alphaNumeric(10),
    ...overrides
  })
}
