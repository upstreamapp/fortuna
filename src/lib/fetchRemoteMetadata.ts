/* eslint @typescript-eslint/naming-convention: 0 */
import axios from 'axios'
import { isArray } from 'lodash'
import Logger from './logger'
import stats from './stats'

const logger = Logger(module)

export interface IMetadata {
  name: string
  description: string
  image: string
  image_data: string
  external_url: string
  animation_url: string
  youtube_url: string
}

type TRemoteMetadata = {
  imageUrl: string | null
  imageData: string | null
  externalUrl: any
  tokenName: string
  tokenDescription: any
  animationUrl: string
  youtubeUrl: string
}

/**
 * Get a token's remote metadata.
 *
 * @remarks
 * Also handles `ipfs` and cases of misplaced metadata values.
 *
 * @param {tokenUri} tokenUri - The `tokenUri`'s string.
 *
 * @returns {Promise<TRemoteMetadata | null>} `Promise<TRemoteMetadata | null>` - A promise that resolves to either the remote metadata or null.
 */
async function fetchRemoteMetadata(
  tokenUri: string
): Promise<TRemoteMetadata | null> {
  const startTime = Date.now()
  stats.increment('fetch_remote_metadata_called')

  try {
    const resp = tokenUri.startsWith('data:application/json;base64,')
      ? ({
          data: JSON.parse(
            Buffer.from(
              tokenUri.replace('data:application/json;base64,', ''),
              'base64'
            ).toString()
          )
        } as { data: IMetadata })
      : await axios.get<IMetadata>(
          tokenUri.replace(/^ipfs\:\/\//, 'https://ipfs.io/ipfs/'),
          { timeout: 2000 }
        )

    const {
      image,
      image_data,
      external_url,
      description,
      name,
      animation_url,
      youtube_url
    } = resp.data

    stats.histogram('fetch_remote_metadata_finished', Date.now() - startTime)

    // some tokens keep encoded images in the `image` attr, as opposed
    // to where it should be -- `image_data` attribute
    const isImageUrlEncoded = image?.startsWith('data:image')
    const imageUrl = image && !isImageUrlEncoded ? image : null
    const imageData = image_data || (isImageUrlEncoded ? image : null)

    // some tokens' metadata's `description` attr is an array. It's not clear why
    // @see 0xd0aaac09e7f9b794fafa9020a34ad5b906566a5c / 1086
    const tokenDescription = isArray(description) ? description[0] : description

    // some tokens' metadata's `external_url` attr is an array. It's not clear why
    // @see https://cloudflare-ipfs.com/ipfs/QmaaGbMief8kTZhhhvx8z9FX7cQSVT7EFLfc3evZPiPdcg/540
    const externalUrl = isArray(external_url) ? external_url[0] : external_url

    return {
      imageUrl,
      imageData,
      externalUrl,
      tokenName: name,
      tokenDescription,
      animationUrl: animation_url,
      youtubeUrl: youtube_url
    }
  } catch (err) {
    stats.histogram('fetch_remote_metadata_failed', Date.now() - startTime)
    logger.debug(`Failed at fetchRemoteMetadata(${tokenUri}): ${err}`)
    return null
  }
}

export default fetchRemoteMetadata
