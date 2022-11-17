import { NFTType, NFTAdapterType, ParsedNFTType } from '~/logic/nft/types'

const NFTAdapter = (parsedNFT: ParsedNFTType): NFTAdapterType => {
  return {
    request: ({ owner, comments, image, audio, video }): NFTType => {
      const nft = { owner, comments, ...parsedNFT }

      if (image) {
        nft.image = image
      }

      if (audio) {
        nft.audio = audio
      }

      if (video) {
        nft.video = video
      }

      return nft
    }
  }
}

export default NFTAdapter
