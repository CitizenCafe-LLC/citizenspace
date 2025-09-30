# Database Migration Guide

Complete guide for managing database schema migrations, backups, and maintenance for CitizenSpace.

## Table of Contents

- [Overview](#overview)
- [Migration Strategy](#migration-strategy)
- [Supabase Migrations](#supabase-migrations)
- [Local Development](#local-development)
- [Production Migrations](#production-migrations)
- [Backup and Recovery](#backup-and-recovery)
- [Schema Management](#schema-management)
- [Troubleshooting](#troubleshooting)

---

## Overview

Database migrations allow you to:
- Version control your database schema
- Safely update production databases
- Roll back changes if needed
- Collaborate with team on schema changes

**Tools Used:**
- **Supabase CLI**: For migration management
- **PostgreSQL**: Database engine
- **Git**: Version control for migrations

---

## Migration Strategy

### Migration Types

1. **Additive Migrations** (Safe)
   - Add new tables
   - Add new columns (with defaults)
   - Add new indexes
   - Create new functions/triggers

2. **Destructive Migrations** (Requires caution)
   - Drop tables
   - Drop columns
   - Rename columns
   - Change column types

3. **Data Migrations**
   - Bulk data updates
   - Data transformations
   - Backfill operations

### Best Practices

- ✅ **Always test migrations locally first**
- ✅ **Backup database before production migrations**
- ✅ **Make migrations reversible when possible**
- ✅ **Use transactions for data migrations**
- ✅ **Run migrations during low-traffic periods**
- ✅ **Monitor migrations in production**
- ✅ **Document breaking changes**
- ❌ **Never modify applied migrations**
- ❌ **Never skip migrations**

---

## Supabase Migrations

### 1. Install Supabase CLI

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Linux:**
```bash
brew install supabase/tap/supabase
# Or use NPM
npm install -g supabase
```

**Windows:**
```bash
# Use Scoop
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### 2. Initialize Supabase

```bash
# Login to Supabase
supabase login

# Initialize in your project
supabase init

# This creates:
# - supabase/config.toml
# - supabase/migrations/
# - supabase/seed.sql
```

### 3. Link to Remote Project

```bash
# Get your project reference from Supabase dashboard
supabase link --project-ref your-project-ref

# Test connection
supabase db remote status
```

### 4. Create New Migration

```bash
# Create a new migration file
supabase migration new create_bookings_table

# This creates: supabase/migrations/20250929120000_create_bookings_table.sql
```

### 5. Write Migration

**Example: Create bookings table**

```sql
-- supabase/migrations/20250929120000_create_bookings_table.sql

-- Create enum for booking status
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  workspace_type VARCHAR(50) NOT NULL CHECK (workspace_type IN ('desk', 'room', 'pod')),

  -- Booking details
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours DECIMAL(4,2) NOT NULL,

  -- Status and pricing
  status booking_status NOT NULL DEFAULT 'pending',
  total_price DECIMAL(10,2) NOT NULL,
  credits_used INTEGER DEFAULT 0,

  -- Payment
  payment_status VARCHAR(50) DEFAULT 'pending',
  stripe_session_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),

  -- Confirmation
  confirmation_code VARCHAR(50) UNIQUE NOT NULL,
  qr_code_url TEXT,

  -- Metadata
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT positive_price CHECK (total_price >= 0),
  CONSTRAINT positive_credits CHECK (credits_used >= 0)
);

-- Create indexes
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_date ON public.bookings(date);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_workspace ON public.bookings(workspace_id, date);
CREATE INDEX idx_bookings_stripe_session ON public.bookings(stripe_session_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own bookings
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create bookings
CREATE POLICY "Users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bookings (within time limits)
CREATE POLICY "Users can update own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Comment the table
COMMENT ON TABLE public.bookings IS 'Stores workspace booking information';
```

### 6. Test Migration Locally

```bash
# Start local Supabase (Docker required)
supabase start

# Apply migrations
supabase db reset

# Check status
supabase status

# Access local database
psql postgresql://postgres:postgres@localhost:54322/postgres
```

### 7. Apply to Production

```bash
# Review pending migrations
supabase db diff

# Push migrations to production
supabase db push

# Verify migrations
supabase db remote status
```

---

## Local Development

### Setup Local Database

```bash
# Start Supabase locally (includes PostgreSQL)
supabase start

# This starts:
# - PostgreSQL database on localhost:54322
# - Supabase Studio on http://localhost:54323
# - API server on http://localhost:54321
```

### Create Migration from Diff

```bash
# Make changes in Supabase Studio
# Then generate migration from diff
supabase db diff -f create_credits_table

# This creates a migration file with the changes
```

### Seed Development Data

**Create seed file:**

```sql
-- supabase/seed.sql

-- Insert test users (if using local auth)
INSERT INTO auth.users (id, email) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'test@example.com'),
  ('550e8400-e29b-41d4-a716-446655440002', 'admin@example.com')
ON CONFLICT (id) DO NOTHING;

-- Insert test workspaces
INSERT INTO public.workspaces (id, name, type, capacity, hourly_price, available) VALUES
  ('workspace-001', 'Hot Desk A1', 'desk', 1, 15.00, true),
  ('workspace-002', 'Meeting Room B1', 'room', 6, 50.00, true),
  ('workspace-003', 'Private Pod C1', 'pod', 2, 30.00, true)
ON CONFLICT (id) DO NOTHING;

-- Insert test bookings
INSERT INTO public.bookings (
  user_id,
  workspace_id,
  workspace_type,
  date,
  start_time,
  end_time,
  duration_hours,
  total_price,
  status,
  confirmation_code
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'workspace-001',
    'desk',
    CURRENT_DATE,
    '09:00:00',
    '17:00:00',
    8,
    120.00,
    'confirmed',
    'CONF-001'
  )
ON CONFLICT DO NOTHING;
```

**Run seed:**

```bash
# Reset database and run seed
supabase db reset

# Or run seed separately
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/seed.sql
```

---

## Production Migrations

### Pre-Migration Checklist

- [ ] Test migration in local environment
- [ ] Test migration in staging environment
- [ ] Review migration SQL for potential issues
- [ ] Backup production database
- [ ] Schedule migration during low-traffic period
- [ ] Notify team of migration window
- [ ] Have rollback plan ready
- [ ] Monitor database during migration

### Step 1: Backup Production Database

**Supabase (Pro Plan):**
```bash
# Automatic backups are enabled
# Manual backup via dashboard: Database → Backups → Create backup
```

**Manual Backup:**
```bash
# Export entire database
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d-%H%M%S).sql

# Export specific tables
pg_dump $DATABASE_URL --table=bookings --table=users > backup-tables.sql

# Compressed backup
pg_dump $DATABASE_URL | gzip > backup.sql.gz
```

### Step 2: Apply Migration

```bash
# 1. Review changes
supabase db diff

# 2. Test in staging first
supabase db push --db-url $STAGING_DATABASE_URL

# 3. Verify in staging
# Run tests, check data, verify functionality

# 4. Apply to production
supabase db push

# 5. Verify in production
supabase db remote status
```

### Step 3: Verify Migration

```bash
# Connect to production database
psql $DATABASE_URL

# Check table exists
\dt bookings

# Check columns
\d+ bookings

# Check indexes
\di

# Check constraints
SELECT * FROM information_schema.table_constraints WHERE table_name = 'bookings';

# Run test queries
SELECT COUNT(*) FROM bookings;
```

### Step 4: Monitor

```bash
# Watch database metrics
# - Query performance
# - Connection count
# - Error rates

# Vercel logs
vercel logs --follow

# Database logs (Supabase dashboard)
# Go to: Database → Logs
```

---

## Backup and Recovery

### Automated Backups (Supabase Pro)

- **Daily backups**: Retained for 7 days
- **Weekly backups**: Retained for 4 weeks
- **Point-in-time recovery**: Last 7 days

**Configure:**
1. Go to Supabase Dashboard → Project Settings → Database
2. Enable automated backups
3. Set backup schedule
4. Configure retention period

### Manual Backups

**Full Database Backup:**
```bash
# Create backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore backup
psql $DATABASE_URL < backup-20250929.sql
```

**Schema-Only Backup:**
```bash
# Backup schema without data
pg_dump --schema-only $DATABASE_URL > schema.sql

# Restore schema
psql $DATABASE_URL < schema.sql
```

**Data-Only Backup:**
```bash
# Backup data without schema
pg_dump --data-only $DATABASE_URL > data.sql

# Restore data
psql $DATABASE_URL < data.sql
```

**Specific Tables:**
```bash
# Backup specific tables
pg_dump $DATABASE_URL --table=bookings --table=users > backup-tables.sql

# Restore specific tables
psql $DATABASE_URL < backup-tables.sql
```

### Point-in-Time Recovery

**Supabase Pro:**
```bash
# Via dashboard: Database → Backups → Point-in-time Recovery
# Select date/time to restore to
# Create new database from backup
```

**Manual PITR (if using WAL archiving):**
```bash
# Restore to specific time
pg_restore --target-time="2025-09-29 14:30:00" backup.sql
```

### Disaster Recovery Plan

1. **Identify Issue**
   - Determine scope of data loss
   - Identify last known good state

2. **Stop Application**
   ```bash
   # Prevent further damage
   vercel env add MAINTENANCE_MODE true production
   ```

3. **Restore Database**
   ```bash
   # Create new database from backup
   # Test restoration in separate instance first

   # Switch connection string
   vercel env add DATABASE_URL $NEW_DATABASE_URL production
   ```

4. **Verify Data**
   - Check critical tables
   - Verify data integrity
   - Run validation queries

5. **Resume Application**
   ```bash
   vercel env rm MAINTENANCE_MODE production
   vercel --prod
   ```

6. **Post-Mortem**
   - Document what happened
   - Identify root cause
   - Update procedures to prevent recurrence

---

## Schema Management

### Viewing Current Schema

```sql
-- List all tables
\dt

-- Describe table structure
\d+ bookings

-- List all indexes
SELECT * FROM pg_indexes WHERE tablename = 'bookings';

-- List all constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'bookings'::regclass;

-- View RLS policies
SELECT * FROM pg_policies WHERE tablename = 'bookings';
```

### Common Schema Changes

**Add Column:**
```sql
-- Add nullable column (safe)
ALTER TABLE bookings ADD COLUMN notes TEXT;

-- Add column with default (safer)
ALTER TABLE bookings ADD COLUMN priority INTEGER DEFAULT 0;

-- Add NOT NULL column (requires default or backfill)
ALTER TABLE bookings ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'standard';
```

**Modify Column:**
```sql
-- Change column type (can be destructive)
ALTER TABLE bookings ALTER COLUMN duration_hours TYPE INTEGER;

-- Add constraint
ALTER TABLE bookings ADD CONSTRAINT check_duration
  CHECK (duration_hours > 0 AND duration_hours <= 24);

-- Drop constraint
ALTER TABLE bookings DROP CONSTRAINT check_duration;
```

**Rename Column:**
```sql
-- Rename column (requires code update)
ALTER TABLE bookings RENAME COLUMN notes TO description;

-- Better approach: Add new column, migrate data, then drop old
ALTER TABLE bookings ADD COLUMN description TEXT;
UPDATE bookings SET description = notes WHERE notes IS NOT NULL;
ALTER TABLE bookings DROP COLUMN notes;
```

**Add Index:**
```sql
-- Create index (can be slow on large tables)
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Create index concurrently (doesn't lock table)
CREATE INDEX CONCURRENTLY idx_bookings_created_at ON bookings(created_at);

-- Partial index
CREATE INDEX idx_active_bookings ON bookings(date)
  WHERE status IN ('pending', 'confirmed');
```

### Data Migrations

**Backfill Data:**
```sql
-- Update in batches to avoid locking
DO $$
DECLARE
  batch_size INTEGER := 1000;
  offset_value INTEGER := 0;
  updated_count INTEGER;
BEGIN
  LOOP
    UPDATE bookings
    SET category = 'standard'
    WHERE id IN (
      SELECT id FROM bookings
      WHERE category IS NULL
      LIMIT batch_size
    );

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    EXIT WHEN updated_count = 0;

    -- Sleep between batches (optional)
    PERFORM pg_sleep(0.1);
  END LOOP;
END $$;
```

**Transform Data:**
```sql
-- Migrate data between columns
UPDATE bookings
SET new_column = CASE
  WHEN old_column = 'value1' THEN 'new_value1'
  WHEN old_column = 'value2' THEN 'new_value2'
  ELSE 'default'
END;
```

---

## Troubleshooting

### Migration Failed

**Error: "relation already exists"**
```sql
-- Add IF NOT EXISTS
CREATE TABLE IF NOT EXISTS bookings (...);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
```

**Error: "column already exists"**
```sql
-- Check if column exists before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'notes'
  ) THEN
    ALTER TABLE bookings ADD COLUMN notes TEXT;
  END IF;
END $$;
```

**Error: "constraint already exists"**
```sql
-- Drop and recreate
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS check_duration;
ALTER TABLE bookings ADD CONSTRAINT check_duration CHECK (duration_hours > 0);
```

### Migration Taking Too Long

```sql
-- Create index concurrently
CREATE INDEX CONCURRENTLY idx_bookings_date ON bookings(date);

-- Update in batches
UPDATE bookings SET status = 'confirmed'
WHERE id IN (SELECT id FROM bookings WHERE status = 'pending' LIMIT 1000);

-- Use WHERE clause to limit scope
UPDATE bookings SET updated_at = NOW()
WHERE created_at > '2025-01-01';
```

### Rollback Migration

```bash
# If migration hasn't been committed
ROLLBACK;

# If migration was committed, create new migration to undo
supabase migration new rollback_add_column

# In rollback migration:
ALTER TABLE bookings DROP COLUMN IF EXISTS new_column;
```

### Check Migration Status

```bash
# Check applied migrations
supabase db remote status

# Check pending migrations
supabase db diff

# View migration history
SELECT * FROM supabase_migrations.schema_migrations;
```

---

## Migration Examples

### Example 1: Add Credits System

```sql
-- Create credits table
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 0,
  allocated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  expires_at TIMESTAMP WITH TIME ZONE,
  source VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),

  CONSTRAINT positive_amount CHECK (amount >= 0)
);

CREATE INDEX idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX idx_user_credits_expires_at ON public.user_credits(expires_at);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
  ON public.user_credits FOR SELECT
  USING (auth.uid() = user_id);
```

### Example 2: Add Membership Tiers

```sql
-- Create membership types enum
CREATE TYPE membership_tier AS ENUM ('basic', 'premium', 'enterprise');

-- Add membership columns to users
ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS membership_tier membership_tier DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS membership_start_date DATE,
ADD COLUMN IF NOT EXISTS membership_end_date DATE;

-- Create membership history table
CREATE TABLE IF NOT EXISTS public.membership_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  tier membership_tier NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### Example 3: Add Full-Text Search

```sql
-- Add search column
ALTER TABLE public.bookings
ADD COLUMN search_vector tsvector;

-- Create index for full-text search
CREATE INDEX idx_bookings_search ON public.bookings USING gin(search_vector);

-- Create trigger to update search vector
CREATE OR REPLACE FUNCTION public.bookings_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.workspace_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.confirmation_code, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.special_requests, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.bookings_search_vector_update();

-- Search example
SELECT * FROM bookings
WHERE search_vector @@ to_tsquery('english', 'desk & morning');
```

---

## Best Practices Summary

1. **Version Control**: Always commit migrations to Git
2. **Testing**: Test in local → staging → production
3. **Reversibility**: Write down migrations when possible
4. **Backups**: Always backup before production migrations
5. **Monitoring**: Watch for errors during and after migrations
6. **Documentation**: Document breaking changes and manual steps
7. **Timing**: Run migrations during low-traffic periods
8. **Batching**: Process large data changes in batches
9. **Indexes**: Create indexes concurrently in production
10. **Rollback Plan**: Always have a rollback strategy ready

---

## Additional Resources

- [Supabase Migrations Documentation](https://supabase.com/docs/guides/database/migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQL Style Guide](https://www.sqlstyle.guide/)
- [Database Design Best Practices](https://www.postgresql.org/docs/current/ddl-intro.html)

---

**Last Updated**: 2025-09-29
**Version**: 1.0.0