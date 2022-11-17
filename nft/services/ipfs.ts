import all from 'it-all'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import * as tPromise from 'io-ts-promise'
import { Service, Container } from 'vue-typedi'
import { IPFSHTTPClient } from 'ipfs-http-client'
import fileType from 'file-type'
import { NFTPayload } from '~/logic/nft/models'
import {
  NFTPayloadType,
  NFTMediaType,
  INFTDataToCreate
} from '~/logic/nft/types'
import tokens from '~/logic/tokens'

@Service(tokens.NFT_IPFS_SERVICE)
export default class NFTIPFSService {
  protected get $ipfs(): IPFSHTTPClient {
    return Container.get(tokens.IPFS) as IPFSHTTPClient
  }

  public URIToIPFSHash = (URI: string): string => {
    if (URI.startsWith('ipfs://ipfs/')) {
      return URI.replace('ipfs://ipfs/', '')
    }
    if (URI.startsWith('ipfs://')) {
      return URI.replace('ipfs://', '')
    }
    if (URI.startsWith('https://ipfs.io/ipfs/')) {
      return URI.replace('https://ipfs.io/ipfs/', '')
    }
    try {
      return URI.split('/')[URI.split('/').length - 1]
    } catch {
      return ''
    }
  }

  public fetchMedia = async (ipfsHash: string): Promise<NFTMediaType> => {
    try {
      const response = uint8ArrayConcat(await all(this.$ipfs.cat(ipfsHash)))
      const fileTypeResult = await fileType.fromBuffer(response)
      return await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = String(reader.result)
          if (fileTypeResult !== undefined) {
            const type = fileTypeResult.mime.split('/')[0]
            if (type === 'audio') {
              return resolve({ audio: result })
            } else if (type === 'video') {
              return resolve({ video: result })
            } else if (type === 'image') {
              return resolve({ image: result })
            }
          }
          resolve({})
        }
        const blob = new Blob([response.buffer])
        reader.readAsDataURL(blob)
      })
    } catch {
      return {}
    }
  }

  public fetchNFTPayload = async (
    ipfsHash: string
  ): Promise<NFTPayloadType> => {
    try {
      const response = uint8ArrayConcat(await all(this.$ipfs.cat(ipfsHash)))
      const payload = JSON.parse(uint8ArrayToString(response))
      return await tPromise.decode(NFTPayload, payload)
    } catch {
      return {}
    }
  }

  public saveFile = async (file: File): Promise<string> => {
    const data = await this.$ipfs.add(file)
    await this.$ipfs.pin.add(data.path)
    return data.path
  }

  public saveNFT = async (nft: INFTDataToCreate): Promise<string> => {
    const data = await this.$ipfs.add(JSON.stringify(nft))
    await this.$ipfs.pin.add(data.path)
    return data.path
  }
}
