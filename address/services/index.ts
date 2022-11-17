import Web3 from 'web3'
import { Container, Service, Inject } from 'vue-typedi'
import { AddressServiceDataType } from '../types'
import AddressWEB3Service from '~/logic/address/services/web3'
import AddressAPIService from '~/logic/address/services/api'
import TokenService from '~/logic/tokens/services'
import tokens from '~/logic/tokens'

@Service(tokens.ADDRESS_SERVICE)
export default class AddressService {
  // @Inject(tokens.ADDRESS_IPFS_SERVICE)
  // public addressIPFSService!: AddressIPFSService

  @Inject(tokens.ADDRESS_WEB3_SERVICE)
  public addressWEB3Service!: AddressWEB3Service

  @Inject(tokens.ADDRESS_API_SERVICE)
  public addressAPIService!: AddressAPIService

  @Inject(tokens.TOKEN_SERVICE)
  public tokenService!: TokenService

  protected get $web3(): Web3 {
    return Container.get(tokens.WEB3) as Web3
  }

  data: AddressServiceDataType = {
    address: '',
    chainId: 1
  }

  public get chainId(): string | number {
    return this.data.chainId
  }

  public setData = (params: AddressServiceDataType) => {
    this.data = params
  }

  public getBalance = async (address: string): Promise<number> => {
    const balance = await this.addressWEB3Service.getBalance(address)

    return balance
  }

  public getTransactionsCount = async (address: string): Promise<number> => {
    const transactionsCount =
      await this.addressWEB3Service.getTransactionsCount(address)

    return transactionsCount
  }
}
