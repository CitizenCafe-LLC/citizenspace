/**
 * Unit Tests for JWT Utilities
 */

import {
  createAccessToken,
  createRefreshToken,
  createTokenPair,
  verifyToken,
  isTokenExpired,
  extractTokenFromHeader,
  TokenPayload,
} from '@/lib/auth/jwt';

describe('JWT Utilities', () => {
  const mockPayload: TokenPayload = {
    userId: 'user-123',
    email: 'test@example.com',
    role: 'user',
  };

  describe('createAccessToken', () => {
    it('should create a valid access token', async () => {
      const token = await createAccessToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should create tokens with correct payload', async () => {
      const token = await createAccessToken(mockPayload);
      const decoded = await verifyToken(token);

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });
  });

  describe('createRefreshToken', () => {
    it('should create a valid refresh token', async () => {
      const token = await createRefreshToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should create tokens with correct payload', async () => {
      const token = await createRefreshToken(mockPayload);
      const decoded = await verifyToken(token);

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });
  });

  describe('createTokenPair', () => {
    it('should create both access and refresh tokens', async () => {
      const tokens = await createTokenPair(mockPayload);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });

    it('should create valid token pairs', async () => {
      const tokens = await createTokenPair(mockPayload);

      const accessDecoded = await verifyToken(tokens.accessToken);
      const refreshDecoded = await verifyToken(tokens.refreshToken);

      expect(accessDecoded.userId).toBe(mockPayload.userId);
      expect(refreshDecoded.userId).toBe(mockPayload.userId);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const token = await createAccessToken(mockPayload);
      const decoded = await verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
    });

    it('should reject an invalid token', async () => {
      await expect(verifyToken('invalid.token.here')).rejects.toThrow();
    });

    it('should reject a malformed token', async () => {
      await expect(verifyToken('not-a-jwt')).rejects.toThrow();
    });

    it('should reject an empty token', async () => {
      await expect(verifyToken('')).rejects.toThrow();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for a valid token', async () => {
      const token = await createAccessToken(mockPayload);
      const expired = await isTokenExpired(token);
      expect(expired).toBe(false);
    });

    it('should return true for an invalid token', async () => {
      const expired = await isTokenExpired('invalid.token.here');
      expect(expired).toBe(true);
    });

    it('should return true for a malformed token', async () => {
      const expired = await isTokenExpired('not-a-jwt');
      expect(expired).toBe(true);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Bearer header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature';
      const header = `Bearer ${token}`;
      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    it('should return null for null header', () => {
      const extracted = extractTokenFromHeader(null);
      expect(extracted).toBeNull();
    });

    it('should return null for empty header', () => {
      const extracted = extractTokenFromHeader('');
      expect(extracted).toBeNull();
    });

    it('should return null for invalid format', () => {
      const extracted = extractTokenFromHeader('InvalidFormat token');
      expect(extracted).toBeNull();
    });

    it('should return null for header without Bearer prefix', () => {
      const extracted = extractTokenFromHeader('just-a-token');
      expect(extracted).toBeNull();
    });

    it('should return null for header with multiple spaces', () => {
      const extracted = extractTokenFromHeader('Bearer  token  extra');
      expect(extracted).toBeNull();
    });
  });
});