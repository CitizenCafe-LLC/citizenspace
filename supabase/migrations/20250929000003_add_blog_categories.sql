-- CitizenSpace Database Schema
-- Migration: Add Blog Categories Table
-- Created: 2025-09-29
-- Description: Creates blog_categories table and adds relationship to blog_posts

-- =====================================================
-- BLOG CATEGORIES TABLE
-- =====================================================
CREATE TABLE blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    post_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Blog categories indexes
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX idx_blog_categories_post_count ON blog_categories(post_count DESC);

-- Add category relationship to blog_posts (optional - uses JSONB tags instead)
-- Uncomment if you want a many-to-many relationship
-- CREATE TABLE blog_post_categories (
--     blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
--     blog_category_id UUID NOT NULL REFERENCES blog_categories(id) ON DELETE CASCADE,
--     PRIMARY KEY (blog_post_id, blog_category_id)
-- );
-- CREATE INDEX idx_blog_post_categories_post ON blog_post_categories(blog_post_id);
-- CREATE INDEX idx_blog_post_categories_category ON blog_post_categories(blog_category_id);

-- Function to update post_count when blog posts are tagged with categories
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
    -- This is a placeholder for when categories are implemented via tags JSONB
    -- You can update this to match your implementation strategy
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE blog_categories IS 'Blog post categories for content organization';

-- Seed initial blog categories
INSERT INTO blog_categories (name, slug, description, post_count) VALUES
('Community', 'community', 'Stories and updates from our CitizenSpace community', 0),
('Workspace Tips', 'workspace-tips', 'Productivity tips and workspace best practices', 0),
('Events', 'events', 'Recaps and announcements of community events', 0),
('Technology', 'technology', 'Tech trends, tutorials, and industry insights', 0),
('Entrepreneurship', 'entrepreneurship', 'Startup advice and business growth strategies', 0),
('Local Scene', 'local-scene', 'Santa Cruz local business and culture', 0);

-- Confirmation message
DO $$
BEGIN
    RAISE NOTICE '======================================';
    RAISE NOTICE 'Blog Categories Table Created';
    RAISE NOTICE '======================================';
    RAISE NOTICE '6 initial categories seeded';
    RAISE NOTICE '======================================';
END $$;