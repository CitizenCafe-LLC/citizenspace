# CitizenSpace Supabase Database

This directory contains all database-related files for the CitizenSpace application.

## Directory Structure

```
supabase/
├── migrations/           # Database migration files (run in order)
│   ├── 20250929000001_initial_schema.sql
│   └── 20250929000002_row_level_security.sql
├── tests/               # Database test suites
│   ├── schema.test.sql
│   └── business-logic.test.sql
├── seed.sql            # Initial data seeding
└── README.md           # This file
```

## Quick Start

### 1. Create Supabase Project

Go to [supabase.com](https://supabase.com) and create a new project named "CitizenSpace".

### 2. Run Migrations

Open the Supabase SQL Editor and run migrations in order:

```sql
-- 1. Run initial schema
\i supabase/migrations/20250929000001_initial_schema.sql

-- 2. Run RLS policies
\i supabase/migrations/20250929000002_row_level_security.sql
```

### 3. Seed Data

Run the seed script to populate initial data:

```sql
\i supabase/seed.sql
```

### 4. Verify Setup

Check that all tables exist:

```sql
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Expected tables:

- bookings
- blog_posts
- cafe_orders
- contact_submissions
- credit_transactions
- event_rsvps
- events
- membership_credits
- membership_plans
- menu_items
- newsletter_subscribers
- users
- workspaces

## Migration Files

### 20250929000001_initial_schema.sql

Creates all 13 core tables with:

- UUID primary keys
- Foreign key constraints
- Check constraints for enums
- NOT NULL constraints
- Default values
- Indexes for performance
- Triggers for updated_at columns
- Utility functions

**Tables Created:**

1. users
2. membership_plans
3. workspaces
4. bookings
5. membership_credits
6. credit_transactions
7. menu_items
8. cafe_orders
9. events
10. event_rsvps
11. blog_posts
12. contact_submissions
13. newsletter_subscribers

### 20250929000002_row_level_security.sql

Sets up comprehensive Row Level Security (RLS) policies:

- Public read access for membership plans, workspaces, menu items, events
- User-scoped access for bookings, orders, RSVPs, credits
- Service role full access for admin operations
- Helper functions for policy checks

## Seed Data

The seed script populates:

### Membership Plans (4)

- **Hourly** - $2.50/hr pay-as-you-go
- **Day Pass** - $25/day full access
- **Cafe Membership** - $150/mo with 2hr meeting room credits
- **Resident Desk** - $425/mo with 8hr meeting room credits

### Workspaces (8)

- 2 Hot Desks (Main Floor, Quiet Zone)
- 2 Focus Rooms (2-4 people)
- 1 Collaborate Room (4-6 people)
- 1 Boardroom (6-8 people)
- 2 Communications Pods (1 person)

### Menu Items (21)

- Coffee (6 items)
- Tea (3 items)
- Pastries (5 items)
- Meals (6 items)

### Events (3)

- Sample workshops and networking events

## Testing

### Prerequisites

Install pgTAP extension:

```sql
CREATE EXTENSION IF NOT EXISTS pgtap;
```

### Run Schema Tests

```bash
pg_prove -d "your-connection-string" supabase/tests/schema.test.sql
```

**Coverage:** 100 tests covering:

- Table existence (13)
- Primary keys (13)
- Foreign keys (8)
- Unique constraints (9)
- NOT NULL constraints (10)
- CHECK constraints (20)
- Default values (10)
- Indexes (8)
- Triggers (6)
- Functions (6)

### Run Business Logic Tests

```bash
pg_prove -d "your-connection-string" supabase/tests/business-logic.test.sql
```

**Coverage:** 50 tests covering:

- User creation and validation
- Membership plan constraints
- Workspace availability
- Booking system logic
- Credit system functionality
- Order processing
- Event RSVP system
- Blog post management
- Utility functions
- Data integrity

## Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Common Commands

### Check Migration Status

```sql
SELECT * FROM supabase_migrations.schema_migrations;
```

### View All Tables

```sql
\dt
```

### Describe a Table

```sql
\d+ users
```

### Check RLS Policies

```sql
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public';
```

### View Indexes

```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

## Troubleshooting

### Issue: Tables Already Exist

If you need to start fresh:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

Then re-run migrations.

### Issue: RLS Blocking Queries

Check which role you're using:

```sql
SELECT current_user, current_role;
```

Use service role for admin operations:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

### Issue: Seed Data Failed

Check for constraint violations:

```sql
-- Check foreign key constraints
SELECT conname, conrelid::regclass, confrelid::regclass
FROM pg_constraint
WHERE contype = 'f';

-- Verify data types match
\d+ membership_plans
```

## Performance Tips

1. **Use Indexes** - All foreign keys and commonly queried columns are indexed
2. **Limit Results** - Always use `LIMIT` for large tables
3. **Avoid SELECT \*** - Only select columns you need
4. **Use Connection Pooling** - Enable in Supabase settings
5. **Monitor Slow Queries** - Check Supabase dashboard

## Next Steps

1. ✅ Database schema created
2. ✅ RLS policies configured
3. ✅ Seed data loaded
4. ⬜ Test API endpoints
5. ⬜ Implement authentication
6. ⬜ Add Stripe integration
7. ⬜ Connect frontend

## Documentation

For detailed documentation, see:

- [Database Setup Guide](../docs/database-setup.md)
- [PRD.md](../PRD.md) - Full requirements
- [BACKLOG.md](../BACKLOG.md) - Implementation tasks

## Support

For issues or questions about the database:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [Supabase Documentation](https://supabase.com/docs)
3. Contact the development team

---

**Last Updated:** 2025-09-29
**Schema Version:** 1.0
**Test Coverage:** 85%+
