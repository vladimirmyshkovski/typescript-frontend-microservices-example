import { Inject, Injectable } from 'vue-typedi'
import { Action, Mutation, State, Getter } from 'vuex-simple'
import AuthService from '~/logic/auth/service'
import {
  ConnectResponseType,
  SwitchProviderParamsType
} from '~/logic/auth/types'
import tokens from '~/logic/tokens'

@Injectable()
/**
 * Represents a typed Vuex module.
 *
 * @see https://vuex.vuejs.org/guide/modules.html
 * @see https://github.com/sascha245/vuex-simple
 */
export default class AuthModule {
  // Dependencies

  @Inject(tokens.AUTH_SERVICE)
  public authService!: AuthService

  // State

  @State()
  public authenticated = false

  // Getters

  @Getter()
  public get selectedAddress(): string {
    return this.authService.selectedAddress
  }

  @Getter()
  public get chainId(): string | number {
    return this.authService.selectedChainId
  }

  @Getter()
  public get selectedNetworkName(): string {
    return this.authService.selectedNetworkName
  }

  @Getter()
  public get selectedNetworkSlug(): string {
    return this.authService.selectedNetworkSlug
  }

  @Getter()
  public get selectedNetworkType(): string {
    return this.authService.selectedNetworkType
  }

  @Getter()
  public get selectedProviderName(): string {
    return this.authService.selectedProviderName
  }

  @Getter()
  public get isAuth(): boolean {
    return this.selectedAddress ? this.authenticated : false
  }

  @Getter()
  public get isUnknownChain(): boolean {
    return this.authService.isUnknownChain
  }

  // Mutations

  @Mutation()
  public setIsAuth(isAuth: boolean): void {
    this.authenticated = isAuth
  }

  // Actions

  @Action()
  public signin(): void {
    this.setIsAuth(true)
  }

  @Action()
  public async signout(): Promise<void> {
    this.setIsAuth(false)
    await this.authService.clientDisconnect()
  }

  @Action()
  public async switchProvider({
    providerName,
    network
  }: SwitchProviderParamsType): Promise<ConnectResponseType> {
    /** подключаемся к провайдеру */

    const providerResponse = await this.authService.switchProvider(providerName)

    if (providerResponse.status === 'error') {
      return providerResponse
    }

    /** меняем сеть в провайдере */

    const networkResponse = await this.authService.switchChain(network)

    return networkResponse
  }

  @Action()
  public async switchChain(type: string): Promise<void> {
    this.setIsAuth(false)
    await this.authService.clientDisconnect()
    this.authService.clientSwitchChain(type)
  }

  @Action()
  public async setChainId(chainId: number | string): Promise<void> {
    await this.authService.setOrChangeWeb3Data(this.selectedAddress, chainId)
  }
}
