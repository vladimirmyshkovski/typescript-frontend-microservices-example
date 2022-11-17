import { Service, Inject } from 'vue-typedi'
import AddressService from '~/logic/address/services'
import TokenCacheService from '~/logic/tokens/services/cache'
import TokenAPIService from '~/logic/tokens/services/api'
import TokenIPFSService from '~/logic/tokens/services/ipfs'
import TokenWeb3Service from '~/logic/tokens/services/web3'
import { TokenBalanceType, TokenInfoType } from '~/logic/tokens/types'
import tokens from '~/logic/tokens'
import { networkHelper } from '~/utils/networkHelper'
import { EChainId } from '~/types/EChainId'

@Service(tokens.TOKEN_SERVICE)
export default class TokenService {
  @Inject(tokens.ADDRESS_SERVICE)
  public addressService!: AddressService

  @Inject(tokens.TOKEN_CACHE_SERVICE)
  public tokenCacheService!: TokenCacheService

  @Inject(tokens.TOKEN_API_SERVICE)
  public tokenAPIService!: TokenAPIService

  @Inject(tokens.TOKEN_IPFS_SERVICE)
  public tokenIPFSService!: TokenIPFSService

  @Inject(tokens.TOKEN_WEB3_SERVICE)
  public tokenWeb3Service!: TokenWeb3Service

  public getTokenRate = async (
    address: string,
    currency = 'usd'
  ): Promise<number> => {
    const tokenInfo = await this.getTokenInfo(address)
    if (currency === 'usd') {
      return tokenInfo && tokenInfo.rate && tokenInfo.rate.usd
        ? tokenInfo.rate.usd
        : 0
    }
    return 0
  }

  public getTokenInfo = async (
    address: string
  ): Promise<TokenInfoType | null> => {
    if (await this.tokenCacheService.tokenInfoCached(address)) {
      return await this.tokenCacheService.getTokenInfo(address)
    } else {
      let tokenInfo = await this.tokenIPFSService.getTokenInfo(address)

      if (!tokenInfo) {
        tokenInfo = await this.tokenWeb3Service.getTokenInfo(address)
      }

      this.tokenCacheService.setTokenInfo(address, tokenInfo)

      return tokenInfo
    }
  }

  /**
   * Returns sorted desc by usdBalance, but at first plase always basicToken
   */
  public getTokenBalances = async (
    address: string,
    chainId: number | string
  ): Promise<TokenBalanceType[]> => {
    const basicToken = this.getBasicToken(chainId)
    let tokenBalances = await this.tokenAPIService.getTokenBalances(address)
    const pageTokenBalance = await this.getPageTokenBalance(address, chainId)

    /** tokenBalances - список токенов, полученный от Сovalent API
     * для solana - используется public-api.solscan.io
     * для tron - используется apilist.tronscan.org
     *
     * Если Сovalent API возвращает токены по адресу, то данные токены будут являться результатом операции
     * Если токенов нет (обычно для тестовых сетей), то балансы получаем по каждому токену из основных сетей
     * в tokenBalances в таком случае записываются по условию: balance > 0
     **/

    if (tokenBalances.length > 0) {
      /** токен, соответствующий выбранному chainId */
      let basicTokenBalance = tokenBalances.find((tokenBalance) => {
        return (
          tokenBalance.tokenInfo.symbol?.toLowerCase() ===
          basicToken.symbol?.toLowerCase()
        )
      })

      tokenBalances = tokenBalances.filter((tokenBalance) => {
        return (
          tokenBalance.tokenInfo.symbol?.toLowerCase() !==
          basicToken.symbol?.toLowerCase()
        )
      })

      /** Sort desc by usdBalance */
      tokenBalances = tokenBalances.sort((a, b) =>
        a.usdBalance > b.usdBalance ? -1 : 1
      )

      /** если нет нужного токена в списке, то пробуем его получить из web3 (eth) */
      if (!basicTokenBalance) {
        basicTokenBalance = await this.getBasicTokenBalance(address, basicToken)
      }

      /** итоговый список: токен выбранной сети, баланс crypto.page, все остальные токены */
      tokenBalances = [basicTokenBalance, pageTokenBalance, ...tokenBalances]
    } else {
      /** Add basic token, because IPFSTokenStorage don't store it  */
      const basicTokenBalance = await this.getBasicTokenBalance(
        address,
        basicToken
      )
      tokenBalances = await this.tokenWeb3Service.getTokenBalances(address)

      /** Sort desc by usdBalance */
      tokenBalances = tokenBalances
        .filter(
          (token) =>
            token.tokenInfo.symbol?.toLowerCase() !==
            basicToken.symbol?.toLowerCase()
        )
        .sort((a, b) => (a.usdBalance > b.usdBalance ? -1 : 1))

      /** итоговый список: токен выбранной сети, баланс crypto.page, все остальные токены */
      tokenBalances = [basicTokenBalance, pageTokenBalance, ...tokenBalances]
    }

    /** Add to cache each token */
    await tokenBalances.forEach(async (tokenBalance: TokenBalanceType) => {
      if (tokenBalance.tokenInfo) {
        await this.tokenCacheService.setTokenInfo(
          tokenBalance.tokenInfo.address,
          tokenBalance.tokenInfo
        )
      }
    })

    return tokenBalances
  }

  public getBasicTokenBalance = async (
    address: string,
    tokenInfo: TokenInfoType
  ): Promise<TokenBalanceType> => {
    const rawBalance = await this.addressService.getBalance(address)
    const rate = await this.getTokenRate(tokenInfo.address, 'usd')
    tokenInfo.rate = { usd: rate }
    const balance = tokenInfo.decimals
      ? rawBalance / 10 ** tokenInfo.decimals
      : rawBalance
    const usdBalance = balance * Number(tokenInfo.rate ? tokenInfo.rate.usd : 0)
    return {
      balance,
      usdBalance,
      diff: 0,
      tokenInfo
    }
  }

  public getPageTokenBalance = async (
    address: string,
    chainId: number | string
  ): Promise<TokenBalanceType> => {
    const tokenInfo = this.pageToken

    try {
      const networkSlug = networkHelper.getNetworkSlug(chainId)
      const contractABI = await import(
        `../../../contracts/${networkSlug}/PageToken.json`
      )

      /** адрес нашего контракта по выбранной в URL сети */
      tokenInfo.address = contractABI.address

      /** получаем баланс по адресу контракта и адресу из URL */
      const balance = await this.addressService.addressWEB3Service.getBalanceOf(
        address,
        tokenInfo.address
      )

      /** получаем ставку токена к USD */
      const rate = await this.getTokenRate(tokenInfo.address, 'usd')
      tokenInfo.rate = { usd: rate }
      const usdBalance =
        balance * Number(tokenInfo.rate ? tokenInfo.rate.usd : 0)

      return {
        balance,
        usdBalance,
        diff: 0,
        tokenInfo
      }
    } catch {
      return {
        balance: 0,
        usdBalance: 0,
        diff: 0,
        tokenInfo
      }
    }
  }

  public get pageToken(): TokenInfoType {
    return {
      address: '0x1F33CF88A6D824650FF4b58d377B4D62604495B7',
      name: 'Crypto Page',
      symbol: 'PAGE',
      decimals: 18,
      image: require('@/assets/img/logo.svg'),
      rate: { usd: 0 }
    }
  }

  public getBasicToken(chainId: number | string): TokenInfoType {
    const baseURL =
      'https://www.covalenthq.com/static/images/icons/display-icons/'

    /** Binance coin */
    if ([EChainId.bsc, EChainId.bscTestnet].includes(Number(chainId))) {
      return {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        name: 'Binance coin',
        symbol: 'BNB',
        decimals: 18,
        image: `${baseURL}binance-coin-bnb-logo.png`,
        rate: { usd: 0 }
      }
    }

    /** Polygon coin */
    if ([EChainId.polygon, EChainId.polygonTestnet].includes(Number(chainId))) {
      return {
        address: '0x0000000000000000000000000000000000001010',
        name: 'Polygon coin',
        symbol: 'MATIC',
        decimals: 18,
        image: `https://logos.covalenthq.com/tokens/1/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png`,
        rate: { usd: 0 }
      }
    }

    /** Tron */
    if (chainId === EChainId.tron) {
      return {
        address: '0x0000000000000000000000000000000000001010',
        name: 'Tron',
        symbol: 'TRX',
        decimals: 6,
        image: `https://etherscan.io/token/images/trontrx_32.png`,
        rate: { usd: 0 }
      }
    }

    /** Solana */
    if (chainId === EChainId.solana) {
      return {
        address: '0x0000000000000000000000000000000000001010',
        name: 'Solana',
        symbol: 'SOL',
        decimals: 18,
        image: `https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png`,
        rate: { usd: 0 }
      }
    }

    /** Ethereum coin (by default) */
    return {
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      name: 'Ethereum coin',
      symbol: 'ETH',
      decimals: 18,
      image: `${baseURL}ethereum-eth-logo.png`,
      rate: { usd: 0 }
    }
  }
}
