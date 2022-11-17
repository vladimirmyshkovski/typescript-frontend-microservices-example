import * as ts from 'io-ts'
import { BaseTransaction } from '~/logic/transactions/models'

const BaseEtherscanTransaction = ts.type({
  blockHash: ts.string,
  blockNumber: ts.string,
  confirmations: ts.string,
  cumulativeGasUsed: ts.string,
  from: ts.string,
  gasPrice: ts.string,
  gasUsed: ts.string,
  timeStamp: ts.string,
  to: ts.string,
  transactionIndex: ts.string,
  isError: ts.union([ts.string, ts.undefined])
})

/* Transaction types */

const EtherscanInternal = ts.type({
  type: ts.string,
  traceId: ts.string,
  errCode: ts.string,
  isError: ts.string
})

const EtherscanERC20 = ts.type({
  contractAddress: ts.string,
  tokenDecimal: ts.string,
  tokenName: ts.string,
  tokenSymbol: ts.string
})

const EtherscanERC721 = ts.type({
  tokenID: ts.string
})

/* Transactions */

export const EtherscanNormalTransaction = ts.intersection([
  BaseTransaction,
  BaseEtherscanTransaction
])

export const EtherscanInternalTransaction = ts.intersection([
  EtherscanNormalTransaction,
  EtherscanInternal
])

export const EtherscanERC20Transaction = ts.intersection([
  EtherscanNormalTransaction,
  EtherscanERC20
])

export const EtherscanERC721Transaction = ts.intersection([
  EtherscanNormalTransaction,
  EtherscanERC20,
  EtherscanERC721
])

/* Responses */

export const EtherscanABIResponse = ts.type({
  status: ts.string,
  message: ts.string,
  result: ts.string
})

export const EtherscanNormalTransactionsResponse = ts.type({
  status: ts.string,
  message: ts.string,
  result: ts.array(EtherscanNormalTransaction)
})

export const EtherscanInternalTransactionsResponse = ts.type({
  status: ts.string,
  message: ts.string,
  result: ts.array(EtherscanInternalTransaction)
})

export const EtherscanERC20TransactionsResponse = ts.type({
  status: ts.string,
  message: ts.string,
  result: ts.array(EtherscanERC20Transaction)
})

export const EtherscanERC721TransactionsResponse = ts.type({
  status: ts.string,
  message: ts.string,
  result: ts.array(EtherscanERC721Transaction)
})

export const EtherscanLastPriceResponse = ts.type({
  status: ts.string,
  message: ts.string,
  result: ts.any
})
