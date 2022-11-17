import * as ts from 'io-ts'
import { CovalentAPITokensResponseDataItem } from '~/logic/services/api/covalent/models'
export type CovalentAPITokenType = ts.TypeOf<
  typeof CovalentAPITokensResponseDataItem
>
