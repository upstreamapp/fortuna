import { URL } from 'url'
import { ConnectionOptions } from 'sequelize'

export default function parseUrlToConnectionOptions(
  connectionStr: string
): ConnectionOptions {
  const obj = new URL(connectionStr)
  return {
    host: obj.hostname,
    port: obj.port,
    username: obj.username,
    password: obj.password,
    database: obj.pathname.substring(1)
  }
}
