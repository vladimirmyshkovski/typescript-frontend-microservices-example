import { TokenBalanceType } from '~/logic/tokens/types'
import {
  TronGridAPITokenType,
  TronGridAPITransactionType
} from '~/logic/services/api/trongrid/types'

declare const window: Window &
  typeof globalThis & {
    tronWeb: any
  }

export class TronGridAPITokenBalanceParser {
  parse = (token: TronGridAPITokenType): TokenBalanceType => {
    const balance = Number(token.balance) / 10 ** token.tokenDecimal
    const usdBalance = 0
    const rate = 0
    const diff = 0
    return {
      balance,
      usdBalance,
      diff,
      tokenInfo: {
        address: token.tokenId,
        name: token.tokenName,
        symbol: token.tokenAbbr,
        image: token.tokenLogo,
        decimals: token.tokenDecimal,
        rate: { usd: rate }
      }
    }
  }
}

export class TronGridAPITransactionParser {
  parse = (tx: TronGridAPITransactionType): any => {
    return {
      gas: tx.energy_usage,
      hash: tx.txID,
      nonce: '',
      input: '',
      value: tx.raw_data.contract[0].parameter.value.amount,
      blockHash: '',
      blockNumber: tx.blockNumber,
      confirmations: '',
      cumulativeGasUsed: tx.energy_usage_total,
      from: window.tronWeb.address.fromHex(
        tx.raw_data.contract[0].parameter.value.owner_address
      ),
      gasPrice: tx.energy_fee,
      gasUsed: tx.net_usage,
      timeStamp: tx.block_timestamp / 1000,
      to: window.tronWeb.address.fromHex(
        tx.raw_data.contract[0].parameter.value.to_address
      ),
      type: 'tron'
    }
  }
}

export class TronGridApiTRC20Parser {
  async transactionDecodedInfo(tx: any) {
    try {
      const address = tx.raw_data.contract[0].parameter.value.contract_address
      const token = await window.tronWeb.contract().at(address)
      const symbol = await token.symbol().call()
      const decimals = await token.decimals().call()
      const transactionData = await token.decodeInput(
        tx.raw_data.contract[0].parameter.value.data
      )
      const method = transactionData.name
      const to = window.tronWeb.address.fromHex(transactionData._to)
      const amount = transactionData.params._value.toString() / 10 ** decimals
      const from = window.tronWeb.address.fromHex(
        tx.raw_data.contract[0].parameter.value.owner_address
      )
      return {
        from,
        to,
        amount,
        method,
        address,
        decimals: Number(decimals),
        name: symbol,
        symbol
      }
    } catch {
      return {}
    }
  }

  async parse(tx: any): Promise<any> {
    const transactionDecoded = await this.transactionDecodedInfo(tx)
    return {
      gas: tx.energy_usage,
      hash: tx.txID,
      nonce: '',
      input: '',
      value: tx.raw_data.contract[0].parameter.value.amount,
      blockHash: '',
      blockNumber: tx.blockNumber,
      confirmations: '',
      cumulativeGasUsed: tx.energy_usage_total,
      from: transactionDecoded.from,
      gasPrice: tx.energy_fee,
      gasUsed: tx.net_usage,
      timeStamp: tx.block_timestamp / 1000,
      to: transactionDecoded.to,
      type: 'tron',
      receiver: transactionDecoded.to,
      amount: transactionDecoded.amount,
      token: {
        address: transactionDecoded.address,
        decimals: transactionDecoded.decimals,
        name: transactionDecoded.name,
        symbol: transactionDecoded.symbol
      }
    }
  }
}
