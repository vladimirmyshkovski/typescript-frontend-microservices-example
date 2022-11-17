import Vue from 'vue'
import { Inject, Injectable } from 'vue-typedi'
import { Action, Mutation, State, Getter } from 'vuex-simple'
import { AddressInfoType } from '~/logic/address/types'
import { TokenBalanceType, TokenInfoType } from '~/logic/tokens/types'
import {
  TransactionPagination,
  TransactionType,
  ESortDirectionType,
  ParamsUpdateAddressInfoType,
  ParamsUpdateTransactionPagination,
  ParamsGetTransactions
} from '~/logic/transactions/types'
import TransactionService from '~/logic/transactions/services'
import TokenService from '~/logic/tokens/services'
import AddressService from '~/logic/address/services/index'
import tokens from '~/logic/tokens'
import { networkHelper } from '~/utils/networkHelper'
import { uniqueHashConcat } from '~/utils/array'

const defaultPagination: TransactionPagination = {
  pageSize: 10,
  sort: 'desc',
  page: 0,
  hasAllPages: false
}

@Injectable()
/**
 * Represents a typed Vuex module.
 *
 * @see https://vuex.vuejs.org/guide/modules.html
 * @see https://github.com/sascha245/vuex-simple
 */
export default class AddressModule {
  // Dependencies

  @Inject(tokens.TRANSACTION_SERVICE)
  public transactionService!: TransactionService

  @Inject(tokens.ADDRESS_SERVICE)
  public addressService!: AddressService

  @Inject(tokens.TOKEN_SERVICE)
  public tokenService!: TokenService

  // State

  @State()
  public addressInfo: AddressInfoType = {
    address: '',
    chainId: 1,
    tokenInfo: null,
    tokens: [],
    transactionsCount: 0
  }

  @State()
  public loadingInfo = false

  /** normal transactions */

  @State()
  public normalTransactions: TransactionType[] = []

  @State()
  public normalTransactionPagination: TransactionPagination = {
    ...defaultPagination
  }

  /** erc721 transactions */

  @State()
  public ERC721Transactions: TransactionType[] = []

  @State()
  public ERC721TransactionPagination: TransactionPagination = {
    ...defaultPagination
  }

  /** erc20 transactions */

  @State()
  public ERC20Transactions: TransactionType[] = []

  @State()
  public ERC20TransactionPagination: TransactionPagination = {
    ...defaultPagination
  }

  // Getters

  @Getter()
  public get address(): string {
    return this.addressInfo.address
  }

  @Getter()
  public get chainId(): string | number {
    return this.addressInfo.chainId
  }

  @Getter()
  public get networkSlug(): string {
    return networkHelper.getNetworkSlug(this.addressInfo.chainId)
  }

  @Getter()
  public get networkName(): string {
    return networkHelper.getNetworkName(this.addressInfo.chainId)
  }

  @Getter()
  public get basicTokenSymbol(): string {
    return this.tokenService.getBasicToken(this.chainId).symbol
  }

  @Getter()
  public get tokens(): TokenBalanceType[] {
    return this.addressInfo ? this.addressInfo.tokens : []
  }

  @Getter()
  public get image(): string {
    return this.addressInfo.tokenInfo && this.addressInfo.tokenInfo.image
      ? this.addressInfo.tokenInfo.image
      : ''
  }

  @Getter()
  public get name(): string {
    return this.addressInfo.tokenInfo && this.addressInfo.tokenInfo.name
      ? this.addressInfo.tokenInfo.name
      : ''
  }

  @Getter()
  public get symbol(): string {
    return this.addressInfo.tokenInfo && this.addressInfo.tokenInfo.symbol
      ? this.addressInfo.tokenInfo.symbol
      : ''
  }

  @Getter()
  public get transactionsCount(): number {
    return this.addressInfo?.transactionsCount || 0
  }

  // Getters normal transactions

  @Getter()
  public get hasAllNormalTransactionsPages(): boolean {
    return this.normalTransactionPagination.hasAllPages
  }

  @Getter()
  public get inputAddressesCount(): number {
    return new Set(
      this.normalTransactions
        .filter(
          (tx: TransactionType) =>
            tx.to.toLowerCase() === this.addressInfo.address.toLowerCase()
        )
        .map((tx: TransactionType) => tx.from)
    ).size
  }

  @Getter()
  public get outputAddressesCount(): number {
    return new Set(
      this.normalTransactions
        .filter(
          (tx: TransactionType) =>
            tx.from.toLowerCase() === this.addressInfo.address.toLowerCase()
        )
        .map((tx: TransactionType) => tx.to)
    ).size
  }

  // Getters erc721 transactions

  @Getter()
  public get hasAllERC721TransactionsPages(): boolean {
    return this.ERC721TransactionPagination.hasAllPages
  }

  // Getters erc20 transactions

  @Getter()
  public get hasAllERC20TransactionsPages(): boolean {
    return this.ERC20TransactionPagination.hasAllPages
  }

  // Mutations

  @Mutation()
  public setAddress(address: string): void {
    Vue.set(this.addressInfo, 'address', address)
  }

  @Mutation()
  public setChainId(chainId: string): void {
    Vue.set(this.addressInfo, 'chainId', chainId)
  }

  @Mutation()
  public setAddressInfo(addressInfo: AddressInfoType | null): void {
    Vue.set(this, 'addressInfo', addressInfo)
  }

  @Mutation()
  public setTokens(tokens: TokenBalanceType[]): void {
    Vue.set(this.addressInfo, 'tokens', tokens)
  }

  @Mutation()
  public setTransactionsCount(transactionsCount: number): void {
    Vue.set(this.addressInfo, 'transactionsCount', transactionsCount)
  }

  @Mutation()
  public setTokenInfo(tokenInfo: TokenInfoType | null): void {
    Vue.set(this.addressInfo, 'tokenInfo', tokenInfo)
  }

  @Mutation()
  public setLoadingInfo(loading: boolean): void {
    this.loadingInfo = loading
  }

  @Mutation()
  public removeTransactions(): void {
    /** очищаем списки транзакций */
    this.normalTransactions = []
    this.ERC20Transactions = []
    this.ERC721Transactions = []

    /** сбрасываем пагинацию */
    this.normalTransactionPagination = { ...defaultPagination }
    this.ERC20TransactionPagination = { ...defaultPagination }
    this.ERC721TransactionPagination = { ...defaultPagination }
  }

  // Mutations normal transactions

  @Mutation()
  public setNormalTransactions(transactions: TransactionType[]): void {
    /** проверяем на уникальность,
     * т.к. в момент скрола могла прийти новая транзакция,
     * которая сдвигает пагинацию */
    this.normalTransactions = uniqueHashConcat(
      this.normalTransactions,
      transactions
    )
  }

  @Mutation()
  public setNormalPagination({
    page,
    hasAllPages
  }: ParamsUpdateTransactionPagination): void {
    this.normalTransactionPagination = {
      ...this.normalTransactionPagination,
      page,
      hasAllPages
    }
  }

  // Mutations erc721 transactions

  @Mutation()
  public setERC721Transactions(transactions: TransactionType[]): void {
    /** проверяем на уникальность,
     * т.к. в момент скрола могла прийти новая транзакция,
     * которая сдвигает пагинацию */
    this.ERC721Transactions = uniqueHashConcat(
      this.ERC721Transactions,
      transactions
    )
  }

  @Mutation()
  public setERC721Pagination({
    page,
    hasAllPages
  }: ParamsUpdateTransactionPagination): void {
    this.ERC721TransactionPagination = {
      ...this.ERC721TransactionPagination,
      page,
      hasAllPages
    }
  }

  @Mutation()
  public updateERC721Transaction(transaction: TransactionType): void {
    const index: number = this.ERC721Transactions.findIndex(
      (tx: TransactionType) => tx.hash === transaction.hash
    )

    if (index > -1) {
      Vue.set(this.ERC721Transactions, index, transaction)
      return
    }

    this.ERC721Transactions = [transaction, ...this.ERC721Transactions]
  }

  // Mutations erc20 transactions

  @Mutation()
  public setERC20Transactions(transactions: TransactionType[]): void {
    /** проверяем на уникальность,
     * т.к. в момент скрола могла прийти новая транзакция,
     * которая сдвигает пагинацию */
    this.ERC20Transactions = uniqueHashConcat(
      this.ERC20Transactions,
      transactions
    )
  }

  @Mutation()
  public setERC20Pagination({
    page,
    hasAllPages
  }: ParamsUpdateTransactionPagination): void {
    this.ERC20TransactionPagination = {
      ...this.ERC20TransactionPagination,
      page,
      hasAllPages
    }
  }

  // Actions

  @Action()
  public async updateAddressInfo({
    address,
    chainId
  }: ParamsUpdateAddressInfoType): Promise<void> {
    this.setAddressInfo({
      address,
      chainId,
      tokenInfo: null,
      tokens: [],
      transactionsCount: 0
    })

    /** сохраняем в service, чтобы была возможность получить chain в API */
    this.addressService.setData({
      address,
      chainId
    })

    // const tokenInfo = await this.tokenService.getTokenInfo(address)
    this.setLoadingInfo(true)

    const tokenInfo = await this.tokenService.getTokenInfo(address)
    this.setTokenInfo(tokenInfo)

    const tokens = await this.tokenService.getTokenBalances(address, chainId)
    this.setTokens(tokens)

    const transactionsCount = await this.addressService.getTransactionsCount(
      address
    )
    this.setTransactionsCount(transactionsCount)

    this.setLoadingInfo(false)
  }

  @Action()
  public async getNormalTransactions({
    address
  }: ParamsGetTransactions): Promise<TransactionType[]> {
    const { page: currentPage, pageSize: offset } =
      this.normalTransactionPagination
    const page = currentPage + 1

    const transactions = await this.transactionService.getNormalTransactions({
      address,
      page,
      offset,
      sort: ESortDirectionType.desc
    })

    this.setNormalTransactions(transactions)
    this.setNormalPagination({
      page,
      hasAllPages: transactions.length === 0
    })

    return transactions
  }

  @Action()
  public async getERC20Transactions({
    address,
    contractAddress
  }: ParamsGetTransactions): Promise<TransactionType[]> {
    const { page: currentPage, pageSize: offset } =
      this.ERC20TransactionPagination
    const page = currentPage + 1

    const transactions = await this.transactionService.getERC20Transactions({
      address,
      contractAddress,
      page,
      offset,
      sort: ESortDirectionType.desc
    })

    this.setERC20Transactions(transactions)
    this.setERC20Pagination({
      page,
      hasAllPages: transactions.length === 0
    })

    return transactions
  }

  @Action()
  public async getERC721Transactions({
    address
  }: ParamsGetTransactions): Promise<TransactionType[]> {
    const { page: currentPage, pageSize: offset } =
      this.ERC721TransactionPagination
    const page = currentPage + 1

    const transactions = await this.transactionService.getERC721Transactions({
      address,
      page,
      offset,
      sort: ESortDirectionType.desc
    })

    this.setERC721Transactions(transactions)
    this.setERC721Pagination({
      page,
      hasAllPages: transactions.length === 0
    })

    return transactions
  }

  @Action()
  public async refreshERC721Transaction(txHash: string) {
    const transaction = this.ERC721Transactions.find(
      (tx: TransactionType) => tx.hash === txHash
    )

    if (!transaction?.token?.id) {
      return
    }

    const actualTransaction =
      await this.transactionService.refreshERC721Transaction(transaction)

    this.updateERC721Transaction(actualTransaction)
  }

  @Action()
  public clearTransactions(): void {
    this.removeTransactions()
  }
}
