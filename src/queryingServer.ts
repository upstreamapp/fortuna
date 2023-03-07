import 'dotenv/config'
import 'module-alias/register'
import 'source-map-support/register'

import './lib/doom'
import { json } from 'body-parser'
import express from 'express'
import { isArray } from 'lodash'
import { IResponse, IParams, IBalancesRequest } from './@types'
import enrichBalances from './db/operations/enrichBalances'
import getBalances from './db/operations/getBalances'
import { DEFAULT_QUERYING_PORT, QUERYING_PORT } from './lib/constants'
import errorHandler from './lib/errorHandler'
import { isValidEthAddress } from './lib/isValidEthAddress'
import Logger from './lib/logger'
import { ReportableError } from './utils/errors/errors'

const logger = Logger(module)
const app = express()

app.use(json())

app.get<{ address: string }, IResponse, undefined, IParams>(
  '/balances/:address',
  async (req, res) => {
    const address = req.params.address.toLowerCase()
    if (!isValidEthAddress(address)) {
      throw new ReportableError(`Invalid wallet address`)
    }

    try {
      const balances = await getBalances({ wallets: [address] })
      if (!req.query.enrich) {
        return res.json(balances)
      }

      const enrichedBalances = await enrichBalances(
        balances,
        req.query.refreshMissing || false
      )
      return res.json(enrichedBalances)
    } catch (err) {
      // @ts-ignore
      logger.warn(err.message)
      logger.warn(err)
      return res.sendStatus(500)
    }
  }
)

app.post<{}, IResponse, IBalancesRequest, IParams>(
  '/balances',
  async (req, res) => {
    if (req.body.wallets && !isArray(req.body.wallets)) {
      throw new ReportableError(
        'When specified, `wallets` key must be an array'
      )
    }
    if (req.body.contracts && !isArray(req.body.contracts)) {
      throw new ReportableError(
        'When specified, `contracts` key must be an array'
      )
    }

    const wallets = req.body.wallets
      ? req.body.wallets.map(address => {
          if (!isValidEthAddress(address)) {
            throw new ReportableError(`Invalid wallet address: ${address}`)
          }
          return address.toLowerCase()
        })
      : undefined
    const contracts = req.body.contracts
      ? req.body.contracts.map(address => {
          if (!isValidEthAddress(address)) {
            throw new ReportableError(`Invalid contract address: ${address}`)
          }
          return address.toLowerCase()
        })
      : undefined

    if (!wallets && !contracts) {
      throw new ReportableError(`Either wallets or contracts must be specified`)
    }

    const balances = await getBalances({ wallets, contracts })
    if (!req.query.enrich && !req.body.enrich) {
      return res.json(balances)
    }

    const enrichedBalances = await enrichBalances(
      balances,
      req.query.refreshMissing || req.body.refreshMissing || false
    )
    return res.json(enrichedBalances)
  }
)

app.use(errorHandler)

app.listen(QUERYING_PORT || DEFAULT_QUERYING_PORT, () => {
  logger.info(
    `Querying server started on port ${QUERYING_PORT || DEFAULT_QUERYING_PORT}`
  )
})
