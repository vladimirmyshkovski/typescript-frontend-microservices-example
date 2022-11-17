import * as tPromise from 'io-ts-promise'
import { Service, Container } from 'vue-typedi'
import { create, IPFSHTTPClient } from 'ipfs-http-client'
import { CID } from 'multiformats/cid'
import { IPFSTokensStorageItemResponse } from '~/logic/tokens/models'
import { IPFSTokensStorageItemType, TokenInfoType } from '~/logic/tokens/types'
import tokens from '~/logic/tokens'

@Service(tokens.TOKEN_IPFS_SERVICE)
export default class TokenIPFSService {
  /*
   * List with public gateways. Need to implement gateway checker and switcher
   * https://ipfs.github.io/public-gateway-checker/gateways.json
   */

  protected cid = CID.parse(
    'bafyreibxd3rg42m65fbzr5vqxgxzmxavjdlux37latsvvur3giha2p6ovq'
  )

  protected sizes: number[] = [16, 32, 64, 128]
  protected $ipfs!: IPFSHTTPClient
  protected timeout = 10

  constructor() {
    this.init()
  }

  private init = async () => {
    const ipfs = await create({
      host: 'ipfs.infura.io',
      port: 5001,
      protocol: 'https'
    })
    Container.set(tokens.IPFS, ipfs)
    this.$ipfs = ipfs
  }

  private toTokenInfo = (
    address: string,
    value: IPFSTokensStorageItemType
  ): TokenInfoType => {
    const name = value.name
    const symbol = value.symbol
    const size = 128
    const image =
      size in value.images ? `https://ipfs.io/ipfs/${value.images[size]}` : ''
    const decimals = value.decimals || 18
    const totalSupply = '0'
    return { address, name, symbol, decimals, totalSupply, image }
  }

  public getTokenInfo = async (
    address: string
  ): Promise<TokenInfoType | null> => {
    const path = `/${address}`
    try {
      const result = await this.$ipfs.dag.get(this.cid, {
        path,
        timeout: this.timeout
      })
      const response = await tPromise.decode(
        IPFSTokensStorageItemResponse,
        result
      )
      return this.toTokenInfo(address, response.value)
    } catch {
      return null
    }
  }

  public getTokenImage = async (address: string): Promise<string> => {
    const value = await this.getTokenInfo(address)
    return value && value.image ? value.image : ''
  }

  public getAllTokensAddresses = async (): Promise<string[]> => {
    try {
      const result = await this.$ipfs.dag.get(this.cid, {
        path: '/',
        timeout: this.timeout
      })
      return Object.keys(result.value)
    } catch {
      return []
    }
  }

  public getAllTokens = async (): Promise<TokenInfoType[]> => {
    try {
      const result = await this.$ipfs.dag.get(this.cid, {
        path: '/',
        timeout: this.timeout
      })
      return Object.keys(result.value).map((address: string): TokenInfoType => {
        return this.toTokenInfo(address, result.value[address])
      })
    } catch {
      return []
    }
  }
}
