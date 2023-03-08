'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { updateContractInfoByTokenAddress } from '@lib/updateContractInfo'

async function main() {
  const contractAddress = process.argv[3]

  await updateContractInfoByTokenAddress({
    tokenAddress: contractAddress
  })
}

main()
