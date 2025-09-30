# Monitoring and Observability Setup Guide

Complete guide for setting up monitoring, error tracking, and observability for CitizenSpace in production.

## Table of Contents

- [Overview](#overview)
- [Sentry Setup](#sentry-setup)
- [Vercel Analytics](#vercel-analytics)
- [Database Monitoring](#database-monitoring)
- [Uptime Monitoring](#uptime-monitoring)
- [Log Management](#log-management)
- [Performance Monitoring](#performance-monitoring)
- [Alerting](#alerting)
- [Dashboards](#dashboards)

---

## Overview

A comprehensive monitoring strategy includes:

- **Error Tracking**: Capture and debug errors in production
- **Performance Monitoring**: Track response times and bottlenecks
- **Uptime Monitoring**: Ensure service availability
- **Log Aggregation**: Centralized logging for debugging
- **User Analytics**: Understand user behavior
- **Database Monitoring**: Track query performance and connections

---

## Sentry Setup

Sentry provides real-time error tracking and performance monitoring.

### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Sign up for an account (free tier available)
3. Create a new project:
   - Platform: **Next.js**
   - Project name: **CitizenSpace**

### 2. Install Sentry SDK

```bash
npm install @sentry/nextjs
```

### 3. Run Sentry Wizard

```bash
npx @sentry/wizard@latest -i nextjs
```

This will:
- Create `sentry.client.config.ts`
- Create `sentry.server.config.ts`
- Create `sentry.edge.config.ts`
- Update `next.config.js`
- Add source maps configuration

### 4. Configure Sentry

**sentry.client.config.ts:**
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in production

  // Session Replay (optional)
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions
  replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors

  // Environment
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // Ignore common errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'cancelled',
  ],

  // Filtering sensitive data
  beforeSend(event, hint) {
    // Don't send errors in development
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    // Remove sensitive data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers
    }

    return event
  },

  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: [
        'localhost',
        /^https:\/\/citizenspace\.com/,
      ],
    }),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})
```

**sentry.server.config.ts:**
```typescript
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 1.0,

  environment: process.env.NODE_ENV,

  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Don't capture in development
  enabled: process.env.NODE_ENV === 'production',

  beforeSend(event, hint) {
    // Remove sensitive server data
    if (event.request) {
      delete event.request.cookies
      delete event.request.headers?.authorization
    }

    return event
  },
})
```

### 5. Set Environment Variables

Add to Vercel:

```bash
# Required
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# For source maps (optional but recommended)
SENTRY_AUTH_TOKEN=sntrys_xxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT=citizenspace

# Vercel automatically sets these
VERCEL_GIT_COMMIT_SHA=xxx
VERCEL_URL=xxx
```

**Via Vercel CLI:**
```bash
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add SENTRY_AUTH_TOKEN production
```

### 6. Test Sentry Integration

**Create test error page:**

```typescript
// app/sentry-test/page.tsx
'use client'

export default function SentryTestPage() {
  return (
    <button
      onClick={() => {
        throw new Error('Sentry Test Error')
      }}
    >
      Trigger Error
    </button>
  )
}
```

Visit `/sentry-test` and click the button. Check Sentry dashboard for the error.

### 7. Custom Error Boundaries

```typescript
// app/error.tsx
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### 8. Manual Error Capturing

```typescript
import * as Sentry from '@sentry/nextjs'

// Capture exception
try {
  throw new Error('Something went wrong')
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      section: 'booking',
      userId: user.id,
    },
    level: 'error',
  })
}

// Capture message
Sentry.captureMessage('Payment processing slow', {
  level: 'warning',
  tags: {
    service: 'stripe',
  },
})

// Set user context
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
})

// Add breadcrumb
Sentry.addBreadcrumb({
  category: 'booking',
  message: 'User started booking flow',
  level: 'info',
})
```

### 9. Performance Monitoring

```typescript
import * as Sentry from '@sentry/nextjs'

// Track custom transactions
const transaction = Sentry.startTransaction({
  op: 'booking.create',
  name: 'Create Booking',
})

try {
  // Your booking logic
  const booking = await createBooking()

  transaction.setStatus('ok')
} catch (error) {
  transaction.setStatus('internal_error')
  throw error
} finally {
  transaction.finish()
}

// Track specific operations
const span = transaction.startChild({
  op: 'db.query',
  description: 'Insert booking',
})

await db.bookings.create({ ... })

span.finish()
```

---

## Vercel Analytics

### 1. Enable Vercel Analytics

**Install package:**
```bash
npm install @vercel/analytics
```

**Add to app:**
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 2. Enable Speed Insights

```bash
npm install @vercel/speed-insights
```

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### 3. Custom Events

Track custom events:

```typescript
import { track } from '@vercel/analytics'

// Track button click
track('Booking Started', {
  workspaceType: 'desk',
  duration: 8,
})

// Track conversion
track('Booking Completed', {
  bookingId: booking.id,
  amount: booking.totalPrice,
})
```

### 4. View Analytics

1. Go to Vercel Dashboard → Your Project
2. Click **"Analytics"** tab
3. View:
   - Page views
   - Top pages
   - Top referrers
   - Audience insights
   - Real-time visitors

---

## Database Monitoring

### Supabase Monitoring

1. **Dashboard Metrics**
   - Go to Supabase Dashboard → Your Project
   - Click **"Database"** → **"Performance"**
   - View:
     - Query performance
     - Connection count
     - Database size
     - Table statistics

2. **Query Performance**
   ```sql
   -- Find slow queries
   SELECT
     query,
     calls,
     total_time,
     mean_time,
     max_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 20;
   ```

3. **Connection Monitoring**
   ```sql
   -- Check active connections
   SELECT count(*) as connections
   FROM pg_stat_activity
   WHERE state = 'active';

   -- Check idle connections
   SELECT count(*) as idle_connections
   FROM pg_stat_activity
   WHERE state = 'idle';
   ```

4. **Set Up Alerts**
   - Supabase Dashboard → Project Settings → Alerts
   - Configure alerts for:
     - High CPU usage (> 80%)
     - High memory usage (> 80%)
     - Slow queries (> 1s)
     - Connection limit reached

### PostgreSQL Query Logging

```typescript
// lib/db/postgres.ts
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,

  // Log slow queries
  log: (msg) => {
    if (msg.includes('duration') && parseInt(msg.split('duration: ')[1]) > 1000) {
      console.warn('Slow query detected:', msg)
      // Send to monitoring service
      Sentry.captureMessage(`Slow query: ${msg}`, 'warning')
    }
  },
})
```

---

## Uptime Monitoring

### Option 1: Better Uptime (Recommended)

1. **Sign up**: [betteruptime.com](https://betteruptime.com)
2. **Create Monitor**:
   - Type: HTTP
   - URL: `https://citizenspace.com/api/health`
   - Check frequency: 30 seconds
   - Regions: Multiple (US, EU, Asia)
   - Expected status: 200

3. **Set Up Alerts**:
   - Email notifications
   - Slack integration
   - SMS alerts (premium)

4. **Create Status Page**:
   - Public status page for users
   - Incident management
   - Scheduled maintenance notifications

### Option 2: Uptime Robot (Free)

1. **Sign up**: [uptimerobot.com](https://uptimerobot.com)
2. **Add Monitor**:
   - Monitor Type: HTTP(s)
   - URL: `https://citizenspace.com`
   - Monitoring Interval: 5 minutes (free tier)

3. **Alert Contacts**:
   - Add email
   - Add webhook for Slack

### Health Check Endpoint

Create a robust health check:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {} as Record<string, any>,
  }

  // Database check
  try {
    const result = await pool.query('SELECT NOW()')
    checks.checks.database = {
      status: 'healthy',
      responseTime: Date.now(),
    }
  } catch (error) {
    checks.status = 'unhealthy'
    checks.checks.database = {
      status: 'unhealthy',
      error: error.message,
    }
  }

  // Email service check
  try {
    const configured = !!process.env.RESEND_API_KEY || !!process.env.SMTP_USER
    checks.checks.email = {
      status: configured ? 'healthy' : 'degraded',
      configured,
    }
  } catch (error) {
    checks.checks.email = {
      status: 'unhealthy',
      error: error.message,
    }
  }

  // Stripe check
  checks.checks.stripe = {
    status: !!process.env.STRIPE_SECRET_KEY ? 'healthy' : 'degraded',
    configured: !!process.env.STRIPE_SECRET_KEY,
  }

  const statusCode = checks.status === 'healthy' ? 200 : 503

  return NextResponse.json(checks, { status: statusCode })
}
```

---

## Log Management

### Vercel Logs

**View logs:**
```bash
# Real-time logs
vercel logs --follow

# Filter by function
vercel logs --function=api/bookings

# Filter by time
vercel logs --since=1h

# Export logs
vercel logs > logs-$(date +%Y%m%d).txt
```

### Structured Logging

Create a logger utility:

```typescript
// lib/logger.ts
import * as Sentry from '@sentry/nextjs'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  bookingId?: string
  [key: string]: any
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (process.env.DEBUG === 'true') {
      console.debug(`[DEBUG] ${message}`, context)
    }
  },

  info(message: string, context?: LogContext) {
    console.info(`[INFO] ${message}`, context)

    if (process.env.NODE_ENV === 'production') {
      Sentry.addBreadcrumb({
        message,
        level: 'info',
        data: context,
      })
    }
  },

  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context)

    if (process.env.NODE_ENV === 'production') {
      Sentry.captureMessage(message, {
        level: 'warning',
        tags: context,
      })
    }
  },

  error(message: string, error: Error, context?: LogContext) {
    console.error(`[ERROR] ${message}`, error, context)

    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        tags: context,
        extra: { message },
      })
    }
  },
}

// Usage
logger.info('Booking created', { bookingId: booking.id, userId: user.id })
logger.error('Payment failed', error, { bookingId: booking.id })
```

---

## Performance Monitoring

### Core Web Vitals

Monitor key metrics:
- **LCP**: Largest Contentful Paint (< 2.5s)
- **FID**: First Input Delay (< 100ms)
- **CLS**: Cumulative Layout Shift (< 0.1)

**Setup:**
```typescript
// app/web-vitals.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    console.log(metric)

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Send to your analytics service
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        body: JSON.stringify(metric),
      })
    }
  })

  return null
}
```

### API Response Time Monitoring

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const start = Date.now()

  const response = NextResponse.next()

  const duration = Date.now() - start

  // Log slow responses
  if (duration > 1000) {
    console.warn(`Slow response: ${request.url} took ${duration}ms`)
  }

  // Add timing header
  response.headers.set('X-Response-Time', `${duration}ms`)

  return response
}
```

---

## Alerting

### Sentry Alerts

1. **Go to Sentry** → Your Project → **Alerts**
2. **Create Alert Rule**:
   - Alert name: "High Error Rate"
   - Conditions:
     - When error count is more than 10
     - In 1 minute
   - Actions:
     - Send email to team
     - Send to Slack
     - Create issue in GitHub

3. **Common Alert Rules**:
   - Error spike detection
   - New error types
   - Performance degradation
   - Release health

### Slack Integration

**Set up Slack webhook:**

```typescript
// lib/notifications/slack.ts
export async function sendSlackAlert(message: string, severity: 'info' | 'warning' | 'error') {
  const color = {
    info: '#36a64f',
    warning: '#ff9800',
    error: '#f44336',
  }[severity]

  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      attachments: [
        {
          color,
          title: 'CitizenSpace Alert',
          text: message,
          ts: Math.floor(Date.now() / 1000),
        },
      ],
    }),
  })
}

// Usage
await sendSlackAlert('Database connection pool exhausted', 'error')
```

---

## Dashboards

### Create Custom Dashboard

**Grafana + Prometheus (Advanced):**

1. Set up Prometheus metrics endpoint
2. Configure Grafana data source
3. Create custom dashboards

**Datadog (Enterprise):**

1. Install Datadog agent
2. Configure APM
3. Use pre-built dashboards

### Simple Status Dashboard

Create an internal dashboard:

```typescript
// app/admin/dashboard/page.tsx
export default async function AdminDashboard() {
  const metrics = {
    uptime: await getUptime(),
    errorRate: await getErrorRate(),
    avgResponseTime: await getAvgResponseTime(),
    activeUsers: await getActiveUsers(),
    todayBookings: await getTodayBookings(),
  }

  return (
    <div>
      <h1>System Health</h1>
      <MetricCard title="Uptime" value={`${metrics.uptime}%`} />
      <MetricCard title="Error Rate" value={`${metrics.errorRate}%`} />
      <MetricCard title="Avg Response Time" value={`${metrics.avgResponseTime}ms`} />
      <MetricCard title="Active Users" value={metrics.activeUsers} />
      <MetricCard title="Today's Bookings" value={metrics.todayBookings} />
    </div>
  )
}
```

---

## Monitoring Checklist

### Essential (Day 1)
- [ ] Sentry error tracking enabled
- [ ] Vercel Analytics configured
- [ ] Health check endpoint created
- [ ] Uptime monitoring (UptimeRobot or Better Uptime)
- [ ] Email alerts for downtime
- [ ] Basic logging in place

### Recommended (Week 1)
- [ ] Performance monitoring (Sentry Performance)
- [ ] Database query monitoring
- [ ] Slack alerts configured
- [ ] Custom error boundaries
- [ ] Structured logging implemented
- [ ] Web Vitals tracking

### Advanced (Month 1)
- [ ] Custom metrics dashboards
- [ ] Session replay (Sentry or LogRocket)
- [ ] A/B testing analytics
- [ ] User behavior tracking
- [ ] Cost monitoring (Vercel, DB, email)
- [ ] Automated performance testing

---

## Costs

### Free Tier
- Sentry: 5k errors/month
- Vercel Analytics: Included with Pro plan
- UptimeRobot: 50 monitors, 5min intervals
- Supabase: Includes basic monitoring

**Total: $0/month** (with paid Vercel plan)

### Production Setup
- Sentry Business: $26/month
- Vercel Pro: $20/month
- Better Uptime: $18/month
- LogRocket: $99/month (optional)

**Total: $64-163/month**

---

## Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Next.js Monitoring](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Vitals](https://web.dev/vitals/)
- [PostgreSQL Monitoring](https://www.postgresql.org/docs/current/monitoring.html)

---

**Last Updated**: 2025-09-29
**Version**: 1.0.0