import { TokenBalanceType } from '~/logic/tokens/types'
import { CovalentAPITokenType } from '~/logic/services/api/covalent/types'

export default class CovalentAPITokenBalanceParser {
  parse = (token: CovalentAPITokenType): TokenBalanceType => {
    const balance = token.contract_decimals
      ? Number(token.balance) / 10 ** token.contract_decimals
      : Number(token.balance)
    const usdBalance = token.quote || 0
    const rate = token.quote_rate || 0
    const diff = 0
    return {
      balance,
      usdBalance,
      diff,
      tokenInfo: {
        address: token.contract_address,
        name: token.contract_name ? token.contract_name : '',
        symbol: token.contract_ticker_symbol
          ? token.contract_ticker_symbol
          : '',
        image: token.logo_url,
        decimals: token.contract_decimals,
        rate: { usd: rate }
      }
    }
  }
}
