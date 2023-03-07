if (
  process.env.ETH_NETWORK !== 'goerli' &&
  process.env.ETH_NETWORK !== 'mainnet'
) {
  throw new Error('Invalid `ETH_NETWORK` parameter')
}

export const NODE_ENV = process.env.NODE_ENV
export const MONITORING_PORT = process.env.MONITORING_PORT
export const QUERYING_PORT = process.env.QUERYING_PORT
export const MAINNET_RPC_PROVIDER_URL = process.env.MAINNET_RPC_PROVIDER_URL
export const GOERLI_RPC_PROVIDER_URL = process.env.GOERLI_RPC_PROVIDER_URL
export const GENESIS = 0
export const MAINNET_FIRST_TRANSFER_BLOCK = 447767
export const GOERLI_FIRST_TRANSFER_BLOCK = 13475
export const REALTIME_BATCH = Number(process.env.REALTIME_BATCH || 1)
export const REALTIME_PARALLEL_QUERIES = Number(
  process.env.REALTIME_PARALLEL_QUERIES || 1
)
export const BACKFILL_BATCH = Number(process.env.BACKFILL_BATCH || 10)
export const BACKFILL_PARALLEL_QUERIES = Number(
  process.env.BACKFILL_PARALLEL_QUERIES || 25
)
export const REALTIME_START_REPEAT = 5
export const ETH_NETWORK = process.env.ETH_NETWORK
export const DATABASE_CONNECTION_STRING = `${process.env.DATABASE_URL}/${process.env.ETH_NETWORK}`

export const BLACKHOLE = `0x0000000000000000000000000000000000000001`

// contract info
export const CONTRACT_INFO_MAX_AGE_IN_DAYS = 1
export const CONTRACT_INFO_QUEUE_URL = process.env.SQS_CONTRACT_INFO_URL
export const CONTRACT_INFO_QUEUE_BATCH = Number(
  process.env.CONTRACT_INFO_QUEUE_BATCH || 1
)
export const CONTRACT_INFO_CLUSTER_MODE =
  process.env.CONTRACT_INFO_CLUSTER_MODE === 'true'

// token info
export const TOKEN_INFO_MAX_AGE_IN_DAYS = 1
export const TOKEN_INFO_QUEUE_URL = process.env.SQS_TOKEN_INFO_URL
export const TOKEN_INFO_BATCH = Number(process.env.TOKEN_INFO_BATCH || 1)
export const TOKEN_INFO_CLUSTER_MODE =
  process.env.TOKEN_INFO_CLUSTER_MODE === 'true'

export const NUM_OF_BLOCKS_TO_REPROCESS = 1
export const LOG_LEVEL = process.env.LOG_LEVEL
export const SQL_DEBUG = process.env.SQL_DEBUG
export const SQL_TIMEZONE = process.env.SQL_TIMEZONE
export const IS_PROD = NODE_ENV === 'production'
export const DEFAULT_MONITORING_PORT = 7529
export const DEFAULT_QUERYING_PORT = 7530
