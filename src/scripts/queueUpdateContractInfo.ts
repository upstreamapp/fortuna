'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { queueContractInfoBackfill } from '@lib/queueContractInfoJobs'

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
