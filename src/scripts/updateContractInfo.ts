'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { updateContractInfoByTokenAddress } from '@lib/updateContractInfo'

async function main() {
  const contractAddress = process.argv[3]
  const blockNumber = process.argv[4] ? +process.argv[4] : undefined
  const fullUpdate = process.argv[5] === 'true'

  await updateContractInfoByTokenAddress({
    tokenAddress: contractAddress,
    transferBlockNumber: blockNumber,
    fullUpdate
  })
}

main()
