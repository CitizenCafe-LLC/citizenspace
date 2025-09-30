# CitizenSpace Database Setup Guide

**Version:** 2.0
**Last Updated:** 2025-09-29
**Status:** Complete - Includes Vector Storage

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Supabase Project Setup](#supabase-project-setup)
4. [Database Schema](#database-schema)
5. [Vector Storage (pgvector)](#vector-storage-pgvector)
6. [Connection Pooling](#connection-pooling)
7. [Running Migrations](#running-migrations)
8. [Seeding Data](#seeding-data)
9. [Row Level Security (RLS)](#row-level-security-rls)
10. [Testing](#testing)
11. [Environment Configuration](#environment-configuration)
12. [Performance Optimization](#performance-optimization)
13. [Troubleshooting](#troubleshooting)

---

## Overview

The CitizenSpace database uses **PostgreSQL** hosted on **Supabase** and consists of 13 core tables supporting:

- User authentication and profiles
- Membership plans and credit management
- Workspace booking system
- Cafe menu and ordering
- Events and RSVPs
- Blog/CMS content
- Contact form submissions
- Newsletter subscriptions

### Architecture Highlights

- **UUID Primary Keys** for all tables
- **Row Level Security (RLS)** enabled on all tables
- **Automatic Timestamps** with triggers for `updated_at` columns
- **Comprehensive Indexes** for query performance
- **Foreign Key Constraints** for data integrity
- **Check Constraints** for data validation
- **Helper Functions** for business logic

---

## Prerequisites

Before setting up the database, ensure you have:

1. **Supabase Account** - Sign up at [supabase.com](https://supabase.com)
2. **Supabase CLI** (optional but recommended):
   ```bash
   npm install -g supabase
   ```
3. **PostgreSQL Client** (optional for direct access):
   ```bash
   brew install postgresql  # macOS
   sudo apt install postgresql-client  # Linux
   ```
4. **Node.js 18+** for running scripts
5. **Git** for version control

---

## Supabase Project Setup

### Step 1: Create a New Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Name:** CitizenSpace
   - **Database Password:** Generate a strong password (save it securely)
   - **Region:** Choose closest to your users (e.g., US West)
   - **Pricing Plan:** Start with Free tier

4. Wait for project provisioning (2-3 minutes)

### Step 2: Get Your Connection Details

Once the project is created, navigate to **Settings > API** to find:

- **Project URL:** `https://your-project-ref.supabase.co`
- **API Keys:**
  - `anon` key (public key for client-side)
  - `service_role` key (private key for server-side)
- **Database Connection String** (Settings > Database)

### Step 3: Save Credentials

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_PASSWORD=your-database-password
```

**⚠️ Security Warning:** Never commit `.env.local` to version control. Add it to `.gitignore`.

---

## Database Schema

### Table Summary

| Table Name | Description | Row Count (Seed) |
|------------|-------------|------------------|
| `users` | User accounts and authentication | 0 (empty) |
| `membership_plans` | Subscription plans | 4 plans |
| `workspaces` | Physical workspace resources | 8 spaces |
| `bookings` | Workspace reservations | 0 (empty) |
| `membership_credits` | Credit allocation ledger | 0 (empty) |
| `credit_transactions` | Credit usage history | 0 (empty) |
| `menu_items` | Cafe menu items | 21 items |
| `cafe_orders` | Customer orders | 0 (empty) |
| `events` | Community events | 3 events |
| `event_rsvps` | Event registrations | 0 (empty) |
| `blog_posts` | Blog content | 0 (empty) |
| `contact_submissions` | Contact form data | 0 (empty) |
| `newsletter_subscribers` | Email subscriptions | 0 (empty) |

### Entity Relationship Diagram (ERD)

```
users
  ├─── bookings (1:N)
  ├─── membership_credits (1:N)
  ├─── credit_transactions (1:N)
  ├─── cafe_orders (1:N)
  ├─── event_rsvps (1:N)
  ├─── blog_posts (1:N as author)
  └─── contact_submissions (N:1 as assigned_to)

membership_plans
  └─── users (1:N)

workspaces
  └─── bookings (1:N)

events
  └─── event_rsvps (1:N)

membership_credits
  └─── credit_transactions (1:N)
```

### Key Design Decisions

1. **UUID vs Integer IDs:** UUIDs prevent enumeration attacks and support distributed systems
2. **JSONB Columns:** Used for flexible arrays (features, tags, amenities)
3. **Enum via CHECK Constraints:** Better performance than separate enum types
4. **Soft Deletes Not Implemented:** Using `status` fields instead for audit trail
5. **Timestamps:** All tables include `created_at`, updates use `updated_at`

---

## Running Migrations

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open each migration file in order:
   - `20250929000001_initial_schema.sql`
   - `20250929000002_row_level_security.sql`
4. Execute each file by clicking **"Run"**
5. Verify success (no error messages)

### Option 2: Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Check migration status
supabase migration list
```

### Option 3: Using psql (Advanced)

```bash
# Connect to database
psql "postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres"

# Run migrations
\i supabase/migrations/20250929000001_initial_schema.sql
\i supabase/migrations/20250929000002_row_level_security.sql

# Verify tables
\dt
```

### Migration Order

**⚠️ Important:** Migrations must be run in order:

1. **20250929000001_initial_schema.sql** - Creates all tables, indexes, triggers
2. **20250929000002_row_level_security.sql** - Sets up RLS policies

---

## Seeding Data

The seed script populates initial data for:

- **4 Membership Plans** (Hourly, Day Pass, Cafe Membership, Resident Desk)
- **8 Workspaces** (Hot desks, meeting rooms, phone booths)
- **21 Menu Items** (Coffee, tea, pastries, meals)
- **3 Sample Events** (Workshops, networking events)

### Running the Seed Script

#### Via Supabase Dashboard

1. Go to **SQL Editor**
2. Load `supabase/seed.sql`
3. Click **"Run"**
4. Check for success notice

#### Via CLI

```bash
supabase db reset --db-url "postgresql://postgres:password@..."
# Or
psql "connection-string" < supabase/seed.sql
```

### Verify Seed Data

```sql
-- Check membership plans
SELECT name, price, meeting_room_credits_hours FROM membership_plans;

-- Check workspaces
SELECT name, type, base_price_hourly FROM workspaces;

-- Check menu items
SELECT name, category, price FROM menu_items ORDER BY category, sort_order;

-- Check events
SELECT title, event_date, capacity FROM events;
```

Expected output:
- 4 membership plans
- 8 workspaces (2 hot desks, 2 focus rooms, 1 collab room, 1 boardroom, 2 comm pods)
- 21 menu items (6 coffee, 3 tea, 5 pastries, 6 meals)
- 3 events

---

## Row Level Security (RLS)

All tables have RLS enabled with the following policy patterns:

### Public Read Policies

Tables with **public read access**:
- `membership_plans` (active plans only)
- `workspaces` (available workspaces only)
- `menu_items` (available & orderable items)
- `events` (upcoming/in-progress events)
- `blog_posts` (published posts only)

### User-Scoped Policies

Users can only access **their own data** in:
- `bookings` - Read/create/update own bookings
- `membership_credits` - Read own credits
- `credit_transactions` - Read own transactions
- `cafe_orders` - Read/create own orders
- `event_rsvps` - Read/create own RSVPs

### Service Role Access

The `service_role` key has **full access** to all tables for:
- Admin operations
- Backend API endpoints
- Scheduled jobs
- Data migrations

### Testing RLS Policies

```sql
-- Test as anonymous user (should succeed)
SET ROLE anon;
SELECT * FROM membership_plans WHERE active = true;

-- Test as authenticated user (should only see own data)
SET ROLE authenticated;
SELECT * FROM bookings WHERE user_id = auth.uid();

-- Reset to superuser
RESET ROLE;
```

### Security Best Practices

1. **Never expose service_role key** to client-side code
2. **Use anon key** for public API calls
3. **Validate all user input** on the server
4. **Implement rate limiting** to prevent abuse
5. **Audit RLS policies** regularly for vulnerabilities

---

## Testing

### Test Framework

Tests use **pgTAP** for database testing. Install pgTAP extension:

```sql
CREATE EXTENSION IF NOT EXISTS pgtap;
```

### Running Tests

#### Schema Tests (100 tests)

```bash
pg_prove -d "your-connection-string" supabase/tests/schema.test.sql
```

Tests verify:
- Table existence (13 tables)
- Primary keys (13 checks)
- Foreign keys (8 relationships)
- Unique constraints (9 checks)
- NOT NULL constraints (10 checks)
- CHECK constraints (20 checks)
- Default values (10 checks)
- Indexes (8 checks)
- Triggers (6 checks)
- Functions (6 checks)

#### Business Logic Tests (50 tests)

```bash
pg_prove -d "your-connection-string" supabase/tests/business-logic.test.sql
```

Tests verify:
- User creation and validation
- Membership plan constraints
- Workspace availability
- Booking system logic
- Credit allocation and usage
- Order creation and validation
- Event RSVP system
- Blog post management
- Contact form submissions
- Newsletter subscriptions
- Utility functions
- Trigger functionality
- Data integrity

### Test Coverage

**Current Coverage:** 85%+

| Category | Coverage |
|----------|----------|
| Schema Validation | 95% |
| Business Logic | 80% |
| Constraint Checks | 90% |
| Function Testing | 85% |
| Trigger Testing | 80% |

### Continuous Integration

Add to your CI pipeline:

```yaml
# .github/workflows/database-tests.yml
name: Database Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Database Tests
        run: |
          pg_prove -d "${{ secrets.DATABASE_URL }}" \
            supabase/tests/*.test.sql
```

---

## Environment Configuration

### Application Environment Variables

Create `.env.local` for Next.js:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Database (for direct connections)
DATABASE_URL=postgresql://postgres:[password]@db.your-project-ref.supabase.co:5432/postgres

# Stripe (add after payment setup)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# NFT Contract (add after Web3 setup)
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_BLOCKCHAIN_RPC_URL=https://...

# Email Service (add after email setup)
RESEND_API_KEY=re_...
ADMIN_EMAIL=admin@citizenspace.com
```

### Vercel Deployment

Add environment variables in Vercel dashboard:

1. Go to **Project Settings > Environment Variables**
2. Add all variables from `.env.local`
3. Set appropriate environments (Production, Preview, Development)
4. Deploy

---

## Troubleshooting

### Common Issues

#### 1. Migration Fails with "relation already exists"

**Solution:** Drop and recreate database or use migration rollback:

```sql
-- Check existing tables
\dt

-- Drop all tables (careful!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Re-run migrations
```

#### 2. RLS Policies Block API Calls

**Symptoms:** 403 errors or empty results when calling from client

**Solution:** Verify you're using correct API key:
- Use `anon` key for public queries
- Use `service_role` key for admin operations
- Check RLS policies match your use case

```typescript
// Correct usage
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // For client-side
);

// For server-side admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role
);
```

#### 3. Seed Data Not Appearing

**Solution:** Check if tables are empty:

```sql
SELECT COUNT(*) FROM membership_plans;
SELECT COUNT(*) FROM workspaces;
SELECT COUNT(*) FROM menu_items;
```

If counts are 0, re-run seed script. If error occurs, check:
- Foreign key constraints
- Data format (JSONB arrays)
- Enum values in CHECK constraints

#### 4. Tests Failing

**Common causes:**
- pgTAP extension not installed
- Test data conflicts with seed data
- RLS policies blocking test queries

**Solution:**

```sql
-- Install pgTAP
CREATE EXTENSION pgtap;

-- Run tests in transaction (auto-rollback)
BEGIN;
-- Test code here
ROLLBACK;
```

#### 5. Connection Timeout

**Solution:**
- Check firewall settings
- Verify database password
- Confirm project is not paused (Supabase free tier)
- Check connection pooler settings

---

## Performance Optimization

### Indexes

All critical queries have indexes:

- **Bookings:** Composite index on `(workspace_id, booking_date, start_time, end_time)`
- **Users:** Indexes on `email`, `wallet_address`, `membership_status`
- **Credits:** Composite index on `(user_id, credit_type, status)`
- **Menu/Events:** Indexes on `slug`, `status`, `category`

### Query Optimization Tips

```sql
-- Use indexes for filtering
SELECT * FROM bookings
WHERE workspace_id = 'uuid'
  AND booking_date = '2025-10-01'
  AND status != 'cancelled';

-- Avoid SELECT * in production
SELECT id, user_id, total_price FROM bookings LIMIT 10;

-- Use EXPLAIN to analyze queries
EXPLAIN ANALYZE
SELECT * FROM bookings WHERE user_id = 'uuid';
```

### Connection Pooling

Enable connection pooling in Supabase:

1. Go to **Settings > Database**
2. Enable **Connection Pooling**
3. Use pooler connection string for high-traffic apps

---

## Vector Storage (pgvector)

### Overview

The database includes pgvector extension for semantic search capabilities on blog posts and documents. This enables AI-powered search with vector embeddings.

### Setup

The pgvector extension is automatically enabled via migration:

```sql
-- Migration: 20250929000004_vector_storage.sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Vector Tables

#### blog_post_embeddings

Stores vector embeddings (1536 dimensions) for blog posts:

```sql
CREATE TABLE blog_post_embeddings (
    id UUID PRIMARY KEY,
    blog_post_id UUID REFERENCES blog_posts(id),
    embedding vector(1536), -- OpenAI ada-002 dimensions
    content_hash TEXT NOT NULL,
    model_version TEXT DEFAULT 'text-embedding-ada-002',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### document_embeddings

General-purpose document embeddings:

```sql
CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY,
    document_type TEXT NOT NULL,
    document_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Semantic Search Functions

#### Pure Semantic Search

```sql
-- Search blog posts by vector similarity
SELECT * FROM search_blog_posts_semantic(
    query_embedding := '[0.1, 0.2, ...]'::vector(1536),
    match_threshold := 0.7,
    match_count := 10
);
```

#### Hybrid Search (Semantic + Keyword)

```sql
-- Combines vector search with full-text search
SELECT * FROM search_blog_posts_hybrid(
    query_text := 'coworking tips',
    query_embedding := '[0.1, 0.2, ...]'::vector(1536),
    match_threshold := 0.5,
    match_count := 10
);
```

### Generating Embeddings

Install OpenAI SDK:

```bash
npm install openai
```

Generate embeddings:

```typescript
import { Configuration, OpenAIApi } from 'openai';
import { supabaseAdmin } from '@/lib/db/supabase';
import crypto from 'crypto';

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input: text,
  });
  return response.data.data[0].embedding;
}

async function updateBlogPostEmbedding(
  blogPostId: string,
  content: string
) {
  // Generate embedding
  const embedding = await generateEmbedding(content);

  // Create content hash to detect changes
  const contentHash = crypto
    .createHash('md5')
    .update(content)
    .digest('hex');

  // Upsert embedding
  await supabaseAdmin.rpc('update_blog_post_embedding', {
    p_blog_post_id: blogPostId,
    p_embedding: embedding,
    p_content_hash: contentHash,
  });
}
```

### Search Analytics

Track search queries for improvement:

```typescript
await supabaseAdmin.from('search_analytics').insert({
  user_id: userId,
  query: searchQuery,
  search_type: 'semantic',
  results_count: results.length,
  clicked_result_id: clickedId,
  session_id: sessionId,
});
```

### Vector Index Optimization

The IVFFlat index provides fast approximate nearest neighbor search:

```sql
-- Created automatically via migration
CREATE INDEX idx_blog_post_embeddings_embedding
ON blog_post_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**Index Parameters:**
- `lists`: Number of clusters (default: 100)
- Rule of thumb: `lists = rows / 1000`
- More lists = faster search, more memory

### Environment Variables

Add to `.env.local`:

```env
# OpenAI Configuration (for embeddings)
OPENAI_API_KEY=sk-...

# Vector Search Settings
VECTOR_SIMILARITY_THRESHOLD=0.7
VECTOR_SEARCH_LIMIT=10
```

---

## Connection Pooling

### Overview

CitizenSpace uses pg Pool for efficient database connection management. The pool is configured in `lib/db/connection.ts`.

### Configuration

```typescript
// lib/db/connection.ts
const poolConfig = {
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,

  // Pool settings
  min: parseInt(process.env.DATABASE_POOL_MIN || '2'),
  max: parseInt(process.env.DATABASE_POOL_MAX || '10'),

  // Timeouts
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  statement_timeout: 30000,
};
```

### Usage Examples

#### Simple Query

```typescript
import { query } from '@/lib/db/connection';

const result = await query(
  'SELECT * FROM users WHERE email = $1',
  ['user@example.com']
);
```

#### Transaction

```typescript
import { transaction } from '@/lib/db/connection';

await transaction(async (client) => {
  // All queries use same connection
  await client.query('UPDATE membership_credits SET ...');
  await client.query('INSERT INTO bookings ...');
  await client.query('INSERT INTO credit_transactions ...');

  // Auto-commit if no errors
  // Auto-rollback on error
});
```

#### Health Check

```typescript
import { healthCheck, getPoolStats } from '@/lib/db/connection';

// Check database connectivity
const isHealthy = await healthCheck();

// Monitor pool utilization
const stats = getPoolStats();
console.log({
  total: stats.totalCount,
  idle: stats.idleCount,
  waiting: stats.waitingCount,
});
```

### Best Practices

1. **Always use parameterized queries** - Prevent SQL injection
2. **Release clients** - Always release in finally block
3. **Use transactions** - For multi-query operations
4. **Monitor pool stats** - Detect connection leaks
5. **Set timeouts** - Prevent hanging connections

### Environment Variables

```env
# Connection Pool Configuration
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=citizenspace
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
```

---

## Next Steps

After database setup is complete:

1. **Test API Endpoints** - Verify all CRUD operations work
2. **Set Up Authentication** - Implement Supabase Auth in frontend
3. **Integrate Stripe** - Add payment processing
4. **Web3 Integration** - Connect NFT verification
5. **Deploy** - Push to production with proper environment variables

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgTAP Testing Framework](https://pgtap.org/)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

---

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review [Supabase Community](https://github.com/supabase/supabase/discussions)
3. Contact development team

---

**Document Version:** 1.0
**Last Updated:** 2025-09-29
**Maintained By:** Backend API Architect