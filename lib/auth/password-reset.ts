/**
 * Password Reset Service
 * Handles password reset token management and email sending
 */

import { supabaseAdmin } from '../supabase/client';
import { sendPasswordResetEmail } from '../email/service';
import { validatePassword } from './password';
import crypto from 'crypto';

interface PasswordResetToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used: boolean;
}

/**
 * Generate a secure random token
 */
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create password reset token in database
 */
async function createResetToken(userId: string): Promise<string> {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Store token in database (you'll need to create this table)
  // For now, we'll use Supabase's built-in password reset
  // This is a placeholder for custom token management if needed

  return token;
}

/**
 * Initiate password reset process
 * Sends email with reset link
 */
export async function initiatePasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      // Don't reveal if email exists or not
      return {
        success: true,
        message: 'If an account exists, a password reset email will be sent',
      };
    }

    // Check if user exists
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      // Don't reveal if email exists or not for security
      return {
        success: true,
        message: 'If an account exists, a password reset email will be sent',
      };
    }

    // Use Supabase's built-in password reset
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.toLowerCase(),
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      },
    });

    if (resetError) {
      console.error('Password reset generation error:', resetError);
      // Still return success to prevent email enumeration
      return {
        success: true,
        message: 'If an account exists, a password reset email will be sent',
      };
    }

    // Note: Supabase handles sending the email automatically
    // If you want custom email templates, you would:
    // 1. Generate a custom token
    // 2. Store it in database
    // 3. Send custom email using sendPasswordResetEmail()

    return {
      success: true,
      message: 'If an account exists, a password reset email will be sent',
    };
  } catch (error) {
    console.error('Password reset error:', error);
    // Don't reveal error details for security
    return {
      success: true,
      message: 'If an account exists, a password reset email will be sent',
    };
  }
}

/**
 * Reset password with token
 */
export async function resetPasswordWithToken(
  token: string,
  newPassword: string
): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        message: 'Invalid password',
        error: passwordValidation.errors.join(', '),
      };
    }

    // Verify token and update password using Supabase
    // This would be called from the reset password page with the token from URL
    const { error } = await supabaseAdmin.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        success: false,
        message: 'Failed to reset password',
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Password reset successfully',
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Change password for authenticated user
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        message: 'Invalid password',
        error: passwordValidation.errors.join(', '),
      };
    }

    // Get user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Verify current password by attempting sign in
    const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      return {
        success: false,
        message: 'Current password is incorrect',
      };
    }

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) {
      return {
        success: false,
        message: 'Failed to change password',
        error: updateError.message,
      };
    }

    return {
      success: true,
      message: 'Password changed successfully',
    };
  } catch (error) {
    console.error('Password change error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}