/**
 * Authentication Service Layer
 * Contains all business logic for authentication operations
 * Uses PostgreSQL directly instead of Supabase Auth
 */

import { executeQuery, executeQuerySingle } from '../db/postgres';
import { hashPassword, comparePassword, validatePassword, generateResetToken } from './password';
import { createTokenPair, TokenPair } from './jwt';

export interface RegisterInput {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    fullName: string | null;
    phone: string | null;
    walletAddress: string | null;
    nftHolder: boolean;
    role: 'user' | 'staff' | 'admin';
    avatarUrl: string | null;
    createdAt: string;
  };
  tokens: TokenPair;
}

export interface AuthError {
  code: string;
  message: string;
  statusCode: number;
}

/**
 * Database user type matching users table schema
 */
interface DbUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  phone: string | null;
  wallet_address: string | null;
  nft_holder: boolean;
  role: 'user' | 'staff' | 'admin';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Custom error class for authentication errors
 */
export class AuthenticationError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Validates email format
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Registers a new user
 */
export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  try {
    // Validate email
    if (!validateEmail(input.email)) {
      throw new AuthenticationError('INVALID_EMAIL', 'Invalid email format', 400);
    }

    // Validate password
    const passwordValidation = validatePassword(input.password);
    if (!passwordValidation.isValid) {
      throw new AuthenticationError(
        'INVALID_PASSWORD',
        passwordValidation.errors.join(', '),
        400
      );
    }

    // Check if user already exists
    const checkQuery = 'SELECT id FROM users WHERE email = $1';
    const { data: existingUser } = await executeQuerySingle<{ id: string }>(
      checkQuery,
      [input.email.toLowerCase()]
    );

    if (existingUser) {
      throw new AuthenticationError(
        'EMAIL_EXISTS',
        'An account with this email already exists',
        409
      );
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user in database
    const insertQuery = `
      INSERT INTO users (email, password_hash, full_name, phone, role, nft_holder)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, password_hash, full_name, phone, wallet_address,
                nft_holder, role, avatar_url, created_at, updated_at
    `;

    const { data: userData, error: dbError } = await executeQuerySingle<DbUser>(
      insertQuery,
      [
        input.email.toLowerCase(),
        passwordHash,
        input.fullName || null,
        input.phone || null,
        'user',
        false,
      ]
    );

    if (dbError || !userData) {
      console.error('Database error during registration:', dbError);
      throw new AuthenticationError(
        'REGISTRATION_FAILED',
        'Failed to create user profile',
        500
      );
    }

    // Generate tokens with NFT holder flag
    const tokens = await createTokenPair({
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      nftHolder: userData.nft_holder,
      walletAddress: userData.wallet_address,
    });

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
      tokens,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    console.error('Unexpected error during registration:', error);
    throw new AuthenticationError(
      'REGISTRATION_FAILED',
      'An unexpected error occurred during registration',
      500
    );
  }
}

/**
 * Authenticates a user and returns tokens
 */
export async function loginUser(input: LoginInput): Promise<AuthResult> {
  try {
    // Validate email
    if (!validateEmail(input.email)) {
      throw new AuthenticationError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    // Fetch user from database
    const query = `
      SELECT id, email, password_hash, full_name, phone, wallet_address,
             nft_holder, role, avatar_url, created_at, updated_at
      FROM users
      WHERE email = $1
    `;

    const { data: userData, error: dbError } = await executeQuerySingle<DbUser>(
      query,
      [input.email.toLowerCase()]
    );

    if (dbError || !userData) {
      throw new AuthenticationError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(input.password, userData.password_hash);

    if (!isPasswordValid) {
      throw new AuthenticationError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
    }

    // Generate tokens with NFT holder flag
    const tokens = await createTokenPair({
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      nftHolder: userData.nft_holder,
      walletAddress: userData.wallet_address,
    });

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
      tokens,
    };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    console.error('Unexpected error during login:', error);
    throw new AuthenticationError('LOGIN_FAILED', 'An unexpected error occurred during login', 500);
  }
}

/**
 * Gets user by ID
 */
export async function getUserById(userId: string) {
  const query = `
    SELECT id, email, password_hash, full_name, phone, wallet_address,
           nft_holder, role, avatar_url, created_at, updated_at
    FROM users
    WHERE id = $1
  `;

  const { data, error } = await executeQuerySingle<DbUser>(query, [userId]);

  if (error || !data) {
    throw new AuthenticationError('USER_NOT_FOUND', 'User not found', 404);
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    phone: data.phone,
    walletAddress: data.wallet_address,
    nftHolder: data.nft_holder,
    role: data.role,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
  };
}

/**
 * Gets user by email
 */
export async function getUserByEmail(email: string) {
  const query = `
    SELECT id, email, password_hash, full_name, phone, wallet_address,
           nft_holder, role, avatar_url, created_at, updated_at
    FROM users
    WHERE email = $1
  `;

  const { data, error } = await executeQuerySingle<DbUser>(query, [email.toLowerCase()]);

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    phone: data.phone,
    walletAddress: data.wallet_address,
    nftHolder: data.nft_holder,
    role: data.role,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
  };
}

/**
 * Updates user profile
 */
export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
  // Build dynamic UPDATE query based on provided fields
  const updateFields: string[] = [];
  const params: any[] = [];
  let paramCount = 1;

  if (input.fullName !== undefined) {
    updateFields.push(`full_name = $${paramCount++}`);
    params.push(input.fullName);
  }

  if (input.phone !== undefined) {
    updateFields.push(`phone = $${paramCount++}`);
    params.push(input.phone);
  }

  if (input.avatarUrl !== undefined) {
    updateFields.push(`avatar_url = $${paramCount++}`);
    params.push(input.avatarUrl);
  }

  // Always update the updated_at timestamp
  updateFields.push(`updated_at = NOW()`);

  if (updateFields.length === 1) {
    // Only updated_at would be updated, meaning no actual changes
    throw new AuthenticationError('NO_UPDATES', 'No fields to update', 400);
  }

  // Add userId as the last parameter
  params.push(userId);

  const query = `
    UPDATE users
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, email, password_hash, full_name, phone, wallet_address,
              nft_holder, role, avatar_url, created_at, updated_at
  `;

  const { data, error } = await executeQuerySingle<DbUser>(query, params);

  if (error || !data) {
    console.error('Error updating user profile:', error);
    throw new AuthenticationError('UPDATE_FAILED', 'Failed to update profile', 500);
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    phone: data.phone,
    walletAddress: data.wallet_address,
    nftHolder: data.nft_holder,
    role: data.role,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
  };
}

/**
 * Initiates password reset process
 * Creates a password reset token and stores it in the database
 * Note: Email sending should be handled by the calling code
 */
export async function initiatePasswordReset(email: string): Promise<{ message: string; token?: string; userId?: string }> {
  try {
    // Validate email
    if (!validateEmail(email)) {
      // Don't reveal if email exists or not for security
      return { message: 'If an account exists, a password reset email will be sent' };
    }

    // Check if user exists
    const checkQuery = 'SELECT id FROM users WHERE email = $1';
    const { data: user } = await executeQuerySingle<{ id: string }>(
      checkQuery,
      [email.toLowerCase()]
    );

    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If an account exists, a password reset email will be sent' };
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    // First, delete any existing tokens for this user
    const deleteQuery = 'DELETE FROM password_reset_tokens WHERE user_id = $1';
    await executeQuery(deleteQuery, [user.id]);

    // Insert new reset token
    const insertQuery = `
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
    `;

    const { error: insertError } = await executeQuery(
      insertQuery,
      [user.id, resetToken, expiresAt.toISOString()]
    );

    if (insertError) {
      console.error('Failed to create password reset token:', insertError);
      return { message: 'If an account exists, a password reset email will be sent' };
    }

    // Return token for email sending (in production, this should trigger an email)
    // The calling code should send the email with the token
    return {
      message: 'If an account exists, a password reset email will be sent',
      token: resetToken,
      userId: user.id,
    };
  } catch (error) {
    // Don't throw error to prevent email enumeration
    console.error('Password reset error:', error);
    return { message: 'If an account exists, a password reset email will be sent' };
  }
}

/**
 * Resets user password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  try {
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new AuthenticationError(
        'INVALID_PASSWORD',
        passwordValidation.errors.join(', '),
        400
      );
    }

    // Verify reset token and get user ID
    const tokenQuery = `
      SELECT user_id, expires_at
      FROM password_reset_tokens
      WHERE token = $1
    `;

    const { data: tokenData, error: tokenError } = await executeQuerySingle<{
      user_id: string;
      expires_at: string;
    }>(tokenQuery, [token]);

    if (tokenError || !tokenData) {
      throw new AuthenticationError('INVALID_TOKEN', 'Invalid or expired reset token', 400);
    }

    // Check if token is expired
    const expiresAt = new Date(tokenData.expires_at);
    if (expiresAt < new Date()) {
      // Delete expired token
      await executeQuery('DELETE FROM password_reset_tokens WHERE token = $1', [token]);
      throw new AuthenticationError('EXPIRED_TOKEN', 'Reset token has expired', 400);
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    const updateQuery = `
      UPDATE users
      SET password_hash = $1, updated_at = NOW()
      WHERE id = $2
    `;

    const { error: updateError } = await executeQuery(updateQuery, [passwordHash, tokenData.user_id]);

    if (updateError) {
      console.error('Failed to update password:', updateError);
      throw new AuthenticationError('RESET_FAILED', 'Failed to reset password', 500);
    }

    // Delete used token
    await executeQuery('DELETE FROM password_reset_tokens WHERE token = $1', [token]);

    return { message: 'Password reset successfully' };
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    console.error('Password reset error:', error);
    throw new AuthenticationError('RESET_FAILED', 'Failed to reset password', 500);
  }
}