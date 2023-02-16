import { Op } from 'sequelize'
import { IBalance, IEnrichedBalance, ITokenInfo } from '../../@types'
import queueTokenInfoJobs from '../../lib/queueTokenInfoJobs'
import { TokenInfo } from '../../models/TokenInfo/TokenInfo'

/**
 * Map an instance of `TokenInfo` into `ITokenInfo`.
 *
 * @param {tokenInfo} tokenInfo - An instance of `TokenInfo`.
 *
 * @returns {Maybe<ITokenInfo>} The `TokenInfo` mapped into `ITokenInfo` or `null` if the function is called with no arguments.
 */
function tokenInfoMapper(tokenInfo: Maybe<TokenInfo>): Maybe<ITokenInfo> {
  if (!tokenInfo) {
    return null
  }

  return {
    contract: {
      address: tokenInfo.address,
      type: tokenInfo.tokenType,
      name: tokenInfo.contractName,
      symbol: tokenInfo.symbol,
      decimals: tokenInfo.decimals
    },
    token: {
      id: tokenInfo.tokenId,
      name: tokenInfo.tokenName,
      description: tokenInfo.tokenDescription,
      imageUrl: tokenInfo.imageUrl,
      imageData: tokenInfo.imageData,
      externalUrl: tokenInfo.externalUrl,
      animationUrl: tokenInfo.animationUrl,
      youtubeUrl: tokenInfo.youtubeUrl
    },
    lastUpdated: tokenInfo.updatedAt
  }
}

/**
 * Enrich token balances with token metadata.
 *
 * @remarks
 * This function also allows the caller to add tokens that have been indexed but that have not had their metadata extracted, into the queue for extraction by the tokenInfoServer.
 *
 * @param {balances} balances - The tokens and their balances
 * @param {refreshMissingTokens} refreshMissingTokens - `true`, if tokens that have been indexed but have not had their metadata extracted should have their metadata extracted. `false`, if not.
 *
 * @returns {Promise<IEnrichedBalance[]>} Promise<IEnrichedBalance[]> - The tokens with their metadata and their balances.
 */
async function enrichBalances(
  balances: IBalance[],
  refreshMissingTokens: boolean = false
): Promise<IEnrichedBalance[]> {
  const tokens = await TokenInfo.findAll({
    where: {
      [Op.or]: balances.map(balance => ({
        address: balance.tokenAddress,
        tokenId: balance.tokenId ?? null
      }))
    }
  })

  // add tokens that have been indexed but that have not had their metadata extracted, into the queue for extraction by the tokenInfoServer.
  if (refreshMissingTokens) {
    const missingTokens = balances.filter(
      balance =>
        !tokens.find(
          token =>
            token.address === balance.tokenAddress &&
            token.tokenId === balance.tokenId
        )
    )

    await queueTokenInfoJobs(
      missingTokens.map(missingToken => ({
        tokenAddress: missingToken.tokenAddress,
        tokenId: missingToken.tokenId
      }))
    )
  }

  return balances.map(balance => ({
    ...balance,
    token: tokenInfoMapper(
      tokens.find(
        token =>
          balance.tokenAddress.toLowerCase() === token.address.toLowerCase() &&
          (!token.tokenId || token.tokenId === balance.tokenId)
      )
    )
  }))
}

export default enrichBalances
