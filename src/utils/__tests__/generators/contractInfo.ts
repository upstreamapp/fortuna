import { ContractInfo } from '@models/index'

export default async function mockCreateContractInfo(
  overrides: Omit<
    Partial<ContractInfo>,
    'address' | 'name' | 'symbol' | 'tokenType'
  > &
    Pick<ContractInfo, 'address' | 'name' | 'symbol' | 'tokenType'>
) {
  return await ContractInfo.create({
    ...overrides
  })
}
