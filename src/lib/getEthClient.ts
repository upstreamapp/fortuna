import { ethers } from 'ethers'
import { EthNetwork } from '../@types'
import {
  ETH_NETWORK,
  GOERLI_RPC_PROVIDER_URL,
  MAINNET_RPC_PROVIDER_URL
} from './constants'

const ethClientByNetwork: KVMap<ethers.providers.JsonRpcProvider> = {}

export const network =
  ETH_NETWORK === 'goerli' ? EthNetwork.GOERLI : EthNetwork.MAINNET

/**
 * HTTP short-lived Client
 *
 * @remarks
 * This function allows for the reuse of a client that has already been instantiated so that resources can be preserved and operations can be carried out more efficiently.
 *
 * @returns {Promise<ethers.providers.JsonRpcProvider>} `Promise<ethers.providers.JsonRpcProvider>` - If the correct matching environment variables are present on application start, i.e. ETH_NETWORK, and/or MAINNET_RPC_PROVIDER_URL or GOERLI_RPC_PROVIDER_URL.
 */
export async function getEthClient(): Promise<ethers.providers.JsonRpcProvider> {
  if (!ethClientByNetwork[network]) {
    const client = new ethers.providers.JsonRpcProvider(
      network === EthNetwork.MAINNET
        ? (MAINNET_RPC_PROVIDER_URL as string)
        : (GOERLI_RPC_PROVIDER_URL as string),
      network === EthNetwork.MAINNET ? 0x1 : 0x5
    )

    // if the provider url is not correct or a connection is unable to be made for whatever reason, it will hang `.ready`.
    await client.ready

    ethClientByNetwork[network] = client
  }

  return ethClientByNetwork[network]
}

/**
 * Retrive all of the Eth clients that have already been created to interface with the network we're connected to.
 *
 * @returns {ethers.providers.JsonRpcProvider[]} `ethers.providers.JsonRpcProvider[]` - If there's any clients present in the ethClientByNetwork KVMap or an empty array.
 */
export function getAllEthClients(): ethers.providers.JsonRpcProvider[] {
  return Object.values(ethClientByNetwork)
}

/**
 * Correctly disposes of all of the Eth clients that have been stored in the ethClientByNetwork KVMap
 *
 * @returns {void} This function is not used for its return.
 */
export function clearAllEthClients(): void {
  Object.keys(ethClientByNetwork).forEach(key => {
    ethClientByNetwork[key].removeAllListeners()
    delete ethClientByNetwork[key]
  })
}
