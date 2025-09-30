# CitizenSpace API Setup Guide

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier is sufficient)
- PostgreSQL knowledge (helpful but not required)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Configuration

#### Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Wait for database provisioning (2-3 minutes)

#### Get API Keys

1. Navigate to Project Settings → API
2. Copy the following values:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key
   - `service_role` secret key

#### Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local
```

### 3. Database Schema Setup

Run the SQL migration to create tables:

```sql
-- Copy and run this in Supabase SQL Editor
-- Location: Database → SQL Editor → New Query

-- Create workspace types enum
CREATE TYPE workspace_type AS ENUM (
  'hot-desk',
  'focus-room',
  'collaborate-room',
  'boardroom',
  'communications-pod'
);

CREATE TYPE resource_category AS ENUM ('desk', 'meeting-room');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');

-- Create workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type workspace_type NOT NULL,
  resource_category resource_category NOT NULL,
  description TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  base_price_hourly DECIMAL(10, 2) NOT NULL,
  requires_credits BOOLEAN DEFAULT false,
  min_duration DECIMAL(5, 2) NOT NULL DEFAULT 1,
  max_duration DECIMAL(5, 2) NOT NULL DEFAULT 8,
  amenities JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  available BOOLEAN DEFAULT true,
  floor_location VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  workspace_id UUID REFERENCES workspaces(id),
  booking_type VARCHAR(50),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours DECIMAL(5, 2),
  attendees INTEGER DEFAULT 1,
  subtotal DECIMAL(10, 2),
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  nft_discount_applied BOOLEAN DEFAULT false,
  total_price DECIMAL(10, 2),
  status booking_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  confirmation_code VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_workspaces_type ON workspaces(type);
CREATE INDEX idx_workspaces_category ON workspaces(resource_category);
CREATE INDEX idx_workspaces_available ON workspaces(available);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_workspace ON bookings(workspace_id);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### 4. Seed Sample Data (Optional)

```sql
-- Insert sample workspaces
INSERT INTO workspaces (name, type, resource_category, description, capacity, base_price_hourly, requires_credits, amenities, images, floor_location) VALUES
('Hot Desk 1', 'hot-desk', 'desk', 'Comfortable hot desk with power outlets', 1, 2.50, false, '["WiFi", "Power", "Monitor"]'::jsonb, '["/images/desk1.jpg"]'::jsonb, 'Main Floor'),
('Hot Desk 2', 'hot-desk', 'desk', 'Hot desk near window with natural light', 1, 2.50, false, '["WiFi", "Power"]'::jsonb, '["/images/desk2.jpg"]'::jsonb, 'Main Floor'),
('Focus Room A', 'focus-room', 'meeting-room', 'Private room for focused work', 4, 15.00, true, '["WiFi", "Whiteboard", "Monitor", "Conference Phone"]'::jsonb, '["/images/room1.jpg"]'::jsonb, 'Second Floor'),
('Collaborate Room', 'collaborate-room', 'meeting-room', 'Open collaboration space', 8, 25.00, true, '["WiFi", "Whiteboard", "Monitor", "Conference Phone", "TV"]'::jsonb, '["/images/room2.jpg"]'::jsonb, 'Second Floor'),
('Boardroom', 'boardroom', 'meeting-room', 'Executive boardroom for presentations', 12, 40.00, true, '["WiFi", "Whiteboard", "Conference Phone", "TV", "Projector", "Premium Chairs"]'::jsonb, '["/images/boardroom.jpg"]'::jsonb, 'Third Floor');
```

### 5. Run Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode for development
npm run test:watch
```

Expected output: All tests should pass with 80%+ coverage.

### 6. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/workspaces`

## Testing the API

### Using cURL

```bash
# Test basic endpoint
curl http://localhost:3000/api/workspaces

# Test with filters
curl "http://localhost:3000/api/workspaces?resource_category=desk&available=true"

# Test availability
curl "http://localhost:3000/api/workspaces/availability?date=2025-10-01"
```

### Using Postman

1. Import the collection from `/docs/postman-collection.json` (if available)
2. Set base URL to `http://localhost:3000`
3. Run the test suite

### Using Browser

Navigate to:

- http://localhost:3000/api/workspaces
- http://localhost:3000/api/workspaces/hot-desks
- http://localhost:3000/api/workspaces/meeting-rooms

## Troubleshooting

### Error: "Missing Supabase environment variables"

**Solution:** Ensure `.env.local` exists with correct Supabase credentials.

### Error: "relation 'workspaces' does not exist"

**Solution:** Run the database migration SQL from Step 3.

### Tests Failing

**Solution:**

1. Ensure all dependencies are installed: `npm install`
2. Check that mocks are properly configured
3. Run `npm run test:coverage` to see which tests are failing

### API Returns 500 Error

**Solution:**

1. Check Supabase dashboard for database status
2. Verify API keys are correct
3. Check server logs for detailed error messages

## Database Administration

### View Data in Supabase

1. Go to Supabase Dashboard
2. Navigate to Table Editor
3. Select `workspaces` or `bookings` table
4. View/edit data directly

### Run Custom Queries

1. Navigate to SQL Editor
2. Write your SQL query
3. Execute to view results

## Performance Optimization

### Enable Connection Pooling

Supabase automatically handles connection pooling. For additional optimization:

```typescript
// In lib/db/supabase.ts
const supabaseClient = createClient(url, key, {
  db: {
    schema: 'public',
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'x-application-name': 'citizenspace-api',
    },
  },
})
```

### Monitor Query Performance

Use Supabase Dashboard:

1. Navigate to Database → Query Performance
2. Identify slow queries
3. Add indexes as needed

## Security Best Practices

1. **Never commit `.env.local`** - It contains secrets
2. **Use service role key only on server-side** - Never expose it to client
3. **Enable Row Level Security (RLS)** when authentication is implemented
4. **Validate all input** - Already implemented in validation layer
5. **Rate limit API** - Implement in production

## Next Steps

After completing this setup:

1. ✅ Test all endpoints using the examples in `/docs/api-workspaces.md`
2. ✅ Review test coverage: `npm run test:coverage`
3. 🔄 Proceed to Task 1.2: Authentication System
4. 🔄 Implement Task 2.2: Hourly Desk Booking System

## Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Zod Validation](https://zod.dev/)
- Project Documentation: `/docs/api-workspaces.md`

---

**Setup Complete!** Your Workspace Management API is now ready for development.
