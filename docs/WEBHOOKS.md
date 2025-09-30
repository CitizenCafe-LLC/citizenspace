# Stripe Webhook Configuration Guide

Complete guide for setting up and managing Stripe webhooks in production for the CitizenSpace application.

## Table of Contents

- [Overview](#overview)
- [Development Setup](#development-setup)
- [Production Setup](#production-setup)
- [Webhook Events](#webhook-events)
- [Testing Webhooks](#testing-webhooks)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

---

## Overview

Webhooks allow Stripe to send real-time notifications to your application when events occur in your Stripe account, such as:

- Payment successful
- Subscription created/updated/cancelled
- Refund processed
- Dispute filed

**Key Benefits:**
- Real-time payment status updates
- Reliable event delivery with retries
- Reduced polling and API calls
- Better user experience

---

## Development Setup

### 1. Install Stripe CLI

The Stripe CLI allows you to test webhooks locally.

**macOS (Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download latest release
wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

**Windows:**
```bash
# Download from: https://github.com/stripe/stripe-cli/releases
# Extract and add to PATH
```

### 2. Login to Stripe CLI

```bash
stripe login
# This will open your browser to authenticate
# Press Enter to continue
```

### 3. Forward Webhooks to Local Server

```bash
# Start your Next.js dev server first
npm run dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# You'll see output like:
# > Ready! Your webhook signing secret is whsec_xxx...
# Copy this secret to your .env.local
```

### 4. Configure Local Environment

Add the webhook secret to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxx...
```

### 5. Test Local Webhooks

```bash
# Trigger a test event
stripe trigger checkout.session.completed

# Or create a real test payment
stripe checkout create --mode payment --success-url http://localhost:3000/success
```

---

## Production Setup

### Step 1: Create Webhook Endpoint

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter endpoint URL: `https://citizenspace.com/api/webhooks/stripe`
4. Select **API version**: Use latest (e.g., `2024-06-20`)

### Step 2: Select Events to Listen

Add these events (minimum required):

**Payment Events:**
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`

**Subscription Events (if using subscriptions):**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

**Refund Events:**
- `charge.refunded`
- `charge.refund.updated`

**Customer Events (optional):**
- `customer.created`
- `customer.updated`
- `customer.deleted`

Or select **"Send all event types"** (not recommended for production)

### Step 3: Save Webhook Secret

1. After creating the endpoint, click on it to view details
2. Click **"Reveal"** next to **Signing secret**
3. Copy the secret (starts with `whsec_`)
4. Add to Vercel environment variables:

```bash
# Via Vercel CLI
vercel env add STRIPE_WEBHOOK_SECRET production

# Or via dashboard
# Settings → Environment Variables → Add
# Name: STRIPE_WEBHOOK_SECRET
# Value: whsec_xxx...
# Scope: Production
```

### Step 4: Deploy Changes

```bash
# Redeploy to apply new environment variable
vercel --prod

# Or push to main branch if auto-deploy is enabled
git push origin main
```

### Step 5: Verify Webhook

1. Go back to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your endpoint
3. Click **"Send test webhook"**
4. Select event: `checkout.session.completed`
5. Check response: Should be `200 OK`

---

## Webhook Events

### Handling Events in Code

The webhook endpoint should be at `/app/api/webhooks/stripe/route.ts` or `/pages/api/webhooks/stripe.ts`

**Example Implementation:**

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await handleCheckoutComplete(session)
      break
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentSuccess(paymentIntent)
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentFailure(paymentIntent)
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdate(subscription)
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      await handleRefund(charge)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  // Update booking status
  // Send confirmation email
  // Allocate credits if applicable
  console.log('Checkout completed:', session.id)

  // Example:
  // await db.bookings.update({
  //   where: { stripeSessionId: session.id },
  //   data: { status: 'confirmed', paymentStatus: 'paid' }
  // })
  //
  // await sendBookingConfirmationEmail({ ... })
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id)
  // Update payment record in database
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment failed:', paymentIntent.id)
  // Send failure notification to user
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)
  // Update user's membership tier
  // Allocate/revoke credits
}

async function handleRefund(charge: Stripe.Charge) {
  console.log('Charge refunded:', charge.id)
  // Update booking status
  // Revoke credits if applicable
  // Send refund confirmation email
}
```

### Event Data Structure

**checkout.session.completed:**
```json
{
  "id": "evt_xxx",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_xxx",
      "amount_total": 12000,
      "currency": "usd",
      "customer": "cus_xxx",
      "customer_email": "customer@example.com",
      "metadata": {
        "bookingId": "booking_123",
        "userId": "user_456"
      },
      "payment_status": "paid",
      "status": "complete"
    }
  }
}
```

**Use metadata to link Stripe data to your database:**

```typescript
// When creating checkout session
const session = await stripe.checkout.sessions.create({
  // ... other params
  metadata: {
    bookingId: booking.id,
    userId: user.id,
    workspaceId: workspace.id,
  },
})

// In webhook handler
const { bookingId, userId } = session.metadata
// Use these IDs to update your database
```

---

## Testing Webhooks

### 1. Test with Stripe CLI

```bash
# Trigger specific events
stripe trigger checkout.session.completed
stripe trigger payment_intent.succeeded
stripe trigger customer.subscription.created

# Trigger with specific data
stripe trigger checkout.session.completed \
  --add checkout_session:metadata.bookingId=test_123 \
  --add checkout_session:metadata.userId=user_456
```

### 2. Test with Dashboard

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your endpoint
3. Click **"Send test webhook"**
4. Select event type
5. Customize event data (optional)
6. Click **"Send test webhook"**
7. Check response and logs

### 3. Test with Real Payments

Use Stripe test cards:

```
Success: 4242 4242 4242 4242
Declined: 4000 0000 0000 0002
Requires Authentication: 4000 0025 0000 3155
```

**Test Flow:**
1. Create checkout session
2. Complete payment with test card
3. Check webhook receives event
4. Verify database updated correctly
5. Confirm user receives email

### 4. Verify Webhook Logs

**In Stripe Dashboard:**
1. Go to [Developers → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click on your endpoint
3. View **"Recent events"** tab
4. Check status codes and responses

**In Vercel:**
```bash
# View real-time logs
vercel logs --follow

# Filter for webhook logs
vercel logs | grep "webhooks/stripe"
```

---

## Security

### 1. Always Verify Signatures

**DO:**
```typescript
// Always verify webhook signatures
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
)
```

**DON'T:**
```typescript
// Never trust webhook data without verification
const event = JSON.parse(body) // ❌ INSECURE
```

### 2. Use HTTPS in Production

- Stripe requires HTTPS for webhook endpoints
- Vercel provides HTTPS automatically
- Never expose webhook endpoints over HTTP

### 3. Protect Webhook Secret

```bash
# Store as environment variable
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Never commit to git
# Add to .gitignore:
.env
.env.local
.env.production
```

### 4. Implement Idempotency

Stripe may send the same event multiple times. Handle this:

```typescript
// Check if event already processed
const existingEvent = await db.webhookEvents.findUnique({
  where: { stripeEventId: event.id }
})

if (existingEvent) {
  return NextResponse.json({ received: true }) // Already processed
}

// Process event
await handleEvent(event)

// Record event as processed
await db.webhookEvents.create({
  data: {
    stripeEventId: event.id,
    type: event.type,
    processedAt: new Date()
  }
})
```

### 5. Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
// Example with Upstash Redis
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
})

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // Process webhook...
}
```

---

## Troubleshooting

### Issue: Webhook Returns 500 Error

**Symptoms:**
- Webhook shows failed in Stripe dashboard
- Response code: 500

**Solutions:**
```bash
# Check Vercel logs
vercel logs --follow

# Common causes:
1. Database connection error
2. Missing environment variable
3. Unhandled exception in handler

# Fix:
- Add try-catch blocks
- Return 200 even if processing fails
- Log errors for debugging
```

### Issue: Signature Verification Failed

**Symptoms:**
- Error: "No signatures found matching the expected signature for payload"
- Response code: 400

**Solutions:**
```bash
# Check webhook secret
echo $STRIPE_WEBHOOK_SECRET

# Verify you're using the correct secret:
# - Test mode: whsec_test_xxx
# - Live mode: whsec_xxx

# Get correct secret from dashboard
# Update environment variable
vercel env rm STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_WEBHOOK_SECRET production

# Redeploy
vercel --prod
```

### Issue: Events Not Received

**Symptoms:**
- No webhook events in logs
- Stripe shows event sent but no response

**Solutions:**
```bash
# 1. Check endpoint URL is correct
# Should be: https://yourdomain.com/api/webhooks/stripe

# 2. Verify endpoint is accessible
curl https://yourdomain.com/api/webhooks/stripe
# Should return 405 Method Not Allowed (GET not allowed)

# 3. Check Stripe event selection
# Verify events are enabled in webhook settings

# 4. Test with Stripe CLI
stripe listen --forward-to https://yourdomain.com/api/webhooks/stripe
stripe trigger checkout.session.completed
```

### Issue: Duplicate Event Processing

**Symptoms:**
- Same event processed multiple times
- Duplicate database entries

**Solutions:**
```typescript
// Implement idempotency key checking
const processed = await redis.get(`webhook:${event.id}`)
if (processed) {
  return NextResponse.json({ received: true })
}

await processEvent(event)
await redis.set(`webhook:${event.id}`, '1', { ex: 86400 }) // 24h TTL
```

### Issue: Timeout Errors

**Symptoms:**
- Webhook times out (10 second limit)
- Stripe retries repeatedly

**Solutions:**
```typescript
// Process quickly, queue heavy work
export async function POST(req: Request) {
  const event = await verifyWebhook(req)

  // Queue for async processing
  await queue.add('process-webhook', {
    eventId: event.id,
    type: event.type,
    data: event.data,
  })

  // Return immediately
  return NextResponse.json({ received: true })
}
```

### Webhook Retry Behavior

Stripe retries failed webhooks with exponential backoff:

```
Attempt 1: Immediate
Attempt 2: After 5 minutes
Attempt 3: After 30 minutes
Attempt 4: After 2 hours
Attempt 5: After 8 hours
Attempt 6: After 24 hours
```

**Best Practices:**
- Return `200 OK` as quickly as possible
- Process webhooks asynchronously if needed
- Implement idempotency to handle retries
- Monitor webhook failures in dashboard

---

## Monitoring Webhooks

### Set Up Alerts

**Slack Notifications:**
```typescript
async function notifyWebhookFailure(event: Stripe.Event, error: Error) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Webhook Failed: ${event.type}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Event:* ${event.id}\n*Type:* ${event.type}\n*Error:* ${error.message}`
          }
        }
      ]
    })
  })
}
```

### Dashboard Monitoring

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Monitor success rate (should be > 99%)
3. Check failed events regularly
4. Set up email alerts for failures

### Metrics to Track

- **Success Rate**: > 99%
- **Response Time**: < 1 second
- **Retry Rate**: < 1%
- **Event Processing Lag**: < 1 minute

---

## Advanced Configuration

### Multiple Webhooks

You can create multiple webhook endpoints for different purposes:

```
Production: https://citizenspace.com/api/webhooks/stripe
Staging: https://staging.citizenspace.com/api/webhooks/stripe
Analytics: https://analytics.citizenspace.com/webhooks/stripe
```

### Webhook Versions

Stripe sends webhooks with the API version you selected:

```typescript
// Handle different API versions
if (event.api_version === '2024-06-20') {
  // Use latest data structure
} else {
  // Handle older version
}
```

### Custom Metadata

Use metadata to track custom data:

```typescript
// When creating checkout
const session = await stripe.checkout.sessions.create({
  metadata: {
    bookingId: 'book_123',
    userId: 'user_456',
    workspaceId: 'workspace_789',
    source: 'web',
    campaignId: 'summer2025',
  },
})

// In webhook
const metadata = session.metadata
// Use metadata to enrich your analytics
```

---

## Checklist

### Development
- [ ] Stripe CLI installed
- [ ] Webhook secret in `.env.local`
- [ ] Test events trigger correctly
- [ ] Local endpoint responds with 200

### Production
- [ ] Webhook endpoint created in Stripe dashboard
- [ ] Correct events selected
- [ ] Webhook secret added to Vercel environment
- [ ] Endpoint URL uses HTTPS
- [ ] Signature verification implemented
- [ ] Idempotency handling added
- [ ] Error handling and logging in place
- [ ] Test webhook sent successfully
- [ ] Real payment test completed
- [ ] Monitoring and alerts configured

---

## Additional Resources

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Webhook Event Reference](https://stripe.com/docs/api/events/types)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)

---

**Last Updated**: 2025-09-29
**Version**: 1.0.0