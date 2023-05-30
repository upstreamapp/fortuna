import { QueryTypes, ITotal } from '../../@types'
import { sequelize } from '../../models'
import { getTotalsForContracts } from '../../models/queries'

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
export default async function getTotals({
  contracts
}: {
  contracts: string[]
}): Promise<ITotal[]> {
  const query = getTotalsForContracts

  return sequelize.query<ITotal>(query, {
    replacements: {
      contracts
    },
    type: QueryTypes.SELECT,
    raw: false,
    plain: false
  })
}
