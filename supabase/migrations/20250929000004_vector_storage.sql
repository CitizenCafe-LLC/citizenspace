-- CitizenSpace Database Schema
-- Migration: Vector Storage for Semantic Search (ZeroDB/pgvector)
-- Created: 2025-09-29
-- Description: Sets up pgvector extension for semantic search on blog posts and documents

-- =====================================================
-- ENABLE PGVECTOR EXTENSION
-- =====================================================
-- Note: pgvector provides vector similarity search capabilities
-- Compatible with OpenAI embeddings (1536 dimensions) and other models
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- BLOG POST EMBEDDINGS TABLE
-- =====================================================
-- Stores vector embeddings of blog post content for semantic search
CREATE TABLE blog_post_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
    embedding vector(1536), -- OpenAI ada-002 embedding dimension
    content_hash TEXT NOT NULL, -- MD5 hash to detect content changes
    model_version TEXT DEFAULT 'text-embedding-ada-002' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(blog_post_id)
);

-- Indexes for vector similarity search
CREATE INDEX idx_blog_post_embeddings_blog_post_id ON blog_post_embeddings(blog_post_id);
CREATE INDEX idx_blog_post_embeddings_embedding ON blog_post_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- =====================================================
-- DOCUMENT EMBEDDINGS TABLE (OPTIONAL)
-- =====================================================
-- For future use: general document/knowledge base embeddings
CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type TEXT NOT NULL, -- 'faq', 'help-doc', 'policy', etc.
    document_id TEXT NOT NULL, -- External reference ID
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    content_hash TEXT NOT NULL,
    model_version TEXT DEFAULT 'text-embedding-ada-002' NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(document_type, document_id)
);

-- Indexes for document embeddings
CREATE INDEX idx_document_embeddings_document_type ON document_embeddings(document_type);
CREATE INDEX idx_document_embeddings_embedding ON document_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- =====================================================
-- SEARCH ANALYTICS TABLE
-- =====================================================
-- Track search queries for analytics and improvement
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    search_type TEXT NOT NULL CHECK (search_type IN ('semantic', 'keyword', 'hybrid')),
    results_count INTEGER NOT NULL,
    clicked_result_id UUID, -- Which result was clicked
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Search analytics indexes
CREATE INDEX idx_search_analytics_user_id ON search_analytics(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_search_analytics_search_type ON search_analytics(search_type);
CREATE INDEX idx_search_analytics_created_at ON search_analytics(created_at DESC);

-- =====================================================
-- VECTOR SEARCH FUNCTIONS
-- =====================================================

-- Function: Semantic search for blog posts
CREATE OR REPLACE FUNCTION search_blog_posts_semantic(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    blog_post_id UUID,
    title TEXT,
    excerpt TEXT,
    similarity float,
    published_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        bp.id,
        bp.title,
        bp.excerpt,
        1 - (bpe.embedding <=> query_embedding) as similarity,
        bp.published_at
    FROM blog_post_embeddings bpe
    JOIN blog_posts bp ON bp.id = bpe.blog_post_id
    WHERE
        bp.status = 'published'
        AND 1 - (bpe.embedding <=> query_embedding) > match_threshold
    ORDER BY bpe.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function: Hybrid search (semantic + keyword)
CREATE OR REPLACE FUNCTION search_blog_posts_hybrid(
    query_text TEXT,
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    blog_post_id UUID,
    title TEXT,
    excerpt TEXT,
    similarity float,
    keyword_rank float,
    combined_score float,
    published_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH semantic_search AS (
        SELECT
            bp.id,
            bp.title,
            bp.excerpt,
            bp.published_at,
            1 - (bpe.embedding <=> query_embedding) as similarity
        FROM blog_post_embeddings bpe
        JOIN blog_posts bp ON bp.id = bpe.blog_post_id
        WHERE bp.status = 'published'
    ),
    keyword_search AS (
        SELECT
            id,
            ts_rank(
                to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content),
                plainto_tsquery('english', query_text)
            ) as keyword_rank
        FROM blog_posts
        WHERE status = 'published'
    )
    SELECT
        ss.id,
        ss.title,
        ss.excerpt,
        ss.similarity,
        COALESCE(ks.keyword_rank, 0) as keyword_rank,
        (ss.similarity * 0.6 + COALESCE(ks.keyword_rank, 0) * 0.4) as combined_score,
        ss.published_at
    FROM semantic_search ss
    LEFT JOIN keyword_search ks ON ss.id = ks.id
    WHERE ss.similarity > match_threshold OR ks.keyword_rank > 0.1
    ORDER BY combined_score DESC
    LIMIT match_count;
END;
$$;

-- Function: Update blog post embedding
CREATE OR REPLACE FUNCTION update_blog_post_embedding(
    p_blog_post_id UUID,
    p_embedding vector(1536),
    p_content_hash TEXT,
    p_model_version TEXT DEFAULT 'text-embedding-ada-002'
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO blog_post_embeddings (
        blog_post_id,
        embedding,
        content_hash,
        model_version
    ) VALUES (
        p_blog_post_id,
        p_embedding,
        p_content_hash,
        p_model_version
    )
    ON CONFLICT (blog_post_id) DO UPDATE SET
        embedding = EXCLUDED.embedding,
        content_hash = EXCLUDED.content_hash,
        model_version = EXCLUDED.model_version,
        updated_at = NOW();
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update embedding updated_at timestamp
CREATE TRIGGER update_blog_post_embeddings_updated_at
BEFORE UPDATE ON blog_post_embeddings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_embeddings_updated_at
BEFORE UPDATE ON document_embeddings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE blog_post_embeddings IS 'Vector embeddings for semantic search on blog posts';
COMMENT ON TABLE document_embeddings IS 'Vector embeddings for general documents and knowledge base';
COMMENT ON TABLE search_analytics IS 'Analytics tracking for search queries and user behavior';

COMMENT ON FUNCTION search_blog_posts_semantic IS 'Performs semantic similarity search on blog posts using vector embeddings';
COMMENT ON FUNCTION search_blog_posts_hybrid IS 'Combines semantic and keyword search for better results';
COMMENT ON FUNCTION update_blog_post_embedding IS 'Upserts blog post embedding (handles both insert and update)';

-- =====================================================
-- FULL-TEXT SEARCH INDEXES (FALLBACK)
-- =====================================================
-- Add full-text search indexes for keyword search fallback
CREATE INDEX idx_blog_posts_fts ON blog_posts
USING gin(to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || content));

-- =====================================================
-- CONFIRMATION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '======================================';
    RAISE NOTICE 'Vector Storage Setup Complete';
    RAISE NOTICE '======================================';
    RAISE NOTICE 'pgvector extension enabled';
    RAISE NOTICE 'Blog post embeddings table created';
    RAISE NOTICE 'Document embeddings table created';
    RAISE NOTICE 'Search analytics tracking enabled';
    RAISE NOTICE 'Semantic search functions created';
    RAISE NOTICE '======================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Generate embeddings for existing blog posts';
    RAISE NOTICE '2. Configure OpenAI API key for embeddings';
    RAISE NOTICE '3. Implement embedding generation in application';
    RAISE NOTICE '======================================';
END $$;