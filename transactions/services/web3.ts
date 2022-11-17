import { Transaction } from 'web3-eth/types'
import { Service, Inject } from 'vue-typedi'
import Web3 from 'web3'
import tokens from '~/logic/tokens'
import {
  TransactionType,
  ParamsTransactionsType
} from '~/logic/transactions/types'

@Service(tokens.TRANSACTION_WEB3_SERVICE)
export default class TransactionWeb3Service {
  @Inject(tokens.WEB3)
  public $web3!: Web3

  /**
   * Get a list of 'Normal' Transactions By Address from Etherscan API
   * https://etherscan.io/apidocs#accounts
   */
  public getNormalTransactions = async (
    params: ParamsTransactionsType
  ): Promise<TransactionType[]> => {
    const offset = Number(params.offset || 10)
    const transactions: TransactionType[] = []
    const lastBlock = await this.$web3.eth.getBlockNumber()
    let block = await this.$web3.eth.getBlock(lastBlock, true)
    while (transactions.length <= offset) {
      block.transactions.forEach((transaction: Transaction | string) => {
        if (
          !(typeof transaction === 'string') &&
          (params.address === '*' ||
            params.address === transaction.from ||
            params.address === transaction.to)
        ) {
          const tx: TransactionType = {
            gas: String(transaction.gas),
            hash: transaction.hash,
            input: transaction.input,
            nonce: String(transaction.nonce),
            value: transaction.value,
            blockHash: String(transaction.blockHash),
            blockNumber: String(transaction.blockNumber),
            confirmations: '0',
            cumulativeGasUsed: '0',
            from: transaction.from,
            gasPrice: transaction.gasPrice,
            gasUsed: '0',
            timeStamp: '0',
            to: String(transaction.to),
            sender: transaction.from,
            receiver: String(transaction.to)
          }
          transactions.push(tx)
        }
      })
      block = await this.$web3.eth.getBlock(lastBlock - 1, true)
    }
    return transactions
  }

  /**
   * Proxy methods
   */
  public getInternalTransactions = async (
    params: ParamsTransactionsType
  ): Promise<TransactionType[]> => {
    return await this.getNormalTransactions(params)
  }

  public getERC20Transactions = async (
    params: ParamsTransactionsType
  ): Promise<TransactionType[]> => {
    return await this.getNormalTransactions(params)
  }

  public getERC721Transactions = async (
    params: ParamsTransactionsType
  ): Promise<TransactionType[]> => {
    return await this.getNormalTransactions(params)
  }
}
