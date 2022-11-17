import EthplorerTokenBalanceParser from '~/logic/services/api/ethplorer/parser'
import { EthplorerGetAddressInfoResponseType } from '~/logic/services/api/ethplorer/types'
import { AddressInfoAdapterType, AddressInfoType } from '~/logic/address/types'

const AddressInfoAdapter = (
  addressInfo: EthplorerGetAddressInfoResponseType,
  chainId: number | string
): AddressInfoAdapterType => {
  return {
    request: (): AddressInfoType => {
      const address = addressInfo.address
      const parser = new EthplorerTokenBalanceParser()
      const ETHToken = parser.parseETHToken(addressInfo.ETH)
      let tokenInfo
      if (addressInfo.tokenInfo) {
        tokenInfo = parser.parseTokenInfo(addressInfo.tokenInfo)
      }
      let tokens = addressInfo.tokens
        ? addressInfo.tokens.map((token) => parser.parse(token))
        : []
      tokens = [ETHToken, ...tokens]
      const transactionsCount = addressInfo.countTxs
      return {
        address,
        chainId,
        tokenInfo,
        tokens,
        transactionsCount
      }
    }
  }
}

export default AddressInfoAdapter
