import { Service, Inject } from 'vue-typedi'
import tokens from '~/logic/tokens'
import EtherscanAPIService from '~/logic/services/api/etherscan'

@Service(tokens.ADDRESS_API_SERVICE)
export default class AddressAPIService {
  @Inject(tokens.ETHERSCAN_API_SERVICE)
  public etherscanAPIService!: EtherscanAPIService
  // NEED TO MOVE TO /logic/services/ethplorer
  /**
   * Get address info from Ethpltorer API
   * https://github.com/EverexIO/Ethplorer/wiki/Ethplorer-API
  public getAddressInfo = async (address: string): Promise<AddressInfoType> => {
    const URL = `${this.ethplorerBaseURL}getAddressInfo/${address}?apiKey=${this.ethplorerApiKey}`
    try {
      const response = await this.$axios.get(URL)
      const data = await tPromise.decode(
        EthplorerGetAddressInfoResponse,
        response.data
      )
      return AddressInfoAdapter(data).request()
    } catch (error) {
      return {
        address,
        tokenInfo: null,
        tokens: [],
        transactionsCount: 0
      }
    }
  }
  */

  /**
   * Get ETH / BNB / MATIC Balance for a Single Address
   * https://docs.bscscan.com/api-endpoints/accounts
   */
  public getBalance = async (address: string): Promise<number> => {
    return await this.etherscanAPIService.getBalance(address)
  }

  /**
   * Returns the number of transactions performed by an address.
   * https://docs.bscscan.com/api-endpoints/geth-parity-proxy
   */
  public getTransactionsCount = async (address: string): Promise<number> => {
    return await this.etherscanAPIService.getTransactionsCount(address)
  }
}
