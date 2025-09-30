-- NFT Verifications Table
-- Stores cached NFT ownership verification results with 24-hour TTL

CREATE TABLE IF NOT EXISTS nft_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  nft_balance INTEGER NOT NULL DEFAULT 0,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_wallet UNIQUE (user_id, wallet_address),
  CONSTRAINT valid_wallet_address CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
  CONSTRAINT valid_balance CHECK (nft_balance >= 0),
  CONSTRAINT valid_expiry CHECK (expires_at > verified_at)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_nft_verifications_user_id ON nft_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_nft_verifications_wallet_address ON nft_verifications(wallet_address);
CREATE INDEX IF NOT EXISTS idx_nft_verifications_expires_at ON nft_verifications(expires_at);

-- Add wallet_address column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'wallet_address') THEN
    ALTER TABLE users ADD COLUMN wallet_address TEXT;
    ALTER TABLE users ADD CONSTRAINT valid_user_wallet_address
      CHECK (wallet_address IS NULL OR wallet_address ~ '^0x[a-fA-F0-9]{40}$');
  END IF;
END $$;

-- Add nft_holder flag to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'users' AND column_name = 'nft_holder') THEN
    ALTER TABLE users ADD COLUMN nft_holder BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create index on wallet_address for users
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address) WHERE wallet_address IS NOT NULL;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on nft_verifications
DROP TRIGGER IF EXISTS update_nft_verifications_updated_at ON nft_verifications;
CREATE TRIGGER update_nft_verifications_updated_at
  BEFORE UPDATE ON nft_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired verifications
CREATE OR REPLACE FUNCTION cleanup_expired_nft_verifications()
RETURNS void AS $$
BEGIN
  DELETE FROM nft_verifications WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE nft_verifications IS 'Stores NFT ownership verification results with 24-hour TTL cache';
COMMENT ON COLUMN nft_verifications.nft_balance IS 'Number of CitizenSpace NFTs owned by this wallet';
COMMENT ON COLUMN nft_verifications.verified_at IS 'Timestamp of when verification was performed';
COMMENT ON COLUMN nft_verifications.expires_at IS 'Timestamp when this verification expires (24 hours from verified_at)';