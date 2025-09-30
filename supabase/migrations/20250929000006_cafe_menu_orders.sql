-- CitizenSpace Database Schema
-- Migration: Cafe Menu & Orders System
-- Created: 2025-09-29
-- Description: Creates menu_items, orders, and order_items tables for the cafe ordering system

-- =====================================================
-- 1. MENU ITEMS TABLE
-- =====================================================
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category TEXT NOT NULL CHECK (category IN ('coffee', 'tea', 'pastries', 'meals')),
    dietary_tags TEXT[] DEFAULT '{}',
    image TEXT,
    orderable BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Menu items indexes for performance
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_orderable ON menu_items(orderable);
CREATE INDEX idx_menu_items_featured ON menu_items(featured);
CREATE INDEX idx_menu_items_created_at ON menu_items(created_at DESC);

-- =====================================================
-- 2. ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    discount_amount DECIMAL(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
    nft_discount_applied BOOLEAN DEFAULT false,
    processing_fee DECIMAL(10, 2) DEFAULT 0 CHECK (processing_fee >= 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    status TEXT NOT NULL CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_intent_id TEXT,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Orders indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_payment_intent_id ON orders(payment_intent_id) WHERE payment_intent_id IS NOT NULL;
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);

-- =====================================================
-- 3. ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Order items indexes for performance
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);

-- =====================================================
-- 4. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for menu_items
CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for orders
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. SAMPLE DATA (Optional)
-- =====================================================

-- Insert sample menu items
INSERT INTO menu_items (id, title, description, price, category, dietary_tags, orderable, featured) VALUES
    ('a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d', 'House Blend', 'Our signature medium roast with chocolate and caramel notes', 3.50, 'coffee', '{}', true, false),
    ('b2c3d4e5-f6a7-4b5c-8d7e-9f0a1b2c3d4e', 'Single-Origin Pour Over', 'Rotating selection of premium beans, ask your barista', 4.50, 'coffee', '{}', true, true),
    ('c3d4e5f6-a7b8-4c5d-8e7f-9a0b1c2d3e4f', 'Cappuccino', 'Classic espresso with steamed milk and foam', 4.00, 'coffee', '{}', true, false),
    ('d4e5f6a7-b8c9-4d5e-8f7a-9b0c1d2e3f4a', 'Latte', 'Smooth espresso with steamed milk', 4.25, 'coffee', '{}', true, false),
    ('e5f6a7b8-c9d0-4e5f-8a7b-9c0d1e2f3a4b', 'Espresso', 'Bold and rich double shot', 3.00, 'coffee', '{}', true, false),
    ('f6a7b8c9-d0e1-4f5a-8b7c-9d0e1f2a3b4c', 'Green Tea', 'Organic Japanese sencha', 3.00, 'tea', '{}', true, false),
    ('a7b8c9d0-e1f2-4a5b-8c7d-9e0f1a2b3c4d', 'Chai Latte', 'Spiced black tea with steamed milk', 4.50, 'tea', '{}', true, false),
    ('b8c9d0e1-f2a3-4b5c-8d7e-9f0a1b2c3d4e', 'Almond Croissant', 'Buttery pastry with almond cream from Arsicault Bakery', 3.75, 'pastries', ARRAY['vegetarian'], true, true),
    ('c9d0e1f2-a3b4-4c5d-8e7f-9a0b1c2d3e4f', 'Chocolate Croissant', 'Flaky pastry filled with dark chocolate', 3.50, 'pastries', ARRAY['vegetarian'], true, false),
    ('d0e1f2a3-b4c5-4d5e-8f7a-9b0c1d2e3f4a', 'Blueberry Muffin', 'Fresh baked with organic blueberries', 3.25, 'pastries', ARRAY['vegetarian'], true, false),
    ('e1f2a3b4-c5d6-4e5f-8a7b-9c0d1e2f3a4b', 'Avocado Toast', 'Sourdough with smashed avocado, radish, everything seasoning', 12.00, 'meals', ARRAY['vegetarian', 'vegan option'], true, false),
    ('f2a3b4c5-d6e7-4f5a-8b7c-9d0e1f2a3b4c', 'Turkey Club Sandwich', 'Roasted turkey, bacon, lettuce, tomato on sourdough', 14.00, 'meals', '{}', true, false),
    ('a3b4c5d6-e7f8-4a5b-8c7d-9e0f1a2b3c4d', 'Caprese Salad', 'Fresh mozzarella, tomatoes, basil, balsamic glaze', 11.00, 'meals', ARRAY['vegetarian', 'gluten-free'], true, false);

-- Add comments for documentation
COMMENT ON TABLE menu_items IS 'Cafe menu items including coffee, tea, pastries, and meals';
COMMENT ON TABLE orders IS 'Customer orders with pricing, discounts, and status tracking';
COMMENT ON TABLE order_items IS 'Individual items within an order with quantity and pricing';

COMMENT ON COLUMN menu_items.dietary_tags IS 'Array of dietary information tags (vegetarian, vegan, gluten-free, etc.)';
COMMENT ON COLUMN orders.nft_discount_applied IS 'Indicates if NFT holder 10% discount was applied';
COMMENT ON COLUMN orders.status IS 'Order fulfillment status: pending, preparing, ready, completed, cancelled';
COMMENT ON COLUMN orders.payment_status IS 'Payment processing status: pending, paid, refunded';