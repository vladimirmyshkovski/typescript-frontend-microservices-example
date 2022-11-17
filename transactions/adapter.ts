import { NFTType } from '../nft/types'
import { TransactionType } from '~/logic/transactions/types'

export default class TransactionAdapter {
  protected transaction!: TransactionType
  constructor(transaction: TransactionType) {
    this.transaction = transaction
  }

  public calculateSender(): string {
    return this.transaction.from
  }

  public calculateReceiver(): string {
    return this.transaction.to
  }

  public calculateAmount(): number {
    const tx = this.transaction

    const amount = Number(tx.value)
    let decimals = 18

    if (tx.type === 'tron') {
      decimals = 6
    }

    if (tx.token && 'decimals' in tx.token) {
      decimals = Number(tx.token.decimals)
    }

    return decimals ? amount / 10 ** decimals : amount
  }

  public calculateFee(): number {
    const tx = this.transaction
    let decimals = 18

    if (tx.type === 'tron') {
      decimals = 6
    }

    if (tx.token && 'decimals' in tx.token) {
      decimals = Number(tx.token.decimals)
    }

    const fee = decimals
      ? Number(tx.gasPrice) / 10 ** decimals
      : Number(tx.gasPrice)

    return fee * Number(tx.gasUsed)
  }

  public calculateUSDFee(rate: { [currency: string]: number }): number {
    if ('usd' in rate && this.transaction.fee) {
      const fee = Number(this.transaction.fee)
      return fee * rate.usd
    }
    return 0
  }

  public calculateUSDAmount(rate: { [currency: string]: number }): number {
    if ('usd' in rate) {
      const amount = Number(this.transaction.amount)
      return amount * rate.usd
    }
    return 0
  }

  public addNFT(nft?: NFTType | null): void {
    nft && (this.transaction.nft = nft)
  }

  public request(): TransactionType {
    this.transaction.sender = this.calculateSender()
    this.transaction.receiver = this.calculateReceiver()
    this.transaction.amount = this.calculateAmount()
    this.transaction.fee = this.calculateFee()

    if (this.transaction.token && this.transaction.token.rate) {
      this.transaction.USDFee = this.calculateUSDFee(
        this.transaction.token.rate
      )

      this.transaction.USDAmount = this.calculateUSDAmount(
        this.transaction.token.rate
      )
    }

    return this.transaction
  }
}
