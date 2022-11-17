import { Token } from 'vue-typedi'

/**
 * Here we generate some unique keys to bind our values to.
 *
 * This tokens are unique representation of your dependencies inside the app.
 *
 * @see https://github.com/sascha245/vue-typedi
 * @see https://github.com/typestack/typedi
 */
export default {
  // Auth service:
  AUTH_SERVICE: new Token('auth-service'),

  // NFT services:
  NFT_SERVICE: new Token('nft-service'),
  NFT_API_SERVICE: new Token('nft-api-service'),
  NFT_WEB3_SERVICE: new Token('nft-web3-service'),
  NFT_IPFS_SERVICE: new Token('nft-ipfs-service'),

  // Transaction service:
  TRANSACTION_SERVICE: new Token('transaction-service'),
  TRANSACTION_API_SERVICE: new Token('transaction-api-service'),
  TRANSACTION_WEB3_SERVICE: new Token('transaction-web3-service'),

  // Token services:
  TOKEN_SERVICE: new Token('token-service'),
  TOKEN_API_SERVICE: new Token('token-api-service'),
  TOKEN_WEB3_SERVICE: new Token('token-web3-service'),
  TOKEN_IPFS_SERVICE: new Token('token-ipfs-service'),
  TOKEN_CACHE_SERVICE: new Token('token-cache-service'),

  // Address services:
  ADDRESS_SERVICE: new Token('address-service'),
  ADDRESS_API_SERVICE: new Token('address-api-service'),
  ADDRESS_WEB3_SERVICE: new Token('address-web3-service'),

  // API services
  ETHERSCAN_API_SERVICE: new Token('etherscan-api-service'),
  ETHPLORER_API_SERVICE: new Token('ethplorer-api-service'),
  COVALENT_API_SERVICE: new Token('covalent-api-service'),
  TRONGRID_API_SERVICE: new Token('trongrid-api-service'),
  SOLSCAN_API_SERVICE: new Token('solscan-api-service'),

  // Global dependencies
  AXIOS: new Token('axios'),
  IPFS: new Token('ipfs'),
  WEB3: new Token('web3'),
  WEB3_HTTPS: new Token('web3-https'),
  SEA: new Token('sea'),
  SEARCH: new Token('search')
}
