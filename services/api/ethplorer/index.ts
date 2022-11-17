import * as tPromise from 'io-ts-promise'
import { Service } from 'vue-typedi'
import tokens from '~/logic/tokens'
import { EthplorerAPIServiceMixin } from '~/logic/mixins/api'
import { EthplorerGetAddressInfoResponse } from '~/logic/services/api/ethplorer/models'
import { AddressInfoType } from '~/logic/address/types'
import AddressInfoAdapter from '~/logic/address/adapter'

@Service(tokens.ETHPLORER_API_SERVICE)
export default class EthplorerAPIService extends EthplorerAPIServiceMixin {
  /**
   * Get address info from Ethpltorer API
   * https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API
   */
  public getAddressInfo = async (
    address: string,
    chainId: number | string
  ): Promise<AddressInfoType> => {
    const URL = `${this.baseURL}getAddressInfo/${address}?apiKey=${this.APIKey}`
    try {
      const response = await this.$axios.get(URL)
      const data = await tPromise.decode(
        EthplorerGetAddressInfoResponse,
        response.data
      )
      return AddressInfoAdapter(data, chainId).request()
    } catch (error) {
      return {
        address,
        chainId,
        tokenInfo: null,
        tokens: [],
        transactionsCount: 0
      }
    }
  }
}
