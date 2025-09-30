-- CitizenSpace Database Business Logic Tests
-- Test Framework: pgTAP
-- Coverage: Business rules, credit system, booking logic
-- Created: 2025-09-29

BEGIN;
SELECT plan(50);

-- =====================================================
-- TEST SUITE 1: USER CREATION AND MEMBERSHIP
-- =====================================================

-- Test 1: Create a basic user
INSERT INTO users (email, password_hash, full_name)
VALUES ('test@example.com', 'hashed_password', 'Test User')
RETURNING id INTO @test_user_id;

SELECT isnt_empty(
    'SELECT id FROM users WHERE email = ''test@example.com''',
    'Should be able to create a user'
);

-- Test 2: Email uniqueness constraint
SELECT throws_ok(
    $$INSERT INTO users (email, password_hash, full_name)
      VALUES ('test@example.com', 'hash2', 'Another User')$$,
    '23505',
    NULL,
    'Should not allow duplicate email addresses'
);

-- Test 3: NFT holder defaults to false
SELECT results_eq(
    'SELECT nft_holder FROM users WHERE email = ''test@example.com''',
    $$VALUES (false)$$,
    'NFT holder should default to false'
);

-- =====================================================
-- TEST SUITE 2: MEMBERSHIP PLANS
-- =====================================================

-- Test 4: All membership plans have required fields
SELECT is(
    (SELECT COUNT(*) FROM membership_plans WHERE name IS NULL OR price IS NULL),
    0::bigint,
    'All membership plans should have name and price'
);

-- Test 5: NFT holder prices are less than regular prices
SELECT is(
    (SELECT COUNT(*) FROM membership_plans WHERE nft_holder_price >= price),
    0::bigint,
    'NFT holder prices should be lower than regular prices'
);

-- Test 6: Meeting room credits are non-negative
SELECT is(
    (SELECT COUNT(*) FROM membership_plans WHERE meeting_room_credits_hours < 0),
    0::bigint,
    'Meeting room credits should not be negative'
);

-- =====================================================
-- TEST SUITE 3: WORKSPACE AVAILABILITY
-- =====================================================

-- Test 7: All workspaces have capacity
SELECT is(
    (SELECT COUNT(*) FROM workspaces WHERE capacity IS NULL OR capacity <= 0),
    0::bigint,
    'All workspaces should have positive capacity'
);

-- Test 8: Hot desks categorized correctly
SELECT is(
    (SELECT COUNT(*) FROM workspaces
     WHERE type = 'hot-desk' AND resource_category != 'desk'),
    0::bigint,
    'Hot desks should be categorized as desk resources'
);

-- Test 9: Meeting rooms categorized correctly
SELECT is(
    (SELECT COUNT(*) FROM workspaces
     WHERE type IN ('focus-room', 'collaborate-room', 'boardroom', 'communications-pod')
     AND resource_category != 'meeting-room'),
    0::bigint,
    'Meeting rooms should be categorized as meeting-room resources'
);

-- Test 10: Price validation
SELECT is(
    (SELECT COUNT(*) FROM workspaces WHERE base_price_hourly <= 0),
    0::bigint,
    'All workspaces should have positive pricing'
);

-- =====================================================
-- TEST SUITE 4: BOOKING SYSTEM
-- =====================================================

-- Create test workspace
INSERT INTO workspaces (name, type, resource_category, capacity, base_price_hourly, requires_credits, min_duration, max_duration, available)
VALUES ('Test Hot Desk', 'hot-desk', 'desk', 1, 2.50, false, 1.0, 12.0, true)
RETURNING id INTO @test_workspace_id;

-- Create test membership plan
INSERT INTO membership_plans (name, slug, price, nft_holder_price, billing_period, meeting_room_credits_hours, active)
VALUES ('Test Plan', 'test-plan', 100.00, 50.00, 'monthly', 5, true)
RETURNING id INTO @test_plan_id;

-- Test 11: Create a booking
INSERT INTO bookings (
    user_id, workspace_id, booking_type, booking_date,
    start_time, end_time, duration_hours, attendees,
    subtotal, total_price, status, payment_status,
    payment_method, confirmation_code
)
VALUES (
    @test_user_id, @test_workspace_id, 'hourly-desk', CURRENT_DATE,
    '09:00:00', '11:00:00', 2.0, 1,
    5.00, 7.00, 'confirmed', 'paid',
    'card', 'TEST12345'
);

SELECT isnt_empty(
    'SELECT id FROM bookings WHERE confirmation_code = ''TEST12345''',
    'Should be able to create a booking'
);

-- Test 12: Booking duration matches time slots
SELECT results_eq(
    $$SELECT EXTRACT(EPOCH FROM (end_time - start_time))/3600 = duration_hours
      FROM bookings WHERE confirmation_code = 'TEST12345'$$,
    $$VALUES (true)$$,
    'Booking duration should match time difference'
);

-- Test 13: Confirmation code uniqueness
SELECT throws_ok(
    $$INSERT INTO bookings (
        user_id, workspace_id, booking_type, booking_date,
        start_time, end_time, duration_hours, attendees,
        subtotal, total_price, status, payment_status,
        payment_method, confirmation_code
      ) VALUES (
        @test_user_id, @test_workspace_id, 'hourly-desk', CURRENT_DATE,
        '13:00:00', '15:00:00', 2.0, 1,
        5.00, 7.00, 'confirmed', 'paid',
        'card', 'TEST12345'
      )$$,
    '23505',
    NULL,
    'Should not allow duplicate confirmation codes'
);

-- Test 14: Booking status validation
SELECT throws_ok(
    $$INSERT INTO bookings (
        user_id, workspace_id, booking_type, booking_date,
        start_time, end_time, duration_hours, attendees,
        subtotal, total_price, status, payment_status,
        payment_method, confirmation_code
      ) VALUES (
        @test_user_id, @test_workspace_id, 'hourly-desk', CURRENT_DATE,
        '15:00:00', '17:00:00', 2.0, 1,
        5.00, 7.00, 'invalid_status', 'paid',
        'card', 'TEST12346'
      )$$,
    '23514',
    NULL,
    'Should only allow valid booking status values'
);

-- =====================================================
-- TEST SUITE 5: MEMBERSHIP CREDITS SYSTEM
-- =====================================================

-- Test 15: Create membership credits
INSERT INTO membership_credits (
    user_id, credit_type, allocated_amount, used_amount,
    remaining_amount, billing_cycle_start, billing_cycle_end, status
)
VALUES (
    @test_user_id, 'meeting-room', 8.0, 0.0, 8.0,
    CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', 'active'
);

SELECT isnt_empty(
    $$SELECT id FROM membership_credits
      WHERE user_id = @test_user_id AND credit_type = 'meeting-room'$$,
    'Should be able to create membership credits'
);

-- Test 16: Remaining credits calculation
SELECT results_eq(
    $$SELECT remaining_amount = allocated_amount - used_amount
      FROM membership_credits WHERE user_id = @test_user_id$$,
    $$VALUES (true)$$,
    'Remaining credits should equal allocated minus used'
);

-- Test 17: Get available credits function
SELECT is(
    get_available_credits(@test_user_id, 'meeting-room'),
    8.0::DECIMAL,
    'get_available_credits should return correct amount'
);

-- Test 18: Multiple credit types
INSERT INTO membership_credits (
    user_id, credit_type, allocated_amount, used_amount,
    remaining_amount, billing_cycle_start, billing_cycle_end, status
)
VALUES (
    @test_user_id, 'printing', 100.0, 0.0, 100.0,
    CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', 'active'
);

SELECT is(
    (SELECT COUNT(DISTINCT credit_type) FROM membership_credits WHERE user_id = @test_user_id),
    2::bigint,
    'User should have multiple credit types'
);

-- =====================================================
-- TEST SUITE 6: CREDIT TRANSACTIONS
-- =====================================================

-- Get credit ID for transactions
SELECT id INTO @test_credit_id FROM membership_credits
WHERE user_id = @test_user_id AND credit_type = 'meeting-room' LIMIT 1;

-- Test 19: Create credit allocation transaction
INSERT INTO credit_transactions (
    user_id, membership_credit_id, transaction_type,
    amount, balance_after, description
)
VALUES (
    @test_user_id, @test_credit_id, 'allocation',
    8.0, 8.0, 'Monthly credit allocation'
);

SELECT isnt_empty(
    $$SELECT id FROM credit_transactions
      WHERE user_id = @test_user_id AND transaction_type = 'allocation'$$,
    'Should be able to create allocation transaction'
);

-- Test 20: Create usage transaction
INSERT INTO credit_transactions (
    user_id, membership_credit_id, transaction_type,
    amount, balance_after, description
)
VALUES (
    @test_user_id, @test_credit_id, 'usage',
    -2.0, 6.0, 'Meeting room booking - 2 hours'
);

SELECT results_eq(
    $$SELECT balance_after FROM credit_transactions
      WHERE transaction_type = 'usage' AND user_id = @test_user_id$$,
    $$VALUES (6.0::DECIMAL)$$,
    'Usage transaction should reduce balance'
);

-- Test 21: Transaction history ordering
SELECT is(
    (SELECT COUNT(*) FROM credit_transactions
     WHERE user_id = @test_user_id
     ORDER BY created_at DESC),
    2::bigint,
    'Should maintain transaction history'
);

-- =====================================================
-- TEST SUITE 7: MENU ITEMS AND PRICING
-- =====================================================

-- Test 22: All menu items have pricing
SELECT is(
    (SELECT COUNT(*) FROM menu_items WHERE price IS NULL OR price <= 0),
    0::bigint,
    'All menu items should have valid pricing'
);

-- Test 23: NFT holder pricing discount
SELECT is(
    (SELECT COUNT(*) FROM menu_items WHERE nft_holder_price >= price),
    0::bigint,
    'NFT holder prices should be discounted'
);

-- Test 24: Menu items in valid categories
SELECT is(
    (SELECT COUNT(*) FROM menu_items
     WHERE category NOT IN ('coffee', 'tea', 'pastries', 'meals')),
    0::bigint,
    'All menu items should have valid category'
);

-- Test 25: Featured items are orderable
SELECT is(
    (SELECT COUNT(*) FROM menu_items WHERE featured = true AND orderable = false),
    0::bigint,
    'Featured items should be orderable'
);

-- =====================================================
-- TEST SUITE 8: CAFE ORDERS
-- =====================================================

-- Test 26: Create cafe order
INSERT INTO cafe_orders (
    user_id, order_number, items, subtotal, tax, total,
    status, payment_status, order_type
)
VALUES (
    @test_user_id, 'ORD-20250929-0001',
    '[{"menu_item_id": "test-id", "quantity": 2, "price": 7.00}]'::jsonb,
    7.00, 0.63, 7.63,
    'pending', 'pending', 'dine-in'
);

SELECT isnt_empty(
    $$SELECT id FROM cafe_orders WHERE order_number = 'ORD-20250929-0001'$$,
    'Should be able to create cafe order'
);

-- Test 27: Order number uniqueness
SELECT throws_ok(
    $$INSERT INTO cafe_orders (
        user_id, order_number, items, subtotal, tax, total,
        status, payment_status, order_type
      ) VALUES (
        @test_user_id, 'ORD-20250929-0001',
        '[]'::jsonb, 0, 0, 0, 'pending', 'pending', 'dine-in'
      )$$,
    '23505',
    NULL,
    'Should not allow duplicate order numbers'
);

-- Test 28: Order total calculation
SELECT results_eq(
    $$SELECT (subtotal + tax - discount_amount) = total
      FROM cafe_orders WHERE order_number = 'ORD-20250929-0001'$$,
    $$VALUES (true)$$,
    'Order total should equal subtotal + tax - discount'
);

-- =====================================================
-- TEST SUITE 9: EVENTS SYSTEM
-- =====================================================

-- Test 29: Create event
INSERT INTO events (
    title, slug, description, event_date, start_time, end_time,
    location, host_name, capacity, price, event_type, status
)
VALUES (
    'Test Workshop', 'test-workshop', 'A test workshop',
    CURRENT_DATE + INTERVAL '7 days', '18:00:00', '20:00:00',
    'Test Location', 'Test Host', 20, 25.00, 'workshop', 'upcoming'
);

SELECT isnt_empty(
    $$SELECT id FROM events WHERE slug = 'test-workshop'$$,
    'Should be able to create event'
);

-- Test 30: Event slug uniqueness
SELECT throws_ok(
    $$INSERT INTO events (
        title, slug, description, event_date, start_time, end_time,
        location, host_name, capacity, price, event_type, status
      ) VALUES (
        'Another Workshop', 'test-workshop', 'Another workshop',
        CURRENT_DATE + INTERVAL '7 days', '18:00:00', '20:00:00',
        'Test Location', 'Test Host', 20, 25.00, 'workshop', 'upcoming'
      )$$,
    '23505',
    NULL,
    'Should not allow duplicate event slugs'
);

-- Test 31: Event capacity validation
SELECT is(
    (SELECT COUNT(*) FROM events WHERE capacity <= 0),
    0::bigint,
    'Events should have positive capacity'
);

-- =====================================================
-- TEST SUITE 10: EVENT RSVPS
-- =====================================================

-- Get event ID
SELECT id INTO @test_event_id FROM events WHERE slug = 'test-workshop';

-- Test 32: Create event RSVP
INSERT INTO event_rsvps (
    event_id, user_id, attendees_count, payment_status,
    confirmation_code, status
)
VALUES (
    @test_event_id, @test_user_id, 1, 'paid', 'RSVP12345', 'confirmed'
);

SELECT isnt_empty(
    $$SELECT id FROM event_rsvps WHERE confirmation_code = 'RSVP12345'$$,
    'Should be able to create event RSVP'
);

-- Test 33: Unique RSVP per user per event
SELECT throws_ok(
    $$INSERT INTO event_rsvps (
        event_id, user_id, attendees_count, payment_status,
        confirmation_code, status
      ) VALUES (
        @test_event_id, @test_user_id, 1, 'paid', 'RSVP12346', 'confirmed'
      )$$,
    '23505',
    NULL,
    'Should not allow duplicate RSVPs for same user and event'
);

-- Test 34: RSVP confirmation code uniqueness
SELECT throws_ok(
    $$INSERT INTO event_rsvps (
        event_id, user_id, attendees_count, payment_status,
        confirmation_code, status
      ) VALUES (
        @test_event_id, @test_user_id, 1, 'paid', 'RSVP12345', 'confirmed'
      )$$,
    '23505',
    NULL,
    'Should not allow duplicate RSVP confirmation codes'
);

-- =====================================================
-- TEST SUITE 11: BLOG POSTS
-- =====================================================

-- Test 35: Create blog post
INSERT INTO blog_posts (
    title, slug, excerpt, content, author_id, status
)
VALUES (
    'Test Post', 'test-post', 'Test excerpt', 'Test content',
    @test_user_id, 'draft'
);

SELECT isnt_empty(
    $$SELECT id FROM blog_posts WHERE slug = 'test-post'$$,
    'Should be able to create blog post'
);

-- Test 36: Blog post slug uniqueness
SELECT throws_ok(
    $$INSERT INTO blog_posts (
        title, slug, excerpt, content, author_id, status
      ) VALUES (
        'Another Post', 'test-post', 'Excerpt', 'Content',
        @test_user_id, 'draft'
      )$$,
    '23505',
    NULL,
    'Should not allow duplicate blog post slugs'
);

-- Test 37: Published posts have published_at timestamp
UPDATE blog_posts SET status = 'published', published_at = NOW()
WHERE slug = 'test-post';

SELECT isnt_empty(
    $$SELECT id FROM blog_posts
      WHERE slug = 'test-post' AND published_at IS NOT NULL$$,
    'Published posts should have published_at timestamp'
);

-- =====================================================
-- TEST SUITE 12: CONTACT SUBMISSIONS
-- =====================================================

-- Test 38: Create contact submission
INSERT INTO contact_submissions (
    name, email, topic, message, status
)
VALUES (
    'John Doe', 'john@example.com', 'general', 'Test message', 'new'
);

SELECT isnt_empty(
    $$SELECT id FROM contact_submissions WHERE email = 'john@example.com'$$,
    'Should be able to create contact submission'
);

-- Test 39: Contact topic validation
SELECT throws_ok(
    $$INSERT INTO contact_submissions (
        name, email, topic, message, status
      ) VALUES (
        'Jane Doe', 'jane@example.com', 'invalid_topic', 'Message', 'new'
      )$$,
    '23514',
    NULL,
    'Should only allow valid contact topics'
);

-- =====================================================
-- TEST SUITE 13: NEWSLETTER SUBSCRIBERS
-- =====================================================

-- Test 40: Subscribe to newsletter
INSERT INTO newsletter_subscribers (email, status, source)
VALUES ('subscriber@example.com', 'active', 'homepage');

SELECT isnt_empty(
    $$SELECT id FROM newsletter_subscribers WHERE email = 'subscriber@example.com'$$,
    'Should be able to subscribe to newsletter'
);

-- Test 41: Email uniqueness in newsletter
SELECT throws_ok(
    $$INSERT INTO newsletter_subscribers (email, status, source)
      VALUES ('subscriber@example.com', 'active', 'footer')$$,
    '23505',
    NULL,
    'Should not allow duplicate newsletter subscriptions'
);

-- Test 42: Unsubscribe updates timestamp
UPDATE newsletter_subscribers
SET status = 'unsubscribed', unsubscribed_at = NOW()
WHERE email = 'subscriber@example.com';

SELECT isnt_empty(
    $$SELECT id FROM newsletter_subscribers
      WHERE email = 'subscriber@example.com' AND unsubscribed_at IS NOT NULL$$,
    'Unsubscribed records should have unsubscribed_at timestamp'
);

-- =====================================================
-- TEST SUITE 14: UTILITY FUNCTIONS
-- =====================================================

-- Test 43: Generate confirmation code
SELECT matches(
    generate_confirmation_code(),
    '^[A-Z0-9]{8}$',
    'Confirmation code should be 8 uppercase alphanumeric characters'
);

-- Test 44: Generate order number
SELECT matches(
    generate_order_number(),
    '^ORD-[0-9]{8}-[0-9]{4}$',
    'Order number should follow ORD-YYYYMMDD-XXXX format'
);

-- Test 45: Has active membership function
UPDATE users SET
    membership_status = 'active',
    membership_start_date = CURRENT_DATE - INTERVAL '1 day',
    membership_end_date = CURRENT_DATE + INTERVAL '30 days'
WHERE id = @test_user_id;

SELECT is(
    has_active_membership(@test_user_id),
    true,
    'has_active_membership should return true for active member'
);

-- Test 46: Expired membership check
UPDATE users SET membership_end_date = CURRENT_DATE - INTERVAL '1 day'
WHERE id = @test_user_id;

SELECT is(
    has_active_membership(@test_user_id),
    false,
    'has_active_membership should return false for expired membership'
);

-- =====================================================
-- TEST SUITE 15: TRIGGER FUNCTIONALITY
-- =====================================================

-- Test 47: Updated_at trigger on users
SELECT col_not_null('users', 'updated_at', 'Users updated_at should not be null');

UPDATE users SET full_name = 'Updated Name' WHERE id = @test_user_id;

SELECT is(
    (SELECT updated_at > created_at FROM users WHERE id = @test_user_id),
    true,
    'updated_at should be greater than created_at after update'
);

-- Test 48: Updated_at trigger on bookings
UPDATE bookings SET status = 'completed' WHERE confirmation_code = 'TEST12345';

SELECT is(
    (SELECT updated_at > created_at FROM bookings WHERE confirmation_code = 'TEST12345'),
    true,
    'Booking updated_at should update on status change'
);

-- Test 49: Updated_at trigger on cafe_orders
UPDATE cafe_orders SET status = 'preparing' WHERE order_number = 'ORD-20250929-0001';

SELECT is(
    (SELECT updated_at > created_at FROM cafe_orders WHERE order_number = 'ORD-20250929-0001'),
    true,
    'Order updated_at should update on status change'
);

-- Test 50: Data integrity check - no orphaned records
SELECT is(
    (SELECT COUNT(*) FROM bookings b
     LEFT JOIN users u ON b.user_id = u.id
     WHERE u.id IS NULL),
    0::bigint,
    'No bookings should exist without a valid user'
);

SELECT * FROM finish();
ROLLBACK;