import { Service } from 'vue-typedi'
import { SolScanAPIServiceMixin } from '~/logic/mixins/api'
import {
  SolScanAPITokenType,
  SolScanAPITransactionType
} from '~/logic/services/api/solscan/types'
import {
  SolScanAPISolBalanceParser,
  SolScanAPITokenBalanceParser,
  SolScanAPITransactionParser,
  SolScanApiSOL20Parser,
  SolScanApiNFTParser
} from '~/logic/services/api/solscan/parser'
import { TokenBalanceType } from '~/logic/tokens/types'
import tokens from '~/logic/tokens'

import {
  ESortDirectionType,
  TransactionType,
  ParamsTransactionsType
} from '~/logic/transactions/types'

@Service(tokens.SOLSCAN_API_SERVICE)
export default class SolScanAPIService extends SolScanAPIServiceMixin {
  public getTokenBalances = async (
    address: string
  ): Promise<TokenBalanceType[]> => {
    const URL = `${this.baseURL}${address}`
    const TOKENS_URL = `${this.baseURL}tokens?account=${address}`
    try {
      const responseBalance = await this.$axios.get(URL)
      const responseTokens = await this.$axios.get(TOKENS_URL)
      const balanceParser = new SolScanAPISolBalanceParser()
      const sol = balanceParser.parse(responseBalance.data)
      const parser = new SolScanAPITokenBalanceParser()
      const sol20Tokens = responseTokens.data.filter(
        (e: any) => e.tokenName && e.tokenIcon
      )
      const tokens = sol20Tokens.map(
        (token: SolScanAPITokenType): TokenBalanceType => parser.parse(token)
      )
      tokens.unshift(sol)
      return tokens
    } catch {
      return []
    }
  }

  public getTransactionsCount = (): Promise<number> => {
    return Promise.resolve(Number.MAX_SAFE_INTEGER)
  }

  public getNormalTransactions = async ({
    address,
    page = 1,
    offset = 10,
    sort = ESortDirectionType.desc
  }: ParamsTransactionsType): Promise<TransactionType[]> => {
    const options = {
      account: address,
      page: `${page}`,
      offset: `${offset}`,
      sort
    }
    const params = new URLSearchParams(options).toString()
    const URL = `${this.baseURL}transactions?${params}`
    try {
      const response: any = await this.$axios.get(URL)
      const parser = new SolScanAPITransactionParser()
      const transactions = response.data.map(
        (transaction: SolScanAPITransactionType): TransactionType =>
          parser.parse(transaction)
      )
      return transactions
    } catch {
      return []
    }
  }

  /**
   * Get a list of SOL20 - Transactions
   */
  public getERC20Transactions = async ({
    address,
    contractAddress,
    page = 1,
    offset = 10,
    sort = ESortDirectionType.desc
  }: ParamsTransactionsType): Promise<any[]> => {
    const options = {
      account: address,
      page: `${offset}`,
      offset: `${page}`,
      sort
    }
    if (contractAddress) {
      Object.assign(options, { contractAddress })
    }
    const params = new URLSearchParams(options).toString()
    const URL = `${this.baseURL}splTransfers?${params}&limit=20`
    try {
      const response = await this.$axios.get(URL)
      const parser = new SolScanApiSOL20Parser()
      const transactions = response.data.data.map((transaction: any): any =>
        parser.parse(transaction)
      )
      return transactions.filter((e: any) => e.token.symbol)
    } catch (err) {
      return []
    }
  }

  /**
   * Get a list of ERC721 - Transactions
   */
  public getERC721Transactions = async ({
    address,
    contractAddress,
    page = 1,
    offset = 10,
    sort = ESortDirectionType.desc
  }: ParamsTransactionsType): Promise<any[]> => {
    const options = {
      account: address,
      page: `${offset}`,
      offset: `${page}`,
      sort
    }
    if (contractAddress) {
      Object.assign(options, { contractAddress })
    }
    const params = new URLSearchParams(options).toString()
    const URL = `https://api-mainnet.magiceden.dev/v2/wallets/${address}/tokens?${params}`
    try {
      const response = await this.$axios.get(URL)
      const parser = new SolScanApiNFTParser()
      const transactions = response.data.map((transaction: any): any =>
        parser.parse(transaction)
      )
      return transactions
    } catch (err) {
      return []
    }
  }
}
