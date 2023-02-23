'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import updateContractInfo from '@lib/updateContractInfo'

async function main() {
  const contractAddress = process.argv[3]
  await updateContractInfo({ tokenAddress: contractAddress })
}

main()
