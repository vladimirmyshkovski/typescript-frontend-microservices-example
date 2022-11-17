import { Service, Inject } from 'vue-typedi'
import CovalentAPIService from '~/logic/services/api/covalent'
import TronGridAPIService from '~/logic/services/api/trongrid'
import SolScanAPIService from '~/logic/services/api/solscan'
import { TokenBalanceType } from '~/logic/tokens/types'
import tokens from '~/logic/tokens'

@Service(tokens.TOKEN_API_SERVICE)
export default class TokenAPIService {
  @Inject(tokens.COVALENT_API_SERVICE)
  public covalentAPIService!: CovalentAPIService

  @Inject(tokens.TRONGRID_API_SERVICE)
  public tronGridAPIService!: TronGridAPIService

  @Inject(tokens.SOLSCAN_API_SERVICE)
  public solScanAPIService!: SolScanAPIService

  public getTokenBalances = async (
    address: string
  ): Promise<TokenBalanceType[]> => {
    if (!address.match('^0x[a-fA-F0-9]{40}$') && address.length === 44) {
      // if not evm related blockchain and length is 44, actually it is solana
      return await this.solScanAPIService.getTokenBalances(address)
    }

    if (!address.match('^0x[a-fA-F0-9]{40}$') && address.length === 34) {
      // if not evm related blockchain and length is 34, actually it is tron
      return await this.tronGridAPIService.getTokenBalances(address)
    }

    return await this.covalentAPIService.getTokenBalances(address)
  }
}
