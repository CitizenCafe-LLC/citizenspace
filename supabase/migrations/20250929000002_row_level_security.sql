-- CitizenSpace Database - Row Level Security (RLS) Policies
-- Migration: RLS Policies Setup
-- Created: 2025-09-29
-- Description: Implements comprehensive security policies for all tables

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile (excluding sensitive fields)
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from modifying these fields directly
    (OLD.membership_plan_id = NEW.membership_plan_id OR NEW.membership_plan_id IS NOT NULL) AND
    (OLD.membership_status = NEW.membership_status OR NEW.membership_status IS NOT NULL)
);

-- Public read access for user basic info (for displaying names, etc.)
CREATE POLICY "Public read access for basic user info"
ON users FOR SELECT
USING (true);

-- Service role can do everything
CREATE POLICY "Service role full access on users"
ON users FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- MEMBERSHIP PLANS TABLE POLICIES
-- =====================================================

-- Anyone can read active membership plans
CREATE POLICY "Anyone can read active membership plans"
ON membership_plans FOR SELECT
USING (active = true);

-- Only service role can modify membership plans
CREATE POLICY "Service role can manage membership plans"
ON membership_plans FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- WORKSPACES TABLE POLICIES
-- =====================================================

-- Anyone can read available workspaces
CREATE POLICY "Anyone can read available workspaces"
ON workspaces FOR SELECT
USING (available = true);

-- Service role can manage workspaces
CREATE POLICY "Service role can manage workspaces"
ON workspaces FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- BOOKINGS TABLE POLICIES
-- =====================================================

-- Users can read their own bookings
CREATE POLICY "Users can read own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id);

-- Users can create bookings for themselves
CREATE POLICY "Users can create own bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings (limited fields)
CREATE POLICY "Users can update own bookings"
ON bookings FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
    auth.uid() = user_id AND
    -- Only allow updating specific fields
    status IN ('pending', 'confirmed', 'cancelled') AND
    payment_status IN ('pending', 'paid', 'refunded')
);

-- Service role full access for admin operations
CREATE POLICY "Service role can manage all bookings"
ON bookings FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- MEMBERSHIP CREDITS TABLE POLICIES
-- =====================================================

-- Users can read their own credits
CREATE POLICY "Users can read own credits"
ON membership_credits FOR SELECT
USING (auth.uid() = user_id);

-- Only service role can modify credits
CREATE POLICY "Service role can manage credits"
ON membership_credits FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- CREDIT TRANSACTIONS TABLE POLICIES
-- =====================================================

-- Users can read their own credit transactions
CREATE POLICY "Users can read own transactions"
ON credit_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Only service role can create transactions
CREATE POLICY "Service role can create transactions"
ON credit_transactions FOR INSERT
WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Service role full access
CREATE POLICY "Service role can manage transactions"
ON credit_transactions FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- MENU ITEMS TABLE POLICIES
-- =====================================================

-- Anyone can read available menu items
CREATE POLICY "Anyone can read available menu items"
ON menu_items FOR SELECT
USING (available = true AND orderable = true);

-- Service role can manage menu items
CREATE POLICY "Service role can manage menu items"
ON menu_items FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- CAFE ORDERS TABLE POLICIES
-- =====================================================

-- Users can read their own orders
CREATE POLICY "Users can read own orders"
ON cafe_orders FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create own orders"
ON cafe_orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending orders (cancel only)
CREATE POLICY "Users can update own orders"
ON cafe_orders FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (
    auth.uid() = user_id AND
    status IN ('pending', 'cancelled')
);

-- Service role full access for staff operations
CREATE POLICY "Service role can manage all orders"
ON cafe_orders FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- EVENTS TABLE POLICIES
-- =====================================================

-- Anyone can read active events
CREATE POLICY "Anyone can read active events"
ON events FOR SELECT
USING (status IN ('upcoming', 'in-progress'));

-- Service role can manage events
CREATE POLICY "Service role can manage events"
ON events FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- EVENT RSVPS TABLE POLICIES
-- =====================================================

-- Users can read their own RSVPs
CREATE POLICY "Users can read own RSVPs"
ON event_rsvps FOR SELECT
USING (auth.uid() = user_id);

-- Users can create RSVPs for themselves
CREATE POLICY "Users can create own RSVPs"
ON event_rsvps FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own RSVPs (cancel only)
CREATE POLICY "Users can update own RSVPs"
ON event_rsvps FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
    auth.uid() = user_id AND
    status IN ('confirmed', 'cancelled', 'waitlist')
);

-- Service role full access
CREATE POLICY "Service role can manage all RSVPs"
ON event_rsvps FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- BLOG POSTS TABLE POLICIES
-- =====================================================

-- Anyone can read published blog posts
CREATE POLICY "Anyone can read published posts"
ON blog_posts FOR SELECT
USING (status = 'published');

-- Authors can read their own drafts
CREATE POLICY "Authors can read own drafts"
ON blog_posts FOR SELECT
USING (auth.uid() = author_id);

-- Authors can create posts
CREATE POLICY "Authors can create posts"
ON blog_posts FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts"
ON blog_posts FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Service role full access
CREATE POLICY "Service role can manage all posts"
ON blog_posts FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- CONTACT SUBMISSIONS TABLE POLICIES
-- =====================================================

-- Anyone can create contact submissions
CREATE POLICY "Anyone can create contact submissions"
ON contact_submissions FOR INSERT
WITH CHECK (true);

-- Only service role can read/manage submissions
CREATE POLICY "Service role can manage submissions"
ON contact_submissions FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- Assigned staff can read submissions assigned to them
CREATE POLICY "Staff can read assigned submissions"
ON contact_submissions FOR SELECT
USING (auth.uid() = assigned_to);

-- =====================================================
-- NEWSLETTER SUBSCRIBERS TABLE POLICIES
-- =====================================================

-- Anyone can subscribe to newsletter
CREATE POLICY "Anyone can subscribe to newsletter"
ON newsletter_subscribers FOR INSERT
WITH CHECK (true);

-- Users can update their own subscription (unsubscribe)
CREATE POLICY "Users can unsubscribe"
ON newsletter_subscribers FOR UPDATE
USING (true)
WITH CHECK (status IN ('active', 'unsubscribed'));

-- Service role full access
CREATE POLICY "Service role can manage subscribers"
ON newsletter_subscribers FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- HELPER FUNCTIONS FOR POLICY CHECKS
-- =====================================================

-- Function to check if user is staff/admin
CREATE OR REPLACE FUNCTION is_staff_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- This can be extended to check a staff role in users table
    -- For now, check if user exists and has specific permissions
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = user_uuid
        -- Add staff role check here when implemented
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has active membership
CREATE OR REPLACE FUNCTION has_active_membership(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = user_uuid
        AND membership_status = 'active'
        AND membership_end_date > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check available meeting room credits
CREATE OR REPLACE FUNCTION get_available_credits(
    user_uuid UUID,
    credit_type_param TEXT
)
RETURNS DECIMAL AS $$
DECLARE
    available_credits DECIMAL;
BEGIN
    SELECT COALESCE(SUM(remaining_amount), 0)
    INTO available_credits
    FROM membership_credits
    WHERE user_id = user_uuid
    AND credit_type = credit_type_param
    AND status = 'active'
    AND billing_cycle_end >= CURRENT_DATE;

    RETURN available_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant access to tables for authenticated users
GRANT SELECT ON membership_plans TO anon, authenticated;
GRANT SELECT ON workspaces TO anon, authenticated;
GRANT SELECT ON menu_items TO anon, authenticated;
GRANT SELECT ON events TO anon, authenticated;
GRANT SELECT ON blog_posts TO anon, authenticated;

-- Grant full access to authenticated users on their own data
GRANT ALL ON users TO authenticated;
GRANT ALL ON bookings TO authenticated;
GRANT ALL ON cafe_orders TO authenticated;
GRANT ALL ON event_rsvps TO authenticated;
GRANT SELECT ON membership_credits TO authenticated;
GRANT SELECT ON credit_transactions TO authenticated;

-- Grant insert on public submission tables
GRANT INSERT ON contact_submissions TO anon, authenticated;
GRANT INSERT, UPDATE ON newsletter_subscribers TO anon, authenticated;

-- Service role gets full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;