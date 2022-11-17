import * as ts from 'io-ts'
import {
  EtherscanNormalTransaction,
  EtherscanInternalTransaction,
  EtherscanERC20Transaction,
  EtherscanERC721Transaction,
  EtherscanNormalTransactionsResponse,
  EtherscanInternalTransactionsResponse,
  EtherscanERC20TransactionsResponse,
  EtherscanERC721TransactionsResponse,
  EtherscanABIResponse,
  EtherscanLastPriceResponse
} from '~/logic/services/api/etherscan/models'
export type EtherscanLastPriceResponseType = ts.TypeOf<
  typeof EtherscanLastPriceResponse
>
export type EtherscanNormalTransactionType = ts.TypeOf<
  typeof EtherscanNormalTransaction
>
export type EtherscanInternalTransactionType = ts.TypeOf<
  typeof EtherscanInternalTransaction
>
export type EtherscanERC20TransactionType = ts.TypeOf<
  typeof EtherscanERC20Transaction
>
export type EtherscanERC721TransactionType = ts.TypeOf<
  typeof EtherscanERC721Transaction
>
export type EtherscanNormalTransactionsResponseType = ts.TypeOf<
  typeof EtherscanNormalTransactionsResponse
>
export type EtherscanInternalTransactionsResponseType = ts.TypeOf<
  typeof EtherscanInternalTransactionsResponse
>
export type EtherscanERC20TransactionsResponseType = ts.TypeOf<
  typeof EtherscanERC20TransactionsResponse
>
export type EtherscanERC721TransactionsResponseType = ts.TypeOf<
  typeof EtherscanERC721TransactionsResponse
>
export type EtherscanABIResponseType = ts.TypeOf<typeof EtherscanABIResponse>
