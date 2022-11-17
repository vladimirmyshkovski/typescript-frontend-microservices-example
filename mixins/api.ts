import { AxiosInstance } from 'axios'
import { Container } from 'vue-typedi'
// import { ParamsTransactionsType } from '~/logic/transactions/types'
import tokens from '~/logic/tokens'
import AddressService from '~/logic/address/services'
import { EChainId } from '~/types/EChainId'

class BaseAPIServiceMixin {
  protected get $axios(): AxiosInstance {
    return Container.get(tokens.AXIOS) as AxiosInstance
  }

  protected get addressService(): AddressService {
    return Container.get(tokens.ADDRESS_SERVICE) as AddressService
  }

  protected get chainId(): any {
    return Number(this.addressService.chainId)
  }
}

export class EtherscanAPIServiceMixin extends BaseAPIServiceMixin {
  protected etherscanAPIKey = 'VQDBC4GZA5MQT2F6IRW2U6RPH66HJRSF6S' // process.env.ETHERSCAN_API_KEY
  protected bscscanAPIKey = 'TQDPK4XAU4BZT8WQNN6IETRRXXDI37W64Y'
  protected polygonscanAPIKey = '4DCKF5U2YGR1HNG1KHWP8DSK47AH85W28Z'
  protected apiURLMap: { [chainId in string | number]: string } = {
    [EChainId.eth]: 'https://api.etherscan.io/api?',
    [EChainId.ropsten]: 'https://api-ropsten.etherscan.io/api?',
    [EChainId.rinkeby]: 'https://api-rinkeby.etherscan.io/api?',
    [EChainId.goerli]: 'https://api-goerli.etherscan.io/api?',
    [EChainId.kovan]: 'https://api-kovan.etherscan.io/api?',
    [EChainId.bsc]: 'https://api.bscscan.com/api?',
    [EChainId.bscTestnet]: 'https://api-testnet.bscscan.com/api?',
    [EChainId.polygon]: 'https://api.polygonscan.com/api?',
    [EChainId.polygonTestnet]: 'https://api-testnet.polygonscan.com/api?'
  }

  protected get symbol(): string {
    if (
      [
        EChainId.eth,
        EChainId.ropsten,
        EChainId.rinkeby,
        EChainId.goerli,
        EChainId.kovan
      ].includes(this.chainId)
    ) {
      return 'ETH'
    }

    if ([EChainId.bsc, EChainId.bscTestnet].includes(this.chainId)) {
      return 'BNB'
    }

    if ([EChainId.polygon, EChainId.polygonTestnet].includes(this.chainId)) {
      return 'MATIC'
    }

    return ''
  }

  protected get APIKey(): string {
    if (
      [
        EChainId.eth,
        EChainId.ropsten,
        EChainId.rinkeby,
        EChainId.goerli,
        EChainId.kovan
      ].includes(this.chainId)
    ) {
      return this.etherscanAPIKey // process.env.ETHERSCAN_API_KEY
    }

    if ([EChainId.bsc, EChainId.bscTestnet].includes(this.chainId)) {
      return this.bscscanAPIKey // process.env.BSCSCAN_API_KEY
    }

    if ([EChainId.polygon, EChainId.polygonTestnet].includes(this.chainId)) {
      return this.polygonscanAPIKey // process.env.POLYGONSCAN_API_KEY
    }

    return this.etherscanAPIKey
  }

  protected get baseURL(): string {
    return this.apiURLMap[this.chainId]
  }
}

export class EthplorerAPIServiceMixin extends BaseAPIServiceMixin {
  protected APIKey = 'EK-wMnq4-9P88Qoh-AC399'
  protected apiURLMap: { [chainId: number]: string } = {
    [EChainId.eth]: 'https://api.ethplorer.io',
    [EChainId.kovan]: 'https://kovan-api.ethplorer.io/'
  }

  protected get baseURL(): string {
    return this.apiURLMap[this.chainId]
  }
}

export class CovalentAPIServiceMixin extends BaseAPIServiceMixin {
  protected APIKey = 'ckey_d826382c6f1b430c97ad2521c0d'

  protected get baseURL(): string {
    return `https://api.covalenthq.com/v1/${this.chainId}`
  }
}

export class TronGridAPIServiceMixin extends BaseAPIServiceMixin {
  protected get baseURL(): string {
    return 'https://apilist.tronscan.org/api/'
  }

  protected get transactionsURL(): string {
    return 'https://api.trongrid.io/v1/'
  }

  protected get symbol(): string {
    return 'TRX'
  }
}
export class SolScanAPIServiceMixin extends BaseAPIServiceMixin {
  protected get baseURL(): string {
    return 'https://public-api.solscan.io/account/'
  }

  protected get symbol(): string {
    return 'SOL'
  }
}
