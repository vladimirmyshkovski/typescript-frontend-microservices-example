import { Service, Container, Inject } from 'vue-typedi'
import Web3 from 'web3'
import { ERC721ABI } from '~/constants/abi-samples'
import AddressService from '~/logic/address/services'
import AuthService from '~/logic/auth/service'
import {
  FetchOneType,
  ERC721ContractDataType,
  ISendNFTWeb3,
  ISendNFTCommentWeb3,
  IBurnParamsType
} from '~/logic/nft/types'
import tokens from '~/logic/tokens'
import { networkHelper } from '~/utils/networkHelper'
import { web3Builder } from '~/utils/web3Builder'

@Service(tokens.NFT_WEB3_SERVICE)
/**
 * Service class to fetch NFT from the API.
 *
 * Is injected into the module context to be used.
 * Should not be used as-is, only as a part of the module.
 */
export default class NFTWeb3Service {
  @Inject(tokens.ADDRESS_SERVICE)
  public addressService!: AddressService

  @Inject(tokens.AUTH_SERVICE)
  public authService!: AuthService

  /**
   * @returns Global `web3` instance from the IoC container.
   */
  protected get $web3Auth(): Web3 {
    return Container.get(tokens.WEB3) as Web3
  }

  public get $web3Address(): Web3 {
    return web3Builder(this.addressService.chainId)
  }

  public getComments = async ({
    tokenId
  }: FetchOneType): Promise<ERC721ContractDataType | null> => {
    let comments = null
    const networkName = networkHelper.getNetworkSlug(
      this.addressService.chainId
    )

    const NFT_CONTRACT = await import(
      `../../../contracts/${networkName}/PageNFT.json`
    )
    const COMMENT_CONTRACT = await import(
      `../../../contracts/${networkName}/PageComment.json`
    )
    const COMMENT_MINTER_CONTRACT = await import(
      `../../../contracts/${networkName}/PageCommentMinter.json`
    )

    /** получаем комментарии */
    const commentMinterContract = new this.$web3Address.eth.Contract(
      COMMENT_MINTER_CONTRACT.abi,
      COMMENT_MINTER_CONTRACT.address
    )

    /**
     * проверяем есть ли контракт комментов у NFT,
     * если да, то получаем текущую статистику
     */
    try {
      const isExists = await commentMinterContract.methods
        .isExists(NFT_CONTRACT.address, tokenId)
        .call()

      if (!isExists) {
        return null
      }

      const commentContractAddress = await commentMinterContract.methods
        .getContract(NFT_CONTRACT.address, tokenId)
        .call()

      const commentContract = new this.$web3Address.eth.Contract(
        COMMENT_CONTRACT.abi,
        commentContractAddress
      )

      comments = await commentContract.methods.getStatisticWithComments().call()

      return { tokenURI: '', owner: '', comments }
    } catch {
      return null
    }
  }

  /**
   * Get TokenURI and owner from contract
   */
  public getTokenURIAndOwner = async ({
    tokenId,
    contractAddress
  }: FetchOneType): Promise<ERC721ContractDataType | null> => {
    try {
      let comments = null
      const contract = new this.$web3Address.eth.Contract(
        ERC721ABI,
        contractAddress
      )
      const tokenURI = await contract.methods.tokenURI(tokenId).call()
      const owner = await contract.methods.ownerOf(tokenId).call()
      const statisticWithComments = await this.getComments({
        tokenId,
        contractAddress
      })

      if (statisticWithComments) {
        comments = statisticWithComments.comments
      }

      return { tokenURI, owner, comments }
    } catch {
      return null
    }
  }

  /** Action safeMint by contract */
  public sendSafeMint = async ({ params, callbacks }: ISendNFTWeb3) => {
    try {
      const networkName = this.authService.selectedNetworkSlug

      const CONTRACT = await import(
        `../../../contracts/${networkName}/PageNFT.json`
      )
      const contract = new this.$web3Auth.eth.Contract(
        CONTRACT.abi,
        CONTRACT.address
      )

      contract.methods
        .safeMint(params.address, params.hash)
        .send({
          from: params.from
        })
        .on('transactionHash', callbacks.onTransactionHash)
        .on('receipt', callbacks.onReceipt)
        .on('error', callbacks.onError)
    } catch {
      callbacks.onError()
    }
  }

  /** Action createComment by contract */
  public sendComment = async ({ params, callbacks }: ISendNFTCommentWeb3) => {
    try {
      const networkName = this.authService.selectedNetworkSlug

      const CONTRACT = await import(
        `../../../contracts/${networkName}/PageCommentMinter.json`
      )
      const contract = new this.$web3Auth.eth.Contract(
        CONTRACT.abi,
        CONTRACT.address
      )

      contract.methods
        .createComment(
          params.nftContractAddress,
          params.tokenId,
          params.from,
          params.comment,
          params.like
        )
        .send({
          from: params.from
        })
        .on('transactionHash', callbacks.onTransactionHash)
        .on('receipt', callbacks.onReceipt)
        .on('error', callbacks.onError)
    } catch {
      callbacks.onError()
    }
  }

  /** Action burn by contract */
  public burn = async ({ params, callbacks }: IBurnParamsType) => {
    try {
      const networkName = this.authService.selectedNetworkSlug

      const CONTRACT = await import(
        `../../../contracts/${networkName}/PageNFT.json`
      )
      const contract = new this.$web3Auth.eth.Contract(
        CONTRACT.abi,
        CONTRACT.address
      )

      contract.methods
        .burn(params.tokenId)
        .send({
          from: params.from
        })
        .on('transactionHash', callbacks.onTransactionHash)
        .on('receipt', callbacks.onReceipt)
        .on('error', callbacks.onError)
    } catch {
      callbacks.onError()
    }
  }
}
