import { getCorrectTokenUrlsByExtension } from './tokenInfoHelper'

describe('tokenInfoHelper', () => {
  describe('getCorrectTokenUrlsByExtension mucky data tests', () => {
    it('should return itself if it does not have extension whether other url is correct or not (and vice versa)', () => {
      // we should not assume the format
      const resp = getCorrectTokenUrlsByExtension({
        imageUrl: 'ipfs://slfjlskfjslj',
        animationUrl: 'abc.png'
      })
      expect(resp.imageUrl).toEqual('ipfs://slfjlskfjslj')
      expect(resp.animationUrl).toEqual('abc.png')

      const resp2 = getCorrectTokenUrlsByExtension({
        imageUrl: 'abc.mp4',
        animationUrl: 'ipfs://slfjlskfjslj'
      })
      expect(resp2.animationUrl).toEqual('ipfs://slfjlskfjslj')
      expect(resp2.imageUrl).toEqual('abc.mp4')
    })

    it('should return other URL if url does not exist and other url is really the correct type for this url', () => {
      const resp = getCorrectTokenUrlsByExtension({
        imageUrl: null,
        animationUrl: 'abc.png'
      })
      expect(resp.imageUrl).toEqual('abc.png')
      expect(resp.animationUrl).toEqual(null)
    })
    it('switch urls (get Image url should return animation URL and vice vers) if image extension exists, has wrong extension and animation extension exists and has wrong extension', () => {
      const resp = getCorrectTokenUrlsByExtension({
        imageUrl: 'abcd.mp4',
        animationUrl: 'abc.png'
      })
      expect(resp.imageUrl).toEqual('abc.png')
      expect(resp.animationUrl).toEqual('abcd.mp4')
    })
    it(`hould return 'null' if image extension exists but has wrong extension and there is no animation url (and vice versa)`, () => {
      const resp = getCorrectTokenUrlsByExtension({
        imageUrl: 'abcd.mp4',
        animationUrl: null
      })
      expect(resp.imageUrl).toEqual(null)
      expect(resp.animationUrl).toEqual('abcd.mp4')

      const resp2 = getCorrectTokenUrlsByExtension({
        imageUrl: null,
        animationUrl: 'abcd.png'
      })
      expect(resp2.imageUrl).toEqual('abcd.png')
      expect(resp2.animationUrl).toEqual(null)
    })
    it(`should return 'null' if image extension exists and has wrong extension and animation url is correct but the same url (and vice versa)`, () => {
      const resp = getCorrectTokenUrlsByExtension({
        imageUrl: 'abcd.mp4',
        animationUrl: 'abcd.mp4'
      })
      expect(resp.imageUrl).toEqual(null)
      expect(resp.animationUrl).toEqual('abcd.mp4')

      const resp2 = getCorrectTokenUrlsByExtension({
        imageUrl: 'abcd.png',
        animationUrl: 'abcd.png'
      })
      expect(resp2.imageUrl).toEqual('abcd.png')
      expect(resp2.animationUrl).toEqual(null)
    })
    it(`should return itself if url is correct and animation url is correct or empty (and vice versa)`, () => {
      const resp = getCorrectTokenUrlsByExtension({
        imageUrl: 'abcd.png',
        animationUrl: 'abc.mp4'
      })
      expect(resp.imageUrl).toEqual('abcd.png')
      expect(resp.animationUrl).toEqual('abc.mp4')

      const resp2 = getCorrectTokenUrlsByExtension({
        imageUrl: 'abcd.png',
        animationUrl: null
      })
      expect(resp2.imageUrl).toEqual('abcd.png')
      expect(resp2.animationUrl).toEqual(null)

      const resp3 = getCorrectTokenUrlsByExtension({
        imageUrl: null,
        animationUrl: 'abcd.mp4'
      })
      expect(resp3.imageUrl).toEqual(null)
      expect(resp3.animationUrl).toEqual('abcd.mp4')
    })
    it(`no changes should be made because extensions match but urls are different, we cannot decide which is correct`, () => {
      const resp = getCorrectTokenUrlsByExtension({
        imageUrl: 'ab.cd.mp4',
        animationUrl: 'abc.mp4'
      })
      expect(resp.imageUrl).toEqual('ab.cd.mp4')
      expect(resp.animationUrl).toEqual('abc.mp4')

      const resp2 = getCorrectTokenUrlsByExtension({
        imageUrl: 'abcd.png',
        animationUrl: 'abc.png'
      })
      expect(resp2.imageUrl).toEqual('abcd.png')
      expect(resp2.animationUrl).toEqual('abc.png')
    })
    it(`no changes should be made because neither extension matches anything`, () => {
      const resp = getCorrectTokenUrlsByExtension({
        imageUrl: 'ab.cd.fsef',
        animationUrl: 'abc.sfsf'
      })
      expect(resp.imageUrl).toEqual('ab.cd.fsef')
      expect(resp.animationUrl).toEqual('abc.sfsf')
    })
    it(`no changes if both have no extensions`, () => {
      const resp3 = getCorrectTokenUrlsByExtension({
        imageUrl: 'abcd',
        animationUrl: 'abc'
      })
      expect(resp3.imageUrl).toEqual('abcd')
      expect(resp3.animationUrl).toEqual('abc')
    })
    it(`no changes if either extensions is not fitting`, () => {
      // we cannot make a decision in this case
      const resp2 = getCorrectTokenUrlsByExtension({
        imageUrl: 'ab.cd.mp4',
        animationUrl: 'abc.fsf.wfewaf' // this does not mean its an image
      })
      expect(resp2.imageUrl).toEqual('ab.cd.mp4')
      expect(resp2.animationUrl).toEqual('abc.fsf.wfewaf')
    })
  })
})
