import { faker } from '@faker-js/faker'
import axios from 'axios'
import { handleDatabaseConnections } from '../../utils/__tests__/utils'
import fetchRemoteMetadata from '../fetchRemoteMetadata'

jest.mock('axios')

describe('fetchRemoteMetadata', () => {
  handleDatabaseConnections()
  const mockedAxiosGet = axios.get as jest.MockedFunction<typeof axios.get>

  beforeEach(async () => {
    mockedAxiosGet.mockReset()
  })

  it('should fetch metadata properly', async () => {
    mockedAxiosGet.mockReturnValue(
      new Promise(resolve =>
        resolve({
          data: {
            image: 'ipfs://QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi',
            attributes: [
              {
                trait_type: 'Mouth',
                value: 'Grin'
              },
              {
                trait_type: 'Clothes',
                value: 'Vietnam Jacket'
              },
              {
                trait_type: 'Background',
                value: 'Orange'
              },
              {
                trait_type: 'Eyes',
                value: 'Blue Beams'
              },
              {
                trait_type: 'Fur',
                value: 'Robot'
              }
            ]
          }
        })
      )
    )

    const metadata = await fetchRemoteMetadata(
      'ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/1'
    )

    expect(metadata).toEqual(
      expect.objectContaining({
        imageUrl: 'ipfs://QmPbxeGcXhYQQNgsC6a36dDyYUcHgMLnGKnF8pVFmGsvqi',
        imageData: null,
        externalUrl: undefined,
        tokenName: undefined,
        tokenDescription: undefined,
        animationUrl: undefined,
        youtubeUrl: undefined
      })
    )
  })

  it('should not return null for a fake uri', async () => {
    const metadata = await fetchRemoteMetadata(faker.random.alphaNumeric(20))
    expect(metadata).toBeNull()
  })

  it('should not return any useful metada for a URI that does not contain any metadata', async () => {
    mockedAxiosGet.mockReturnValue(
      new Promise(resolve => {
        resolve({ data: {} })
      })
    )

    const metadata = await fetchRemoteMetadata(
      `ipfs://${faker.random.alphaNumeric(20)}`
    )

    expect(metadata).toEqual(
      expect.objectContaining({
        imageUrl: null,
        imageData: null,
        externalUrl: undefined,
        tokenName: undefined,
        tokenDescription: undefined,
        animationUrl: undefined,
        youtubeUrl: undefined
      })
    )
  })
})
