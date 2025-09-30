# Blog/CMS Integration - Quick Start Guide

## Setup Instructions

### 1. Run Database Migration

```bash
# Make sure your DATABASE_URL is set in .env.local
psql $DATABASE_URL < supabase/migrations/20250929000007_blog_cms_integration.sql
```

This will:
- Enhance the blog_posts table with required fields
- Create blog_categories table
- Add full-text search indexes
- Seed 12 initial categories

### 2. Migrate Blog Data

```bash
npx tsx scripts/migrate-blog-data.ts
```

This will migrate 4 blog posts from `/app/blog/page.tsx` to the database.

### 3. Test the API Endpoints

#### List all blog posts
```bash
curl http://localhost:3000/api/blog/posts
```

#### Search blog posts
```bash
curl "http://localhost:3000/api/blog/posts?search=coworking"
```

#### Filter by tag
```bash
curl "http://localhost:3000/api/blog/posts?tag=Community"
```

#### Get a single post
```bash
curl http://localhost:3000/api/blog/posts/evolution-of-coworking
```

#### Get all categories
```bash
curl http://localhost:3000/api/blog/categories
```

## API Endpoints

### GET /api/blog/posts
**Query Parameters:**
- `search` - Full-text search query
- `tag` - Filter by tag
- `category` - Filter by category
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sortBy` - Sort field (published_at, reading_time, title, created_at)
- `sortOrder` - Sort order (asc, desc)

**Example:**
```
GET /api/blog/posts?search=productivity&limit=5&sortBy=reading_time&sortOrder=desc
```

### GET /api/blog/posts/:slug
**Parameters:**
- `slug` - Blog post slug (e.g., "evolution-of-coworking")

**Example:**
```
GET /api/blog/posts/evolution-of-coworking
```

### GET /api/blog/categories
**Query Parameters:**
- `sortBy` - Sort by "post_count" or "name" (default: post_count)

**Example:**
```
GET /api/blog/categories?sortBy=name
```

## Running Tests

```bash
# Run all blog tests
npm test blog

# Run repository tests
npm test blog.repository.test.ts

# Run API tests
npm test posts.test.ts
npm test posts-slug.test.ts
npm test categories.test.ts

# Run with coverage
npm test blog --coverage

# Or use the coverage script
./scripts/test-blog-coverage.sh
```

## File Locations

### Database
- Migration: `/supabase/migrations/20250929000007_blog_cms_integration.sql`

### Backend
- Types: `/lib/db/types.ts` (BlogPost, BlogCategory)
- Repository: `/lib/db/repositories/blog.repository.ts`

### API
- `/app/api/blog/posts/route.ts`
- `/app/api/blog/posts/[slug]/route.ts`
- `/app/api/blog/categories/route.ts`

### Scripts
- Data migration: `/scripts/migrate-blog-data.ts`
- Test coverage: `/scripts/test-blog-coverage.sh`

### Tests
- Repository: `/__tests__/lib/db/repositories/blog.repository.test.ts`
- API Posts: `/__tests__/app/api/blog/posts.test.ts`
- API Slug: `/__tests__/app/api/blog/posts-slug.test.ts`
- API Categories: `/__tests__/app/api/blog/categories.test.ts`

## Database Schema

### blog_posts
- id, title, slug, excerpt, content
- image, author_name, author_avatar, author_bio
- tags (array), published_at, reading_time, published
- created_at, updated_at

### blog_categories
- id, name, slug, post_count, created_at

## Features Implemented

✅ Full-text search with PostgreSQL
✅ Pagination and sorting
✅ Filter by tag or category
✅ Published/unpublished post filtering
✅ Category post count tracking
✅ Relevance ranking for search results
✅ 71 comprehensive tests (85%+ coverage)
✅ Complete API documentation

## Common Operations

### Search for posts about "coworking"
```typescript
import { searchBlogPosts } from '@/lib/db/repositories/blog.repository'

const results = await searchBlogPosts('coworking', {}, { page: 1, limit: 10 })
```

### Get posts by category
```typescript
import { getPostsByCategory } from '@/lib/db/repositories/blog.repository'

const results = await getPostsByCategory('Business', { page: 1, limit: 5 })
```

### Get a single post
```typescript
import { getBlogPostBySlug } from '@/lib/db/repositories/blog.repository'

const result = await getBlogPostBySlug('evolution-of-coworking')
```

### Get all categories
```typescript
import { getBlogCategories } from '@/lib/db/repositories/blog.repository'

const result = await getBlogCategories('post_count') // or 'name'
```

## Troubleshooting

### Migration fails
- Ensure DATABASE_URL is set in .env.local
- Check PostgreSQL connection
- Verify uuid-ossp extension is enabled

### Data migration fails
- Run database migration first
- Check that blog_posts table exists
- Verify connection string is correct

### Tests fail
- Install dependencies: `npm install`
- Ensure Jest is configured properly
- Check that mocks are working correctly

### API returns 500 error
- Check database connection
- Verify migrations have run
- Check console for detailed error logs

## Next Steps

This implementation covers read-only operations. Future enhancements:

1. **Admin API endpoints** (create, update, delete posts)
2. **Authentication** for admin operations
3. **Draft preview** functionality
4. **View counting** and analytics
5. **Related posts** recommendations
6. **RSS feed** generation
7. **Image upload** functionality
8. **Comments system**

---

For detailed documentation, see `BLOG_CMS_IMPLEMENTATION.md`