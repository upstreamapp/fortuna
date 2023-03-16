import { faker } from '@faker-js/faker'
import { ethers } from 'ethers'
import { ParsedLog } from 'lib/parseLog'

export function mockCreateLog(overrides: Partial<ParsedLog> = {}) {
  return {
    blockNumber: Number(faker.random.numeric(6)),
    blockHash: faker.random.alphaNumeric(66),
    transactionIndex: Number(faker.random.numeric(1)),
    removed: false,
    address: faker.random.alphaNumeric(42),
    data: '0x0000000000000000000000000000000000000000000000056bc75e2d63100000',
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
      '0x000000000000000000000000ec8c4a3644338a534940ba4858cdb01432dec075'
    ],
    transactionHash: faker.random.alphaNumeric(66),
    logIndex: Number(faker.random.numeric(2)),
    ...overrides
  } as ethers.providers.Log
}

export const testArgs = {
  from: '0x0000000000000000000000000000000000000000',
  to: '0xec8C4a3644338a534940BA4858Cdb01432dec075',
  value: '100000000000000000000'
}

export const testLogObj = {
  blockNumber: Number(faker.random.numeric(6)),
  blockHash: faker.random.alphaNumeric(66),
  transactionIndex: Number(faker.random.numeric(1)),
  removed: false,
  address: faker.random.alphaNumeric(42),
  data: '0x0000000000000000000000000000000000000000000000056bc75e2d63100000',
  topics: [
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    '0x0000000000000000000000000000000000000000000000000000000000000000',
    '0x000000000000000000000000ec8c4a3644338a534940ba4858cdb01432dec075'
  ],
  transactionHash: faker.random.alphaNumeric(66),
  logIndex: Number(faker.random.numeric(2))
}
