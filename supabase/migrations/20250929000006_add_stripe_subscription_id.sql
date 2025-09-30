-- Migration: Add stripe_subscription_id to users table
-- Description: Adds Stripe subscription ID field to track active subscriptions
-- Created: 2025-09-29

-- Add stripe_subscription_id column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255) NULL;

-- Add index for faster lookups by subscription ID
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id
ON users(stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;

-- Add constraint to ensure unique subscription IDs
ALTER TABLE users
ADD CONSTRAINT unique_stripe_subscription_id
UNIQUE (stripe_subscription_id);

-- Add comment for documentation
COMMENT ON COLUMN users.stripe_subscription_id IS 'Stripe subscription ID for active membership subscriptions';

-- Add index on membership_credits for faster credit lookups
CREATE INDEX IF NOT EXISTS idx_membership_credits_user_type_status
ON membership_credits(user_id, credit_type, status);

-- Add index on membership_credits billing cycle
CREATE INDEX IF NOT EXISTS idx_membership_credits_billing_cycle
ON membership_credits(billing_cycle_start, billing_cycle_end);

-- Add constraint to prevent duplicate active credits per user per type per cycle
ALTER TABLE membership_credits
DROP CONSTRAINT IF EXISTS unique_active_credits;

ALTER TABLE membership_credits
ADD CONSTRAINT unique_active_credits
UNIQUE (user_id, credit_type, billing_cycle_start);

-- Add comment
COMMENT ON CONSTRAINT unique_active_credits ON membership_credits IS 'Ensures one active credit allocation per user per type per billing cycle';