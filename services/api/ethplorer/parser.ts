import {
  EthplorerTokenType,
  EthplorerTokenInfoType,
  EthplorerETHType
} from '~/logic/services/api/ethplorer/types'

import { TokenInfoType, TokenBalanceType } from '~/logic/tokens/types'

export default class EthplorerTokenBalanceParser {
  parseETHToken(eth: EthplorerETHType): TokenBalanceType {
    const price = eth.price || {
      rate: 0,
      diff: 0,
      marketCapUsd: 0,
      availableSupply: 0,
      ts: 0
    }
    const ethToken = {
      balance: eth.balance,
      rawBalance: eth.rawBalance || `${eth.balance}`,
      totalIn: 0,
      totalOut: 0,
      tokenInfo: {
        address: '',
        decimals: '18',
        symbol: 'ETH',
        name: 'Ethereum',
        coingecko: '',
        facebook: '',
        twitter: '',
        storageTotalSupply: '',
        publicTags: [''],
        price,
        owner: '',
        countOps: 0,
        totalIn: 0,
        totalOut: 0,
        transfersCount: 0,
        ethTransfersCount: 0,
        holdersCount: 0,
        issuancesCount: 0,
        image:
          'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fbitinfocharts.com%2Fimgs33%2Fethereum.png',
        description: '',
        website: '',
        telegram: '',
        lastUpdated: 0,
        slot: 0
      }
    }
    return this.parse(ethToken)
  }

  parseImage(tokenInfo: EthplorerTokenInfoType): string {
    let image = ''
    if (tokenInfo.image && tokenInfo.image.startsWith('https')) {
      image = tokenInfo.image
    } else if (tokenInfo.image && !tokenInfo.image.startsWith('https')) {
      image = 'https://ethplorer.io' + tokenInfo.image
    }
    return image
  }

  parseTokenInfo(tokenInfo: EthplorerTokenInfoType): TokenInfoType {
    return {
      address: tokenInfo.address ? tokenInfo.address : '',
      totalSupply: tokenInfo.totalSupply ? tokenInfo.totalSupply : '',
      name: tokenInfo.name ? tokenInfo.name : '',
      symbol: tokenInfo.symbol ? tokenInfo.symbol : '',
      decimals: tokenInfo.decimals ? Number(tokenInfo.decimals) : 18,
      image: this.parseImage(tokenInfo)
    }
  }

  parseRate(tokenInfo: EthplorerTokenInfoType): number {
    return Number(
      typeof tokenInfo.price === 'object' ? tokenInfo.price.rate : 0
    )
  }

  parseDiff(tokenInfo: EthplorerTokenInfoType): number {
    return Number(
      typeof tokenInfo.price === 'object' ? tokenInfo.price.diff : 0
    )
  }

  parseBalance(token: EthplorerTokenType): number {
    const decimals = Number(token.tokenInfo.decimals) || 18
    const balance = Number(token.rawBalance)
    return decimals ? balance / 10 ** decimals : balance
  }

  parseUSDBalance(token: EthplorerTokenType): number {
    const rate = this.parseRate(token.tokenInfo)
    if (rate) {
      const decimals = Number(token.tokenInfo.decimals) || 18
      const balance = Number(token.rawBalance)
      return rate * (decimals ? balance / 10 ** decimals : balance)
    }
    return rate
  }

  parse(token: EthplorerTokenType): TokenBalanceType {
    return {
      balance: this.parseBalance(token),
      usdBalance: this.parseUSDBalance(token),
      diff: this.parseDiff(token.tokenInfo),
      tokenInfo: this.parseTokenInfo(token.tokenInfo)
    }
  }
}
