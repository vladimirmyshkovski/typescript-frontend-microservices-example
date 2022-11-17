import { Service } from 'vue-typedi'
import { TronGridAPIServiceMixin } from '~/logic/mixins/api'
import {
  TronGridAPITokenType,
  TronGridAPITransactionType
} from '~/logic/services/api/trongrid/types'
import {
  TronGridAPITokenBalanceParser,
  TronGridAPITransactionParser,
  TronGridApiTRC20Parser
} from '~/logic/services/api/trongrid/parser'
import { TokenBalanceType } from '~/logic/tokens/types'
import tokens from '~/logic/tokens'

import {
  ESortDirectionType,
  TransactionType,
  ParamsTransactionsType
} from '~/logic/transactions/types'

@Service(tokens.TRONGRID_API_SERVICE)
export default class TronGridAPIService extends TronGridAPIServiceMixin {
  public getTokenBalances = async (
    address: string
  ): Promise<TokenBalanceType[]> => {
    const URL = `${this.baseURL}account?address=${address}`
    try {
      const response = await this.$axios.get(URL)
      const parser = new TronGridAPITokenBalanceParser()
      return response.data.tokens.map(
        (token: TronGridAPITokenType): TokenBalanceType => parser.parse(token)
      )
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
      address,
      page: `${page}`,
      offset: `${offset}`,
      sort,
      module: 'account',
      action: 'txlist'
    }
    const params = new URLSearchParams(options).toString()
    const URL = `${this.transactionsURL}accounts/${address}/transactions?${params}`
    try {
      const response = await this.$axios.get(URL)
      const parser = new TronGridAPITransactionParser()
      const transactions = response.data.data.map(
        (transaction: TronGridAPITransactionType): TransactionType =>
          parser.parse(transaction)
      )
      return transactions
    } catch {
      return []
    }
  }

  /**
   * Get a list of TRC20 - Transactions
   */
  public getERC20Transactions = async ({
    address,
    contractAddress,
    page = 1,
    offset = 10,
    sort = ESortDirectionType.desc
  }: ParamsTransactionsType): Promise<any[]> => {
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
    const URL = `${this.transactionsURL}accounts/${address}/transactions?${params}`
    try {
      const response = await this.$axios.get(URL)
      const parser = new TronGridApiTRC20Parser()
      const list = response.data.data.filter(
        (e: any) => e.raw_data.contract[0]?.parameter?.value?.contract_address
      )
      const transactions = await Promise.all(
        list.map((transaction: any): any => parser.parse(transaction))
      )
      return transactions.filter((e: any) => e.token.symbol)
    } catch (err) {
      return []
    }
  }
}
