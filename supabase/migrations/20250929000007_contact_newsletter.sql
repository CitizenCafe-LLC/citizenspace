-- CitizenSpace Database Schema
-- Migration: Contact & Newsletter
-- Created: 2025-09-29
-- Description: Creates contact_submissions and newsletter_subscribers tables

-- =====================================================
-- CONTACT SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  topic TEXT NOT NULL CHECK (topic IN ('general', 'booking', 'partnership', 'press')),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Contact submissions indexes for performance
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_topic ON contact_submissions(topic);

-- =====================================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- =====================================================
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  preferences JSONB DEFAULT '{}'::jsonb,
  subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Newsletter subscribers indexes for performance
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_status ON newsletter_subscribers(status);

-- =====================================================
-- TRIGGER FUNCTIONS FOR UPDATED_AT
-- =====================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for contact_submissions
CREATE TRIGGER update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for newsletter_subscribers
CREATE TRIGGER update_newsletter_subscribers_updated_at
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE contact_submissions IS 'Stores contact form submissions from website visitors';
COMMENT ON COLUMN contact_submissions.topic IS 'Type of inquiry: general, booking, partnership, press';
COMMENT ON COLUMN contact_submissions.status IS 'Admin workflow status: new, in_progress, resolved, closed';
COMMENT ON COLUMN contact_submissions.admin_notes IS 'Internal notes for admins handling the submission';

COMMENT ON TABLE newsletter_subscribers IS 'Stores newsletter subscription emails and preferences';
COMMENT ON COLUMN newsletter_subscribers.status IS 'Subscription status: active, unsubscribed, bounced';
COMMENT ON COLUMN newsletter_subscribers.preferences IS 'JSON object storing topic preferences and settings';
COMMENT ON COLUMN newsletter_subscribers.unsubscribed_at IS 'Timestamp when user unsubscribed (null if subscribed)';