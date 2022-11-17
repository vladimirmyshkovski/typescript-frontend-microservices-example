import * as ts from 'io-ts'
import {
  SolScanAPITokensResponseDataItem,
  SolScanAPITransactionsResponseDataItem,
  SolScanSOL20Transaction
} from '~/logic/services/api/solscan/models'
export type SolScanAPITokenType = ts.TypeOf<
  typeof SolScanAPITokensResponseDataItem
>
export type SolScanAPITransactionType = ts.TypeOf<
  typeof SolScanAPITransactionsResponseDataItem
>
export type SolScanSOL20TransactionType = ts.TypeOf<
  typeof SolScanSOL20Transaction
>
