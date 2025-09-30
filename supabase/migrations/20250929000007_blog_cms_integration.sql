-- CitizenSpace Database Schema
-- Migration: Blog/CMS Integration Enhancement
-- Created: 2025-09-29
-- Description: Enhances blog_posts table with required fields and adds full-text search

-- =====================================================
-- UPDATE BLOG_POSTS TABLE STRUCTURE
-- =====================================================

-- First, drop existing constraints if they exist
ALTER TABLE blog_posts DROP CONSTRAINT IF EXISTS blog_posts_status_check;

-- Add/modify columns to match new schema
ALTER TABLE blog_posts
  -- Drop author_id if it exists (we'll use author_name instead for simplicity)
  DROP COLUMN IF EXISTS author_id CASCADE,
  DROP COLUMN IF EXISTS featured_image_url CASCADE,
  DROP COLUMN IF EXISTS reading_time_minutes CASCADE,
  DROP COLUMN IF EXISTS status CASCADE,
  DROP COLUMN IF EXISTS views_count CASCADE;

-- Add new columns
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS image TEXT,
  ADD COLUMN IF NOT EXISTS author_name TEXT NOT NULL DEFAULT 'Citizen Space',
  ADD COLUMN IF NOT EXISTS author_avatar TEXT,
  ADD COLUMN IF NOT EXISTS author_bio TEXT,
  ADD COLUMN IF NOT EXISTS reading_time INTEGER NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true NOT NULL;

-- Update published_at column to be NOT NULL with default for published posts
ALTER TABLE blog_posts
  ALTER COLUMN published_at TYPE TIMESTAMPTZ,
  ALTER COLUMN published_at SET NOT NULL,
  ALTER COLUMN published_at SET DEFAULT NOW();

-- Recreate excerpt column as NOT NULL
ALTER TABLE blog_posts
  ALTER COLUMN excerpt TYPE TEXT,
  ALTER COLUMN excerpt SET NOT NULL;

-- =====================================================
-- FULL-TEXT SEARCH INDEX
-- =====================================================

-- Create full-text search index on title, excerpt, and content
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts
USING GIN(to_tsvector('english', title || ' ' || excerpt || ' ' || content));

-- Drop old indexes if they exist and recreate with new structure
DROP INDEX IF EXISTS idx_blog_posts_published_at;
DROP INDEX IF EXISTS idx_blog_posts_author_id;

-- Create optimized indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at_desc ON blog_posts(published_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published) WHERE published = true;

-- Ensure tags index exists (already in initial schema but verify)
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- =====================================================
-- BLOG CATEGORIES TABLE ENHANCEMENTS
-- =====================================================

-- Ensure blog_categories table exists with correct structure
-- (Should already exist from previous migration, but verify)
CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    post_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_post_count ON blog_categories(post_count DESC);

-- =====================================================
-- HELPER FUNCTIONS FOR BLOG
-- =====================================================

-- Function to search blog posts using full-text search
CREATE OR REPLACE FUNCTION search_blog_posts(search_query TEXT)
RETURNS TABLE (
    id UUID,
    title TEXT,
    slug TEXT,
    excerpt TEXT,
    content TEXT,
    image TEXT,
    author_name TEXT,
    author_avatar TEXT,
    author_bio TEXT,
    tags JSONB,
    published_at TIMESTAMPTZ,
    reading_time INTEGER,
    published BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.content,
        bp.image,
        bp.author_name,
        bp.author_avatar,
        bp.author_bio,
        bp.tags,
        bp.published_at,
        bp.reading_time,
        bp.published,
        bp.created_at,
        bp.updated_at,
        ts_rank(
            to_tsvector('english', bp.title || ' ' || bp.excerpt || ' ' || bp.content),
            plainto_tsquery('english', search_query)
        ) AS rank
    FROM blog_posts bp
    WHERE
        bp.published = true
        AND to_tsvector('english', bp.title || ' ' || bp.excerpt || ' ' || bp.content) @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, bp.published_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to update category post counts based on tags
CREATE OR REPLACE FUNCTION update_blog_category_counts()
RETURNS void AS $$
DECLARE
    category_record RECORD;
    tag_count INTEGER;
BEGIN
    -- Loop through all categories
    FOR category_record IN SELECT id, name FROM blog_categories LOOP
        -- Count posts that have this category as a tag
        SELECT COUNT(*) INTO tag_count
        FROM blog_posts
        WHERE published = true
        AND tags @> to_jsonb(ARRAY[category_record.name]);

        -- Update the post_count
        UPDATE blog_categories
        SET post_count = tag_count
        WHERE id = category_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER TO AUTO-UPDATE CATEGORY COUNTS
-- =====================================================

-- Trigger function to update category counts when posts are inserted/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_category_counts()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM update_blog_category_counts();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_blog_posts_category_count ON blog_posts;
CREATE TRIGGER trg_blog_posts_category_count
    AFTER INSERT OR UPDATE OR DELETE ON blog_posts
    FOR EACH STATEMENT
    EXECUTE FUNCTION trigger_update_category_counts();

-- =====================================================
-- SEED DATA FOR BLOG CATEGORIES
-- =====================================================

-- Insert categories if they don't exist
INSERT INTO blog_categories (name, slug, post_count)
VALUES
    ('Coworking', 'coworking', 0),
    ('Community', 'community', 0),
    ('Business', 'business', 0),
    ('Coffee', 'coffee', 0),
    ('Productivity', 'productivity', 0),
    ('Culture', 'culture', 0),
    ('Remote Work', 'remote-work', 0),
    ('Team Building', 'team-building', 0),
    ('Hybrid', 'hybrid', 0),
    ('San Francisco', 'san-francisco', 0),
    ('Entrepreneurship', 'entrepreneurship', 0),
    ('Startups', 'startups', 0)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION search_blog_posts(TEXT) IS 'Full-text search function for blog posts with relevance ranking';
COMMENT ON FUNCTION update_blog_category_counts() IS 'Updates post_count for all categories based on blog post tags';
COMMENT ON INDEX idx_blog_posts_search IS 'Full-text search index for title, excerpt, and content';

-- =====================================================
-- CONFIRMATION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Blog/CMS Integration Migration Complete';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Blog posts table enhanced with:';
    RAISE NOTICE '  - Author details (name, avatar, bio)';
    RAISE NOTICE '  - Reading time tracking';
    RAISE NOTICE '  - Published flag for filtering';
    RAISE NOTICE '  - Full-text search support';
    RAISE NOTICE 'Blog categories seeded with 12 categories';
    RAISE NOTICE '==========================================';
END $$;