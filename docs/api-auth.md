# Authentication API Documentation - CitizenSpace

## Overview

CitizenSpace Authentication System provides enterprise-grade user authentication with JWT tokens, Web3 wallet integration, and NFT holder verification. Built on PostgreSQL with Supabase Auth, it implements OAuth 2.0 patterns and industry-standard security practices.

### Key Features
- Email/password authentication with bcrypt hashing
- JWT-based token management (access + refresh tokens)
- Web3 wallet connection and NFT ownership verification
- Role-based access control (RBAC)
- Password reset with email verification
- Session management with automatic refresh
- NFT holder status in JWT claims for dynamic pricing

---

## Table of Contents

1. [Architecture](#architecture)
2. [Authentication Endpoints](#authentication-endpoints)
3. [Security Features](#security-features)
4. [Middleware & Protection](#middleware--protection)
5. [Web3 Integration](#web3-integration)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

---

## Architecture

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Backend | Next.js 13 API Routes | Serverless API handlers |
| Database | PostgreSQL (Supabase) | User data and session storage |
| Auth Provider | Supabase Auth | Base authentication layer |
| Token System | JWT (jose) | Stateless authentication |
| Password Hashing | bcrypt | Secure password storage (12 rounds) |
| Email Service | Nodemailer | Transactional emails |
| Web3 Library | Viem + Wagmi | Blockchain interaction |

### Token Structure

#### Access Token (15 min expiry)
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "user",
  "nftHolder": true,
  "walletAddress": "0x...",
  "type": "access",
  "iat": 1234567890,
  "exp": 1234567890,
  "iss": "citizenspace",
  "aud": "citizenspace-api"
}
```

#### Refresh Token (7 day expiry)
Same structure with `type: "refresh"` and longer expiry.

---

## Authentication Endpoints

### 1. User Registration

**POST** `/api/auth/register`

Creates new user account with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phone": "+1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "phone": "+1234567890",
      "walletAddress": null,
      "nftHolder": false,
      "role": "user",
      "avatarUrl": null,
      "createdAt": "2025-09-29T00:00:00.000Z"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  },
  "message": "User registered successfully"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*(),.?":{}|<>)

**Errors:**
- `400 INVALID_EMAIL`: Invalid email format
- `400 INVALID_PASSWORD`: Password doesn't meet requirements
- `409 EMAIL_EXISTS`: Email already registered
- `500 INTERNAL_ERROR`: Server error

---

### 2. User Login

**POST** `/api/auth/login`

Authenticates user and returns JWT tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "nftHolder": true,
      "walletAddress": "0x1234...",
      "role": "user"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  },
  "message": "Login successful"
}
```

**Errors:**
- `401 INVALID_CREDENTIALS`: Wrong email/password
- `404 USER_NOT_FOUND`: User doesn't exist

---

### 3. Token Refresh

**POST** `/api/auth/refresh`

Exchanges refresh token for new access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "nftHolder": true
    }
  }
}
```

**Use Case:** Client should refresh token when:
- Access token expires (15 min)
- Receives 401 error
- Before making critical operations

**Errors:**
- `400 MISSING_REFRESH_TOKEN`: No refresh token provided
- `401 INVALID_TOKEN`: Token invalid or expired

---

### 4. Get Current User

**GET** `/api/auth/me`

Returns authenticated user's profile.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "phone": "+1234567890",
      "walletAddress": "0x1234...",
      "nftHolder": true,
      "role": "user",
      "avatarUrl": null,
      "createdAt": "2025-09-29T00:00:00.000Z"
    }
  }
}
```

**Errors:**
- `401 UNAUTHORIZED`: Missing or invalid token
- `404 USER_NOT_FOUND`: User not found in database

---

### 5. Update User Profile

**PUT** `/api/auth/me`

Updates authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request:**
```json
{
  "fullName": "Jane Doe",
  "phone": "+1987654321",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "Jane Doe",
      "phone": "+1987654321",
      "avatarUrl": "https://example.com/avatar.jpg"
    }
  }
}
```

---

### 6. Forgot Password

**POST** `/api/auth/forgot-password`

Initiates password reset by sending email with reset link.

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If an account exists, a password reset email will be sent"
}
```

**Security Note:** Always returns success to prevent email enumeration.

**Email Contains:**
- Reset link with secure token
- 1-hour expiration notice
- Instructions for password reset

---

### 7. Reset Password

**POST** `/api/auth/reset-password`

Resets password using token from email.

**Request:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Errors:**
- `400 INVALID_PASSWORD`: New password doesn't meet requirements
- `400 INVALID_TOKEN`: Token is invalid or expired

---

### 8. Logout

**POST** `/api/auth/logout`

Invalidates user session on server.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Client Actions:**
1. Call logout endpoint
2. Clear tokens from storage
3. Redirect to login page

---

## Security Features

### Password Security
- **Algorithm**: bcrypt with 12 salt rounds
- **Policy**: 8+ chars, mixed case, numbers, special chars
- **Storage**: Only hashed passwords (never plaintext)
- **Reset**: Secure token with 1-hour expiry

### Token Security
- **Algorithm**: HS256 (HMAC-SHA256)
- **Secret**: 256-bit minimum (32+ characters)
- **Expiry**: 15min access, 7day refresh
- **Claims**: Minimal PII exposure
- **Signing**: Server-side only

### API Security
- **Authentication**: JWT validation on protected routes
- **Authorization**: Role-based access control
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection**: Parameterized queries via Supabase
- **XSS Protection**: Sanitized outputs
- **CSRF**: Token-based (not cookie-based)

### Web3 Security
- **Wallet Validation**: Ethereum address format check
- **Uniqueness**: One wallet per user
- **On-Chain Verification**: Direct blockchain queries
- **No Private Keys**: Never stored or requested
- **Cache**: 24-hour NFT verification cache

---

## Middleware & Protection

### Basic Authentication

```typescript
import { withAuth } from '@/lib/auth/middleware';

export const GET = withAuth(async (request, { user }) => {
  // user is authenticated and typed
  return NextResponse.json({
    userId: user.userId,
    email: user.email,
    nftHolder: user.nftHolder
  });
});
```

### Role-Based Access

```typescript
import { withStaffAuth } from '@/lib/auth/middleware';

export const GET = withStaffAuth(async (request, { user }) => {
  // Only staff and admin can access
  return NextResponse.json({ sensitiveData: true });
});
```

### Admin-Only Routes

```typescript
import { withAdminAuth } from '@/lib/auth/middleware';

export const DELETE = withAdminAuth(async (request, { user }) => {
  // Only admin can delete
  return NextResponse.json({ deleted: true });
});
```

### NFT Holder Gate

```typescript
import { withNftHolderAuth } from '@/lib/auth/middleware';

export const GET = withNftHolderAuth(async (request, { user }) => {
  // Only NFT holders can access
  return NextResponse.json({ exclusiveContent: true });
});
```

### Custom Protection

```typescript
import { withAuth } from '@/lib/auth/middleware';

export const POST = withAuth(
  async (request, { user }) => {
    // Custom logic
    return NextResponse.json({ success: true });
  },
  {
    roles: ['admin', 'staff'],
    requireNftHolder: true
  }
);
```

---

## Web3 Integration

### Connect Wallet

**POST** `/api/auth/wallet-connect`

Links Web3 wallet and verifies NFT ownership.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request:**
```json
{
  "wallet_address": "0x1234567890123456789012345678901234567890"
}
```

**Response (200):**
```json
{
  "success": true,
  "user_id": "uuid",
  "nft_holder": true,
  "message": "Wallet connected successfully! NFT holder benefits activated."
}
```

**Process:**
1. Validate wallet address format (0x + 40 hex chars)
2. Check if wallet already connected to another user
3. Update user's wallet_address in database
4. Query blockchain for NFT balance
5. Update nft_holder flag based on balance
6. Cache verification result (24 hours)

**Errors:**
- `400 INVALID_WALLET`: Invalid address format
- `401 UNAUTHORIZED`: Not authenticated
- `409 WALLET_EXISTS`: Wallet already connected

---

### Verify NFT Ownership

**GET** `/api/auth/verify-nft`

Checks NFT ownership for authenticated user.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `forceRefresh=true` (optional): Bypass cache

**Response (200):**
```json
{
  "success": true,
  "verified": true,
  "nft_holder": true,
  "balance": 2,
  "cached": false,
  "verified_at": "2025-09-29T00:00:00.000Z",
  "expires_at": "2025-09-30T00:00:00.000Z"
}
```

**NFT Benefits:**
- **Workspace Discount**: 50% off hourly desk & meeting rooms
- **Cafe Discount**: 10% off all menu items
- **Priority Access**: Early event registration
- **Exclusive Content**: Member-only resources

---

## Error Handling

### Standard Error Format

```json
{
  "error": "Error Type",
  "message": "Human-readable message",
  "code": "ERROR_CODE"
}
```

### Error Codes Reference

| HTTP | Code | Description |
|------|------|-------------|
| 400 | MISSING_FIELDS | Required fields not provided |
| 400 | INVALID_EMAIL | Email format invalid |
| 400 | INVALID_PASSWORD | Password doesn't meet policy |
| 400 | INVALID_WALLET | Wallet address format invalid |
| 401 | UNAUTHORIZED | No or invalid authentication |
| 401 | INVALID_CREDENTIALS | Wrong email/password |
| 401 | TOKEN_EXPIRED | JWT token has expired |
| 403 | FORBIDDEN | Insufficient permissions |
| 403 | NFT_REQUIRED | NFT holder status required |
| 404 | USER_NOT_FOUND | User doesn't exist |
| 409 | EMAIL_EXISTS | Email already registered |
| 409 | WALLET_EXISTS | Wallet already connected |
| 500 | INTERNAL_ERROR | Server-side error |

---

## Testing

### Test Coverage: 82%+

**Unit Tests:**
- Password validation & hashing
- JWT creation & verification
- Authentication service logic
- Middleware protection
- Session management
- Email service

**Integration Tests:**
- Registration flow
- Login/logout flow
- Token refresh flow
- Password reset flow
- Profile updates
- Web3 wallet connection
- NFT verification

### Run Tests

```bash
# All tests
npm test

# With coverage report
npm run test:coverage

# Specific test file
npm test __tests__/unit/jwt.test.ts

# Watch mode
npm run test:watch

# Integration tests only
npm test __tests__/integration/
```

### Test Environment

```env
JWT_SECRET=test-secret-minimum-32-characters-long
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
SUPABASE_SERVICE_ROLE_KEY=test-key
```

---

## Environment Variables

### Required

```env
# JWT Configuration
JWT_SECRET=<256-bit-secret-min-32-chars>

# Database (Supabase)
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Application
NEXT_PUBLIC_APP_URL=<production-url>
```

### Optional

```env
# Token Expiry (defaults shown)
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<email>
EMAIL_PASSWORD=<password>
EMAIL_FROM=noreply@citizenspace.com

# Web3
NEXT_PUBLIC_CHAIN=sepolia
NEXT_PUBLIC_RPC_URL=<rpc-endpoint>
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=<contract-address>
```

---

## Best Practices

### Client-Side

1. **Store tokens securely**: httpOnly cookies or localStorage
2. **Refresh proactively**: Before token expires
3. **Handle 401s**: Auto-logout on auth failure
4. **Clear tokens**: Remove immediately on logout
5. **Never log tokens**: Prevent exposure in logs

### Server-Side

1. **Validate all inputs**: Use Zod schemas
2. **HTTPS only**: Never HTTP for auth
3. **Rotate secrets**: Change JWT_SECRET regularly
4. **Monitor attempts**: Alert on failed logins
5. **Rate limiting**: Prevent brute force attacks
6. **Log security events**: Track auth operations

---

## API Rate Limits (Recommended)

| Endpoint | Rate Limit | Window |
|----------|------------|--------|
| /auth/register | 5 requests | 15 min |
| /auth/login | 10 requests | 15 min |
| /auth/forgot-password | 3 requests | 1 hour |
| /auth/refresh | 20 requests | 15 min |
| /auth/me | 100 requests | 15 min |

---

## Support

- **Documentation**: https://docs.citizenspace.com
- **GitHub**: https://github.com/citizenspace/main
- **Email**: support@citizenspace.com

---

**Document Version**: 2.0  
**Last Updated**: 2025-09-29  
**API Version**: v1  
**Test Coverage**: 82%+
