import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { BigNumber } from 'bignumber.js'
import {
  IGetQuery,
  IResponse,
  EthNetwork,
  IBalance,
  IEnrichedBalance,
  IHoldersCount,
  IHoldersCountRequest
} from '../@types'
export * from '../@types'

export interface IFortunaClient {
  ethMainnet: string
  ethGoerli: string
}

export type BalanceEntry = {
  balance: BigNumber
}

export type Props = {
  address: string
  network: EthNetwork
  enrich?: boolean
  refreshMissing?: boolean
}

export interface IGetBalances extends IGetQuery {
  network: EthNetwork
  enrich?: boolean
  refreshMissing?: boolean
}

export interface IGetHoldersCount extends IHoldersCountRequest {
  network: EthNetwork
}

export class FortunaClient {
  ethMainnet: string
  ethGoerli: string
  axiosClient: AxiosInstance

  constructor({ ethGoerli, ethMainnet }: IFortunaClient) {
    if (!ethGoerli || !ethMainnet) {
      throw new Error('We require both ethGoerli, ethMainnet to be strings')
    }

    this.ethMainnet = ethMainnet
    this.ethGoerli = ethGoerli
    this.axiosClient = axios.create()
  }

  public async getBalance(
    options: Props & {
      enrich: true
    }
  ): Promise<AxiosResponse<IEnrichedBalance[]>>
  public async getBalance(
    options: Props & {
      enrich: false
    }
  ): Promise<AxiosResponse<IBalance[]>>
  public async getBalance(options: Props): Promise<AxiosResponse<IBalance[]>>
  public async getBalance({
    network,
    address,
    enrich = false,
    refreshMissing = false
  }: Props) {
    const apiString = this.getApiUrl(network)

    return this.axiosClient.get<IResponse>(`${apiString}/balances/${address}`, {
      params: {
        enrich,
        refreshMissing
      }
    })
  }

  public async getBalances(
    options: IGetBalances & {
      enrich: true
    }
  ): Promise<AxiosResponse<IEnrichedBalance[]>>
  public async getBalances(
    options: IGetBalances & {
      enrich: false
    }
  ): Promise<AxiosResponse<IBalance[]>>
  public async getBalances(
    options: IGetBalances
  ): Promise<AxiosResponse<IBalance[]>>
  public async getBalances({
    network,
    contracts,
    wallets,
    refreshMissing,
    enrich = false
  }: IGetBalances) {
    const apiString = this.getApiUrl(network)

    return this.axiosClient.post<IResponse>(`${apiString}/balances`, {
      contracts,
      wallets,
      enrich,
      refreshMissing
    })
  }

  public async getTokenHoldersCount(
    options: IGetHoldersCount
  ): Promise<AxiosResponse<IHoldersCount[]>>
  public async getTokenHoldersCount({ network, contracts }: IGetHoldersCount) {
    const apiString = this.getApiUrl(network)

    return this.axiosClient.post<IResponse>(`${apiString}/holders`, {
      contracts
    })
  }

  getApiUrl = (network: EthNetwork) => {
    return network === EthNetwork.MAINNET ? this.ethMainnet : this.ethGoerli
  }
}
