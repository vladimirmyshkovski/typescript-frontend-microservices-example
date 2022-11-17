import { Service, Inject } from 'vue-typedi'
import tokens from '~/logic/tokens'
import EtherscanAPIService from '~/logic/services/api/etherscan'
import TronGridAPIService from '~/logic/services/api/trongrid'
import SolScanAPIService from '~/logic/services/api/solscan'
import {
  ESortDirectionType,
  TransactionType,
  ParamsTransactionsType
} from '~/logic/transactions/types'

@Service(tokens.TRANSACTION_API_SERVICE)
export default class TransactionAPIService {
  @Inject(tokens.ETHERSCAN_API_SERVICE)
  public etherscanAPIService!: EtherscanAPIService

  @Inject(tokens.TRONGRID_API_SERVICE)
  public tronGridAPIService!: TronGridAPIService

  @Inject(tokens.SOLSCAN_API_SERVICE)
  public solScanAPIService!: SolScanAPIService

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
    /** API solana */
    if (!address.match('^0x[a-fA-F0-9]{40}$') && address.length === 44) {
      // if not evm related blockchain and length is 44, actually it is solana
      return await this.solScanAPIService.getNormalTransactions({
        address,
        page,
        offset,
        sort
      })
    }

    /** API tron */
    if (!address.match('^0x[a-fA-F0-9]{40}$') && address.length === 34) {
      // if not evm related blockchain and length is 34, actually it is tron
      // @todo add address checker
      return await this.tronGridAPIService.getNormalTransactions({
        address,
        page,
        offset,
        sort
      })
    }

    /** API etherscan */
    return await this.etherscanAPIService.getNormalTransactions({
      address,
      page,
      offset,
      sort
    })
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
    /** API solana */
    if (!address.match('^0x[a-fA-F0-9]{40}$') && address.length === 44) {
      // if not evm related blockchain and length is 44, actually it is solana
      // @todo add address checker
      return await this.solScanAPIService.getERC20Transactions({
        address,
        page,
        offset,
        sort
      })
    }

    /** API tron */
    if (!address.match('^0x[a-fA-F0-9]{40}$') && address.length === 34) {
      // if not evm related blockchain and length is 34, actually it is tron
      // @todo add address checker
      return await this.tronGridAPIService.getERC20Transactions({
        address,
        page,
        offset,
        sort
      })
    }

    /** API etherscan */
    return await this.etherscanAPIService.getERC20Transactions({
      address,
      contractAddress,
      page,
      offset,
      sort
    })
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
    /** API solana */
    if (!address.match('^0x[a-fA-F0-9]{40}$') && address.length === 44) {
      // if not evm related blockchain and length is 44, actually it is solana
      // @todo add address checker
      return await this.solScanAPIService.getERC721Transactions({
        address,
        page,
        offset,
        sort
      })
    }

    /** API etherscan */
    return await this.etherscanAPIService.getERC721Transactions({
      address,
      page,
      offset,
      sort
    })
  }
}
