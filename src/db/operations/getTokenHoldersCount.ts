import { QueryTypes, IHoldersCount, IHoldersCountRequest } from '../../@types'
import { sequelize } from '../../models'
import { getTokenHoldersCountForContracts } from '../../models/queries'

/**
 * Get the number of token holders for the passed in contract addresses.
 *
 * @param {ITotalsRequest} IGetQuery - The contracts arrays to get the holders for.
 *
 * @returns {Promise<ITotal[]>} Promise<ITotal[]> A promise that resolves to an array of holders.
 */
export default async function getTokenHoldersCount({
  contracts
}: IHoldersCountRequest): Promise<IHoldersCount[]> {
  return sequelize.query<IHoldersCount>(getTokenHoldersCountForContracts, {
    replacements: {
      contracts
    },
    type: QueryTypes.SELECT,
    raw: false,
    plain: false
  })
}
