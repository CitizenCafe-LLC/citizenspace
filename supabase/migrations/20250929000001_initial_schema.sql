-- CitizenSpace Database Schema
-- Migration: Initial Schema Setup
-- Created: 2025-09-29
-- Description: Creates all 13 core tables with proper constraints, indexes, and triggers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS & AUTHENTICATION TABLE
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    wallet_address TEXT UNIQUE,
    nft_holder BOOLEAN DEFAULT false,
    nft_token_id TEXT,
    membership_plan_id UUID,
    membership_status TEXT CHECK (membership_status IN ('active', 'paused', 'cancelled')),
    membership_start_date TIMESTAMPTZ,
    membership_end_date TIMESTAMPTZ,
    stripe_customer_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Users indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_wallet_address ON users(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX idx_users_membership_plan_id ON users(membership_plan_id);
CREATE INDEX idx_users_membership_status ON users(membership_status);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- =====================================================
-- 2. MEMBERSHIP PLANS TABLE
-- =====================================================
CREATE TABLE membership_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    nft_holder_price DECIMAL(10, 2) NOT NULL,
    billing_period TEXT NOT NULL CHECK (billing_period IN ('hourly', 'daily', 'monthly')),
    features JSONB DEFAULT '[]'::jsonb,
    limitations JSONB DEFAULT '[]'::jsonb,
    meeting_room_credits_hours INTEGER DEFAULT 0,
    printing_credits INTEGER DEFAULT 0,
    cafe_discount_percentage INTEGER DEFAULT 0,
    guest_passes_per_month INTEGER DEFAULT 0,
    access_hours TEXT,
    includes_hot_desk BOOLEAN DEFAULT false,
    stripe_price_id TEXT,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Membership plans indexes
CREATE INDEX idx_membership_plans_slug ON membership_plans(slug);
CREATE INDEX idx_membership_plans_active ON membership_plans(active);
CREATE INDEX idx_membership_plans_sort_order ON membership_plans(sort_order);

-- Add foreign key constraint to users table
ALTER TABLE users
ADD CONSTRAINT fk_users_membership_plan
FOREIGN KEY (membership_plan_id)
REFERENCES membership_plans(id)
ON DELETE SET NULL;

-- =====================================================
-- 3. WORKSPACES TABLE
-- =====================================================
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('hot-desk', 'focus-room', 'collaborate-room', 'boardroom', 'communications-pod')),
    resource_category TEXT NOT NULL CHECK (resource_category IN ('desk', 'meeting-room')),
    description TEXT,
    capacity INTEGER NOT NULL,
    base_price_hourly DECIMAL(10, 2) NOT NULL,
    requires_credits BOOLEAN DEFAULT false,
    min_duration DECIMAL(4, 2) NOT NULL,
    max_duration DECIMAL(4, 2) NOT NULL,
    amenities JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    available BOOLEAN DEFAULT true,
    floor_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Workspaces indexes
CREATE INDEX idx_workspaces_type ON workspaces(type);
CREATE INDEX idx_workspaces_resource_category ON workspaces(resource_category);
CREATE INDEX idx_workspaces_available ON workspaces(available);

-- =====================================================
-- 4. BOOKINGS/RESERVATIONS TABLE
-- =====================================================
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE RESTRICT,
    booking_type TEXT NOT NULL CHECK (booking_type IN ('hourly-desk', 'meeting-room', 'day-pass')),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_hours DECIMAL(4, 2) NOT NULL,
    attendees INTEGER NOT NULL DEFAULT 1,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    nft_discount_applied BOOLEAN DEFAULT false,
    credits_used DECIMAL(4, 2),
    credits_overage_hours DECIMAL(4, 2),
    overage_charge DECIMAL(10, 2),
    processing_fee DECIMAL(10, 2) DEFAULT 2.00,
    total_price DECIMAL(10, 2) NOT NULL,
    special_requests TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_intent_id TEXT,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'credits', 'membership')),
    confirmation_code TEXT UNIQUE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    actual_duration_hours DECIMAL(4, 2),
    final_charge DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Bookings indexes for performance
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_workspace_id ON bookings(workspace_id);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_confirmation_code ON bookings(confirmation_code);
CREATE INDEX idx_bookings_date_time ON bookings(booking_date, start_time, end_time);
-- Composite index for availability checking
CREATE INDEX idx_bookings_availability ON bookings(workspace_id, booking_date, start_time, end_time)
WHERE status != 'cancelled';

-- =====================================================
-- 5. MEMBERSHIP CREDITS LEDGER TABLE
-- =====================================================
CREATE TABLE membership_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credit_type TEXT NOT NULL CHECK (credit_type IN ('meeting-room', 'printing', 'guest-pass')),
    allocated_amount DECIMAL(10, 2) NOT NULL,
    used_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL,
    remaining_amount DECIMAL(10, 2) NOT NULL,
    billing_cycle_start DATE NOT NULL,
    billing_cycle_end DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'rolled-over')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Membership credits indexes
CREATE INDEX idx_membership_credits_user_id ON membership_credits(user_id);
CREATE INDEX idx_membership_credits_credit_type ON membership_credits(credit_type);
CREATE INDEX idx_membership_credits_status ON membership_credits(status);
CREATE INDEX idx_membership_credits_billing_cycle ON membership_credits(billing_cycle_start, billing_cycle_end);
-- Composite index for active credits lookup
CREATE INDEX idx_membership_credits_active ON membership_credits(user_id, credit_type, status)
WHERE status = 'active';

-- =====================================================
-- 6. CREDIT TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    membership_credit_id UUID NOT NULL REFERENCES membership_credits(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('allocation', 'usage', 'refund', 'expiration')),
    amount DECIMAL(10, 2) NOT NULL,
    balance_after DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Credit transactions indexes
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_membership_credit_id ON credit_transactions(membership_credit_id);
CREATE INDEX idx_credit_transactions_booking_id ON credit_transactions(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX idx_credit_transactions_transaction_type ON credit_transactions(transaction_type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- =====================================================
-- 7. MENU ITEMS (CAFE) TABLE
-- =====================================================
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    nft_holder_price DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('coffee', 'tea', 'pastries', 'meals')),
    dietary_tags JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    available BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    orderable BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Menu items indexes
CREATE INDEX idx_menu_items_slug ON menu_items(slug);
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(available);
CREATE INDEX idx_menu_items_featured ON menu_items(featured);
CREATE INDEX idx_menu_items_sort_order ON menu_items(sort_order);

-- =====================================================
-- 8. CAFE ORDERS TABLE
-- =====================================================
CREATE TABLE cafe_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    items JSONB NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    nft_discount_applied BOOLEAN DEFAULT false,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_intent_id TEXT,
    order_type TEXT NOT NULL CHECK (order_type IN ('dine-in', 'takeout')),
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Cafe orders indexes
CREATE INDEX idx_cafe_orders_user_id ON cafe_orders(user_id);
CREATE INDEX idx_cafe_orders_order_number ON cafe_orders(order_number);
CREATE INDEX idx_cafe_orders_status ON cafe_orders(status);
CREATE INDEX idx_cafe_orders_payment_status ON cafe_orders(payment_status);
CREATE INDEX idx_cafe_orders_created_at ON cafe_orders(created_at DESC);

-- =====================================================
-- 9. EVENTS TABLE
-- =====================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT NOT NULL,
    host_name TEXT NOT NULL,
    host_organization TEXT,
    capacity INTEGER NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0,
    image_url TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    external_rsvp_url TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('workshop', 'networking', 'tech-talk', 'experience')),
    status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in-progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Events indexes
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_date_status ON events(event_date, status);

-- =====================================================
-- 10. EVENT RSVPS TABLE
-- =====================================================
CREATE TABLE event_rsvps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attendees_count INTEGER NOT NULL DEFAULT 1,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_intent_id TEXT,
    confirmation_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'waitlist')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(event_id, user_id)
);

-- Event RSVPs indexes
CREATE INDEX idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_user_id ON event_rsvps(user_id);
CREATE INDEX idx_event_rsvps_status ON event_rsvps(status);
CREATE INDEX idx_event_rsvps_confirmation_code ON event_rsvps(confirmation_code);

-- =====================================================
-- 11. BLOG POSTS TABLE
-- =====================================================
CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    featured_image_url TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    reading_time_minutes INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Blog posts indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_blog_posts_views_count ON blog_posts(views_count DESC);

-- =====================================================
-- 12. CONTACT SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    topic TEXT NOT NULL CHECK (topic IN ('general', 'tour', 'membership', 'events', 'partnership', 'press')),
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in-progress', 'resolved', 'spam')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Contact submissions indexes
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX idx_contact_submissions_topic ON contact_submissions(topic);
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_assigned_to ON contact_submissions(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at DESC);

-- =====================================================
-- 13. NEWSLETTER SUBSCRIBERS TABLE
-- =====================================================
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    unsubscribed_at TIMESTAMPTZ,
    source TEXT NOT NULL
);

-- Newsletter subscribers indexes
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX idx_newsletter_subscribers_source ON newsletter_subscribers(source);

-- =====================================================
-- TRIGGERS FOR updated_at COLUMNS
-- =====================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membership_credits_updated_at BEFORE UPDATE ON membership_credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cafe_orders_updated_at BEFORE UPDATE ON cafe_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to generate unique confirmation codes
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(
        SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique order numbers
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
           LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE users IS 'Core user accounts with authentication and membership information';
COMMENT ON TABLE membership_plans IS 'Available membership subscription plans with pricing and features';
COMMENT ON TABLE workspaces IS 'Physical workspace resources (desks and meeting rooms)';
COMMENT ON TABLE bookings IS 'Workspace reservations and bookings with payment tracking';
COMMENT ON TABLE membership_credits IS 'Credit allocation ledger for membership benefits';
COMMENT ON TABLE credit_transactions IS 'Detailed transaction history for credit usage';
COMMENT ON TABLE menu_items IS 'Cafe menu items with pricing and availability';
COMMENT ON TABLE cafe_orders IS 'Customer orders from the cafe';
COMMENT ON TABLE events IS 'Community events and workshops';
COMMENT ON TABLE event_rsvps IS 'Event registrations and RSVPs';
COMMENT ON TABLE blog_posts IS 'Blog content and articles';
COMMENT ON TABLE contact_submissions IS 'Contact form submissions from website';
COMMENT ON TABLE newsletter_subscribers IS 'Email newsletter subscription list';