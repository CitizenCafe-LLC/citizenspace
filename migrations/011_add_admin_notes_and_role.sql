-- Migration: Add admin_notes to bookings and role to users

-- Add admin_notes column to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add role column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'staff', 'admin'));
  END IF;
END $$;

-- Create index on user role for faster queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Add comment
COMMENT ON COLUMN bookings.admin_notes IS 'Internal notes from admins about this booking';
COMMENT ON COLUMN users.role IS 'User role for RBAC: user, staff, or admin';