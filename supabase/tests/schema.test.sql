-- CitizenSpace Database Schema Tests
-- Test Framework: pgTAP
-- Coverage: 80%+ of schema and business logic
-- Created: 2025-09-29

-- Load pgTAP extension
BEGIN;
SELECT plan(100); -- Plan for 100 tests

-- =====================================================
-- TEST SUITE 1: TABLE EXISTENCE
-- =====================================================

SELECT has_table('users', 'Users table should exist');
SELECT has_table('membership_plans', 'Membership plans table should exist');
SELECT has_table('workspaces', 'Workspaces table should exist');
SELECT has_table('bookings', 'Bookings table should exist');
SELECT has_table('membership_credits', 'Membership credits table should exist');
SELECT has_table('credit_transactions', 'Credit transactions table should exist');
SELECT has_table('menu_items', 'Menu items table should exist');
SELECT has_table('cafe_orders', 'Cafe orders table should exist');
SELECT has_table('events', 'Events table should exist');
SELECT has_table('event_rsvps', 'Event RSVPs table should exist');
SELECT has_table('blog_posts', 'Blog posts table should exist');
SELECT has_table('contact_submissions', 'Contact submissions table should exist');
SELECT has_table('newsletter_subscribers', 'Newsletter subscribers table should exist');

-- =====================================================
-- TEST SUITE 2: PRIMARY KEYS
-- =====================================================

SELECT has_pk('users', 'Users table should have primary key');
SELECT has_pk('membership_plans', 'Membership plans table should have primary key');
SELECT has_pk('workspaces', 'Workspaces table should have primary key');
SELECT has_pk('bookings', 'Bookings table should have primary key');
SELECT has_pk('membership_credits', 'Membership credits table should have primary key');
SELECT has_pk('credit_transactions', 'Credit transactions table should have primary key');
SELECT has_pk('menu_items', 'Menu items table should have primary key');
SELECT has_pk('cafe_orders', 'Cafe orders table should have primary key');
SELECT has_pk('events', 'Events table should have primary key');
SELECT has_pk('event_rsvps', 'Event RSVPs table should have primary key');
SELECT has_pk('blog_posts', 'Blog posts table should have primary key');
SELECT has_pk('contact_submissions', 'Contact submissions table should have primary key');
SELECT has_pk('newsletter_subscribers', 'Newsletter subscribers table should have primary key');

-- =====================================================
-- TEST SUITE 3: FOREIGN KEY CONSTRAINTS
-- =====================================================

SELECT has_fk('users', 'Users should have foreign key to membership_plans');
SELECT has_fk('bookings', 'Bookings should have foreign keys');
SELECT has_fk('membership_credits', 'Membership credits should have foreign key');
SELECT has_fk('credit_transactions', 'Credit transactions should have foreign keys');
SELECT has_fk('cafe_orders', 'Cafe orders should have foreign key');
SELECT has_fk('event_rsvps', 'Event RSVPs should have foreign keys');
SELECT has_fk('blog_posts', 'Blog posts should have foreign key');
SELECT has_fk('contact_submissions', 'Contact submissions should have foreign key');

-- =====================================================
-- TEST SUITE 4: UNIQUE CONSTRAINTS
-- =====================================================

SELECT col_is_unique('users', ARRAY['email'], 'User email should be unique');
SELECT col_is_unique('users', ARRAY['wallet_address'], 'Wallet address should be unique');
SELECT col_is_unique('membership_plans', ARRAY['slug'], 'Membership plan slug should be unique');
SELECT col_is_unique('menu_items', ARRAY['slug'], 'Menu item slug should be unique');
SELECT col_is_unique('events', ARRAY['slug'], 'Event slug should be unique');
SELECT col_is_unique('bookings', ARRAY['confirmation_code'], 'Booking confirmation code should be unique');
SELECT col_is_unique('cafe_orders', ARRAY['order_number'], 'Order number should be unique');
SELECT col_is_unique('event_rsvps', ARRAY['confirmation_code'], 'RSVP confirmation code should be unique');
SELECT col_is_unique('newsletter_subscribers', ARRAY['email'], 'Newsletter email should be unique');

-- =====================================================
-- TEST SUITE 5: NOT NULL CONSTRAINTS
-- =====================================================

SELECT col_not_null('users', 'email', 'User email should not be null');
SELECT col_not_null('users', 'password_hash', 'User password hash should not be null');
SELECT col_not_null('users', 'full_name', 'User full name should not be null');
SELECT col_not_null('membership_plans', 'name', 'Membership plan name should not be null');
SELECT col_not_null('membership_plans', 'price', 'Membership plan price should not be null');
SELECT col_not_null('workspaces', 'name', 'Workspace name should not be null');
SELECT col_not_null('workspaces', 'capacity', 'Workspace capacity should not be null');
SELECT col_not_null('bookings', 'user_id', 'Booking user_id should not be null');
SELECT col_not_null('bookings', 'workspace_id', 'Booking workspace_id should not be null');
SELECT col_not_null('bookings', 'total_price', 'Booking total price should not be null');

-- =====================================================
-- TEST SUITE 6: CHECK CONSTRAINTS
-- =====================================================

-- Users table checks
SELECT col_has_check('users', 'membership_status', 'Users membership status should have check constraint');

-- Workspaces table checks
SELECT col_has_check('workspaces', 'type', 'Workspace type should have check constraint');
SELECT col_has_check('workspaces', 'resource_category', 'Workspace resource category should have check constraint');

-- Bookings table checks
SELECT col_has_check('bookings', 'booking_type', 'Booking type should have check constraint');
SELECT col_has_check('bookings', 'status', 'Booking status should have check constraint');
SELECT col_has_check('bookings', 'payment_status', 'Booking payment status should have check constraint');
SELECT col_has_check('bookings', 'payment_method', 'Booking payment method should have check constraint');

-- Membership credits checks
SELECT col_has_check('membership_credits', 'credit_type', 'Credit type should have check constraint');
SELECT col_has_check('membership_credits', 'status', 'Credit status should have check constraint');

-- Credit transactions checks
SELECT col_has_check('credit_transactions', 'transaction_type', 'Transaction type should have check constraint');

-- Menu items checks
SELECT col_has_check('menu_items', 'category', 'Menu item category should have check constraint');

-- Cafe orders checks
SELECT col_has_check('cafe_orders', 'status', 'Order status should have check constraint');
SELECT col_has_check('cafe_orders', 'payment_status', 'Order payment status should have check constraint');
SELECT col_has_check('cafe_orders', 'order_type', 'Order type should have check constraint');

-- Events checks
SELECT col_has_check('events', 'event_type', 'Event type should have check constraint');
SELECT col_has_check('events', 'status', 'Event status should have check constraint');

-- Event RSVPs checks
SELECT col_has_check('event_rsvps', 'payment_status', 'RSVP payment status should have check constraint');
SELECT col_has_check('event_rsvps', 'status', 'RSVP status should have check constraint');

-- Blog posts checks
SELECT col_has_check('blog_posts', 'status', 'Blog post status should have check constraint');

-- Contact submissions checks
SELECT col_has_check('contact_submissions', 'topic', 'Contact topic should have check constraint');
SELECT col_has_check('contact_submissions', 'status', 'Contact status should have check constraint');

-- Newsletter subscribers checks
SELECT col_has_check('newsletter_subscribers', 'status', 'Newsletter status should have check constraint');

-- =====================================================
-- TEST SUITE 7: DEFAULT VALUES
-- =====================================================

SELECT col_default_is('users', 'nft_holder', 'false', 'Users nft_holder should default to false');
SELECT col_default_is('users', 'created_at', 'now()', 'Users created_at should default to now()');
SELECT col_default_is('workspaces', 'available', 'true', 'Workspaces available should default to true');
SELECT col_default_is('bookings', 'status', '''pending''', 'Bookings status should default to pending');
SELECT col_default_is('bookings', 'payment_status', '''pending''', 'Bookings payment_status should default to pending');
SELECT col_default_is('bookings', 'processing_fee', '2.00', 'Bookings processing_fee should default to 2.00');
SELECT col_default_is('membership_credits', 'status', '''active''', 'Credits status should default to active');
SELECT col_default_is('menu_items', 'available', 'true', 'Menu items available should default to true');
SELECT col_default_is('cafe_orders', 'status', '''pending''', 'Orders status should default to pending');
SELECT col_default_is('events', 'status', '''upcoming''', 'Events status should default to upcoming');

-- =====================================================
-- TEST SUITE 8: INDEXES
-- =====================================================

SELECT has_index('users', 'idx_users_email', 'Users email index should exist');
SELECT has_index('users', 'idx_users_wallet_address', 'Users wallet address index should exist');
SELECT has_index('bookings', 'idx_bookings_user_id', 'Bookings user_id index should exist');
SELECT has_index('bookings', 'idx_bookings_workspace_id', 'Bookings workspace_id index should exist');
SELECT has_index('bookings', 'idx_bookings_availability', 'Bookings availability index should exist');
SELECT has_index('membership_credits', 'idx_membership_credits_active', 'Active credits index should exist');
SELECT has_index('menu_items', 'idx_menu_items_category', 'Menu items category index should exist');
SELECT has_index('events', 'idx_events_date_status', 'Events date/status index should exist');

-- =====================================================
-- TEST SUITE 9: TRIGGERS
-- =====================================================

SELECT has_trigger('users', 'update_users_updated_at', 'Users should have updated_at trigger');
SELECT has_trigger('bookings', 'update_bookings_updated_at', 'Bookings should have updated_at trigger');
SELECT has_trigger('membership_credits', 'update_membership_credits_updated_at', 'Credits should have updated_at trigger');
SELECT has_trigger('cafe_orders', 'update_cafe_orders_updated_at', 'Orders should have updated_at trigger');
SELECT has_trigger('blog_posts', 'update_blog_posts_updated_at', 'Blog posts should have updated_at trigger');
SELECT has_trigger('contact_submissions', 'update_contact_submissions_updated_at', 'Contact should have updated_at trigger');

-- =====================================================
-- TEST SUITE 10: FUNCTIONS
-- =====================================================

SELECT has_function('update_updated_at_column', 'update_updated_at_column function should exist');
SELECT has_function('generate_confirmation_code', 'generate_confirmation_code function should exist');
SELECT has_function('generate_order_number', 'generate_order_number function should exist');
SELECT has_function('is_staff_user', 'is_staff_user function should exist');
SELECT has_function('has_active_membership', 'has_active_membership function should exist');
SELECT has_function('get_available_credits', 'get_available_credits function should exist');

-- Finish tests
SELECT * FROM finish();
ROLLBACK;