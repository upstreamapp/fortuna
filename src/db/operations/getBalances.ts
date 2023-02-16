import { QueryTypes, IBalance, IGetQuery } from '../../@types'
import { sequelize } from '../../models'
import {
  getBalancesForWallets,
  getBalancesForContracts,
  getBalancesForWalletsAndContracts
} from '../../models/queries'

/**
 * Get the appropriate sql query based on which arguments this function is called with.
 *
 * @param {IGetQuery} IGetQuery - The wallets and/or contracts arrays to distiguish between which sql query to choose.
 *
 * @returns {string | null} string | null - The sql query if wallets and/or contracts are passed in on function invocation or null.
 */
function getQuery({ wallets, contracts }: IGetQuery): string | null {
  if (wallets && contracts) {
    return getBalancesForWalletsAndContracts
  } else if (wallets && !contracts) {
    return getBalancesForWallets
  } else if (!wallets && contracts) {
    return getBalancesForContracts
  }

  return null
}

/**
 * Get the token balances for the passed in wallet adresses, or the token balances under the passed in contract addresses, or the token balances for the passed in wallet addresses that are also part of the passed in contract addresses.
 *
 * @remarks
 * This function handles a total of three querying scenarios based around which arguments it's called with.
 *
 * @param {IGetQuery} IGetQuery - The wallets and/or contracts arrays to get the balances for.
 *
 * @returns {Promise<IBalance[]>} Promise<IBalance[]> A promise that resolves to an array of balances.
 */
export default async function getBalances({
  wallets,
  contracts
}: IGetQuery): Promise<IBalance[]> {
  const query = getQuery({ wallets, contracts })
  if (!query) {
    return []
  }

  return sequelize.query<IBalance>(query, {
    replacements: {
      wallets,
      contracts
    },
    type: QueryTypes.SELECT,
    raw: false,
    plain: false
  })
}
