import { TokenInfo } from '../models/TokenInfo/TokenInfo'

const ANIMATION_EXTENSIONS = new Set([
  'webm',
  'mpg',
  'mp2',
  'mpeg',
  'mpe',
  'mpv',
  'ogg',
  'mp4',
  'm4p',
  'm4v',
  'avi',
  'wmv',
  'mov',
  'qt',
  'flv',
  'swf'
])

const IMAGE_EXTENSIONS = new Set([
  'gif',
  'jpg',
  'jpeg',
  'jfif',
  'pjpeg',
  'pjp',
  'png',
  'svg',
  'bmp',
  'ico',
  'cur',
  'tif',
  'tiff',
  'webp',
  'apng',
  'avif'
])

type TTokenInfoUrl = Pick<TokenInfo, 'imageUrl' | 'animationUrl'>

/**
 * Correct the URLs for a token
 *
 * @param {token} token object for which to correct urls for.
 * @returns {{imageUrl: Maybe<string>, animationUrl: Maybe<string>}} {imageUrl: string, animationUrl: string} if null changes can be made or not made. Else returns an object containing new urls '{imageUrl:string, animationUrl:string, id:number}'.
 *  The resulting string might not have any changes if both urls are different but have the same type extensions
 */
export function getCorrectTokenUrlsByExtension(token: TTokenInfoUrl): {
  imageUrl: Maybe<string>
  animationUrl: Maybe<string>
} {
  //copy original object

  const imageUrl = getCorrectImageUrl(token)
  const animationUrl = getCorrectAnimationUrl(token)

  return {
    imageUrl,
    animationUrl
  }
}

/**
 * Get the correct image URL.
 *
 * @param {token} token - An object with `imageUrl` and/or `animationUrl`, or neither.
 *
 * @returns {Maybe<string>} `Maybe<string>` - Maybe the correct `imageUrl`.
 */
function getCorrectImageUrl(token: TTokenInfoUrl) {
  const urlsAreSame = token.imageUrl === token.animationUrl
  const imageUrlHasExtension = !!getExtension(token.imageUrl)
  const animationUrlHasExtension = !!getExtension(token.animationUrl)
  const isImageUrlCorrectExtension = isExtensionOfType(
    IMAGE_EXTENSIONS,
    token.imageUrl
  )
  const isAnimationReallyImageExtension = isExtensionOfType(
    IMAGE_EXTENSIONS,
    token.animationUrl
  )
  const isAnimationUrlCorrectExtension = isExtensionOfType(
    ANIMATION_EXTENSIONS,
    token.animationUrl
  )
  if (!!token.imageUrl?.length && !imageUrlHasExtension) {
    return token.imageUrl //ipfs or unknown
  } else if (!token.imageUrl?.length && isAnimationReallyImageExtension) {
    return token.animationUrl
  } else if (
    !!imageUrlHasExtension &&
    !isImageUrlCorrectExtension &&
    !!animationUrlHasExtension &&
    !isAnimationUrlCorrectExtension
  ) {
    return token.animationUrl // flipped extension case scenario
  } else if (
    !!imageUrlHasExtension &&
    !isImageUrlCorrectExtension &&
    (!token.animationUrl?.length ||
      (isAnimationUrlCorrectExtension && urlsAreSame)) // incase both sides have different mp4, we shouldnt null out
  ) {
    return null
  }

  return token.imageUrl
}

/**
 * Get the correct animation URL.
 *
 * @param {token} token - An object with `imageUrl` and/or `animationUrl`, or neither.
 *
 * @returns {Maybe<string>} `Maybe<string>` - Maybe the correct `tokenUrl`.
 */
function getCorrectAnimationUrl(token: TTokenInfoUrl) {
  const urlsAreSame = token.imageUrl === token.animationUrl
  const imageUrlHasExtension = !!getExtension(token.imageUrl)
  const animationUrlHasExtension = !!getExtension(token.animationUrl)
  const isImageUrlCorrectExtension = isExtensionOfType(
    IMAGE_EXTENSIONS,
    token.imageUrl
  )
  const isImageReallyAnimationExtension = isExtensionOfType(
    ANIMATION_EXTENSIONS,
    token.imageUrl
  )
  const isAnimationUrlCorrectExtension = isExtensionOfType(
    ANIMATION_EXTENSIONS,
    token.animationUrl
  )

  if (!!token.animationUrl?.length && !animationUrlHasExtension) {
    return token.animationUrl //ipfs
  } else if (!token.animationUrl?.length && isImageReallyAnimationExtension) {
    return token.imageUrl
  } else if (
    !!animationUrlHasExtension && //ipfs will get rejected
    !isAnimationUrlCorrectExtension &&
    !!imageUrlHasExtension &&
    !isImageUrlCorrectExtension
  ) {
    return token.imageUrl // flipped extension case scenario
  } else if (
    !!animationUrlHasExtension &&
    !isAnimationUrlCorrectExtension &&
    (!token.imageUrl?.length ||
      (isImageUrlCorrectExtension &&
        urlsAreSame)) /* incase both sides have different png, we shouldnt null out */
  ) {
    return null
  }

  return token.animationUrl
}

function getExtension(url: Maybe<string>) {
  const lastItem = url?.split('.').pop()
  if (
    lastItem &&
    (IMAGE_EXTENSIONS.has(lastItem) || ANIMATION_EXTENSIONS.has(lastItem))
  ) {
    return lastItem
  }
  return null
}

function isExtensionOfType(extensionsToCheck: Set<string>, url: Maybe<string>) {
  const extension = getExtension(url)
  return !!extension && extensionsToCheck.has(extension.toLowerCase())
}
