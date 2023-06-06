import { readFileSync } from 'fs'
import { join, resolve } from 'path'

/**
 * Get the contents of the sql file.
 *
 * @remarks
 * This function use's Node's synchronous `readFileSync` method.
 *
 * @param {name} name - The name of the sql file.
 *
 * @returns {string} string - The contents of the file.
 */
function loadSqlFile(name: string): string {
  return readFileSync(
    join(resolve(__dirname, '../..'), `sql/${name}.sql`),
    'utf8'
  )
}

export const getBalancesForWallets: string = loadSqlFile(
  'GetBalancesForWallets'
)

export const getBalancesForContracts: string = loadSqlFile(
  'GetBalancesForContracts'
)

export const getBalancesForWalletsAndContracts: string = loadSqlFile(
  'GetBalancesForWalletsAndContracts'
)

export const getTokenHoldersCountForContracts: string = loadSqlFile(
  'GetTokenHoldersCountForContracts'
)
