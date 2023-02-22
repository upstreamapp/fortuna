'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { getEthClient } from '@lib/getEthClient'
import updateContractInfo from '@lib/updateContractInfo'
import { ContractInfo } from '@models/index'

async function main() {
  const contractAddress = process.argv[3]
  await updateContractInfo({ tokenAddress: contractAddress, full: false })

  const client = await getEthClient()
  const contractInfo = await ContractInfo.findOne({
    where: {
      address: contractAddress.toLowerCase()
    },
    logging: console.log
  })
  if (!contractInfo) {
    return
  }
  const logs = await client.getLogs({
    address: contractAddress,
    fromBlock: contractInfo.lastTransactionBlock || 0
  })

  console.log(logs)
}

main()
