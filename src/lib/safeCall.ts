import { Contract } from 'ethers'
import Logger from './logger'

const logger = Logger(module)

/**
 * Safely call a contract's method.
 *
 * @remarks
 * This function uses a try/catch block to handle exceptions.
 *
 * @param {contract} contract - An instance of the contract.
 * @param {methodName} methodName - The method name to call.
 * @param {params} params - Any parameters needed to pass to the method.
 *
 * @returns {Promise<Maybe<T>>} `Promise<Maybe<T>>` - A promise that resolves to the generic value passed in or `null`.
 */
export default async function safeCall<T>(
  contract: Contract,
  methodName: string,
  ...params: any
): Promise<Maybe<T>> {
  try {
    const val = await contract[methodName](...params)
    return val
  } catch (err) {
    logger.debug(
      `Failed at safeCall(${contract.address}, ${methodName}): ${err}`
    )
    return null
  }
}
