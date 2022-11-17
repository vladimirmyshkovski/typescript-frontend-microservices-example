import * as ts from 'io-ts'

export const BaseCovalentAPIResponse = ts.type({
  error: ts.boolean,
  error_code: ts.union([ts.number, ts.null]),
  error_message: ts.union([ts.string, ts.null])
})

export const CovalentAPITokensResponseDataItem = ts.type({
  balance: ts.string,
  balance_24h: ts.union([ts.string, ts.null]),
  contract_address: ts.string,
  contract_decimals: ts.number,
  contract_name: ts.union([ts.string, ts.null]),
  contract_ticker_symbol: ts.union([ts.string, ts.null]),
  last_transferred_at: ts.union([ts.string, ts.null]),
  logo_url: ts.string,
  nft_data: ts.union([ts.null, ts.string]),
  quote: ts.union([ts.null, ts.number]),
  quote_24h: ts.union([ts.null, ts.number]),
  quote_rate: ts.union([ts.null, ts.number]),
  quote_rate_24h: ts.union([ts.null, ts.number]),
  supports_erc: ts.union([ts.null, ts.array(ts.string)]),
  type: ts.string
})

export const CovalentAPITokensResponseData = ts.type({
  address: ts.string,
  updated_at: ts.string,
  next_update_at: ts.string,
  quote_currency: ts.string,
  chain_id: ts.number,
  pagination: ts.null,
  items: ts.array(CovalentAPITokensResponseDataItem)
})

export const CovalentAPITokensResponse = ts.intersection([
  BaseCovalentAPIResponse,
  ts.type({
    data: CovalentAPITokensResponseData
  })
])
