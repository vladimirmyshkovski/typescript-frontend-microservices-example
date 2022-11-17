import {
  ERC721CommentsType,
  NFTAttributesType,
  NFTCommentsType,
  NFTPayloadType,
  ParsedNFTType
} from '~/logic/nft/types'

/**
 * See more about this standard: https://docs.opensea.io/docs/metadata-standards
 */
export default class NFTParser {
  private URIParser(URI: string): string {
    if (URI.startsWith('ipfs://ipfs/')) {
      return URI.replace('ipfs://', 'https://ipfs.io/')
    } else if (URI.startsWith('ipfs://')) {
      return URI.replace('ipfs://', 'https://ipfs.io/ipfs/')
    } else {
      return URI
    }
  }

  private SVGToBase64(SVGString: string): string {
    const parser = new DOMParser()
    const element = parser.parseFromString(SVGString, 'image/svg+xml')
    const imageData = new XMLSerializer().serializeToString(element)
    const image = btoa(imageData)
    return `data:image/svg+xml;base64,${image}`
  }

  private extractImage(NFTPayload: NFTPayloadType): string {
    const image =
      NFTPayload.image_url || NFTPayload.image_data || NFTPayload.image
    if (!image) return ''
    return image
  }

  public parseAnimationURL(NFTPayload: NFTPayloadType): string {
    return NFTPayload.animation_url ? NFTPayload.animation_url : ''
  }

  private extractTitle(NFTPayload: NFTPayloadType): string {
    return NFTPayload.title || NFTPayload.name || ''
  }

  private extractDescription(NFTPayload: NFTPayloadType): string {
    return NFTPayload.description || ''
  }

  private extractAttributes(NFTPayload: NFTPayloadType): NFTAttributesType {
    const attributes: NFTAttributesType = {
      properties: [],
      levels: [],
      stats: [],
      dates: [],
      boosts: []
    }

    if (!NFTPayload.attributes) {
      return attributes
    }

    NFTPayload.attributes.forEach((item) => {
      // parse stats

      if (item.display_type === 'number') {
        attributes.stats.push({
          type: item.trait_type,
          value: Number(item.value),
          maxValue: item.max_value
        })

        return
      }

      // parse dates

      if (item.display_type === 'date') {
        attributes.dates.push({
          type: item.trait_type,
          value: Number(item.value)
        })

        return
      }

      // parse boosts

      if (
        item.display_type === 'boost_percentage' ||
        item.display_type === 'boost_number'
      ) {
        attributes.boosts.push({
          type: item.trait_type,
          value: Number(item.value),
          displayType: item.display_type
        })

        return
      }

      // parse levels

      if (item.max_value) {
        attributes.levels.push({
          type: item.trait_type,
          value: Number(item.value),
          maxValue: item.max_value
        })

        return
      }

      // parse properties

      attributes.properties.push({
        type: item.trait_type,
        value: String(item.value)
      })
    })

    return attributes
  }

  private prepareImage(image: string): string {
    if (image.startsWith('ipfs')) image = this.URIParser(image)
    else if (image.startsWith('<svg')) image = this.SVGToBase64(image)
    return image
  }

  public parseComments(
    comments: ERC721CommentsType | null
  ): NFTCommentsType | null {
    if (!comments) {
      return null
    }

    return {
      total: comments.total,
      likes: comments.likes,
      dislikes: comments.dislikes
    }
  }

  public parse(NFTPayload: NFTPayloadType): ParsedNFTType {
    return {
      image: this.prepareImage(this.extractImage(NFTPayload)),
      title: this.extractTitle(NFTPayload),
      description: this.extractDescription(NFTPayload),
      attributes: this.extractAttributes(NFTPayload)
    }
  }
}
