import { utils } from 'ethers'

/**
 * Check if the passed in address is a valid Ethereum address.
 *
 * @param {address} address - The address to be checked for validity
 *
 * @returns {boolean} `boolean` - `true`, if the address is valid, `false`, if not.
 */
export function isValidEthAddress(address: Maybe<string>): boolean {
  try {
    if (!address) {
      return false
    }

    utils.getAddress(address)
    return true
  } catch (ex) {
    return false
  }
}
