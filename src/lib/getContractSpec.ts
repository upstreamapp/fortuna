import { Contract } from 'ethers'
import { TokenType } from '../@types'
import { BLACKHOLE } from './constants'
import { getEthClient } from './getEthClient'
import Logger from './logger'
import safeCall from './safeCall'

const logger = Logger(module)

const abi = [
  'function balanceOf(address) view returns (uint256)',
  'function supportsInterface(bytes4 interfaceID) external view returns (bool)'
]

/**
 * Get a contract's specification.
 *
 * @remarks
 * Only checks for `ERC20`, `ERC721`, and `ERC1155`
 *
 * @param {address} address - The address of the contract to find the spec of.
 *
 * @returns {Promise<Maybe<TokenType>>} `Promise<Maybe<TokenType>>` - A promise that maybe resolves to `TokenType` denoting the contract's specification.
 */
async function getContractSpec(address: string): Promise<Maybe<TokenType>> {
  try {
    const client = await getEthClient()
    const contract = new Contract(address, abi, client)

    // ERC721
    const isERC721 = await safeCall<boolean>(
      contract,
      'supportsInterface',
      `0x80ac58cd`
    )
    if (isERC721) {
      return TokenType.ERC_721
    }

    // ERC1155
    const isERC1155 = await safeCall<boolean>(
      contract,
      'supportsInterface',
      `0xd9b67a26`
    )
    if (isERC1155) {
      return TokenType.ERC_1155
    }

    // ERC20
    try {
      // check to see if the contract supports balanceOf() calls
      await contract.balanceOf(BLACKHOLE)
      return TokenType.ERC_20
    } catch (err) {
      return null
    }
  } catch (err) {
    logger.warn(`Failed at getContractSpec(${address}): ${err}`)
    return null
  }
}

export default getContractSpec
