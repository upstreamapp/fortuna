interface IKnownContract {
  name: string
  symbol?: string
  decimals?: number
}

type TKnownContractsMap = { [address: string]: IKnownContract }

const knownContracts: TKnownContractsMap = {
  '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85': {
    name: 'Ethereum Name Service',
    symbol: 'ENS'
  }
}

export default knownContracts

export interface IBalance {
  tokenAddress: string
  walletAddress: string
  balance: string
  tokenId: null | string
  token: ITokenInfo
}

export interface ITokenInfo {
  contract: IContract
  token: IToken
  lastUpdated: string
}

export interface IContract {
  address: string
  type: TokenType
  name: null | string
  symbol: null | string
  decimals: number | null
}

export enum TokenType {
  Erc1155 = 'ERC_1155',
  Erc20 = 'ERC_20',
  Erc721 = 'ERC_721'
}

export interface IToken {
  id: null | string
  name: null | string
  description: null | string
  imageUrl: null | string
  imageData: null | string
  externalUrl: null | string
  animationUrl: null | string
  youtubeUrl: null | string
}
