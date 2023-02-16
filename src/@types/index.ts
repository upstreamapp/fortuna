export interface IBalancesRequest {
  wallets?: string[]
  contracts?: string[]
  enrich?: boolean
  refreshMissing?: boolean
}

export interface IParams {
  enrich?: boolean
  refreshMissing?: boolean
}

export interface IBalance {
  tokenAddress: string
  walletAddress: string
  balance: string
  tokenId?: string
}

export interface ITokenInfo {
  contract: {
    address: string
    type: Maybe<TokenType>
    name: Maybe<string>
    symbol: Maybe<string>
    decimals: Maybe<number>
  }
  token: {
    id: Maybe<string>
    name: Maybe<string>
    description: Maybe<string>
    imageUrl: Maybe<string>
    imageData: Maybe<string>
    externalUrl: Maybe<string>
    animationUrl: Maybe<string>
    youtubeUrl: Maybe<string>
  }
  lastUpdated: Date
}

export interface IEnrichedBalance extends IBalance {
  token: Maybe<ITokenInfo>
}

export type IResponse = IBalance[] | IEnrichedBalance[]

export interface IGetQuery {
  wallets?: string[]
  contracts?: string[]
}

export enum EthNetwork {
  MAINNET,
  GOERLI
}

export enum TokenType {
  ERC_20 = 'ERC_20',
  ERC_721 = 'ERC_721',
  ERC_1155 = 'ERC_1155'
}

export enum SyncingState {
  BACKFILLING = 'BACKFILLING',
  REALTIME = 'REALTIME'
}

export enum QueryTypes {
  SELECT = 'SELECT',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  BULKUPDATE = 'BULKUPDATE',
  BULKDELETE = 'BULKDELETE',
  DELETE = 'DELETE',
  UPSERT = 'UPSERT',
  VERSION = 'VERSION',
  SHOWTABLES = 'SHOWTABLES',
  SHOWINDEXES = 'SHOWINDEXES',
  DESCRIBE = 'DESCRIBE',
  RAW = 'RAW',
  FOREIGNKEYS = 'FOREIGNKEYS'
}

export type TAbiInput = {
  indexed: boolean
  name: string
  type: string
  internalType?: string
}

export type TAbi = {
  anonymous: boolean
  name: string
  type: string
  inputs: TAbiInput[]
}[]

export type TotalTokenValue = {
  token_address: string
  address: string
  balance: string
  token_ids: string[]
}
