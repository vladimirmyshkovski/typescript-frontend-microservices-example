import { TransactionType } from '~/logic/transactions/types'
import {
  EtherscanNormalTransactionType,
  EtherscanERC20TransactionType,
  EtherscanERC721TransactionType
} from '~/logic/services/api/etherscan/types'
import { TokenInfoType } from '~/logic/tokens/types'

export default class EtherscanTransactionParser {
  private parseTokenInfo(
    transaction: EtherscanERC20TransactionType | EtherscanERC721TransactionType
  ): TokenInfoType | null {
    if (!transaction.contractAddress) {
      return null
    }

    const tokenInfo = {
      address: transaction.contractAddress,
      decimals: Number(transaction.tokenDecimal),
      name: transaction.tokenName,
      symbol: transaction.tokenSymbol
    }

    if ('tokenID' in transaction) {
      Object.assign(tokenInfo, { id: transaction.tokenID })
    }

    return tokenInfo
  }

  public parse(
    transaction:
      | EtherscanNormalTransactionType
      | EtherscanERC20TransactionType
      | EtherscanERC721TransactionType
  ): TransactionType {
    return {
      gas: transaction.gas,
      hash: transaction.hash,
      input: transaction.input,
      nonce: transaction.nonce,
      value: transaction.value || '',
      blockHash: transaction.blockHash,
      blockNumber: transaction.blockNumber,
      confirmations: transaction.confirmations,
      cumulativeGasUsed: transaction.cumulativeGasUsed,
      from: transaction.from,
      gasPrice: transaction.gasPrice,
      gasUsed: transaction.gasUsed,
      timeStamp: transaction.timeStamp,
      to: transaction.to,
      sender: transaction.from,
      receiver: transaction.to,
      isError: transaction.isError,
      token:
        'contractAddress' in transaction
          ? this.parseTokenInfo(transaction)
          : null
    }
  }
}
