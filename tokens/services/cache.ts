import { Service } from 'vue-typedi'
import { TokenInfoType } from '~/logic/tokens/types'
import tokens from '~/logic/tokens'

@Service(tokens.TOKEN_CACHE_SERVICE)
export default class TokenCacheService {
  private TOKEN_INFO_CACHE = new Map()
  private LIMIT = 500
  public tokenInfoCached = async (address: string): Promise<boolean> => {
    return await this.TOKEN_INFO_CACHE.has(address)
  }

  public getTokenInfo = async (
    address: string
  ): Promise<TokenInfoType | null> => {
    if (await this.tokenInfoCached(address)) {
      const tokenInfo = await this.TOKEN_INFO_CACHE.get(address)
      // re-insert for LRU strategy
      this.TOKEN_INFO_CACHE.delete(address)
      this.TOKEN_INFO_CACHE.set(address, tokenInfo)
      return tokenInfo
    }
    return null
  }

  public setTokenInfo = async (
    address: string,
    tokenInfo: TokenInfoType | null
  ): Promise<void> => {
    if (this.TOKEN_INFO_CACHE.size >= this.LIMIT) {
      const keyToDelete = this.TOKEN_INFO_CACHE.keys().next().value
      this.TOKEN_INFO_CACHE.delete(keyToDelete)
    }
    const isCached = await this.tokenInfoCached(address)
    if (isCached && tokenInfo && 'image' in tokenInfo) {
      await this.TOKEN_INFO_CACHE.set(address, tokenInfo)
    } else if (isCached && tokenInfo && 'rate' in tokenInfo) {
      await this.TOKEN_INFO_CACHE.set(address, tokenInfo)
    } else {
      await this.TOKEN_INFO_CACHE.set(address, tokenInfo)
    }
  }
}
