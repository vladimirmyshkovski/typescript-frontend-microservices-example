import { TokenBalanceType } from '~/logic/tokens/types'
import {
  SolScanAPITokenType,
  SolScanAPITransactionType
} from '~/logic/services/api/solscan/types'

export class SolScanAPISolBalanceParser {
  parse = (token: any): TokenBalanceType => {
    const balance = Number(token.lamports) / 10 ** 9
    const usdBalance = 0
    const rate = 0
    const diff = 0
    return {
      balance,
      usdBalance,
      diff,
      tokenInfo: {
        address: token.tokenId,
        name: 'Solana',
        symbol: 'Sol',
        image: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png',
        decimals: 9,
        rate: { usd: rate }
      }
    }
  }
}

export class SolScanAPITokenBalanceParser {
  parse = (token: SolScanAPITokenType): TokenBalanceType => {
    const balance =
      Number(token.tokenAmount.amount) / 10 ** token.tokenAmount.decimals
    const usdBalance = 0
    const rate = 0
    const diff = 0
    return {
      balance,
      usdBalance,
      diff,
      tokenInfo: {
        address: token.tokenAddress,
        name: token.tokenName,
        symbol: token.tokenSymbol,
        image: token.tokenIcon,
        decimals: token.tokenAmount.decimals,
        rate: { usd: rate }
      }
    }
  }
}

export class SolScanAPITransactionParser {
  parse = (tx: SolScanAPITransactionType): any => {
    return {
      gas: 0,
      hash: tx.txHash,
      nonce: '',
      input: '',
      value: tx.lamport,
      blockHash: '',
      blockNumber: tx.blockTime,
      confirmations: '',
      cumulativeGasUsed: 0,
      from: tx.signer[0],
      gasPrice: tx.fee,
      gasUsed: 0,
      timeStamp: tx.blockTime,
      to: '',
      type: 'solana'
    }
  }
}

export class SolScanApiSOL20Parser {
  parse(tx: any): any {
    return {
      gas: tx.fee,
      hash: tx.signature[0],
      nonce: '',
      input: '',
      value: 0,
      blockHash: '',
      blockNumber: 0,
      confirmations: '',
      cumulativeGasUsed: 0,
      from: tx.owner,
      gasPrice: 0,
      gasUsed: 0,
      timeStamp: 0,
      to: tx.address,
      type: 'solana',
      receiver: tx.address,
      amount: Math.abs(tx.changeAmount / 10 ** tx.decimals),
      token: {
        address: tx.tokenAddress,
        decimals: tx.decimals,
        name: tx.symbol,
        symbol: tx.symbol
      }
    }
  }
}
export class SolScanApiNFTParser {
  parse(tx: any): any {
    return {
      gas: 0,
      hash: '0x',
      nonce: '',
      input: '',
      value: 0,
      blockHash: '',
      blockNumber: 0,
      confirmations: '',
      cumulativeGasUsed: 0,
      from: tx.owner,
      gasPrice: 0,
      gasUsed: 0,
      timeStamp: 0,
      to: '0x',
      type: 'solana',
      receiver: tx.owner,
      amount: 1,
      token: {
        address: tx.mintAddress,
        decimals: 9,
        name: tx.name,
        symbol: tx.collection
      },
      nft: {
        image: tx.image,
        owner: tx.owner,
        title: tx.name,
        attributes: []
      }
    }
  }
}
