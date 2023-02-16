import { Status } from './Status/Status'
import { TokenInfo } from './TokenInfo/TokenInfo'
import { TokenTransfer } from './TokenTransfer/TokenTransfer'
import { dbConnection } from './db'

export const sequelize = dbConnection

sequelize.addModels([Status, TokenTransfer, TokenInfo])

export { Status, TokenTransfer }
