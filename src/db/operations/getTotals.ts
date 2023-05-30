import { QueryTypes, ITotal, ITotalsRequest } from '../../@types'
import { sequelize } from '../../models'
import { getTotalsForContracts } from '../../models/queries'

/**
 * Get the number of token holders for the passed in contract addresses.
 *
 * @param {ITotalsRequest} IGetQuery - The contracts arrays to get the holders for.
 *
 * @returns {Promise<ITotal[]>} Promise<ITotal[]> A promise that resolves to an array of holders.
 */
export default async function getTotals({
  contracts
}: ITotalsRequest): Promise<ITotal[]> {
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
