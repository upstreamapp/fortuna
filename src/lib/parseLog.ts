import { ethers } from 'ethers'
import Abi from 'web3-eth-abi'
import { TAbi, TAbiInput } from '../@types'
import nonNullable from '../utils/guards/nonNullable'

type ParsedLogArgs = {
  from: string
  to: string
  value?: string
  tokenId?: string
  operator?: string
  id?: string
  ids?: string[]
  values?: string[]
}

type ParsedLog = {
  name: string
  address: string
  blockNumber: number
  blockHash: string
  transactionHash: string
  logIndex: number
  args: ParsedLogArgs
  log: ethers.providers.Log
}

type CachedParsersValue = {
  name: string
  sig: string
  parseArgs: ({ topics, data }: { topics: any; data: any }) => ParsedLogArgs
}

type DecodedData = { [key: string]: string }

const cachedParsers: Map<
  string,
  {
    name: string
    sig: string
    parseArgs: ({ topics, data }: { topics: any; data: any }) => {}
  }
> = new Map()

/**
 * Check if the passed in type is dynamically-sized.
 *
 * @param {type} type - The event's ABI input type
 *
 * @returns {boolean} `true` if the passed in type is dynamically-sized and `false` if not.
 */
const indexedAsHash = (type: string): boolean =>
  !(
    (type.startsWith('uint') ||
      type.startsWith('int') ||
      type.startsWith('byte') ||
      type.startsWith('bool') ||
      type.startsWith('address')) &&
    !type.includes('[')
  )

/**
 * Decode the current data based on the names and types.
 *
 * @param {names} names - The event's ABI input names
 * @param {types} types - The event's ABI input types
 * @param {data} data - The log's data
 *
 * @returns {DecodedData} `DecodedData` - The decoded log data.
 */
const decodeParameters = (
  names: string[],
  types: string[],
  data: string
): DecodedData => {
  const ret: DecodedData = {}

  if (names.length && names.length === types.length) {
    const result = Abi.decodeParameters(types, data)

    for (let i = 0; types.length > i; i += 1) {
      if (undefined !== result[i]) {
        ret[names[i]] = result[i]
      }
    }
  }

  return ret
}

/**
 * Create a log parser.
 *
 * @param {inputs} inputs - The event's ABI input array
 *
 * @returns {function({topics: string[], data: string}): ParsedLogArgs} The log parser.
 */
const createArgsParser = (
  inputs: TAbiInput[]
): ((arg0: { topics: string[]; data: string }) => ParsedLogArgs) => {
  const indexedNames: string[] = []
  const indexedTypes: string[] = []

  const nonIndexedNames: string[] = []
  const nonIndexedTypes: string[] = []

  inputs.forEach(({ indexed, name, type }) => {
    if (indexed) {
      indexedNames.push(name)

      // dynamically-sized values do not get stored as-is, they are SHA3'd prior
      // to being indexed
      if (indexedAsHash(type)) {
        indexedTypes.push('bytes32')
      } else {
        indexedTypes.push(type)
      }
    } else {
      nonIndexedNames.push(name)
      nonIndexedTypes.push(type)
    }
  })

  /**
   * Parse the logs into an organized and readable format.
   *
   * @function parser
   *
   * @param {log} log - The current log that is being parsed
   * @param {string[]} log.topics - The topics for the current log
   * @param {string} log.data = The data for the current log
   *
   * @returns {ParsedLogArgs} `ParsedLogArgs` - All of the arguments parsed.
   */
  return ({
    topics,
    data
  }: {
    topics: string[]
    data: string
  }): ParsedLogArgs => {
    // trim "0x.." from the front
    const indexedData = topics
      .slice(1)
      .map(str => str.slice(2))
      .join('')
    const nonIndexedData = data.slice(2)

    const args: ParsedLogArgs = {
      from: '',
      to: ''
    }

    // decode all of the parameters and assign them to the args object
    Object.assign(
      args,
      decodeParameters(indexedNames, indexedTypes, indexedData)
    )
    Object.assign(
      args,
      decodeParameters(nonIndexedNames, nonIndexedTypes, nonIndexedData)
    )

    return args
  }
}

/**
 * Parse the logs received from the Ethereum node into an organized and readable format.
 *
 * @param {logs} logs - The logs needed to be parsed
 * @param {eventAbis} eventAbis - The ABIs of the transfer events used to match event signatures and get event names
 * @param {filter} filter - An object with optional address and optional blockNumber parameters that can be used for further filtering of logs.
 *
 * @returns {ParsedLog[]} All of the logs that have been parsed and found to match the given eventAbis.
 */
const parseLog = (
  logs: ethers.providers.Log[],
  eventAbis: TAbi,
  filter: { address?: string; blockNumber?: number } = {}
): ParsedLog[] => {
  // remove ABIs that are anonymous
  const filteredAbis = eventAbis.filter(({ anonymous }) => !anonymous)

  const parsers = filteredAbis.map(thisAbi => {
    const key = JSON.stringify(thisAbi)

    if (!cachedParsers.get(key)) {
      const { name, inputs } = thisAbi

      // compute event signature hash
      const sig = Abi.encodeEventSignature(
        `${name}(${inputs.map(({ type }) => type).join(',')})`
      )

      cachedParsers.set(key, {
        name,
        sig,
        parseArgs: createArgsParser(inputs)
      })
    }

    return cachedParsers.get(key) as CachedParsersValue
  })

  let filteredLogs = logs

  if (Object.keys(filter).length) {
    filteredLogs = logs.filter(
      ({ address, blockNumber }) =>
        (undefined === filter.address ||
          address.toLowerCase() === filter.address.toLowerCase()) &&
        (undefined === filter.blockNumber || blockNumber === filter.blockNumber)
    )
  }

  return filteredLogs
    .map(log => {
      for (let i = 0; i < parsers.length; i++) {
        const { name, sig, parseArgs } = parsers[i]

        if (log.topics[0] === sig) {
          try {
            return {
              name,
              address: log.address,
              blockNumber: log.blockNumber,
              blockHash: log.blockHash,
              transactionHash: log.transactionHash,
              logIndex: log.logIndex,
              args: parseArgs(log),
              log
            }
          } catch (err) {
            // console.error(
            //   `Error parsing args for event ${name} in block ${log.blockNumber} in transaction ${log.transactionHash}`
            // )
          }
        }
      }
    })
    .filter(nonNullable)
}

export default parseLog
