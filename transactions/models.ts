import * as ts from 'io-ts'

const BasePartialTransaction = ts.partial({})

const BaseStrictTransaction = ts.type({
  value: ts.union([ts.string, ts.undefined]),
  gas: ts.string,
  hash: ts.string,
  input: ts.string,
  nonce: ts.string,
  to: ts.string
})

export const BaseTransaction = ts.intersection([
  BasePartialTransaction,
  BaseStrictTransaction
])
