import differenceInDays from 'date-fns/differenceInDays'
import { Contract } from 'ethers'
import { TOKEN_INFO_MAX_AGE_IN_DAYS } from './constants'
import fetchRemoteMetadata from './fetchRemoteMetadata'
import { getEthClient } from './getEthClient'
import Logger from './logger'
import { ITokenInfoJobDetails } from './queueTokenInfoJobs'
import safeCall from './safeCall'
import stats from './stats'
import substituteTokenID from './substituteTokenID'
import { ContractInfo, TokenInfo } from '@models/index'
import { getCorrectTokenUrlsByExtension } from '@utils/tokenInfoHelper'

const abi = [
  'function tokenURI(uint256 _tokenId) external view returns (string)',
  'function uri(uint256 _id) external view returns (string memory)'
]

const logger = Logger(module)

/**
 * Update, or add, a token's metadata into the `TokenInfo` table.
 *
 * @remarks
 * This function not only gets metadata from the contract in the blockchain itself, but also externally hosted metadata if there's a `tokenURI` present.
 *
 * @param {tokenAddress} tokenAddress - The address of the token.
 * @param {tokenId} tokenId - The token's Id, if it exists.
 *
 * @returns {Promise<void>} This function does not return any useful value.
 */
async function updateTokenInfo({
  tokenAddress,
  tokenId
}: ITokenInfoJobDetails): Promise<void> {
  const startTime = Date.now()
  stats.increment('update_token_called')
  const address = tokenAddress.toLowerCase()

  try {
    const [contractInfo] = await ContractInfo.findOrCreate({
      where: {
        address
      }
    })
    const [token, created] = await TokenInfo.findOrCreate({
      where: {
        address,
        // coalesce to null, since `undefined` isn't a valid sequelize value
        tokenId: tokenId ?? null
      },
      defaults: {
        address,
        tokenId: tokenId ?? null,
        contractInfoId: contractInfo.id
      }
    })

    const daysSinceLastUpdate = differenceInDays(Date.now(), token.updatedAt)

    // if this token is being updated and its last update has occured in less time than or equal to TOKEN_INFO_MAX_AGE_IN_DAYS, then don't update it again.
    if (!created && daysSinceLastUpdate <= TOKEN_INFO_MAX_AGE_IN_DAYS) {
      stats.increment('update_token_not_stale')
      return
    }

    const client = await getEthClient()
    const contract = new Contract(tokenAddress, abi, client)
    const [tokenURI, uri] = await Promise.all([
      safeCall<string>(contract, 'tokenURI', tokenId),
      safeCall<string>(contract, 'uri', tokenId)
    ])

    token.tokenUri = substituteTokenID(
      tokenURI || uri || token.tokenUri,
      tokenId
    )

    if (token.tokenUri) {
      const metadata = await fetchRemoteMetadata(token.tokenUri)
      if (metadata) {
        token.imageUrl = metadata.imageUrl || token.imageUrl
        token.imageData = metadata.imageData || token.imageData
        token.externalUrl = metadata.externalUrl || token.externalUrl
        token.tokenName = metadata.tokenName || token.tokenName
        token.tokenDescription =
          metadata.tokenDescription || token.tokenDescription
        token.animationUrl = metadata.animationUrl || token.animationUrl
        token.youtubeUrl = metadata.youtubeUrl || token.youtubeUrl

        const correctUrlData = getCorrectTokenUrlsByExtension(token)

        token.imageUrl = correctUrlData.imageUrl
        token.animationUrl = correctUrlData.animationUrl
      }
    }

    token.contractInfoId = contractInfo.id

    await token.save()
    stats.histogram('update_token_finished', Date.now() - startTime)
  } catch (err) {
    console.log(err)
    logger.warn(
      `Failed at updateTokenInfo(${tokenAddress}, ${tokenId}): ${err}`
    )
    stats.histogram('update_token_failed', Date.now() - startTime)
  }
}

export default updateTokenInfo
