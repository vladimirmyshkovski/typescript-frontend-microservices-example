import { AxiosInstance } from 'axios'
import * as tPromise from 'io-ts-promise'
import { Inject, Service, Container } from 'vue-typedi'
import { NFTPayload } from '~/logic/nft/models'
import { NFTPayloadType, NFTMediaType } from '~/logic/nft/types'
import NFTWeb3Service from '~/logic/nft/services/web3'
import tokens from '~/logic/tokens'

@Service(tokens.NFT_API_SERVICE)
/**
 * Service class to fetch NFT from the API.
 *
 * Is injected into the module context to be used.
 * Should not be used as-is, only as a part of the module.
 */
export default class NFTAPIService {
  /**
   * That's an example of how to inject dependencies into the service.
   *
   * This is actually overly-complicated.
   * And usually `@Inject` decorator is enough.
   * But, since `$axios` is injected via `Nuxt`,
   * we have two conflicting IoC and DI implementations.
   * That's a fix!
   *
   * @returns Global `axios` instance from the IoC container.
   */
  protected get $axios(): AxiosInstance {
    return Container.get(tokens.AXIOS) as AxiosInstance
  }

  @Inject(tokens.NFT_WEB3_SERVICE)
  public nftWeb3Service!: NFTWeb3Service

  public IPFSHashToURI = (IPFSHash: string): string => {
    if (IPFSHash.startsWith('ipfs://ipfs/')) {
      return IPFSHash.replace('ipfs://', 'https://ipfs.io/')
    } else if (IPFSHash.startsWith('ipfs://')) {
      return IPFSHash.replace('ipfs://', 'https://ipfs.io/ipfs/')
    } else if (IPFSHash.startsWith('https://ipfs.io/ipfs/')) {
      return IPFSHash
    }
    return `https://ipfs.io/ipfs/${IPFSHash}`
  }

  public fetchMedia = async (URI: string): Promise<NFTMediaType | null> => {
    try {
      const response = await this.$axios(URI, { responseType: 'blob' })
      return await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = String(reader.result)
          const type = result.split('/')[0].split('data:')[1]
          if (type === 'audio') {
            return resolve({ audio: result })
          } else if (type === 'video') {
            return resolve({ video: result })
          } else if (type === 'image') {
            return resolve({ image: result })
          } else {
            return resolve({})
          }
        }
        reader.readAsDataURL(response.data)
      })
    } catch {
      return {}
    }
  }

  public fetchNFTPayload = async (
    tokenURI: string
  ): Promise<NFTPayloadType> => {
    try {
      const response = await this.$axios.get(tokenURI)
      return tPromise.decode(NFTPayload, response.data)
    } catch {
      return {}
    }
  }
}
