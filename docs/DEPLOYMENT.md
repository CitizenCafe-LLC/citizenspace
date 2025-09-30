# CitizenSpace Deployment Guide

Complete guide for deploying CitizenSpace to production using Vercel, with instructions for database setup, environment configuration, and third-party integrations.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Database Deployment](#database-deployment)
- [Vercel Deployment](#vercel-deployment)
- [Domain & SSL Configuration](#domain--ssl-configuration)
- [Post-Deployment Steps](#post-deployment-steps)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] **Node.js 18+** installed locally
- [ ] **Git** repository set up
- [ ] **Vercel account** (free tier works for getting started)
- [ ] **PostgreSQL database** (Supabase, Railway, or managed provider)
- [ ] **Stripe account** (for payments)
- [ ] **Email service** (Resend, SendGrid, or SMTP)
- [ ] **WalletConnect Project ID** (for Web3 features)
- [ ] **Domain name** (optional but recommended for production)

---

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd CitizenSpace
npm install
```

### 2. Set Up Local Environment

```bash
cp .env.example .env.local
# Edit .env.local with your development credentials
```

### 3. Test Locally

```bash
npm run dev
# Visit http://localhost:3000
```

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Environment Setup

### Development Environment

Create `.env.local` for local development:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (local or Supabase)
DATABASE_URL=postgresql://postgres:password@localhost:5432/citizenspace_dev

# Stripe (test keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# Email (SMTP for development)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-dev-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=dev@citizenspace.local

# JWT
JWT_SECRET=your-dev-jwt-secret-32-characters-min
NEXTAUTH_SECRET=your-dev-nextauth-secret

# Web3
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-id
```

### Production Environment

Set these in Vercel dashboard (Settings → Environment Variables):

```env
# Required for Production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://citizenspace.com

# Database (with SSL)
DATABASE_URL=postgresql://user:password@host:5432/db?sslmode=require

# Stripe (live keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... # Get from webhook dashboard

# Email (Resend recommended)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@citizenspace.com
EMAIL_FROM_NAME=CitizenSpace

# JWT (generate new for production)
JWT_SECRET=<run: openssl rand -base64 32>
JWT_EXPIRES_IN=7d
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=https://citizenspace.com

# Web3
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-production-id
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=1

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...

# Feature Flags
ENABLE_NFT_VERIFICATION=true
ENABLE_MEMBERSHIP_CREDITS=true
ENABLE_CAFE_ORDERING=true
```

---

## Database Deployment

### Option 1: Supabase (Recommended)

1. **Create Supabase Project**
   ```bash
   # Visit https://supabase.com/dashboard
   # Create new project
   # Note your project URL and keys
   ```

2. **Run Migrations**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login
   supabase login

   # Link project
   supabase link --project-ref your-project-ref

   # Push migrations
   supabase db push
   ```

3. **Enable RLS (Row Level Security)**
   ```sql
   -- Run in Supabase SQL Editor
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
   ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
   -- Add policies as needed
   ```

4. **Set Connection String**
   ```env
   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

### Option 2: Railway

1. **Create Database**
   ```bash
   # Visit https://railway.app/dashboard
   # Create new PostgreSQL database
   # Copy connection string
   ```

2. **Run Migrations**
   ```bash
   # Set DATABASE_URL temporarily
   export DATABASE_URL="postgresql://..."

   # Run migrations
   npm run db:migrate
   ```

### Option 3: AWS RDS

1. **Create RDS Instance**
   - Database: PostgreSQL 15+
   - Instance: t3.micro (for testing) or larger
   - Storage: 20 GB SSD
   - Enable automated backups
   - Enable SSL

2. **Configure Security Group**
   - Allow port 5432 from Vercel IPs
   - Use VPC for enhanced security

3. **Connection String**
   ```env
   DATABASE_URL=postgresql://username:password@instance.region.rds.amazonaws.com:5432/citizenspace?sslmode=require
   ```

---

## Vercel Deployment

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Framework Preset: **Next.js**
5. Root Directory: `./` (leave default)

### Step 2: Configure Build Settings

```bash
# Build Command (use default)
npm run build

# Output Directory (use default)
.next

# Install Command (use default)
npm install

# Development Command (use default)
npm run dev
```

### Step 3: Environment Variables

Add all production environment variables:

```bash
# Quick add via CLI
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add DATABASE_URL production
vercel env add STRIPE_SECRET_KEY production
# ... add all required vars
```

Or add via dashboard: **Settings → Environment Variables**

### Step 4: Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Or push to main branch for auto-deploy
git push origin main
```

### Step 5: Verify Deployment

1. Visit your deployment URL
2. Check health endpoint: `https://your-app.vercel.app/api/health`
3. Test authentication: Sign up / Sign in
4. Test booking flow
5. Verify email sending
6. Test Stripe payment (use test card: 4242 4242 4242 4242)

---

## Domain & SSL Configuration

### Configure Custom Domain

1. **Add Domain in Vercel**
   ```
   Project Settings → Domains → Add Domain
   Enter: citizenspace.com
   ```

2. **Update DNS Records**

   Add these records in your domain provider:

   ```
   Type    Name    Value
   A       @       76.76.21.21
   CNAME   www     cname.vercel-dns.com
   ```

3. **Update Environment Variables**
   ```env
   NEXT_PUBLIC_APP_URL=https://citizenspace.com
   NEXTAUTH_URL=https://citizenspace.com
   ```

4. **SSL Certificate**
   - Vercel automatically provisions SSL via Let's Encrypt
   - Certificate renews automatically
   - HTTPS enforced by default

### Configure Email Domain (for Resend)

1. **Add DNS Records for Email**
   ```
   Type    Name                    Value
   TXT     _resend                 resend-domain-verification=...
   MX      @                       feedback-smtp.resend.com (priority 10)
   TXT     @                       v=spf1 include:_spf.resend.com ~all
   TXT     resend._domainkey       p=MIGfMA0GCSqG...
   ```

2. **Verify Domain in Resend**
   - Visit https://resend.com/domains
   - Add domain
   - Wait for DNS propagation (up to 24 hours)
   - Verify status

---

## Post-Deployment Steps

### 1. Configure Stripe Webhooks

See [WEBHOOKS.md](./WEBHOOKS.md) for detailed instructions.

```bash
# Quick setup
1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: https://citizenspace.com/api/webhooks/stripe
3. Select events: checkout.session.completed, payment_intent.succeeded
4. Copy webhook secret to STRIPE_WEBHOOK_SECRET
5. Test webhook in Stripe dashboard
```

### 2. Set Up Database Backups

**Supabase:**
- Automatic daily backups (Pro plan)
- Manual backup: Dashboard → Database → Backups

**Railway:**
- Automatic daily backups (included)
- Snapshot before major changes

**AWS RDS:**
```bash
# Enable automated backups
aws rds modify-db-instance \
  --db-instance-identifier citizenspace-prod \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00"
```

### 3. Configure Monitoring

See [MONITORING.md](./MONITORING.md) for detailed setup.

```bash
# Quick Sentry setup
1. Create project at https://sentry.io
2. Add NEXT_PUBLIC_SENTRY_DSN to environment
3. Deploy with sentry integration
4. Test error tracking
```

### 4. Set Up Cron Jobs (Optional)

For credit expiration checks and automated tasks:

```bash
# Create vercel.json
{
  "crons": [
    {
      "path": "/api/cron/credit-expiration",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/booking-reminders",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### 5. Configure Rate Limiting

**Vercel Pro Plan:**
- Configure in dashboard: Settings → Edge Config
- Set rate limits per endpoint

**Alternative: Use Upstash Redis**
```bash
# Add to environment
REDIS_URL=redis://...
REDIS_TOKEN=...

# Implement in middleware
```

### 6. Enable Analytics

**Vercel Analytics:**
```bash
npm install @vercel/analytics

# Add to _app.tsx
import { Analytics } from '@vercel/analytics/react'
<Analytics />
```

**Google Analytics:**
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Monitoring & Maintenance

### Health Checks

Create health check endpoint:

```typescript
// pages/api/health.ts
export default async function handler(req, res) {
  const checks = {
    database: await checkDatabase(),
    email: await checkEmail(),
    stripe: await checkStripe(),
  }

  const healthy = Object.values(checks).every(c => c === 'ok')
  res.status(healthy ? 200 : 503).json(checks)
}
```

Set up monitoring:
- Vercel: Settings → Monitoring
- Uptime Robot: https://uptimerobot.com
- Better Uptime: https://betteruptime.com

### Performance Monitoring

**Key Metrics to Monitor:**
- Response times (target: < 200ms)
- Error rates (target: < 0.1%)
- Database query performance
- API endpoint latency
- Memory usage
- Build times

**Tools:**
- Vercel Analytics (included)
- Sentry Performance Monitoring
- LogRocket (session replay)

### Database Maintenance

**Regular Tasks:**
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM bookings WHERE user_id = $1;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public';

-- Vacuum and analyze
VACUUM ANALYZE;

-- Check indexes
SELECT * FROM pg_stat_user_indexes;
```

### Log Monitoring

**Access Logs:**
```bash
# Vercel logs
vercel logs --follow

# Filter by function
vercel logs --function=api/bookings

# Export logs
vercel logs > logs-$(date +%Y%m%d).txt
```

---

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Error: "Module not found"**
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

**Error: "Type errors"**
```bash
# Solution: Fix TypeScript errors
npm run typecheck
# Fix errors, then deploy
```

#### 2. Database Connection Issues

**Error: "Connection timeout"**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection locally
psql $DATABASE_URL

# Check SSL requirement
# Add ?sslmode=require to connection string
```

**Error: "Too many connections"**
```bash
# Solution: Use connection pooling
# Supabase: Use pooler connection string
# Or set DATABASE_POOL_MAX=10
```

#### 3. Email Sending Failures

**Error: "Email not sending"**
```bash
# Check provider configuration
# Verify API key is correct
# Check email service logs

# Test email manually
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test@citizenspace.com",
    "to": "your@email.com",
    "subject": "Test",
    "html": "<p>Test</p>"
  }'
```

#### 4. Stripe Webhook Issues

**Error: "Webhook signature verification failed"**
```bash
# Solution: Update STRIPE_WEBHOOK_SECRET
# Get correct secret from Stripe dashboard
# Ensure it's the production secret, not test
```

#### 5. Environment Variable Issues

**Error: "Cannot access environment variable"**
```bash
# Check variable is set
vercel env ls

# Ensure NEXT_PUBLIC_ prefix for client-side vars
# Redeploy after adding new variables
vercel --prod --force
```

#### 6. Authentication Issues

**Error: "JWT verification failed"**
```bash
# Check JWT_SECRET is set
# Ensure secret is at least 32 characters
# Generate new secret: openssl rand -base64 32
# Update environment and redeploy
```

### Debug Mode

Enable debug logging:

```env
DEBUG=true
LOG_LEVEL=debug
```

Then check Vercel logs:

```bash
vercel logs --follow
```

### Emergency Rollback

If production is broken:

```bash
# Via Vercel dashboard
Go to Deployments → Select last working deployment → Promote to Production

# Via CLI
vercel rollback [deployment-url]
```

### Getting Help

- **Documentation**: Check `/docs` folder
- **Vercel Support**: https://vercel.com/support
- **Community**: GitHub Discussions
- **Status Page**: https://vercel-status.com

---

## Security Checklist

Before going live:

- [ ] All secrets are environment variables (not in code)
- [ ] JWT secrets are strong (32+ characters)
- [ ] Database uses SSL connections
- [ ] API routes have authentication
- [ ] Rate limiting is configured
- [ ] CORS is properly configured
- [ ] Stripe webhooks are verified
- [ ] Email sending is authenticated
- [ ] Error messages don't expose sensitive data
- [ ] Database has row-level security (if using Supabase)
- [ ] Environment variables are production values
- [ ] Test cards removed from production
- [ ] Analytics and monitoring enabled
- [ ] Automated backups configured
- [ ] Domain has HTTPS enforced

---

## Cost Estimation

### Free Tier (Hobby Project)

- **Vercel**: Free (100 GB bandwidth/month)
- **Supabase**: Free (500 MB database, 2 GB bandwidth)
- **Resend**: Free (100 emails/day)
- **Stripe**: 2.9% + $0.30 per transaction
- **WalletConnect**: Free

**Total**: ~$0/month + transaction fees

### Production (Small Business)

- **Vercel Pro**: $20/month
- **Supabase Pro**: $25/month
- **Resend Pro**: $20/month (50k emails)
- **Stripe**: 2.9% + $0.30 per transaction
- **Sentry**: $26/month (Business plan)
- **Domain**: $12/year

**Total**: ~$91/month + transaction fees

### Scale (Growing Business)

- **Vercel Enterprise**: $400+/month
- **AWS RDS**: $100-500/month
- **SendGrid**: $80/month
- **CloudFlare**: $20/month
- **Monitoring**: $100/month

**Total**: $700-1100/month

---

## Next Steps

After deployment:

1. ✅ **Test all functionality** in production
2. ✅ **Set up monitoring** (Sentry, Vercel Analytics)
3. ✅ **Configure backups** (database, code)
4. ✅ **Set up alerts** (downtime, errors, performance)
5. ✅ **Document runbooks** (common tasks, troubleshooting)
6. ✅ **Train team** on deployment process
7. ✅ **Schedule regular maintenance** (weekly/monthly checks)

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Guides](https://supabase.com/docs/guides)
- [Stripe Integration](https://stripe.com/docs/payments/checkout)
- [Resend Documentation](https://resend.com/docs)
- [WEBHOOKS.md](./WEBHOOKS.md) - Stripe webhook setup
- [MONITORING.md](./MONITORING.md) - Monitoring setup
- [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) - Database migrations

---

**Last Updated**: 2025-09-29
**Version**: 1.0.0