# Stripe Integration Setup Guide

This guide provides step-by-step instructions for setting up Stripe payment processing in the CitizenSpace application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Stripe Account Setup](#stripe-account-setup)
3. [Environment Configuration](#environment-configuration)
4. [Webhook Configuration](#webhook-configuration)
5. [Creating Products and Prices](#creating-products-and-prices)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)

---

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Access to your Stripe Dashboard
- Development and production environments ready

---

## Stripe Account Setup

### 1. Create a Stripe Account

1. Visit https://stripe.com and sign up for an account
2. Complete the onboarding process
3. Verify your email address
4. Complete your business profile

### 2. Get API Keys

1. Navigate to **Developers > API keys** in your Stripe Dashboard
2. Copy your **Publishable key** (starts with `pk_test_` for test mode)
3. Copy your **Secret key** (starts with `sk_test_` for test mode)
4. Store these securely - never commit them to version control

---

## Environment Configuration

### 1. Update `.env.local`

Add the following environment variables to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (you'll create these in the next step)
STRIPE_PRICE_ID_HOT_DESK_HOURLY=price_your_hot_desk_price_id
STRIPE_PRICE_ID_MEMBERSHIP_BASIC=price_your_basic_membership_price_id
STRIPE_PRICE_ID_MEMBERSHIP_PREMIUM=price_your_premium_membership_price_id
STRIPE_PRICE_ID_MEMBERSHIP_ENTERPRISE=price_your_enterprise_membership_price_id
```

### 2. Verify Configuration

Run your development server to verify the configuration:

```bash
npm run dev
```

Check the console for any errors related to missing environment variables.

---

## Webhook Configuration

Webhooks allow Stripe to notify your application of events like successful payments or subscription updates.

### 1. Local Development with Stripe CLI

For local testing, use the Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to your Stripe account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret (starts with whsec_)
# Add it to your .env.local as STRIPE_WEBHOOK_SECRET
```

### 2. Production Webhook Setup

1. Go to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL: `https://your-domain.com/api/webhooks/stripe`
4. Select the following events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `charge.refunded`
5. Copy the **Signing secret** and add it to your production environment variables

---

## Creating Products and Prices

### 1. Hot Desk Hourly Booking

1. Navigate to **Products** in Stripe Dashboard
2. Click **Add product**
3. Fill in details:
   - **Name**: Hot Desk Hourly
   - **Description**: Hourly hot desk booking
   - **Pricing**: One-time payment
   - **Price**: $15.00 (or your desired amount)
   - **Currency**: USD
4. Click **Save product**
5. Copy the **Price ID** (starts with `price_`) and add to `.env.local` as `STRIPE_PRICE_ID_HOT_DESK_HOURLY`

### 2. Membership Plans

Create three membership products:

#### Basic Membership

- **Name**: CitizenSpace Basic
- **Description**: Basic membership plan
- **Pricing**: Recurring (monthly)
- **Price**: $99.00/month
- **Features**: Add metadata for tracking
- Copy Price ID to `STRIPE_PRICE_ID_MEMBERSHIP_BASIC`

#### Premium Membership

- **Name**: CitizenSpace Premium
- **Description**: Premium membership plan
- **Pricing**: Recurring (monthly)
- **Price**: $199.00/month
- Copy Price ID to `STRIPE_PRICE_ID_MEMBERSHIP_PREMIUM`

#### Enterprise Membership

- **Name**: CitizenSpace Enterprise
- **Description**: Enterprise membership plan
- **Pricing**: Recurring (monthly)
- **Price**: $499.00/month
- Copy Price ID to `STRIPE_PRICE_ID_MEMBERSHIP_ENTERPRISE`

### 3. NFT Holder Pricing

For NFT holder discounts (50% off):

1. Create duplicate products with "_NFT" suffix
2. Set prices at 50% of regular price
3. Application logic will automatically apply correct pricing based on user's NFT holder status

---

## Testing

### 1. Test Card Numbers

Use Stripe's test card numbers for testing payments:

```
Successful payment: 4242 4242 4242 4242
Requires authentication: 4000 0025 0000 3155
Card declined: 4000 0000 0000 9995
Insufficient funds: 4000 0000 0000 9995

Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### 2. Test Payment Flow

```bash
# Start your development server
npm run dev

# In another terminal, start Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test the payment flow:
# 1. Create a booking
# 2. Navigate to payment page
# 3. Use test card 4242 4242 4242 4242
# 4. Complete payment
# 5. Verify booking status updates to "confirmed"
```

### 3. Test Subscription Flow

```bash
# Test subscription creation
curl -X POST http://localhost:3000/api/memberships/subscribe \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "membershipPlanId": "YOUR_PLAN_ID"
  }'

# Test subscription cancellation
curl -X DELETE http://localhost:3000/api/memberships/subscription \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "cancelImmediately": false
  }'
```

### 4. Run Automated Tests

```bash
# Run all tests
npm test

# Run payment-specific tests
npm test -- --testPathPattern=payments

# Run with coverage
npm run test:coverage
```

---

## Production Deployment

### 1. Switch to Live Mode

1. In Stripe Dashboard, toggle from **Test mode** to **Live mode**
2. Navigate to **Developers > API keys**
3. Copy your **Live** API keys (start with `pk_live_` and `sk_live_`)
4. Update your production environment variables

### 2. Production Environment Variables

```bash
# Production Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret

# Use LIVE Price IDs
STRIPE_PRICE_ID_HOT_DESK_HOURLY=price_live_hot_desk
STRIPE_PRICE_ID_MEMBERSHIP_BASIC=price_live_basic
STRIPE_PRICE_ID_MEMBERSHIP_PREMIUM=price_live_premium
STRIPE_PRICE_ID_MEMBERSHIP_ENTERPRISE=price_live_enterprise
```

### 3. Webhook Verification

1. Set up production webhook endpoint
2. Test webhook delivery using Stripe Dashboard
3. Monitor webhook logs for any failures
4. Set up alerts for failed webhooks

### 4. Monitoring

Set up monitoring for:

- Failed payments
- Failed webhooks
- Subscription churn
- Refund rates
- Processing errors

Use Stripe Dashboard's built-in analytics and consider integrating with:
- Sentry for error tracking
- DataDog or New Relic for performance monitoring
- Stripe's webhook monitoring tools

---

## API Endpoints Reference

### Payment Endpoints

#### Create Payment Intent
```
POST /api/payments/create-intent
Body: {
  bookingId: string
  amount: number
}
Response: {
  clientSecret: string
  paymentIntentId: string
}
```

#### Create Refund
```
POST /api/payments/refund
Body: {
  bookingId: string
  amount?: number
  reason?: string
}
Response: {
  refundId: string
  amount: number
  status: string
}
```

### Subscription Endpoints

#### Create Subscription
```
POST /api/memberships/subscribe
Body: {
  membershipPlanId: string
  trialPeriodDays?: number
}
Response: {
  subscriptionId: string
  clientSecret: string
  status: string
}
```

#### Update Subscription
```
PATCH /api/memberships/subscription
Body: {
  newPlanId?: string
  cancelAtPeriodEnd?: boolean
}
Response: {
  subscriptionId: string
  status: string
}
```

#### Cancel Subscription
```
DELETE /api/memberships/subscription
Body: {
  cancelImmediately?: boolean
}
Response: {
  subscriptionId: string
  status: string
  canceledAt: string
}
```

### Webhook Endpoint

```
POST /api/webhooks/stripe
Headers: {
  stripe-signature: string
}
Body: Stripe Event Object
```

---

## Troubleshooting

### Common Issues

#### 1. Webhook Signature Verification Failed

**Problem**: Webhooks are failing with signature verification errors

**Solution**:
- Verify `STRIPE_WEBHOOK_SECRET` is correctly set
- Ensure you're using the correct webhook secret for your environment
- Check that the request body is not being modified before verification

#### 2. Payment Intent Creation Failed

**Problem**: Cannot create payment intents

**Solution**:
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check that the amount is valid (positive integer in cents)
- Ensure customer exists in Stripe

#### 3. Subscription Not Creating

**Problem**: Subscription creation fails

**Solution**:
- Verify Price ID exists and is active
- Check that customer has a valid payment method
- Ensure metadata includes required fields

#### 4. Credits Not Allocated

**Problem**: Membership credits not showing after subscription

**Solution**:
- Check webhook logs for `customer.subscription.created` event
- Verify membership plan has credit configuration
- Check database for credit records

### Getting Help

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Support**: Available in Dashboard under Help
- **GitHub Issues**: Report bugs in project repository
- **Discord Community**: Join our developer community

---

## Security Best Practices

1. **Never expose secret keys**: Keep `STRIPE_SECRET_KEY` server-side only
2. **Verify webhook signatures**: Always validate webhook events
3. **Use HTTPS in production**: Required for PCI compliance
4. **Implement idempotency**: Use idempotency keys for critical operations
5. **Log all transactions**: Maintain audit logs for compliance
6. **Handle errors gracefully**: Never expose internal errors to users
7. **Rate limit endpoints**: Prevent abuse of payment endpoints
8. **Validate amounts**: Always validate payment amounts server-side
9. **Use customer IDs**: Store Stripe customer IDs for faster processing
10. **Monitor for fraud**: Set up Stripe Radar for fraud prevention

---

## Compliance

### PCI Compliance

CitizenSpace uses Stripe Elements/Checkout, which means:
- Card data never touches your servers
- Stripe handles PCI compliance
- You're responsible for SAQ-A compliance only

### Data Retention

- Store minimal payment data
- Reference Stripe objects by ID
- Follow GDPR requirements for user data
- Implement data deletion procedures

---

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Stripe Security Best Practices](https://stripe.com/docs/security/guide)
- [PCI Compliance Guide](https://stripe.com/docs/security/guide#pci-compliance)

---

**Last Updated**: 2025-09-29
**Version**: 1.0.0