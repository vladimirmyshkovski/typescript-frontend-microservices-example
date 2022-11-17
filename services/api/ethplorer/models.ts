import * as t from 'io-ts'

export const EthplorerBalance = t.type({
  balance: t.number,
  rawBalance: t.string
})

export const EthplorerPrice = t.type({
  rate: t.number,
  currency: t.union([t.string, t.undefined]),
  diff: t.number,
  diff7d: t.union([t.number, t.undefined]),
  diff30d: t.union([t.number, t.undefined]),
  marketCapUsd: t.number,
  availableSupply: t.number,
  volume24h: t.union([t.number, t.undefined]),
  volDiff1: t.union([t.number, t.undefined]),
  volDiff7: t.union([t.number, t.undefined]),
  volDiff30: t.union([t.number, t.undefined]),
  ts: t.number
})

export const EthplorerETH = t.type({
  price: EthplorerPrice,
  balance: t.number,
  rawBalance: t.string
})

export const EthplorerContractInfo = t.type({
  creatorAddress: t.string,
  transactionHash: t.string,
  timestamp: t.number
})

export const EthplorerTokenInfo = t.partial({
  address: t.string,
  coingecko: t.string,
  facebook: t.string,
  twitter: t.string,
  totalSupply: t.string,
  storageTotalSupply: t.string,
  name: t.string,
  symbol: t.string,
  decimals: t.union([t.string, t.number]),
  publicTags: t.array(t.string),
  price: t.union([EthplorerPrice, t.boolean]),
  owner: t.string,
  countOps: t.number,
  totalIn: t.number,
  totalOut: t.number,
  transfersCount: t.number,
  ethTransfersCount: t.number,
  holdersCount: t.number,
  issuancesCount: t.number,
  image: t.string,
  description: t.string,
  website: t.string,
  telegram: t.string,
  lastUpdated: t.number,
  slot: t.number
})

export const EthplorerToken = t.type({
  balance: t.number,
  rawBalance: t.string,
  totalIn: t.number,
  totalOut: t.number,
  tokenInfo: EthplorerTokenInfo
})

export const EthplorerGetAddressInfoResponse = t.type({
  ETH: EthplorerETH,
  address: t.string,
  contractInfo: t.union([EthplorerContractInfo, t.undefined]),
  tokenInfo: t.union([EthplorerTokenInfo, t.undefined]),
  tokens: t.union([t.array(EthplorerToken), t.undefined]),
  countTxs: t.number
})
