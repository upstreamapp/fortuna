'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { Op } from 'sequelize'
import {
  IContractInfoJobDetailsByTokenAddress,
  queueContractInfoByTokenAddressJobs,
  TBackfill
} from '@lib/queueContractInfoJobs'
import { ContractInfo } from '@models/index'

async function queueContractInfoBackfill({
  howMany,
  unproccessedOnly = true,
  minId
}: TBackfill) {
  const whereClause =
    minId || unproccessedOnly
      ? {
          ...(minId
            ? {
                id: {
                  [Op.gte]: minId
                }
              }
            : {}),
          ...(unproccessedOnly
            ? {
                lastTransactionBlock: { [Op.is]: null }
              }
            : undefined)
        }
      : undefined

  const contracts = await ContractInfo.findAll({
    where: whereClause,
    limit: howMany ? +howMany : undefined,
    order: [['id', 'asc']]
  })

  const queueTokens: IContractInfoJobDetailsByTokenAddress[] = contracts.map(
    contract => ({
      tokenAddress: contract.address
    })
  )
  await queueContractInfoByTokenAddressJobs(queueTokens)
}

async function main() {
  const howMany = +process.argv[3] ? +process.argv[3] : undefined
  const unproccessedOnly = new Boolean(
    process.argv[4] !== undefined ? process.argv[4] : true
  ).valueOf()
  const minId = process.argv[5] ? +process.argv[5] : undefined

  if (!howMany) {
    throw new Error(
      `Missing howMany to process and if process unproccesed only`
    )
  }

  await queueContractInfoBackfill({ howMany, unproccessedOnly, minId })
}

main()
