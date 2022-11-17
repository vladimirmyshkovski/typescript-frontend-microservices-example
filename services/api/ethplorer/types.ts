import * as ts from 'io-ts'
import {
  EthplorerETH,
  EthplorerToken,
  EthplorerTokenInfo,
  EthplorerGetAddressInfoResponse
} from '~/logic/services/api/ethplorer/models'
export type EthplorerETHType = ts.TypeOf<typeof EthplorerETH>
export type EthplorerTokenType = ts.TypeOf<typeof EthplorerToken>
export type EthplorerTokenInfoType = ts.TypeOf<typeof EthplorerTokenInfo>
export type EthplorerGetAddressInfoResponseType = ts.TypeOf<
  typeof EthplorerGetAddressInfoResponse
>
