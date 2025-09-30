/**
 * Session Management
 * Handles user sessions, token refresh, and session persistence
 */

import { supabaseAdmin } from '../supabase/client'
import type { TokenPayload, TokenPair } from './jwt';
import { createTokenPair, verifyToken } from './jwt'
import { AuthenticationError } from './service'

export interface Session {
  user: {
    id: string
    email: string
    fullName: string | null
    phone: string | null
    walletAddress: string | null
    nftHolder: boolean
    role: 'user' | 'staff' | 'admin'
    avatarUrl: string | null
    createdAt: string
  }
  accessToken: string
  refreshToken: string
  expiresAt: number
}

/**
 * Create a new session from tokens
 */
export async function createSession(userId: string, tokens: TokenPair): Promise<Session> {
  // Fetch user data
  const { data: userData, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !userData) {
    throw new AuthenticationError('USER_NOT_FOUND', 'User not found', 404)
  }

  // Decode access token to get expiry
  const payload = await verifyToken(tokens.accessToken)
  const decoded = await verifyToken(tokens.accessToken)

  return {
    user: {
      id: userData.id,
      email: userData.email,
      fullName: userData.full_name,
      phone: userData.phone,
      walletAddress: userData.wallet_address,
      nftHolder: userData.nft_holder,
      role: userData.role,
      avatarUrl: userData.avatar_url,
      createdAt: userData.created_at,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes (matches ACCESS_TOKEN_EXPIRY)
  }
}

/**
 * Refresh an expired access token using refresh token
 */
export async function refreshSession(
  refreshToken: string
): Promise<{ success: boolean; session?: Session; error?: string }> {
  try {
    // Verify refresh token
    const payload = await verifyToken(refreshToken)

    // Fetch latest user data
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', payload.userId)
      .single()

    if (error || !userData) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    // Generate new token pair
    const tokens = await createTokenPair({
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      nftHolder: userData.nft_holder,
      walletAddress: userData.wallet_address,
    })

    // Create new session
    const session = await createSession(userData.id, tokens)

    return {
      success: true,
      session,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed',
    }
  }
}

/**
 * Validate a session token
 */
export async function validateSession(
  accessToken: string
): Promise<{ valid: boolean; payload?: TokenPayload; error?: string }> {
  try {
    const payload = await verifyToken(accessToken)
    return {
      valid: true,
      payload,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid session',
    }
  }
}

/**
 * Revoke all sessions for a user (e.g., on logout or password change)
 */
export async function revokeSessions(userId: string): Promise<boolean> {
  try {
    // Sign out user from Supabase (invalidates all tokens)
    const { error } = await supabaseAdmin.auth.admin.signOut(userId)

    if (error) {
      console.error('Session revocation error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Session revocation error:', error)
    return false
  }
}

/**
 * Get session from request headers
 */
export async function getSessionFromRequest(
  authHeader: string | null
): Promise<{ session: Session | null; error?: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      session: null,
      error: 'No authorization header',
    }
  }

  const token = authHeader.substring(7)
  const validation = await validateSession(token)

  if (!validation.valid || !validation.payload) {
    return {
      session: null,
      error: validation.error || 'Invalid token',
    }
  }

  // Fetch user data to create session
  const { data: userData, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', validation.payload.userId)
    .single()

  if (error || !userData) {
    return {
      session: null,
      error: 'User not found',
    }
  }

  return {
    session: {
      user: {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name,
        phone: userData.phone,
        walletAddress: userData.wallet_address,
        nftHolder: userData.nft_holder,
        role: userData.role,
        avatarUrl: userData.avatar_url,
        createdAt: userData.created_at,
      },
      accessToken: token,
      refreshToken: '', // Not included in request
      expiresAt: Date.now() + 15 * 60 * 1000,
    },
  }
}

/**
 * Update NFT holder status in active session
 */
export async function updateNftHolderStatus(
  userId: string,
  nftHolder: boolean
): Promise<{ success: boolean; session?: Session }> {
  try {
    // Update user in database
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .update({ nft_holder: nftHolder, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()

    if (error || !userData) {
      return { success: false }
    }

    // Generate new tokens with updated nft_holder flag
    const tokens = await createTokenPair({
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      nftHolder: userData.nft_holder,
      walletAddress: userData.wallet_address,
    })

    const session = await createSession(userId, tokens)

    return {
      success: true,
      session,
    }
  } catch (error) {
    console.error('NFT holder status update error:', error)
    return { success: false }
  }
}
