import * as tPromise from 'io-ts-promise'
import { Service } from 'vue-typedi'
import { CovalentAPIServiceMixin } from '~/logic/mixins/api'
import { CovalentAPITokensResponse } from '~/logic/services/api/covalent/models'
import { CovalentAPITokenType } from '~/logic/services/api/covalent/types'
import CovalentAPITokenBalanceParser from '~/logic/services/api/covalent/parser'
import { TokenBalanceType } from '~/logic/tokens/types'
import tokens from '~/logic/tokens'

@Service(tokens.COVALENT_API_SERVICE)
export default class CovalentAPIService extends CovalentAPIServiceMixin {
  public getTokenBalances = async (
    address: string
  ): Promise<TokenBalanceType[]> => {
    const URL = `${this.baseURL}/address/${address}/balances_v2/?key=${this.APIKey}`
    try {
      const response = await this.$axios.get(URL)
      const data = await tPromise.decode(
        CovalentAPITokensResponse,
        response.data
      )
      const parser = new CovalentAPITokenBalanceParser()

      return data.data.items.map(
        (token: CovalentAPITokenType): TokenBalanceType => parser.parse(token)
      )
    } catch {
      return []
    }
  }
}
