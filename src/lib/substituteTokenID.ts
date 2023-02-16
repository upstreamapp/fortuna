import BigNumber from 'bignumber.js'
import Logger from './logger'

const logger = Logger(module)

/**
 * Substitute the token's URI ID, if present in the URI, with formatted tokenId.
 *
 * @param {uri} uri - The token's URI, if present.
 * @param {tokenId} tokenId - The token's ID, if present.
 *
 * @returns {Maybe<string>} `Maybe<string>` - Maybe the passed in `uri`, or the `uri` with the substituted ID.
 */
function substituteTokenID(
  uri: Maybe<string>,
  tokenId: Maybe<string>
): Maybe<string> {
  if (!uri) {
    return null
  } else if (!tokenId) {
    return uri
  } else if (!uri.includes('{id}')) {
    return uri
  }

  try {
    const hexTokenId = new BigNumber(tokenId).toString(16)
    const tokenIdWithoutPrefix = hexTokenId.replace('0x', '')
    const paddedTokenId = tokenIdWithoutPrefix.padStart(64, '0')
    return uri.replace('{id}', paddedTokenId)
  } catch (err) {
    logger.warn(`Failed at substituteTokenID(${uri}, ${tokenId}): ${err}`)
    return uri
  }
}

export default substituteTokenID
