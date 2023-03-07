import { ContractInfo } from './ContractInfo/ContractInfo'
import { Status } from './Status/Status'
import { TokenInfo } from './TokenInfo/TokenInfo'
import { TokenTransfer } from './TokenTransfer/TokenTransfer'
import { dbConnection } from './db'

export const sequelize = dbConnection

sequelize.addModels([Status, TokenTransfer, TokenInfo, ContractInfo])

export { Status, TokenTransfer, TokenInfo, ContractInfo }
