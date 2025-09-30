# CitizenSpace Payment Processing Architecture

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Next.js Frontend)                    │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Booking    │  │ Membership   │  │   Stripe     │             │
│  │   Page       │  │   Page       │  │  Elements    │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
└─────────┼──────────────────┼──────────────────┼────────────────────┘
          │                  │                  │
          │ JWT Token        │ JWT Token        │ Client Secret
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API ROUTES (Next.js Backend)                      │
│                                                                      │
│  ┌───────────────────┐  ┌───────────────────┐  ┌──────────────┐   │
│  │ /api/payments/    │  │ /api/memberships/ │  │ /api/webhooks│   │
│  │                   │  │                   │  │   /stripe     │   │
│  │ • create-intent   │  │ • subscribe       │  │              │   │
│  │ • refund          │  │ • subscription    │  │ (POST)       │   │
│  └────────┬──────────┘  └────────┬──────────┘  └──────▲───────┘   │
│           │                      │                     │            │
│           │ Auth Middleware      │                     │            │
│           ▼                      ▼                     │            │
│  ┌──────────────────────────────────────┐             │            │
│  │     Authentication Service           │             │            │
│  │     • JWT Verification               │             │            │
│  │     • User Context                   │             │            │
│  └──────────────────────────────────────┘             │            │
│                                                        │            │
└────────────────────────────────────────────────────────┼────────────┘
                            │                            │
                            │                            │ Webhook Events
                            ▼                            │
┌─────────────────────────────────────────────────────────────────────┐
│                      STRIPE INTEGRATION LAYER                        │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  Stripe Config   │  │  Stripe Utils    │  │ Webhook Handlers │ │
│  │                  │  │                  │  │                  │ │
│  │ • Client Setup   │  │ • Customer Mgmt  │  │ • Payment Events │ │
│  │ • Amount Utils   │  │ • Payment Intent │  │ • Sub Events     │ │
│  │ • Constants      │  │ • Subscriptions  │  │ • Credit Alloc   │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                      │
└────────────────────────────┬─────────────────────────────────────────┘
                            │
                            │ Create/Update/Query
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA LAYER (PostgreSQL)                         │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ Booking Repo     │  │ User Queries     │  │ Credit Queries   │ │
│  │                  │  │                  │  │                  │ │
│  │ • getBookingById │  │ • getUserWithMem │  │ • allocateCredits│ │
│  │ • updateBooking  │  │ • updateUser     │  │ • getUserCredits │ │
│  │ • updatePayment  │  │ • createCustomer │  │ • deductCredits  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                        Database Tables                        │  │
│  │                                                               │  │
│  │  users                    bookings           membership_credits│
│  │  • stripe_customer_id     • payment_status   • credit_type    │
│  │  • stripe_subscription_id • payment_intent_id• allocated      │
│  │  • membership_plan_id     • total_price      • remaining      │
│  │  • nft_holder             • status           • cycle_dates    │
│  │                                                               │  │
│  │  membership_plans         credit_transactions                 │
│  │  • stripe_price_id        • transaction_type                  │
│  │  • price                  • amount                            │
│  │  • nft_holder_price       • description                       │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

                            ▲
                            │
                            │ Events & Confirmations
                            │
┌─────────────────────────────────────────────────────────────────────┐
│                          STRIPE API                                  │
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │ Payment Intents  │  │  Subscriptions   │  │    Webhooks      │ │
│  │ • Create         │  │  • Create        │  │  • Send Events   │ │
│  │ • Confirm        │  │  • Update        │  │  • Retry Failed  │ │
│  │ • Refund         │  │  • Cancel        │  │  • Sign Events   │ │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Payment Flow Sequences

### 1. Booking Payment Flow

```
User                Frontend            API                 Stripe            Database
 │                     │                 │                    │                  │
 │ 1. Create Booking   │                 │                    │                  │
 ├────────────────────>│                 │                    │                  │
 │                     │ 2. POST /api/   │                    │                  │
 │                     │  bookings       │                    │                  │
 │                     ├────────────────>│                    │                  │
 │                     │                 │ 3. Insert Booking  │                  │
 │                     │                 ├───────────────────────────────────────>│
 │                     │                 │                    │                  │
 │                     │ 4. Booking ID   │                    │                  │
 │                     │<────────────────┤                    │                  │
 │                     │                 │                    │                  │
 │ 5. Initiate Payment │                 │                    │                  │
 ├────────────────────>│                 │                    │                  │
 │                     │ 6. POST /api/   │                    │                  │
 │                     │  payments/      │                    │                  │
 │                     │  create-intent  │                    │                  │
 │                     ├────────────────>│                    │                  │
 │                     │                 │ 7. Verify Booking  │                  │
 │                     │                 ├───────────────────────────────────────>│
 │                     │                 │                    │                  │
 │                     │                 │ 8. Create Customer │                  │
 │                     │                 ├───────────────────>│                  │
 │                     │                 │                    │                  │
 │                     │                 │ 9. Create Payment  │                  │
 │                     │                 │    Intent          │                  │
 │                     │                 ├───────────────────>│                  │
 │                     │                 │                    │                  │
 │                     │                 │ 10. Client Secret  │                  │
 │                     │                 │<───────────────────┤                  │
 │                     │                 │                    │                  │
 │                     │ 11. Client Sec  │                    │                  │
 │                     │<────────────────┤                    │                  │
 │                     │                 │                    │                  │
 │ 12. Show Payment UI │                 │                    │                  │
 │<────────────────────┤                 │                    │                  │
 │                     │                 │                    │                  │
 │ 13. Enter Card Info │                 │                    │                  │
 ├────────────────────>│                 │                    │                  │
 │                     │ 14. Confirm     │                    │                  │
 │                     │     Payment     │                    │                  │
 │                     ├────────────────────────────────────>│                  │
 │                     │                 │                    │                  │
 │                     │                 │ 15. Process Payment│                  │
 │                     │                 │                    │ (Stripe Network) │
 │                     │                 │                    │                  │
 │                     │                 │ 16. payment_intent │                  │
 │                     │                 │    .succeeded      │                  │
 │                     │                 │<───────────────────┤                  │
 │                     │                 │                    │                  │
 │                     │                 │ 17. Update Booking │                  │
 │                     │                 │     status=confirmed│                 │
 │                     │                 │     payment=paid   │                  │
 │                     │                 ├───────────────────────────────────────>│
 │                     │                 │                    │                  │
 │ 18. Success Message │                 │                    │                  │
 │<────────────────────┤                 │                    │                  │
```

### 2. Subscription Creation Flow

```
User                Frontend            API                 Stripe            Database
 │                     │                 │                    │                  │
 │ 1. Select Plan      │                 │                    │                  │
 ├────────────────────>│                 │                    │                  │
 │                     │ 2. POST /api/   │                    │                  │
 │                     │  memberships/   │                    │                  │
 │                     │  subscribe      │                    │                  │
 │                     ├────────────────>│                    │                  │
 │                     │                 │ 3. Get Plan        │                  │
 │                     │                 ├───────────────────────────────────────>│
 │                     │                 │                    │                  │
 │                     │                 │ 4. Create/Get      │                  │
 │                     │                 │    Customer        │                  │
 │                     │                 ├───────────────────>│                  │
 │                     │                 │                    │                  │
 │                     │                 │ 5. Create          │                  │
 │                     │                 │    Subscription    │                  │
 │                     │                 ├───────────────────>│                  │
 │                     │                 │                    │                  │
 │                     │                 │ 6. Subscription ID │                  │
 │                     │                 │<───────────────────┤                  │
 │                     │                 │                    │                  │
 │                     │ 7. Client Secret│                    │                  │
 │                     │<────────────────┤                    │                  │
 │                     │                 │                    │                  │
 │ 8. Payment UI       │                 │                    │                  │
 │<────────────────────┤                 │                    │                  │
 │                     │                 │                    │                  │
 │ 9. Confirm Payment  │                 │                    │                  │
 ├────────────────────────────────────────────────────────>│                  │
 │                     │                 │                    │                  │
 │                     │                 │ 10. customer.      │                  │
 │                     │                 │     subscription   │                  │
 │                     │                 │     .created       │                  │
 │                     │                 │<───────────────────┤                  │
 │                     │                 │                    │                  │
 │                     │                 │ 11. Update User    │                  │
 │                     │                 │     membership     │                  │
 │                     │                 ├───────────────────────────────────────>│
 │                     │                 │                    │                  │
 │                     │                 │ 12. Allocate       │                  │
 │                     │                 │     Credits        │                  │
 │                     │                 ├───────────────────────────────────────>│
 │                     │                 │                    │                  │
 │ 13. Success Message │                 │                    │                  │
 │<────────────────────┤                 │                    │                  │
```

### 3. Webhook Processing Flow

```
Stripe              Webhook Endpoint         Handlers              Database
 │                        │                     │                      │
 │ 1. Event Occurred      │                     │                      │
 │   (payment success)    │                     │                      │
 │                        │                     │                      │
 │ 2. POST /api/webhooks/ │                     │                      │
 │    stripe              │                     │                      │
 ├───────────────────────>│                     │                      │
 │                        │                     │                      │
 │                        │ 3. Get Signature    │                      │
 │                        │    from Headers     │                      │
 │                        │                     │                      │
 │                        │ 4. Verify Signature │                      │
 │                        │    with Secret      │                      │
 │                        │                     │                      │
 │                        │ 5. Parse Event      │                      │
 │                        │                     │                      │
 │                        │ 6. Route to Handler │                      │
 │                        ├────────────────────>│                      │
 │                        │                     │                      │
 │                        │                     │ 7. Process Event     │
 │                        │                     │    (update booking,  │
 │                        │                     │     allocate credits)│
 │                        │                     ├─────────────────────>│
 │                        │                     │                      │
 │                        │                     │ 8. Send Email        │
 │                        │                     │    (if configured)   │
 │                        │                     │                      │
 │                        │ 9. Return Result    │                      │
 │                        │<────────────────────┤                      │
 │                        │                     │                      │
 │ 10. 200 OK             │                     │                      │
 │<───────────────────────┤                     │                      │
 │                        │                     │                      │
 │ 11. Mark Delivered     │                     │                      │
```

## Key Components

### 1. Stripe Configuration (`/lib/stripe/config.ts`)
- Singleton Stripe client
- Environment variable validation
- Amount conversion utilities
- Processing fee calculations
- Configuration constants

### 2. Stripe Utilities (`/lib/stripe/utils.ts`)
- Customer management
- Payment intent creation
- Subscription lifecycle
- Refund processing
- Webhook event construction

### 3. Webhook Handlers (`/lib/stripe/webhook-handlers.ts`)
- Payment event processing
- Subscription event processing
- Credit allocation logic
- Database updates
- Email notifications (hooks)

### 4. API Endpoints
- `/api/payments/create-intent` - Create payment for booking
- `/api/payments/refund` - Process refund
- `/api/memberships/subscribe` - Create subscription
- `/api/memberships/subscription` - Manage subscription
- `/api/webhooks/stripe` - Receive Stripe events

### 5. Database Repositories
- Booking repository (existing)
- User queries (existing)
- Credit management (new)

## Security Layers

```
┌──────────────────────────────────────────────────────┐
│ Layer 1: HTTPS/TLS Encryption                       │
│ • All traffic encrypted                              │
│ • SSL/TLS certificates                               │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│ Layer 2: Authentication                              │
│ • JWT token validation                               │
│ • User identity verification                         │
│ • Session management                                 │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│ Layer 3: Authorization                               │
│ • Booking ownership checks                           │
│ • Role-based access (admin/staff)                    │
│ • Resource permissions                               │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│ Layer 4: Input Validation                            │
│ • Zod schema validation                              │
│ • UUID format checking                               │
│ • Amount validation                                  │
│ • Status verification                                │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│ Layer 5: Stripe Security                             │
│ • Webhook signature verification                     │
│ • Server-side amount validation                      │
│ • PCI compliance via Stripe                          │
│ • Customer tokenization                              │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│ Layer 6: Database Security                           │
│ • Parameterized queries                              │
│ • SQL injection prevention                           │
│ • Data encryption at rest                            │
│ • Access control                                     │
└──────────────────────────────────────────────────────┘
```

## Error Handling Strategy

```
Error Occurs
     │
     ▼
┌─────────────────┐
│ Catch Exception │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│ Log Error       ├────>│ Console + Sentry │
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐
│ Determine Type  │
└────────┬────────┘
         │
         ├──> Validation Error ──> 400 Bad Request
         │
         ├──> Auth Error ───────> 401 Unauthorized
         │
         ├──> Permission Error ─> 403 Forbidden
         │
         ├──> Not Found ────────> 404 Not Found
         │
         ├──> Stripe API Error ─> 500 + Details
         │
         └──> Unknown Error ────> 500 Generic
                                      │
                                      ▼
                              ┌──────────────┐
                              │ Return JSON  │
                              │ Error Response│
                              └──────────────┘
```

## Monitoring & Observability

```
Application Metrics
        │
        ├──> Payment Success Rate
        │    • Track success/failure ratio
        │    • Alert on > 5% failure rate
        │
        ├──> Subscription Churn
        │    • Monitor cancellations
        │    • Track retention rate
        │
        ├──> Webhook Delivery
        │    • Monitor delivery success
        │    • Alert on failures
        │
        ├──> API Response Times
        │    • P50, P95, P99 latency
        │    • Alert on > 2s P95
        │
        ├──> Error Rates
        │    • Track by endpoint
        │    • Alert on > 1% error rate
        │
        └──> Database Performance
             • Query execution time
             • Connection pool usage
```

---

**Last Updated**: 2025-09-29
**Version**: 1.0.0