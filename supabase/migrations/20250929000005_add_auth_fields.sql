-- Migration: Add Authentication Fields
-- Created: 2025-09-29
-- Description: Adds role, avatar_url columns to users table and creates password_reset_tokens table

-- Add missing columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'staff', 'admin')),
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index on role for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create password_reset_tokens table for password reset functionality
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for password_reset_tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Add comment to table
COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens for user authentication';
COMMENT ON COLUMN password_reset_tokens.token IS 'Unique reset token sent to user email';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token expiration timestamp (typically 1 hour from creation)';