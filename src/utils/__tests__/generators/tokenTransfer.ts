import { faker } from '@faker-js/faker'
import { format } from 'node-pg-format'
import { TokenType } from '../../../@types/index'
import { sequelize, TokenTransfer } from '@models/index'

export default async function mockCreateTokenTransfer(
  overrides: Partial<TokenTransfer> = {}
) {
  const value = {
    tokenType: TokenType.ERC_20,
    tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    fromAddress: '0x975297b42cf350442e8084d0aa5f3369b82a077f',
    toAddress: '0xec8c4a3644338a534940ba4858cdb01432dec075',
    operator: null,
    tokenId: null,
    value: faker.random.numeric(3),
    transactionHash: `0x5d0ac70d99b4f8ae4482e0f14960e48c0eabc2198cec63b30ff5a3${faker.random.alphaNumeric(
      10
    )}`,
    logIndex: Number(faker.random.numeric(2)),
    blockNumber: Number(faker.random.numeric(8)),
    ...overrides
  }

  await sequelize.query(
    format(
      `INSERT INTO "TokenTransfer" ("tokenType", "tokenAddress", "fromAddress", "toAddress", "operator", "tokenId", "value", "transactionHash", "logIndex", "blockNumber") VALUES %L ON CONFLICT DO NOTHING;`,
      [value].map(Object.values)
    )
  )
}
