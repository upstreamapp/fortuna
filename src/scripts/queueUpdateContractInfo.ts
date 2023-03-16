'use strict'

import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import { queueAllContractInfoRecordsForBackfill } from '@lib/queueContractInfoJobs'

async function main() {
  await queueAllContractInfoRecordsForBackfill()
}

main()
