-- Migration: Create audit_logs table for tracking admin actions
-- This table stores all administrative actions for compliance and security

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'status_change', 'refund')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('booking', 'user', 'workspace', 'menu_item', 'order', 'membership')),
  resource_id UUID NOT NULL,
  changes JSONB, -- Store before/after values
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX idx_audit_logs_admin_user_id ON audit_logs(admin_user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Add comment for documentation
COMMENT ON TABLE audit_logs IS 'Audit trail for all administrative actions in the system';
COMMENT ON COLUMN audit_logs.changes IS 'JSONB object containing before and after values of changed fields';