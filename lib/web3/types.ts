/**
 * Type definitions for Web3 and NFT verification
 */

export interface NftVerification {
  id: string
  user_id: string
  wallet_address: string
  nft_balance: number
  verified_at: string
  expires_at: string
  created_at: string
  updated_at: string
}

export interface WalletConnectRequest {
  wallet_address: string
  signature?: string
  message?: string
}

export interface WalletConnectResponse {
  success: boolean
  user_id: string
  nft_holder: boolean
  message?: string
}

export interface NftVerificationResponse {
  verified: boolean
  nft_holder: boolean
  balance: number
  cached: boolean
  verified_at?: string
  expires_at?: string
}

export interface NftVerificationCache {
  wallet_address: string
  balance: number
  verified_at: Date
  expires_at: Date
}
