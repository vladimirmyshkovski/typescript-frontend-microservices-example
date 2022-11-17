import Vue from 'vue'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { BscConnector } from '@binance-chain/bsc-connector'
import Web3 from 'web3'
import { Service, Container, Inject } from 'vue-typedi'
import { Component } from 'nuxt-property-decorator'
import {
  ConnectResponseType,
  TronRequestAccountsResponseType
} from '~/logic/auth/types'
import TokenService from '~/logic/tokens/services'
import tokens from '~/logic/tokens'
import { INFURA_PROJECT_ID, PROVIDER_HOST_BY_CHAINID } from '~/constants'
import { networkHelper } from '~/utils/networkHelper'
import { EChainId } from '~/types/EChainId'
import { EProvider } from '~/types/EProvider'
import { EMainChain } from '~/types/EMainChain'

declare const window: Window &
  typeof globalThis & {
    ethereum: any
    BinanceChain: any
    okexchain: any
    tronLink: any
    solana: any
  }

const ERROR_UNKNOWN_NETWORK = 'UNKNOWN_NETWORK'

const bsc = new BscConnector({
  supportedChainIds: [Number(EChainId.bsc), Number(EChainId.bscTestnet)]
})

@Service(tokens.AUTH_SERVICE)
@Component
export default class AuthService extends Vue {
  @Inject(tokens.TOKEN_SERVICE)
  public tokenService!: TokenService

  constructor() {
    super()

    /** получаем localStorage, где хранится статус авторизации и последний провайдер */

    const localStorage = typeof window !== 'undefined' && window.localStorage

    if (!localStorage) {
      return
    }

    /** если пользователь не авторизован, то не подключаемся к провайдеру */

    const auth = localStorage.getItem('auth')

    if (!auth) {
      return
    }

    try {
      const { authenticated }: Record<string, any> = JSON.parse(auth)

      if (!authenticated) {
        return
      }
    } catch {
      this.kill()
      return
    }

    /** получаем провайдера и пробуем подключиться */

    const lastUsedProvider = localStorage.getItem('lastProvider')

    if (!lastUsedProvider) {
      this.kill()
      return
    }

    this.init(lastUsedProvider)
  }

  /*
   * This is hack for reacive selectedAddress and selectedChainId
   */
  data: any = {
    address: '',
    chainId: 1,
    isUnknownChain: false,
    providerName: ''
  }

  protected get metamaskInstalled(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window?.ethereum?.on === 'function'
    )
  }

  protected get bscInstalled(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window?.BinanceChain?.on === 'function'
    )
  }

  protected get okexInstalled(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window?.okexchain?.on === 'function'
    )
  }

  protected get tronInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window?.tronLink === 'object'
  }

  protected get solanaInstalled(): boolean {
    return typeof window !== 'undefined' && typeof window?.solana === 'object'
  }

  private provider: WalletConnectProvider | undefined
  private metamaskConnected = false
  private okexConnected = false
  private bscConnected = false
  private walletConnectConnected = false
  private tronLinkConnected = false
  private phantomConnected = false

  protected get $web3(): any {
    return Container.get(tokens.WEB3)
  }

  protected get $sea(): any {
    return Container.get(tokens.SEA)
  }

  /**
   * Just reacive proxy for simple access
   */
  public get selectedAddress(): string {
    return this.data.address
  }

  /**
   * Just reacive proxy for simple access
   */
  public get selectedProviderName(): string {
    return this.data.providerName
  }

  /*
   * Just reacive proxy for simple access
   */
  public get selectedChainId(): any {
    return this.data.chainId
  }

  public changeWeb3(web3: Web3): void {
    Container.set(tokens.WEB3, web3)
  }

  /*
   * Just reacive proxy for simple access
   */
  public get selectedNetworkName(): string {
    return networkHelper.getNetworkName(this.selectedChainId)
  }

  /*
   * Just reacive proxy for simple access
   */
  public get selectedNetworkSlug(): string {
    return networkHelper.getNetworkSlug(this.selectedChainId)
  }

  /*
   * Just reacive proxy for simple access
   */
  public get selectedNetworkType(): string {
    return networkHelper.getNetworkType(this.selectedChainId)
  }

  /*
   * Проверяем поддерживаемость сети
   * У провайдеров пользователь мог поменять сеть на ту, которую мы не поддерживаем
   * В результате подписки на смену сети, мы можем установить неизвестную для нас сеть в качестве активной
   * Для исключения этого в Connect проверяется isUnknownChain. В случае true делаем logout
   */
  public isSupportedByProvider(
    chainId: string | number,
    provider: string
  ): boolean {
    return networkHelper.isSupportedByProvider(chainId, provider)
  }

  public setUnknownChain(isUnknown: boolean) {
    this.data && (this.data.isUnknownChain = isUnknown)
  }

  public get isUnknownChain(): boolean {
    return this.data.isUnknownChain
  }

  /**
   * Set or Change web3 data into instance.
   * @param {String} address - address of current wallet
   * @param {Number} chainId - chainId of current network
   * @returns {Void}
   */
  public setOrChangeWeb3Data(address: string, chainId: number | string): void {
    /** даже если значение пустое, то мы должны установить,
     * иначе будет показываться корректно предыдущий адрес */
    Vue.set(this.data, 'address', address || '')
    this.data.address = address || ''

    /** даже если значение пустое, то мы должны установить,
     * иначе будет показываться корректно предыдущая сеть */
    Vue.set(this.data, 'chainId', chainId || 0)
    this.data.chainId = chainId || 0
  }

  public setChainId(chainId: number | string): void {
    /** даже если значение пустое, то мы должны установить,
     * иначе будет показываться корректно предыдущая сеть */
    Vue.set(this.data, 'chainId', chainId || 0)
    this.data.chainId = chainId || 0
  }

  /**
   * Change provider name
   * @param providerName
   * @returns
   */
  public setProviderName(providerName: string) {
    this.data.providerName = providerName
  }

  /**
   * Change current providerName
   * @param {String} providerName - value of providerName
   * @returns {String} - result of action
   */
  public switchProvider = async (
    providerName: string
  ): Promise<ConnectResponseType> => {
    /** сбрасываем флаг неизвестной сети  */

    this.setUnknownChain(false)

    /** подключение к metamask */

    if (providerName === EProvider.metamask) {
      return await this.connectToMetamask()
    }

    /** подключение к walletConnect */

    if (providerName === EProvider.walletConnect) {
      return await this.connectToWalletConnect()
    }

    /** подключение к bsc_wallet */

    if (providerName === EProvider.bscWallet) {
      return await this.connectToBscWallet()
    }

    /** подключение к okex */

    if (providerName === EProvider.okex) {
      return await this.connectToOkex()
    }

    /** подключение к tron_link */

    if (providerName === EProvider.tron) {
      return await this.connectToTronLink()
    }

    /** подключение к phantom */

    if (providerName === EProvider.phantom) {
      return await this.connectToPhantom()
    }

    /** остальное не поддерживаем */

    return {
      status: 'error',
      message: {
        title: 'This provider is not available',
        text: 'Please try another provider'
      }
    }
  }

  /**
   * Change current network
   * @param {String} networkName - name of the network blockchain, example ethereum, bsc, polygon
   */
  switchChain = async (networkName: string): Promise<ConnectResponseType> => {
    /** проверяем поддерживаем ли данную сеть */

    const chain = networkHelper.getChainData(networkName)

    if (!chain) {
      return {
        status: 'error',
        message: {
          title: 'Network is not allowed',
          text: 'Please try another network'
        }
      }
    }

    /** проверяем наличие активного провайдера
     * т.к. подключение к провайдеру должно быть раньше, чем к сети
     */

    if (!this.provider) {
      return {
        status: 'error',
        message: {
          title: 'Provider is not connected',
          text: 'Please reload page and try again'
        }
      }
    }

    /** WALLET_CONNECT сам устанавливает выбранную сеть */

    if (this.selectedProviderName === EProvider.walletConnect) {
      return {
        status: 'success'
      }
    }

    /** TRON поддерживается только провайдером TRON_LINK */

    if (networkName === EMainChain.tron) {
      if (this.selectedProviderName === EProvider.tron) {
        return {
          status: 'success'
        }
      }

      return {
        status: 'error',
        message: {
          title: 'Wrong provider for Tron',
          text: 'Please install and connect TronLink Ext.'
        }
      }
    }

    /** SOLANA поддерживается только провайдером PHANTOM */

    if (networkName === EMainChain.solana) {
      if (this.selectedProviderName === EProvider.phantom) {
        return {
          status: 'success'
        }
      }

      return {
        status: 'error',
        message: {
          title: 'Wrong provider for Solana',
          text: 'Please install and connect Phantom Ext.'
        }
      }
    }

    /** Провайдер BSC_WALLET поддерживает только сеть BSC */

    if (this.selectedProviderName === EProvider.bscWallet) {
      if (networkName !== EMainChain.bsc) {
        return {
          status: 'error',
          message: {
            title: `Wrong provider for ${networkName}`,
            text: 'Please connect to another provider'
          }
        }
      }

      try {
        /** в провайдере BSC_WALLET пытаемся переключить сеть на BSC
         * т.к. в расширении можно выбрать другие сети
         */
        await this.provider.switchNetwork('bsc-mainnet')

        /** при успехе устанавливаем сеть у нас */
        this.setChainId(Number(chain.chainId))

        return {
          status: 'success'
        }
      } catch {
        return {
          status: 'error',
          message: {
            title: `Not connected to ${networkName}`,
            text: 'Please accept connect in the Binance Wallet Ext.'
          }
        }
      }
    }

    /** METAMASK и OKEX - api полностью совпадают
     * пробуем выставить выбранную сеть в расширении, какой бы она не была  */

    if (
      this.selectedProviderName === EProvider.metamask ||
      this.selectedProviderName === EProvider.okex
    ) {
      const providerTitle =
        this.selectedProviderName === EProvider.okex
          ? 'MetaX Ext.'
          : 'MetaMask Ext.'

      try {
        /** пробуем переключиться на сеть */

        await this.provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chain.chainId }]
        })

        /** при успехе устанавливаем сеть у нас */
        this.setChainId(Number(chain.chainId))

        return {
          status: 'success'
        }
      } catch (switchError: any) {
        const CHAIN_NOT_FOUND_CODE = 4902

        /** если это не ошибка отсутствия сети, то возвращаем ошибку */

        if (switchError.code !== CHAIN_NOT_FOUND_CODE) {
          return {
            status: 'error',
            message: {
              title: `Not connected to ${networkName}`,
              text: `Please accept connect in the ${providerTitle}`
            }
          }
        }

        /** пробуем добавить сеть */

        try {
          await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [chain]
          })

          /** при успехе устанавливаем сеть у нас */
          this.setChainId(Number(chain.chainId))

          return {
            status: 'success'
          }
        } catch {
          return {
            status: 'error',
            message: {
              title: `Not connected to ${networkName}`,
              text: `Please accept connect in the ${providerTitle}`
            }
          }
        }
      }
    }

    /** в остальных случаях показываем ошибку */

    return {
      status: 'error',
      message: {
        title: `Not connected to ${networkName}`,
        text: 'Please try with another network or provider'
      }
    }
  }

  /**
   * Если изменили сеть через клиент, то выполняем logout и запоминаем выбранную сеть
   * логика из https://openocean.finance/
   **/
  clientSwitchChain = (network: string): void => {
    /** указываем chainId от network */
    const chain = networkHelper.getChainData(network)

    this.setOrChangeWeb3Data(
      '',
      [String(EMainChain.tron), String(EMainChain.solana)].includes(network)
        ? chain.chainId
        : Number(chain.chainId)
    )
  }

  /** Если пользователь делает disconnect, то сбрасываем все подключения */
  clientDisconnect = async () => {
    await this.kill()
  }

  /**
   * ======== METAMASK ========
   *
   * подключение к metamask
   */
  public connectToMetamask = async (): Promise<ConnectResponseType> => {
    if (!this.metamaskInstalled) {
      return {
        status: 'error',
        message: {
          title: 'Not found MetaMask extension',
          text: 'Please install MetaMask Ext.,<br>reload page and try again'
        }
      }
    }

    const status = await this.addMetamaskEventsListener()

    if (!status) {
      return {
        status: 'error',
        message: {
          title: 'Not connected to MetaMask',
          text: 'Please choose supported chain in the MetaMask Ext.<br>and accept connect'
        }
      }
    }

    this.setProviderName(EProvider.metamask)
    window.localStorage.setItem('lastProvider', EProvider.metamask)

    return {
      status: 'success'
    }
  }

  /**
   * Adding event listener for metamask
   * @returns {Boolean}
   */
  private addMetamaskEventsListener = async (): Promise<boolean> => {
    try {
      /** получаем selectedAddress и chainId с задержкой */

      const setMetamaskData = () => {
        return new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            const chainId = Number(window.ethereum.chainId)

            if (!this.isSupportedByProvider(chainId, EProvider.metamask)) {
              this.setUnknownChain(true)
              this.kill()
              reject(ERROR_UNKNOWN_NETWORK)

              return
            }

            this.setOrChangeWeb3Data(window.ethereum.selectedAddress, chainId)

            resolve()
          }, 300)
        })
      }

      /** запрос на подключение к metamask, привязка к событиям */

      if (this.metamaskInstalled) {
        if (!this.metamaskConnected) {
          await window.ethereum.send('eth_requestAccounts')

          window.ethereum.on('chainChanged', setMetamaskData)
          window.ethereum.on('accountsChanged', setMetamaskData)

          this.metamaskConnected = true
        }

        this.provider = window.ethereum

        await setMetamaskData()

        return true
      }

      return false
    } catch {
      return false
    }
  }
  /**
   * ========================
   */

  /**
   * ======== WALLET_CONNECT ========
   *
   * подключение к walletConnect
   */
  public connectToWalletConnect = async (): Promise<ConnectResponseType> => {
    const status = await this.addWalletConnectEventsListener()

    if (!status) {
      return {
        status: 'error',
        message: {
          title: 'WalletConnect not connected',
          text: 'Please choose supported chain in the wallet<br>and accept connect'
        }
      }
    }

    this.setProviderName(EProvider.walletConnect)
    window.localStorage.setItem('lastProvider', EProvider.walletConnect)

    return {
      status: 'success'
    }
  }

  /**
   * Adding event listener for walletconnect
   * @returns {Boolean}
   */
  private addWalletConnectEventsListener = async (): Promise<boolean> => {
    try {
      if (typeof window === 'undefined' || this.walletConnectConnected) {
        return false
      }

      /** получаем selectedAddress и chainId из WalletConnect */

      const setWalletConnectData = async () => {
        const accounts = await this.$web3.eth.getAccounts()
        const networkId = await this.$web3.eth.net.getId()
        const address = accounts?.[0] || ''
        const chainId = Number(networkId)

        if (!this.isSupportedByProvider(chainId, EProvider.walletConnect)) {
          this.setUnknownChain(true)
          this.kill()
          throw new Error(ERROR_UNKNOWN_NETWORK)
        }

        this.setOrChangeWeb3Data(address, chainId)
      }

      const provider = await new WalletConnectProvider({
        infuraId: INFURA_PROJECT_ID,
        rpc: PROVIDER_HOST_BY_CHAINID
      })

      await provider.enable()
      this.provider = provider

      const $web3 = await new Web3(<any>provider)
      this.changeWeb3($web3)

      await setWalletConnectData()

      provider.on('accountsChanged', setWalletConnectData)
      provider.on('chainChanged', setWalletConnectData)

      provider.on('close', () => {
        this.walletConnectConnected = false
      })

      this.walletConnectConnected = true

      return true
    } catch {
      return false
    }
  }
  /**
   * ========================
   */

  /**
   * ======== BSC_WALLET ========
   *
   * подключение к bsc_wallet
   */
  public connectToBscWallet = async (): Promise<ConnectResponseType> => {
    if (!this.bscInstalled) {
      return {
        status: 'error',
        message: {
          title: 'Not found Binance Wallet extension',
          text: 'Please install Binance Wallet Ext.,<br>reload page and try again'
        }
      }
    }

    const status = await this.addBSCEventsListener()

    if (!status) {
      return {
        status: 'error',
        message: {
          title: 'Not connected to Binance Wallet',
          text: 'Please choose supported chain in the Binance Ext.<br>and accept connect'
        }
      }
    }

    this.setProviderName(EProvider.bscWallet)
    window.localStorage.setItem('lastProvider', EProvider.bscWallet)

    return {
      status: 'success'
    }
  }

  /**
   * Adding event listener for binance wallet
   * @returns {Boolean}
   */
  private addBSCEventsListener = async (): Promise<boolean> => {
    try {
      /** получаем selectedAddress и chainId с задержкой */

      const setBSCData = () => {
        return new Promise<void>((resolve, reject) => {
          setTimeout(async () => {
            const address: any = await bsc.getAccount()
            const chainId = await bsc.getChainId()

            if (
              !this.isSupportedByProvider(Number(chainId), EProvider.bscWallet)
            ) {
              this.setUnknownChain(true)
              this.kill()
              reject(ERROR_UNKNOWN_NETWORK)

              return
            }

            this.setOrChangeWeb3Data(address, Number(chainId))

            resolve()
          }, 300)
        })
      }

      /** запрос на подключение к binance wallet, привязка к событиям */

      if (this.bscInstalled) {
        if (!this.bscConnected) {
          await bsc.activate()

          window.BinanceChain.on('chainChanged', setBSCData)
          window.BinanceChain.on('accountsChanged', setBSCData)

          this.bscConnected = true
        }

        this.provider = window.BinanceChain

        await setBSCData()

        return true
      }

      return false
    } catch {
      return false
    }
  }
  /**
   * ========================
   */

  /**
   * ======== OKEX ========
   *
   * подключение к okex
   */
  public connectToOkex = async (): Promise<ConnectResponseType> => {
    if (!this.okexInstalled) {
      return {
        status: 'error',
        message: {
          title: 'Not found MetaX extension',
          text: 'Please install MetaX Ext.,<br>reload page and try again'
        }
      }
    }

    const status = await this.addOKEXEventsListener()

    if (!status) {
      return {
        status: 'error',
        message: {
          title: 'Not connected to MetaX',
          text: 'Please choose supported chain in the MetaX Ext.<br>and accept connect'
        }
      }
    }

    this.setProviderName(EProvider.okex)
    window.localStorage.setItem('lastProvider', EProvider.okex)

    return {
      status: 'success'
    }
  }

  /**
   * Adding event listener for okex
   * @returns {Boolean}
   */
  private addOKEXEventsListener = async (): Promise<boolean> => {
    try {
      /** получаем selectedAddress и chainId с задержкой */

      const setOKEXData = () => {
        return new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            const chainId = Number(window.okexchain.chainId)

            if (!this.isSupportedByProvider(chainId, EProvider.okex)) {
              this.setUnknownChain(true)
              this.kill()
              reject(ERROR_UNKNOWN_NETWORK)

              return
            }

            this.setOrChangeWeb3Data(window.okexchain.selectedAddress, chainId)

            resolve()
          }, 300)
        })
      }

      /** запрос на подключение к okex, привязка к событиям */

      if (this.okexInstalled) {
        if (!this.okexConnected) {
          await window.okexchain.send('eth_requestAccounts')

          window.okexchain.on('chainChanged', setOKEXData)
          window.okexchain.on('accountsChanged', setOKEXData)

          this.okexConnected = true
        }

        this.provider = window.okexchain

        await setOKEXData()

        return true
      }

      return false
    } catch {
      return false
    }
  }
  /**
   * ========================
   */

  /**
   * ======== TRON_LINK ========
   *
   * подключение к tron_link
   */
  public connectToTronLink = async (): Promise<ConnectResponseType> => {
    if (!this.tronInstalled) {
      return {
        status: 'error',
        message: {
          title: 'Not found TronLink extension',
          text: 'Please install TronLink Ext.,<br>reload page and try again'
        }
      }
    }

    const status = await this.addTronLinkEventsListener()

    if (!status) {
      return {
        status: 'error',
        message: {
          title: 'Not connected to TronLink',
          text: 'Please accept connect in the TronLink Ext.,<br>reload page and try again'
        }
      }
    }

    this.setProviderName(EProvider.tron)
    window.localStorage.setItem('lastProvider', EProvider.tron)

    return {
      status: 'success'
    }
  }

  /**
   * Adding event listener for tronlink
   * @returns {Boolean}
   */
  private addTronLinkEventsListener = async (): Promise<boolean> => {
    try {
      /** получаем selectedAddress и chainId с задержкой */

      const setTronData = () => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            const address = window.tronLink.tronWeb.defaultAddress?.base58
            this.setOrChangeWeb3Data(address, 'tron')

            resolve()
          }, 300)
        })
      }

      /** запрос на подключение к tron, привязка к событиям */

      if (this.tronInstalled) {
        if (!this.tronLinkConnected) {
          const response: TronRequestAccountsResponseType =
            await window.tronLink.request({ method: 'tron_requestAccounts' })

          if (response.code !== 200) {
            throw new Error('Request denied by TronLink Ext.')
          }

          window.addEventListener('message', (e) => {
            if (e.data.message && e.data.message.action === 'setAccount') {
              const address = e.data.message.data.address
              if (address !== this.data.address) {
                this.setOrChangeWeb3Data(address, 'tron')
              }
            }
          })

          this.tronLinkConnected = true
        }

        this.provider = window.tronLink.tronWeb

        await setTronData()

        return true
      }

      return false
    } catch {
      return false
    }
  }
  /**
   * ========================
   */

  /**
   * ======== PHANTOM ========
   *
   * подключение к phantom
   */
  public connectToPhantom = async (): Promise<ConnectResponseType> => {
    if (!this.solanaInstalled) {
      return {
        status: 'error',
        message: {
          title: 'Not found Phantom extension',
          text: 'Please install Phantom Ext.,<br>reload page and try again'
        }
      }
    }

    const status = await this.addPhantomEventsListener()

    if (!status) {
      return {
        status: 'error',
        message: {
          title: 'Not connected to Phantom',
          text: 'Please accept connect in the Phantom Ext.,<br>reload page and try again'
        }
      }
    }

    this.setProviderName(EProvider.phantom)
    window.localStorage.setItem('lastProvider', EProvider.phantom)

    return {
      status: 'success'
    }
  }

  /**
   * Adding event listener for phantom
   * @returns {Boolean}
   */
  private addPhantomEventsListener = async (): Promise<boolean> => {
    try {
      /** получаем selectedAddress и chainId с задержкой */

      const setSolanaData = () => {
        return new Promise<void>((resolve) => {
          setTimeout(async () => {
            const result = await window.solana.connect()
            const address = result?.publicKey?.toString()
            this.setOrChangeWeb3Data(address, 'solana')

            resolve()
          }, 300)
        })
      }

      /** запрос на подключение к phantom, привязка к событиям */

      if (this.solanaInstalled) {
        if (!this.phantomConnected) {
          await window.solana.connect()

          this.phantomConnected = true
        }

        this.provider = window.solana

        await setSolanaData()

        return true
      }

      return false
    } catch {
      return false
    }
  }
  /**
   * ========================
   */

  /**
   * Initialize web3 provider functionality
   * @param {String} providerName - value of provider
   */
  public init = async (providerName: string): Promise<boolean> => {
    if (typeof window === 'undefined') {
      return false
    }

    const status = await this.switchProvider(providerName)

    return status.status === 'success'
  }

  public disconnect = async (): Promise<void> => {
    if (this.provider) {
      this.provider.disconnect && (await this.provider.disconnect())
      this.provider.close && (await this.provider.close())
    }

    this.metamaskConnected = false
    this.okexConnected = false
    this.bscConnected = false
    this.walletConnectConnected = false
    this.tronLinkConnected = false
    this.phantomConnected = false
  }

  public logout = () => {
    const auth = {
      authenticated: false,
      status: true
    }

    window.localStorage.setItem('auth', JSON.stringify(auth))
  }

  /**
   * Remove connections of provider and localstorage data
   */
  public kill = async (): Promise<void> => {
    await this.disconnect()
    this.logout()
    this.setUnknownChain(false)
    this.provider = undefined
    this.setProviderName('')
    this.setOrChangeWeb3Data('', 1)
    window.localStorage.removeItem('lastProvider')
  }
}
