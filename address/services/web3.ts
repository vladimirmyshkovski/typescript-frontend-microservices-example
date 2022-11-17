import { Inject, Service } from 'vue-typedi'
import Web3 from 'web3'
import AddressService from '.'
import { ERC20ABI } from '~/constants/abi-samples'
import tokens from '~/logic/tokens'
import { web3Builder } from '~/utils/web3Builder'

@Service(tokens.ADDRESS_WEB3_SERVICE)
export default class AddressWeb3Service {
  @Inject(tokens.ADDRESS_SERVICE)
  public addressService!: AddressService

  /** используем web3 с провайдером сети из address */
  protected get $web3(): Web3 {
    return web3Builder(this.addressService.chainId)
  }

  public getBalanceOf = async (
    address: string,
    contractAddress: string
  ): Promise<number> => {
    try {
      const contract = new this.$web3.eth.Contract(ERC20ABI, contractAddress)
      const balanceOf = await contract.methods.balanceOf(address).call()
      const decimals = await contract.methods.decimals().call()
      const balance = decimals ? balanceOf / 10 ** decimals : balanceOf
      return balance
    } catch {
      return 0
    }
  }

  public getBalance = async (address: string): Promise<number> => {
    try {
      const balance = await this.$web3.eth.getBalance(address)
      return Number(balance)
    } catch {
      return 0
    }
  }

  public getTransactionsCount = async (address: string): Promise<number> => {
    try {
      return await this.$web3.eth.getTransactionCount(address)
    } catch {
      return 0
    }
  }
}
