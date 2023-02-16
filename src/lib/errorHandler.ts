import { ErrorRequestHandler } from 'express'
import { ReportableError } from '../utils/errors/errors'
import Logger from './logger'

const logger = Logger(module)

// 500 (ignore eslint on that last unused argument; it's required for express
// to realize this is an error handler middleware)
// eslint-disable-next-line
const errorHandler: ErrorRequestHandler = (err, _req, res, _) => {
  if (err instanceof ReportableError) {
    const defaultCode = 500
    const defaultMessage = `Operation failed. Please try again later.`

    return res.status(err.code || defaultCode).send({
      success: false,
      message: err.message || defaultMessage,
      errors: err.errors || []
    })
  }

  logger.warn(err)

  return res
    .status(err.status || 500)
    .send({ success: false, message: 'Server error. Try again later?' })
}

export default errorHandler
