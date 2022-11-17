import * as ts from 'io-ts'

import {
  TokenInfo,
  IPFSTokensStorageItem,
  IPFSTokensStorageItemResponse
} from '~/logic/tokens/models'

export type TokenInfoType = ts.TypeOf<typeof TokenInfo>
export type TokenBalanceType = {
  balance: number
  usdBalance: number
  diff?: number
  tokenInfo: TokenInfoType
}

export type IPFSTokensStorageItemResponseType = ts.TypeOf<
  typeof IPFSTokensStorageItemResponse
>

export type IPFSTokensStorageItemType = ts.TypeOf<typeof IPFSTokensStorageItem>
