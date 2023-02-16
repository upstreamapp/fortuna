import StatsD from 'hot-shots'
import { EthNetwork } from '../@types'
import { NODE_ENV, IS_PROD } from './constants'
import { network } from './getEthClient'
import Logger from './logger'

const logger = Logger(module)

const stats = new StatsD({
  host: 'telegraf.default.svc.cluster.local',
  prefix: 'fortuna_',
  telegraf: true,
  globalTags: {
    env: NODE_ENV!,
    network: network === EthNetwork.MAINNET ? 'mainnet' : 'goerli'
  },
  errorHandler: err => {
    logger.warn(`Failed to log metrics: ${err}`)
  },
  mock: !IS_PROD
})

export default stats
