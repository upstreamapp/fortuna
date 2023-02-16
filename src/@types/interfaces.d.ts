export {}

declare global {
  type KVMap<T> = { [key: string]: T }

  type Maybe<T> = T | null | undefined

  // eslint-disable-next-line
  interface BigInt {
    /** Convert to BigInt to string form in JSON.stringify */
    toJSON: () => string
  }
}
