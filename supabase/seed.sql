-- CitizenSpace Database - Seed Data
-- Created: 2025-09-29
-- Description: Seeds initial data for membership plans, workspaces, and menu items

-- =====================================================
-- 1. MEMBERSHIP PLANS
-- =====================================================

INSERT INTO membership_plans (
    name, slug, price, nft_holder_price, billing_period,
    features, limitations,
    meeting_room_credits_hours, printing_credits,
    cafe_discount_percentage, guest_passes_per_month,
    access_hours, includes_hot_desk,
    active, sort_order
) VALUES
-- Hourly Plan
(
    'Hourly',
    'hourly',
    2.50,
    1.25,
    'hourly',
    '["Pay as you go", "Access to coworking zone", "High-speed WiFi", "Power at every seat", "50% off for NFT holders ($1.25/hr)"]'::jsonb,
    '["No minimum commitment", "Hourly billing via app"]'::jsonb,
    0, -- no meeting room credits
    0, -- no printing credits
    0, -- no cafe discount
    0, -- no guest passes
    '7:00 AM - 10:00 PM',
    false, -- does not include hot desk
    true,
    1
),
-- Day Pass
(
    'Day Pass',
    'day-pass',
    25.00,
    12.50,
    'daily',
    '["Full day access", "All coworking amenities", "10% off cafe purchases", "Meeting room credits (2 hours)", "50% off for NFT holders ($12.50/day)"]'::jsonb,
    '["Valid for one calendar day", "Non-transferable"]'::jsonb,
    2, -- 2 hours meeting room credits
    0,
    10, -- 10% cafe discount
    0,
    '7:00 AM - 10:00 PM',
    true, -- includes hot desk access
    true,
    2
),
-- Cafe Membership
(
    'Cafe Membership',
    'cafe-membership',
    150.00,
    75.00,
    'monthly',
    '["Any available desk", "9am-5pm access Monday-Friday", "10% off cafe purchases", "Meeting room credits (2 hours/month)", "Free printing (50 pages/month)", "50% off for NFT holders ($75/mo)"]'::jsonb,
    '["Monthly billing", "30-day notice to cancel", "Business hours only"]'::jsonb,
    2, -- 2 hours meeting room credits per month
    50, -- 50 pages printing
    10, -- 10% cafe discount
    0,
    '9:00 AM - 5:00 PM Mon-Fri',
    true, -- includes hot desk during business hours
    true,
    3
),
-- Resident Desk (Most Popular)
(
    'Resident Desk',
    'resident',
    425.00,
    225.00,
    'monthly',
    '["Dedicated desk space", "24/7 access", "Locker included", "Free printing (100 pages)", "20% off cafe purchases", "Meeting room credits (8 hours)", "Guest day passes (2 per month)", "50% off for NFT holders ($225/mo)"]'::jsonb,
    '["Monthly billing", "30-day notice to cancel"]'::jsonb,
    8, -- 8 hours meeting room credits per month
    100, -- 100 pages printing
    20, -- 20% cafe discount
    2, -- 2 guest passes per month
    '24/7',
    true, -- includes dedicated hot desk
    true,
    4
);

-- =====================================================
-- 2. WORKSPACES
-- =====================================================

INSERT INTO workspaces (
    name, type, resource_category, description,
    capacity, base_price_hourly, requires_credits,
    min_duration, max_duration,
    amenities, images, available, floor_location
) VALUES
-- Hot Desks
(
    'Hot Desk - Main Floor',
    'hot-desk',
    'desk',
    'Any available desk in the coworking zone with power, WiFi, and ergonomic seating',
    1,
    2.50,
    false, -- can be paid hourly or included in membership
    1.0,
    12.0,
    '["High-speed WiFi", "Power outlets", "Ergonomic chair", "Natural lighting", "Shared workspace"]'::jsonb,
    '["/photos/workspace-hotdesk-1.jpg", "/photos/workspace-hotdesk-2.jpg"]'::jsonb,
    true,
    'Main Floor'
),
(
    'Hot Desk - Quiet Zone',
    'hot-desk',
    'desk',
    'Dedicated quiet area for focused work with noise-reduction',
    1,
    2.50,
    false,
    1.0,
    12.0,
    '["High-speed WiFi", "Power outlets", "Ergonomic chair", "Quiet zone", "Noise reduction"]'::jsonb,
    '["/photos/workspace-quiet-1.jpg"]'::jsonb,
    true,
    'Second Floor'
),

-- Focus Room (2-4 people)
(
    'Focus Room A',
    'focus-room',
    'meeting-room',
    'Private meeting room for 2-4 people with whiteboard and video conferencing',
    4,
    25.00,
    true, -- can use membership credits
    0.5,
    8.0,
    '["Whiteboard", "Video conferencing", "65-inch display", "HDMI connection", "Coffee maker", "Natural light"]'::jsonb,
    '["/photos/focus-room-1.jpg", "/photos/focus-room-2.jpg"]'::jsonb,
    true,
    'Main Floor'
),
(
    'Focus Room B',
    'focus-room',
    'meeting-room',
    'Intimate meeting space perfect for 1-on-1s or small team discussions',
    4,
    25.00,
    true,
    0.5,
    8.0,
    '["Whiteboard", "Video conferencing", "50-inch display", "HDMI connection", "Soundproof"]'::jsonb,
    '["/photos/focus-room-3.jpg"]'::jsonb,
    true,
    'Second Floor'
),

-- Collaborate Room (4-6 people)
(
    'Collaborate Room',
    'collaborate-room',
    'meeting-room',
    'Meeting room with AV equipment for 4-6 people, ideal for presentations and workshops',
    6,
    40.00,
    true,
    0.5,
    8.0,
    '["75-inch display", "Wireless presentation", "Video conferencing", "Whiteboard", "Conference phone", "Premium AV system", "Standing desk option"]'::jsonb,
    '["/photos/collab-room-1.jpg", "/photos/collab-room-2.jpg"]'::jsonb,
    true,
    'Main Floor'
),

-- Boardroom (6-8 people)
(
    'Boardroom',
    'boardroom',
    'meeting-room',
    'Executive meeting space for 6-8 people with premium furnishings and full AV suite',
    8,
    60.00,
    true,
    0.5,
    8.0,
    '["Executive furnishings", "85-inch display", "Premium AV system", "Video conferencing", "Whiteboard", "Conference phone", "Espresso machine", "City views", "Soundproof"]'::jsonb,
    '["/photos/boardroom-1.jpg", "/photos/boardroom-2.jpg", "/photos/boardroom-3.jpg"]'::jsonb,
    true,
    'Second Floor'
),

-- Communications Pods
(
    'Communications Pod 1',
    'communications-pod',
    'meeting-room',
    'Private phone booth for calls and video meetings with acoustic treatment',
    1,
    5.00,
    true,
    0.5,
    4.0,
    '["Soundproof", "Video conferencing setup", "Standing desk", "USB charging", "LED lighting", "Acoustic panels"]'::jsonb,
    '["/photos/pod-1.jpg"]'::jsonb,
    true,
    'Main Floor'
),
(
    'Communications Pod 2',
    'communications-pod',
    'meeting-room',
    'Private phone booth for calls and video meetings with acoustic treatment',
    1,
    5.00,
    true,
    0.5,
    4.0,
    '["Soundproof", "Video conferencing setup", "Standing desk", "USB charging", "LED lighting", "Acoustic panels"]'::jsonb,
    '["/photos/pod-2.jpg"]'::jsonb,
    true,
    'Second Floor'
);

-- =====================================================
-- 3. MENU ITEMS
-- =====================================================

-- Coffee Items
INSERT INTO menu_items (
    name, slug, description, price, nft_holder_price,
    category, dietary_tags, available, featured, orderable, sort_order
) VALUES
(
    'House Blend',
    'house-blend',
    'Our signature medium roast with chocolate and caramel notes',
    3.50,
    3.15, -- 10% off for NFT holders
    'coffee',
    '[]'::jsonb,
    true,
    false,
    true,
    1
),
(
    'Single-Origin Pour Over',
    'single-origin-pour-over',
    'Rotating selection of premium beans, ask your barista',
    4.50,
    4.05,
    'coffee',
    '[]'::jsonb,
    true,
    true,
    true,
    2
),
(
    'Espresso',
    'espresso',
    'Classic single-origin espresso shot',
    3.00,
    2.70,
    'coffee',
    '[]'::jsonb,
    true,
    false,
    true,
    3
),
(
    'Cappuccino',
    'cappuccino',
    'Espresso with steamed milk and foam',
    4.00,
    3.60,
    'coffee',
    '["vegetarian"]'::jsonb,
    true,
    false,
    true,
    4
),
(
    'Latte',
    'latte',
    'Espresso with steamed milk (dairy or plant-based options)',
    4.25,
    3.83,
    'coffee',
    '["vegetarian", "vegan option"]'::jsonb,
    true,
    false,
    true,
    5
),
(
    'Cold Brew',
    'cold-brew',
    'Smooth cold-brewed coffee, less acidic',
    4.00,
    3.60,
    'coffee',
    '[]'::jsonb,
    true,
    false,
    true,
    6
);

-- Tea Items
INSERT INTO menu_items (
    name, slug, description, price, nft_holder_price,
    category, dietary_tags, available, featured, orderable, sort_order
) VALUES
(
    'English Breakfast Tea',
    'english-breakfast-tea',
    'Classic black tea blend',
    3.00,
    2.70,
    'tea',
    '["vegan"]'::jsonb,
    true,
    false,
    true,
    10
),
(
    'Green Tea',
    'green-tea',
    'Japanese sencha green tea',
    3.00,
    2.70,
    'tea',
    '["vegan"]'::jsonb,
    true,
    false,
    true,
    11
),
(
    'Chai Latte',
    'chai-latte',
    'Spiced chai with steamed milk',
    4.00,
    3.60,
    'tea',
    '["vegetarian", "vegan option"]'::jsonb,
    true,
    false,
    true,
    12
);

-- Pastries
INSERT INTO menu_items (
    name, slug, description, price, nft_holder_price,
    category, dietary_tags, available, featured, orderable, sort_order
) VALUES
(
    'Almond Croissant',
    'almond-croissant',
    'Buttery pastry with almond cream from Arsicault Bakery',
    3.75,
    3.38,
    'pastries',
    '["vegetarian"]'::jsonb,
    true,
    true,
    true,
    20
),
(
    'Chocolate Croissant',
    'chocolate-croissant',
    'Classic pain au chocolat with dark chocolate',
    3.50,
    3.15,
    'pastries',
    '["vegetarian"]'::jsonb,
    true,
    false,
    true,
    21
),
(
    'Butter Croissant',
    'butter-croissant',
    'Traditional French butter croissant',
    3.00,
    2.70,
    'pastries',
    '["vegetarian"]'::jsonb,
    true,
    false,
    true,
    22
),
(
    'Blueberry Muffin',
    'blueberry-muffin',
    'House-made muffin with fresh blueberries',
    3.50,
    3.15,
    'pastries',
    '["vegetarian"]'::jsonb,
    true,
    false,
    true,
    23
),
(
    'Banana Bread',
    'banana-bread',
    'Moist banana bread with walnuts',
    3.25,
    2.93,
    'pastries',
    '["vegetarian"]'::jsonb,
    true,
    false,
    true,
    24
);

-- Meals
INSERT INTO menu_items (
    name, slug, description, price, nft_holder_price,
    category, dietary_tags, available, featured, orderable, sort_order
) VALUES
(
    'Avocado Toast',
    'avocado-toast',
    'Sourdough with smashed avocado, radish, everything seasoning',
    12.00,
    10.80,
    'meals',
    '["vegetarian", "vegan option"]'::jsonb,
    true,
    true,
    true,
    30
),
(
    'Breakfast Burrito',
    'breakfast-burrito',
    'Scrambled eggs, cheese, potatoes, salsa in flour tortilla',
    10.00,
    9.00,
    'meals',
    '["vegetarian"]'::jsonb,
    true,
    false,
    true,
    31
),
(
    'Greek Yogurt Bowl',
    'greek-yogurt-bowl',
    'Greek yogurt with granola, fresh berries, and honey',
    9.00,
    8.10,
    'meals',
    '["vegetarian", "gluten-free option"]'::jsonb,
    true,
    false,
    true,
    32
),
(
    'Turkey Club Sandwich',
    'turkey-club-sandwich',
    'Turkey, bacon, lettuce, tomato, mayo on sourdough',
    13.00,
    11.70,
    'meals',
    '[]'::jsonb,
    true,
    false,
    true,
    33
),
(
    'Quinoa Salad Bowl',
    'quinoa-salad-bowl',
    'Quinoa, roasted vegetables, chickpeas, tahini dressing',
    11.00,
    9.90,
    'meals',
    '["vegan", "gluten-free"]'::jsonb,
    true,
    false,
    true,
    34
),
(
    'Caprese Panini',
    'caprese-panini',
    'Fresh mozzarella, tomato, basil, balsamic on ciabatta',
    11.50,
    10.35,
    'meals',
    '["vegetarian"]'::jsonb,
    true,
    false,
    true,
    35
);

-- =====================================================
-- 4. SAMPLE EVENTS (Optional - for testing)
-- =====================================================

INSERT INTO events (
    title, slug, description,
    event_date, start_time, end_time,
    location, host_name, host_organization,
    capacity, price, tags, event_type, status
) VALUES
(
    'Digital Art Basics Workshop',
    'digital-art-basics-workshop',
    'Learn the fundamentals of digital art creation with local artist Maya Chen. Perfect for beginners!',
    CURRENT_DATE + INTERVAL '15 days',
    '19:00:00',
    '21:00:00',
    'Citizen Space Main Floor',
    'Maya Chen',
    'Santa Cruz Art Collective',
    20,
    25.00,
    '["workshop", "art", "creative", "beginner-friendly"]'::jsonb,
    'workshop',
    'upcoming'
),
(
    'Tech Startup Networking',
    'tech-startup-networking',
    'Monthly networking event for startup founders, developers, and entrepreneurs. Pizza and drinks provided!',
    CURRENT_DATE + INTERVAL '7 days',
    '18:00:00',
    '20:00:00',
    'Citizen Space Cafe',
    'Santa Cruz Tech Meetup',
    'Tech Community SC',
    50,
    0.00,
    '["networking", "startups", "tech", "free"]'::jsonb,
    'networking',
    'upcoming'
),
(
    'Introduction to Web3',
    'introduction-to-web3',
    'Learn about blockchain, cryptocurrencies, and decentralized applications from industry experts.',
    CURRENT_DATE + INTERVAL '21 days',
    '18:30:00',
    '20:30:00',
    'Citizen Space Boardroom',
    'Alex Rodriguez',
    'Web3 Santa Cruz',
    15,
    15.00,
    '["tech-talk", "web3", "blockchain", "education"]'::jsonb,
    'tech-talk',
    'upcoming'
);

-- =====================================================
-- CONFIRMATION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '======================================';
    RAISE NOTICE 'CitizenSpace Database Seeded Successfully';
    RAISE NOTICE '======================================';
    RAISE NOTICE 'Membership Plans: 4 plans created';
    RAISE NOTICE 'Workspaces: 8 spaces created';
    RAISE NOTICE 'Menu Items: 21 items created';
    RAISE NOTICE 'Events: 3 sample events created';
    RAISE NOTICE '======================================';
END $$;