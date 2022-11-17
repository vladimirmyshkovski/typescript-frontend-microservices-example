import * as tPromise from 'io-ts-promise'
import { Inject, Service } from 'vue-typedi'
import { NFTPayload } from '~/logic/nft/models'
import NFTAdapter from '~/logic/nft/adapter'
import NFTParser from '~/logic/nft/parser'
import NFTAPIService from '~/logic/nft/services/api'
import NFTIPFSService from '~/logic/nft/services/ipfs'
import {
  NFTType,
  FetchOneType,
  NFTPayloadType,
  NFTMediaType,
  NFTAdapterRequestParamsType,
  ISendNFTComment,
  IBurnParamsType,
  ICreateNFT,
  INFTDataToCreate,
  ISendNFTParams
} from '~/logic/nft/types'
import NFTWeb3Service from '~/logic/nft/services/web3'
import tokens from '~/logic/tokens'

@Service(tokens.NFT_SERVICE)
export default class NFTService {
  public parser = new NFTParser()

  @Inject(tokens.NFT_API_SERVICE)
  public nftAPIService!: NFTAPIService

  @Inject(tokens.NFT_WEB3_SERVICE)
  public nftWeb3Service!: NFTWeb3Service

  @Inject(tokens.NFT_IPFS_SERVICE)
  public nftIPFSService!: NFTIPFSService

  public getServiceByURI(
    URI: string
  ): NFTAPIService | NFTWeb3Service | NFTIPFSService {
    if (URI.startsWith('https://ipfs.io/')) return this.nftIPFSService
    if (URI.startsWith('ipfs://')) return this.nftIPFSService
    if (URI.startsWith('https:///')) return this.nftAPIService
    return this.nftAPIService
  }

  public fetchMedia = async (URI: string): Promise<NFTMediaType | null> => {
    if (URI.startsWith('ipfs://') || URI.startsWith('https://ipfs.io/')) {
      const IPFSHash = this.nftIPFSService.URIToIPFSHash(URI)
      return await this.nftIPFSService.fetchMedia(IPFSHash)
    } else {
      return await this.nftAPIService.fetchMedia(URI)
    }
  }

  public fetchBase64NFTPayload = async (
    tokenURI: string
  ): Promise<NFTPayloadType> => {
    const base64 = tokenURI.split(';base64,')[1]
    try {
      const response = await JSON.parse(atob(base64))
      return tPromise.decode(NFTPayload, response)
    } catch (error) {
      return {}
    }
  }

  public fetchNFTPayload = async (
    tokenURI: string
  ): Promise<NFTPayloadType> => {
    if (tokenURI.startsWith('data:') && tokenURI.includes(';base64,')) {
      return await this.fetchBase64NFTPayload(tokenURI)
    } else if (
      tokenURI.startsWith('ipfs://') ||
      tokenURI.startsWith('https://ipfs.io/')
    ) {
      const IPFSHash = this.nftIPFSService.URIToIPFSHash(tokenURI)
      return await this.nftIPFSService.fetchNFTPayload(IPFSHash)
    } else {
      return await this.nftAPIService.fetchNFTPayload(tokenURI)
    }
  }

  /**
   * Fetches NFT from the remote URI (TokenURI).
   *
   * Uses runtime type validation to make sure
   * that types are up-to-date with the any server.
   *
   * @see https://github.com/aeirola/io-ts-promise.
   *
   * @returns Parsed response data.
   */
  public fetchOne = async ({
    tokenId,
    contractAddress
  }: FetchOneType): Promise<NFTType | null> => {
    try {
      const contractData = await this.nftWeb3Service.getTokenURIAndOwner({
        tokenId,
        contractAddress
      })

      if (!contractData) {
        return null
      }

      const { owner, tokenURI, comments } = contractData
      const NFTPayload = await this.fetchNFTPayload(tokenURI)
      const animationURL = this.parser.parseAnimationURL(NFTPayload)
      const parsedComments = this.parser.parseComments(comments)
      const data = this.parser.parse(NFTPayload)
      const adapter = NFTAdapter(data)

      const params: NFTAdapterRequestParamsType = {
        owner,
        comments: parsedComments
      }

      if (animationURL) {
        const media = await this.fetchMedia(animationURL)
        Object.assign(params, media)
      }

      return adapter.request(params)
    } catch {
      return null
    }
  }

  public delete = async ({
    params,
    callbacks
  }: IBurnParamsType): Promise<void> => {
    await this.nftWeb3Service.burn({ params, callbacks })
  }

  /** Create NFT */
  public createNFT = async ({ params, callback }: ICreateNFT) => {
    const { nft, address, from } = params

    const nftSaveData: INFTDataToCreate = {
      name: nft.name,
      description: nft.description,
      attributes: nft.attributes
    }

    /** save upload file to IPFS */

    if (nft.file) {
      try {
        const isMediaFile = /(audio|video)/.test(nft.file.type.split('/')[0])
        const fileHash = await this.nftIPFSService.saveFile(nft.file)

        nftSaveData[isMediaFile ? 'animation_url' : 'image'] =
          fileHash && `https://ipfs.io/ipfs/${fileHash}`

        callback({
          status: 'pending',
          message: 'Got file hash from IPFS'
        })
      } catch {
        callback({
          status: 'error',
          message: 'Failed to save file into IPFS'
        })

        return
      }
    }

    /** save NFT to IPFS */

    let nftHash = ''

    try {
      nftHash = await this.nftIPFSService.saveNFT(nftSaveData)

      callback({
        status: 'pending',
        message: 'Got NFT hash from IPFS'
      })
    } catch {
      callback({
        status: 'error',
        message: 'Failed to save NFT into IPFS'
      })

      return
    }

    /** Send nft to contract via web3 */

    const nftHashParams: ISendNFTParams = {
      address,
      from,
      hash: nftHash
    }
    let txHash = ''

    this.nftWeb3Service.sendSafeMint({
      params: nftHashParams,
      callbacks: {
        onTransactionHash(hash: string) {
          txHash = hash

          callback({
            status: 'pendingTx',
            txHash
          })
        },
        onReceipt() {
          callback({
            status: 'successTx',
            txHash
          })
        },
        onError() {
          callback({
            status: 'errorTx',
            txHash
          })
        }
      }
    })
  }

  /** Send comment to contract via web3 */
  public sendNFTComment = ({ params, callback }: ISendNFTComment) => {
    let txHash = ''

    this.nftWeb3Service.sendComment({
      params,
      callbacks: {
        onTransactionHash(hash: string) {
          txHash = hash

          callback({
            status: 'pending',
            txHash
          })
        },
        onReceipt() {
          callback({
            status: 'success',
            txHash
          })
        },
        onError() {
          callback({
            status: 'error',
            txHash
          })
        }
      }
    })
  }
}
