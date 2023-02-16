import { Sequelize } from 'sequelize-typescript'
import {
  DATABASE_CONNECTION_STRING,
  SQL_DEBUG,
  SQL_TIMEZONE
} from '../lib/constants'
import parseUrlToConnectionOptions from '../lib/parseUrlToConnectionOptions'
import { BigIntDecimal } from './BigIntDecimal'

const writeConnectionObj = parseUrlToConnectionOptions(
  DATABASE_CONNECTION_STRING as string
)

export const dbConnection = new Sequelize(
  writeConnectionObj.database!,
  writeConnectionObj.username!,
  writeConnectionObj.password!,
  {
    dialect: 'postgres',
    host: writeConnectionObj.host!,
    port: +writeConnectionObj.port!,
    logging: SQL_DEBUG === 'true' ? console.log : false,
    timezone: SQL_TIMEZONE,
    define: {
      freezeTableName: true
    },
    pool: {
      max: 20
    },
    hooks: {
      afterConnect: () => {
        dbConnection.connectionManager.refreshTypeParser({
          DECIMAL: BigIntDecimal
        })
      }
    }
  }
)

export const checkIfConnected = async () => {
  await dbConnection.authenticate()
}

export const closeConnections = async () => {
  await dbConnection.close()
}
