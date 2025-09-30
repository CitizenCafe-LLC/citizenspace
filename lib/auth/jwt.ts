/**
 * JWT Token Management
 * Handles creation and verification of access and refresh tokens using jose
 */

import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET!
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m'
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d'

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long')
}

// Convert secret to Uint8Array for jose
const secret = new TextEncoder().encode(JWT_SECRET)

export interface TokenPayload {
  userId: string
  email: string
  role: 'user' | 'staff' | 'admin'
  nftHolder?: boolean
  walletAddress?: string | null
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

/**
 * Parses time duration string to seconds
 */
function parseExpiry(expiry: string): number {
  const unit = expiry.slice(-1)
  const value = parseInt(expiry.slice(0, -1))

  switch (unit) {
    case 's':
      return value
    case 'm':
      return value * 60
    case 'h':
      return value * 3600
    case 'd':
      return value * 86400
    default:
      throw new Error(`Invalid expiry format: ${expiry}`)
  }
}

/**
 * Creates a JWT access token
 */
export async function createAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    nftHolder: payload.nftHolder || false,
    walletAddress: payload.walletAddress || null,
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${parseExpiry(ACCESS_TOKEN_EXPIRY)}s`)
    .setIssuer('citizenspace')
    .setAudience('citizenspace-api')
    .sign(secret)
}

/**
 * Creates a JWT refresh token
 */
export async function createRefreshToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    nftHolder: payload.nftHolder || false,
    walletAddress: payload.walletAddress || null,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${parseExpiry(REFRESH_TOKEN_EXPIRY)}s`)
    .setIssuer('citizenspace')
    .setAudience('citizenspace-api')
    .sign(secret)
}

/**
 * Creates both access and refresh tokens
 */
export async function createTokenPair(payload: TokenPayload): Promise<TokenPair> {
  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken(payload),
    createRefreshToken(payload),
  ])

  return { accessToken, refreshToken }
}

/**
 * Verifies and decodes a JWT token
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'citizenspace',
      audience: 'citizenspace-api',
    })

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as 'user' | 'staff' | 'admin',
      nftHolder: payload.nftHolder as boolean | undefined,
      walletAddress: payload.walletAddress as string | null | undefined,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Token verification failed: ${error.message}`)
    }
    throw new Error('Token verification failed')
  }
}

/**
 * Checks if a token is expired without throwing an error
 */
export async function isTokenExpired(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret)
    return false
  } catch (error: any) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      return true
    }
    // For other errors, consider token invalid/expired
    return true
  }
}

/**
 * Extracts token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }

  return parts[1]
}
