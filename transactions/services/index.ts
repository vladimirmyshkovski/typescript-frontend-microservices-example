import { Service, Inject } from 'vue-typedi'
import tokens from '~/logic/tokens'
import NFTService from '~/logic/nft/services'
import TransactionAPIService from '~/logic/transactions/services/api'
import TransactionAdapter from '~/logic/transactions/adapter'
import {
  TransactionType,
  ParamsTransactionsType
} from '~/logic/transactions/types'

@Service(tokens.TRANSACTION_SERVICE)
export default class TransactionService {
  @Inject(tokens.NFT_SERVICE)
  public nftService!: NFTService

  @Inject(tokens.TRANSACTION_API_SERVICE)
  public transactionAPIService!: TransactionAPIService

  /**
   * Get a list of 'Normal' Transactions By Address from Etherscan API
   * https://etherscan.io/apidocs#accounts
   */
  public getNormalTransactions = async (
    params: ParamsTransactionsType
  ): Promise<TransactionType[]> => {
    const transactions: TransactionType[] =
      await this.transactionAPIService.getNormalTransactions(params)

    return transactions.map((transaction: TransactionType) =>
      new TransactionAdapter(transaction).request()
    )
  }

  /**
   * Get a list of "ERC20 - Token Transfer Events" by Address from Etherscan API
   * https://etherscan.io/apidocs#accounts
   */
  public getERC20Transactions = async (
    params: ParamsTransactionsType
  ): Promise<TransactionType[]> => {
    const transactions: TransactionType[] =
      await this.transactionAPIService.getERC20Transactions(params)

    return transactions.map((transaction: TransactionType) =>
      new TransactionAdapter(transaction).request()
    )
  }

  /**
   * Get a list of "ERC721 - Token Transfer Events" by Address from Etherscan API
   * https://etherscan.io/apidocs#accounts
   */
  public getERC721Transactions = async (
    params: ParamsTransactionsType
  ): Promise<TransactionType[]> => {
    const transactions: TransactionType[] =
      await this.transactionAPIService.getERC721Transactions(params)

    if (
      !params.address?.match('^0x[a-fA-F0-9]{40}$') &&
      params.address?.length === 44
    ) {
      // if not evm related blockchain and length is 44, actually it is solana
      // @todo add address checker
      return transactions
    }

    return await Promise.all(
      transactions.map(
        async (transaction: TransactionType): Promise<TransactionType> => {
          const adapter = new TransactionAdapter(transaction)

          if (transaction.token && transaction.token.id) {
            const nft = await this.nftService.fetchOne({
              tokenId: String(transaction.token.id),
              contractAddress: transaction.token.address
            })

            adapter.addNFT(nft)
          }

          return adapter.request()
        }
      )
    )
  }

  /** refresh NFT data */
  public refreshERC721Transaction = async (
    transaction: TransactionType
  ): Promise<TransactionType> => {
    const actualTransaction = { ...transaction }

    if (!actualTransaction?.token?.id) {
      return actualTransaction
    }

    const adapter = new TransactionAdapter(actualTransaction)

    const nft = await this.nftService.fetchOne({
      tokenId: String(actualTransaction.token.id),
      contractAddress: actualTransaction.token.address
    })

    adapter.addNFT(nft)

    return adapter.request()
  }
}
