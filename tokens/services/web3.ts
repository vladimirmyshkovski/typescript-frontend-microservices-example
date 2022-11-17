import * as tPromise from 'io-ts-promise'
import { Service, Inject } from 'vue-typedi'
import Web3 from 'web3'
import { ERC20ABI } from '~/constants/abi-samples'
import { TokenInfo } from '~/logic/tokens/models'
import { TokenInfoType, TokenBalanceType } from '~/logic/tokens/types'
import tokens from '~/logic/tokens'
import AddressService from '~/logic/address/services'
import { web3Builder } from '~/utils/web3Builder'
import { EChainId } from '~/types/EChainId'

@Service(tokens.TOKEN_WEB3_SERVICE)
export default class TokenWeb3Service {
  @Inject(tokens.ADDRESS_SERVICE)
  public addressService!: AddressService

  public get $web3(): Web3 {
    return web3Builder(this.addressService.chainId)
  }

  /**
   * Get contract name, totalSupply, decimals and symbol from  web3
   */
  public getTokenInfo = async (
    address: string
  ): Promise<TokenInfoType | null> => {
    try {
      const contract = new this.$web3.eth.Contract(ERC20ABI, address)
      const name = await contract.methods.name().call()
      const totalSupply = await contract.methods.totalSupply().call()
      const decimals = Number(await contract.methods.decimals().call())
      const symbol = await contract.methods.symbol().call()

      return await tPromise.decode(TokenInfo, {
        name,
        address,
        totalSupply,
        decimals,
        symbol
      })
    } catch {
      return null
    }
  }

  public getTokenBalances = async (
    address: string
  ): Promise<TokenBalanceType[]> => {
    try {
      const balances = await Promise.all(
        Object.keys(this.baseTokens).map(async (chainId) => {
          const web3 = web3Builder(chainId)
          return await web3.eth.getBalance(address)
        })
      )

      const result: TokenBalanceType[] = []

      Object.values(this.baseTokens).forEach(
        (tokenInfo: TokenInfoType, index: number): void => {
          const value = Number(balances[index]) || 0
          const balance = tokenInfo.decimals
            ? value / 10 ** tokenInfo.decimals
            : value

          if (Number(balance) > 0) {
            result.push({
              balance,
              usdBalance: 0,
              diff: 0,
              tokenInfo
            })
          }
        }
      )

      return result
    } catch (error) {
      return []
    }
  }

  public get baseTokens(): Record<number, any> {
    const baseURL =
      'https://www.covalenthq.com/static/images/icons/display-icons/'

    return {
      [EChainId.eth]: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        name: 'Ethereum coin',
        symbol: 'ETH',
        decimals: 18,
        image: `${baseURL}ethereum-eth-logo.png`,
        rate: { usd: 0 }
      },
      [EChainId.ropsten]: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        name: 'Ethereum coin',
        symbol: 'ETH',
        decimals: 18,
        image: `${baseURL}ethereum-eth-logo.png`,
        rate: { usd: 0 }
      },
      [EChainId.rinkeby]: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        name: 'Ethereum coin',
        symbol: 'ETH',
        decimals: 18,
        image: `${baseURL}ethereum-eth-logo.png`,
        rate: { usd: 0 }
      },
      [EChainId.goerli]: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        name: 'Ethereum coin',
        symbol: 'ETH',
        decimals: 18,
        image: `${baseURL}ethereum-eth-logo.png`,
        rate: { usd: 0 }
      },
      [EChainId.kovan]: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        name: 'Ethereum coin',
        symbol: 'ETH',
        decimals: 18,
        image: `${baseURL}ethereum-eth-logo.png`,
        rate: { usd: 0 }
      },
      [EChainId.bsc]: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        name: 'Binance coin',
        symbol: 'BNB',
        decimals: 18,
        image: `${baseURL}binance-coin-bnb-logo.png`,
        rate: { usd: 0 }
      },
      [EChainId.bscTestnet]: {
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        name: 'Binance coin',
        symbol: 'BNB',
        decimals: 18,
        image: `${baseURL}binance-coin-bnb-logo.png`,
        rate: { usd: 0 }
      },
      [EChainId.polygon]: {
        address: '0x0000000000000000000000000000000000001010',
        name: 'Polygon coin',
        symbol: 'MATIC',
        decimals: 18,
        image: `https://logos.covalenthq.com/tokens/1/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png`,
        rate: { usd: 0 }
      },
      [EChainId.polygonTestnet]: {
        address: '0x0000000000000000000000000000000000001010',
        name: 'Polygon coin',
        symbol: 'MATIC',
        decimals: 18,
        image: `https://logos.covalenthq.com/tokens/1/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png`,
        rate: { usd: 0 }
      }
    }
  }
}
