import * as t from 'io-ts'

export const BaseToken = t.type({
  name: t.string,
  symbol: t.string,
  decimals: t.number
})

export const TokenInfo = t.intersection([
  t.type({
    address: t.string
  }),
  t.partial({
    id: t.number,
    totalSupply: t.string,
    image: t.string,
    rate: t.partial({
      usd: t.number
    })
  }),
  BaseToken
])

export const IPFSTokensStorageItemImages = t.type({
  images: t.type({
    16: t.string,
    32: t.string,
    64: t.string,
    128: t.string
  })
})

export const IPFSTokensStorageItem = t.intersection([
  BaseToken,
  IPFSTokensStorageItemImages
])

export const IPFSTokensStorageItemResponse = t.type({
  remainderPath: t.string,
  value: IPFSTokensStorageItem
})

export const IPFSTokensStorageRootValue = t.type({
  address: IPFSTokensStorageItem
})

export const IPFSTokensStorageRootResponse = t.type({
  remainderPath: t.string,
  value: IPFSTokensStorageRootValue
})
