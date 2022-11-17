import { AbiItem } from 'web3-utils'
import * as ts from 'io-ts'
import * as tPromise from 'io-ts-promise'
import { Service, Inject } from 'vue-typedi'
import { AxiosResponse } from 'axios'
import { EtherscanAPIServiceMixin } from '~/logic/mixins/api'
import tokens from '~/logic/tokens'
import NFTAPIService from '~/logic/nft/services/api'
import {
  ESortDirectionType,
  TransactionType,
  ParamsTransactionsType
} from '~/logic/transactions/types'
import EtherscanTransactionParser from '~/logic/services/api/etherscan/parser'
import {
  EtherscanNormalTransactionType,
  EtherscanLastPriceResponseType,
  EtherscanERC20TransactionType,
  EtherscanERC721TransactionType,
  EtherscanInternalTransactionType,
  EtherscanNormalTransactionsResponseType,
  EtherscanERC20TransactionsResponseType,
  EtherscanERC721TransactionsResponseType,
  EtherscanInternalTransactionsResponseType
} from '~/logic/services/api/etherscan/types'
import {
  EtherscanABIResponse,
  EtherscanLastPriceResponse,
  EtherscanNormalTransactionsResponse,
  EtherscanERC20TransactionsResponse,
  EtherscanERC721TransactionsResponse,
  EtherscanInternalTransactionsResponse
} from '~/logic/services/api/etherscan/models'

@Service(tokens.ETHERSCAN_API_SERVICE)
export default class EtherscanAPIService extends EtherscanAPIServiceMixin {
  @Inject(tokens.NFT_API_SERVICE)
  public nftAPIService!: NFTAPIService

  public parser = new EtherscanTransactionParser()

  /**
   * Get Contract ABI for Verified Contract Source Codes
   * https://etherscan.io/apidocs#contracts
   */
  public getABI = async (address: string): Promise<AbiItem[]> => {
    const options = { address, module: 'contract', action: 'getabi' }
    const params = new URLSearchParams(options).toString()
    const URL = `${this.baseURL}${params}`
    const response = await this.$axios.get(URL)
    const data = await tPromise.decode(EtherscanABIResponse, response.data)
    return JSON.parse(data.result)
  }

  /**
   * Get ETH / BNB / MATIC Balance for a Single Address
   * https://docs.bscscan.com/api-endpoints/accounts
   */
  public getBalance = async (address: string): Promise<number> => {
    const options = { address, module: 'address', action: 'balance' }
    const params = new URLSearchParams(options).toString()
    const URL = `${this.baseURL}${params}&apikey=${this.APIKey}`
    try {
      const response = await this.$axios.get(URL)

      const data = await tPromise.decode(
        ts.type({
          status: ts.string,
          message: ts.string,
          result: ts.string
        }),
        response.data
      )
      return Number(data.result)
    } catch {
      return 0
    }
  }

  /**
   * Returns the number of transactions performed by an address.
   * https://docs.bscscan.com/api-endpoints/geth-parity-proxy
   */
  public getTransactionsCount = async (address: string): Promise<number> => {
    const options = {
      address,
      module: 'proxy',
      action: 'eth_getTransactionCount'
    }

    const params = new URLSearchParams(options).toString()
    const URL = `${this.baseURL}${params}&apikey=${this.APIKey}`

    try {
      const response = await this.$axios.get(URL)

      const data = await tPromise.decode(
        ts.type({
          jsonrpc: ts.string,
          id: ts.number,
          result: ts.string
        }),
        response.data
      )

      return Number(data.result)
    } catch {
      return 0
    }
  }

  /**
   * Get a list of 'Normal' Transactions By Address from Etherscan API
   * https://etherscan.io/apidocs#accounts
   */
  public getNormalTransactions = async ({
    address,
    page = 1,
    offset = 10,
    sort = ESortDirectionType.desc
  }: ParamsTransactionsType): Promise<TransactionType[]> => {
    const options = {
      address,
      page: `${page}`,
      offset: `${offset}`,
      sort,
      module: 'account',
      action: 'txlist'
    }
    const params = new URLSearchParams(options).toString()
    const URL = `${this.baseURL}${params}&apikey=${this.APIKey}`

    try {
      const response: AxiosResponse<EtherscanNormalTransactionsResponseType> =
        await this.$axios.get(URL)

      const data = await tPromise.decode(
        EtherscanNormalTransactionsResponse,
        response.data
      )

      return await Promise.all(
        data.result.map(
          (transaction: EtherscanNormalTransactionType): TransactionType =>
            this.parser.parse(transaction)
        )
      )
    } catch {
      return []
    }
  }

  public getInternalTransactions = async ({
    address,
    page = 1,
    offset = 10,
    sort = ESortDirectionType.desc
  }: ParamsTransactionsType): Promise<TransactionType[]> => {
    const options = {
      address,
      page: `${page}`,
      offset: `${offset}`,
      sort,
      module: 'account',
      action: 'txlistinternal'
    }
    const params = new URLSearchParams(options).toString()
    const URL = `${this.baseURL}${params}&apikey=${this.APIKey}`

    try {
      const response: AxiosResponse<EtherscanInternalTransactionsResponseType> =
        await this.$axios.get(URL)

      const data = await tPromise.decode(
        EtherscanInternalTransactionsResponse,
        response.data
      )

      return await data.result.map(
        (transaction: EtherscanInternalTransactionType): TransactionType =>
          this.parser.parse(transaction)
      )
    } catch {
      return []
    }
  }

  /**
   * Get a list of "ERC20 - Token Transfer Events" by Address from Etherscan API
   * https://etherscan.io/apidocs#accounts
   */
  public getERC20Transactions = async ({
    address,
    contractAddress,
    page = 1,
    offset = 10,
    sort = ESortDirectionType.desc
  }: ParamsTransactionsType): Promise<TransactionType[]> => {
    const options = {
      address,
      page: `${page}`,
      offset: `${offset}`,
      sort,
      module: 'account',
      action: 'tokentx'
    }

    if (contractAddress) {
      Object.assign(options, { contractAddress })
    }

    const params = new URLSearchParams(options).toString()
    const URL = `${this.baseURL}${params}&apikey=${this.APIKey}`

    try {
      const response: AxiosResponse<EtherscanERC20TransactionsResponseType> =
        await this.$axios.get(URL)

      const data = await tPromise.decode(
        EtherscanERC20TransactionsResponse,
        response.data
      )

      return await Promise.all(
        data.result.map(
          (transaction: EtherscanERC20TransactionType): TransactionType =>
            this.parser.parse(transaction)
        )
      )
    } catch {
      return []
    }
  }

  /**
   * Get a list of "ERC721 - Token Transfer Events" by Address from Etherscan API
   * https://etherscan.io/apidocs#accounts
   */
  public getERC721Transactions = async ({
    address,
    page = 1,
    offset = 10,
    sort = ESortDirectionType.desc
  }: ParamsTransactionsType): Promise<TransactionType[]> => {
    const options = {
      address,
      page: `${page}`,
      offset: `${offset}`,
      sort,
      module: 'account',
      action: 'tokennfttx'
    }
    const params = new URLSearchParams(options).toString()
    const URL = `${this.baseURL}${params}&apikey=${this.APIKey}`

    try {
      const response: AxiosResponse<EtherscanERC721TransactionsResponseType> =
        await this.$axios.get(URL)

      const data = await tPromise.decode(
        EtherscanERC721TransactionsResponse,
        response.data
      )

      return await Promise.all(
        data.result.map(
          (transaction: EtherscanERC721TransactionType): TransactionType =>
            this.parser.parse(transaction)
        )
      )
    } catch {
      return []
    }
  }

  /**
   * Get Ether / BNB / Matic Last Price
   */
  public getRate = async (currency = 'usd'): Promise<number> => {
    const prefix = this.symbol.toLowerCase()
    const options = {
      module: 'stats',
      action: `${prefix}price`
    }
    const params = new URLSearchParams(options).toString()
    const URL = `${this.baseURL}${params}&apikey=${this.APIKey}`
    try {
      const response: AxiosResponse<EtherscanLastPriceResponseType> =
        await this.$axios.get(URL)
      const data = await tPromise.decode(
        EtherscanLastPriceResponse,
        response.data
      )
      const key = `${prefix}${currency}`
      const rate = data.result[key] || 0

      return Number(rate)
    } catch {
      return 0
    }
  }
}
