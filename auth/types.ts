export type CurrencyType = {
  name: string
  symbol: string
  decimals: string
}

export type ChainType = {
  chainId: string
  rpcUrls: string[]
  chainName: string
  nativeCurrency: CurrencyType
  blockExplorerUrls: string[]
}

export type EventDataType = {
  selectedAddress: string
  selectedChainId: number
}

export type EventType = {
  name: string
  data: EventDataType
}

export type CallbackType = { (object: EventType): void }

export type AuthServiceSigninResponseType = {
  status: string
  message?: {
    title: string
    text: string
  }
}

export type ConnectResponseType = {
  status: string
  message?: {
    title: string
    text: string
  }
}

export type TronRequestAccountsResponseType = {
  code: number
  message: string
}

export type SwitchProviderParamsType = {
  providerName: string
  network: string
}
