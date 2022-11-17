import * as ts from 'io-ts'
import {
  TronGridAPITokensResponseDataItem,
  TronGridAPITransactionsResponseDataItem,
  TronGridTRC20Transaction
} from '~/logic/services/api/trongrid/models'
export type TronGridAPITokenType = ts.TypeOf<
  typeof TronGridAPITokensResponseDataItem
>
export type TronGridAPITransactionType = ts.TypeOf<
  typeof TronGridAPITransactionsResponseDataItem
>
export type TronGridTRC20TransactionType = ts.TypeOf<
  typeof TronGridTRC20Transaction
>
