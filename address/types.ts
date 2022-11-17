import { TokenInfoType, TokenBalanceType } from '~/logic/tokens/types'

export type AddressInfoType = {
  address: string
  chainId: number | string
  tokenInfo?: TokenInfoType | null
  tokens: TokenBalanceType[]
  transactionsCount: number
}

export type AddressInfoAdapterType = {
  request: () => AddressInfoType
}

export type AddressServiceDataType = {
  address: string
  chainId: number | string
}
