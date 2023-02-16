import { createLogger, format, transports } from 'winston'
import { LOG_LEVEL } from './constants'

const { combine, colorize, timestamp, printf, label } = format
const formatter = printf(
  (info: any) =>
    `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`
)

const getLabel = (callingModule: NodeModule) => {
  const parts = callingModule.filename.split('/')
  return parts[parts.length - 2] + '/' + parts.pop()
}

const generateLogger = (callingModule: NodeModule) =>
  createLogger({
    level: LOG_LEVEL || 'info',
    transports: [
      new transports.Console({
        format: combine(
          label({ label: getLabel(callingModule) }),
          colorize(),
          timestamp(),
          formatter
        )
      })
    ]
  })

export default generateLogger
