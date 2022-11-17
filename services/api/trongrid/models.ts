import * as ts from 'io-ts'

export const BaseTronGridAPIResponse = ts.type({
  error: ts.boolean,
  error_code: ts.union([ts.number, ts.null]),
  error_message: ts.union([ts.string, ts.null])
})

export const TronGridAPITokensResponseDataItem = ts.type({
  balance: ts.string,
  amount: ts.number,
  tokenAbbr: ts.string,
  tokenCanShow: ts.number,
  tokenDecimal: ts.number,
  tokenId: ts.string,
  tokenLogo: ts.string,
  logo_url: ts.string,
  tokenName: ts.string,
  tokenPriceInTrx: ts.string,
  tokenType: ts.string
})

export const TronGridAPITokensResponseData = ts.type({
  address: ts.string,
  updated_at: ts.string,
  next_update_at: ts.string,
  quote_currency: ts.string,
  chain_id: ts.number,
  pagination: ts.null,
  items: ts.array(TronGridAPITokensResponseDataItem)
})

export const TronGridAPITokensResponse = ts.intersection([
  BaseTronGridAPIResponse,
  ts.type({
    data: TronGridAPITokensResponseData
  })
])

export const TronGridAPITransactionsResponseDataItem = ts.type({
  blockNumber: ts.string,
  block_timestamp: ts.number,
  energy_fee: ts.string,
  energy_usage: ts.string,
  energy_usage_total: ts.string,
  net_fee: ts.string,
  net_usage: ts.string,
  raw_data: ts.any,
  raw_data_hex: ts.string,
  signature: ts.string,
  txID: ts.string
})

const TronGridTRC20 = ts.type({
  contractAddress: ts.string,
  tokenDecimal: ts.string,
  tokenName: ts.string,
  tokenSymbol: ts.string
})

export const TronGridTRC20Transaction = ts.type({
  TronGridTRC20,
  TronGridAPITransactionsResponseDataItem
})
