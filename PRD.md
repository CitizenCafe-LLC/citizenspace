# CitizenSpace Backend API Requirements - Product Requirements Document (PRD)

## 🎯 Executive Summary

Your CitizenSpace main app is **100% frontend-only with hardcoded/mock data**. To make this a fully functional real application, you need to build a complete backend system with APIs, database, authentication, and payment processing.

---

## 🗄️ DATABASE SCHEMA REQUIREMENTS

### **1. Users & Authentication**
```sql
users
├── id (UUID, primary key)
├── email (string, unique)
├── password_hash (string)
├── full_name (string)
├── phone (string, nullable)
├── wallet_address (string, nullable, unique)
├── nft_holder (boolean, default: false)
├── nft_token_id (string, nullable)
├── membership_plan_id (FK to membership_plans)
├── membership_status (enum: active, paused, cancelled)
├── membership_start_date (timestamp)
├── membership_end_date (timestamp)
├── stripe_customer_id (string, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### **2. Workspaces**
```sql
workspaces
├── id (UUID, primary key)
├── name (string)
├── type (enum: hot-desk, focus-room, collaborate-room, boardroom, communications-pod)
├── resource_category (enum: desk, meeting-room) # NEW: distinguish desks from rooms
├── description (text)
├── capacity (integer)
├── base_price_hourly (decimal)
├── requires_credits (boolean) # NEW: if true, can use membership credits
├── min_duration (decimal)
├── max_duration (decimal)
├── amenities (jsonb)
├── images (jsonb array)
├── available (boolean)
├── floor_location (string)
└── created_at (timestamp)
```

### **3. Bookings/Reservations**
```sql
bookings
├── id (UUID, primary key)
├── user_id (FK to users)
├── workspace_id (FK to workspaces)
├── booking_type (enum: hourly-desk, meeting-room, day-pass) # NEW: categorize booking
├── booking_date (date)
├── start_time (time)
├── end_time (time)
├── duration_hours (decimal)
├── attendees (integer)
├── subtotal (decimal)
├── discount_amount (decimal)
├── nft_discount_applied (boolean)
├── credits_used (decimal, nullable) # NEW: meeting room credits deducted
├── credits_overage_hours (decimal, nullable) # NEW: hours beyond credits
├── overage_charge (decimal, nullable) # NEW: charge for overage hours
├── processing_fee (decimal)
├── total_price (decimal)
├── special_requests (text, nullable)
├── status (enum: pending, confirmed, cancelled, completed)
├── payment_status (enum: pending, paid, refunded)
├── payment_intent_id (string, stripe)
├── payment_method (enum: card, credits, membership) # NEW: how booking was paid
├── confirmation_code (string, unique)
├── check_in_time (timestamp, nullable)
├── check_out_time (timestamp, nullable)
├── actual_duration_hours (decimal, nullable) # NEW: track actual usage for hourly
├── final_charge (decimal, nullable) # NEW: final amount after actual usage
├── created_at (timestamp)
└── updated_at (timestamp)
```

### **4. Membership Plans**
```sql
membership_plans
├── id (UUID, primary key)
├── name (string)
├── slug (string, unique)
├── price (decimal)
├── nft_holder_price (decimal)
├── billing_period (enum: hourly, daily, monthly)
├── features (jsonb array)
├── limitations (jsonb array)
├── meeting_room_credits_hours (integer) # UPDATED: hours per billing cycle
├── printing_credits (integer)
├── cafe_discount_percentage (integer)
├── guest_passes_per_month (integer)
├── access_hours (string)
├── includes_hot_desk (boolean) # NEW: if true, hot desk included in membership
├── stripe_price_id (string)
├── active (boolean)
├── sort_order (integer)
└── created_at (timestamp)
```

### **4a. Membership Credits Ledger** (NEW TABLE)
```sql
membership_credits
├── id (UUID, primary key)
├── user_id (FK to users)
├── credit_type (enum: meeting-room, printing, guest-pass)
├── allocated_amount (decimal) # Credits allocated this cycle
├── used_amount (decimal) # Credits used
├── remaining_amount (decimal) # Credits remaining
├── billing_cycle_start (date)
├── billing_cycle_end (date)
├── status (enum: active, expired, rolled-over)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### **4b. Credit Transactions** (NEW TABLE)
```sql
credit_transactions
├── id (UUID, primary key)
├── user_id (FK to users)
├── membership_credit_id (FK to membership_credits)
├── booking_id (FK to bookings, nullable)
├── transaction_type (enum: allocation, usage, refund, expiration)
├── amount (decimal) # Positive for allocation, negative for usage
├── balance_after (decimal)
├── description (text)
├── created_at (timestamp)
└── metadata (jsonb) # Additional context
```

### **5. Menu Items (Cafe)**
```sql
menu_items
├── id (UUID, primary key)
├── name (string)
├── slug (string, unique)
├── description (text)
├── price (decimal)
├── nft_holder_price (decimal)
├── category (enum: coffee, tea, pastries, meals)
├── dietary_tags (jsonb array)
├── image_url (string, nullable)
├── available (boolean)
├── featured (boolean)
├── orderable (boolean)
├── sort_order (integer)
└── created_at (timestamp)
```

### **6. Cafe Orders**
```sql
cafe_orders
├── id (UUID, primary key)
├── user_id (FK to users)
├── order_number (string, unique)
├── items (jsonb array) // [{menu_item_id, quantity, price, customizations}]
├── subtotal (decimal)
├── nft_discount_applied (boolean)
├── discount_amount (decimal)
├── tax (decimal)
├── total (decimal)
├── status (enum: pending, preparing, ready, completed, cancelled)
├── payment_status (enum: pending, paid, refunded)
├── payment_intent_id (string)
├── order_type (enum: dine-in, takeout)
├── special_instructions (text, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### **7. Events**
```sql
events
├── id (UUID, primary key)
├── title (string)
├── slug (string, unique)
├── description (text)
├── event_date (date)
├── start_time (time)
├── end_time (time)
├── location (string)
├── host_name (string)
├── host_organization (string, nullable)
├── capacity (integer)
├── price (decimal)
├── image_url (string, nullable)
├── tags (jsonb array)
├── external_rsvp_url (string, nullable)
├── event_type (enum: workshop, networking, tech-talk, experience)
├── status (enum: upcoming, in-progress, completed, cancelled)
└── created_at (timestamp)

event_rsvps
├── id (UUID, primary key)
├── event_id (FK to events)
├── user_id (FK to users)
├── attendees_count (integer)
├── payment_status (enum: pending, paid, refunded)
├── payment_intent_id (string, nullable)
├── confirmation_code (string, unique)
├── status (enum: confirmed, cancelled, waitlist)
└── created_at (timestamp)
```

### **8. Blog/CMS**
```sql
blog_posts
├── id (UUID, primary key)
├── title (string)
├── slug (string, unique)
├── excerpt (text)
├── content (text)
├── author_id (FK to users)
├── featured_image_url (string, nullable)
├── tags (jsonb array)
├── reading_time_minutes (integer)
├── status (enum: draft, published, archived)
├── published_at (timestamp, nullable)
├── views_count (integer, default: 0)
├── created_at (timestamp)
└── updated_at (timestamp)

blog_categories
├── id (UUID, primary key)
├── name (string)
├── slug (string, unique)
├── description (text)
└── post_count (integer)
```

### **9. Contact Form Submissions**
```sql
contact_submissions
├── id (UUID, primary key)
├── name (string)
├── email (string)
├── topic (enum: general, tour, membership, events, partnership, press)
├── message (text)
├── status (enum: new, in-progress, resolved, spam)
├── assigned_to (FK to users, nullable)
├── notes (text, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### **10. Newsletter Subscribers**
```sql
newsletter_subscribers
├── id (UUID, primary key)
├── email (string, unique)
├── status (enum: active, unsubscribed, bounced)
├── subscribed_at (timestamp)
├── unsubscribed_at (timestamp, nullable)
└── source (string) // "blog", "homepage", "footer"
```

---

## 🔌 REQUIRED API ENDPOINTS

### **Authentication & User Management**
```
POST   /api/auth/register          # User registration
POST   /api/auth/login             # User login
POST   /api/auth/logout            # User logout
POST   /api/auth/refresh           # Refresh JWT token
POST   /api/auth/forgot-password   # Password reset request
POST   /api/auth/reset-password    # Password reset
GET    /api/auth/me                # Get current user
PUT    /api/auth/me                # Update current user
POST   /api/auth/wallet-connect    # Connect Web3 wallet
GET    /api/auth/verify-nft        # Verify NFT ownership
```

### **Bookings & Reservations**
```
GET    /api/workspaces                           # List all workspaces
GET    /api/workspaces/:id                       # Get workspace details
GET    /api/workspaces/availability              # Check availability by date/time
GET    /api/workspaces/hot-desks                 # List available hot desks (NEW)
GET    /api/workspaces/meeting-rooms             # List meeting rooms (NEW)

POST   /api/bookings                             # Create booking
POST   /api/bookings/hourly-desk                 # Book hourly desk (NEW)
POST   /api/bookings/meeting-room                # Book meeting room with credits (NEW)
GET    /api/bookings                             # List user's bookings
GET    /api/bookings/active                      # Get currently active booking (NEW)
GET    /api/bookings/:id                         # Get booking details
PUT    /api/bookings/:id                         # Update booking
DELETE /api/bookings/:id                         # Cancel booking
POST   /api/bookings/:id/check-in                # Check in to booking
POST   /api/bookings/:id/check-out               # Check out from booking
POST   /api/bookings/:id/extend                  # Extend hourly booking (NEW)
GET    /api/bookings/:id/receipt                 # Get booking receipt
GET    /api/bookings/:id/calculate-cost          # Calculate final cost for hourly (NEW)
```

### **Membership Plans & Credits**
```
GET    /api/memberships                          # List all plans
GET    /api/memberships/:id                      # Get plan details
POST   /api/memberships/subscribe                # Subscribe to plan
PUT    /api/memberships/current                  # Update subscription
POST   /api/memberships/pause                    # Pause membership
POST   /api/memberships/cancel                   # Cancel membership
GET    /api/memberships/current                  # Get user's current membership

# NEW ENDPOINTS: Credit Management
GET    /api/memberships/credits                  # Get credit balances (meeting-room, printing, etc)
GET    /api/memberships/credits/meeting-rooms    # Get meeting room credits remaining
GET    /api/memberships/credits/transactions     # Get credit transaction history
POST   /api/memberships/credits/allocate         # Allocate credits (monthly cycle, admin)
```

### **Cafe Menu & Orders**
```
GET    /api/menu                                 # Get full menu
GET    /api/menu/:category                       # Get menu by category
GET    /api/menu/items/:id                       # Get item details
POST   /api/orders                               # Create cafe order
GET    /api/orders                               # List user's orders
GET    /api/orders/:id                           # Get order details
PUT    /api/orders/:id/status                    # Update order status (staff only)
DELETE /api/orders/:id                           # Cancel order
```

### **Events**
```
GET    /api/events                               # List all events
GET    /api/events/:slug                         # Get event details
POST   /api/events/:id/rsvp                      # RSVP to event
GET    /api/events/my-rsvps                      # Get user's RSVPs
DELETE /api/events/:id/rsvp                      # Cancel RSVP
GET    /api/events/:id/attendees                 # List event attendees (host only)
```

### **Blog/Content**
```
GET    /api/blog/posts                           # List all posts
GET    /api/blog/posts/:slug                     # Get single post
GET    /api/blog/categories                      # List categories
GET    /api/blog/categories/:slug                # Get category posts
GET    /api/blog/search?q=                       # Search posts
POST   /api/blog/posts/:id/view                  # Increment view count
```

### **Contact & Communication**
```
POST   /api/contact                              # Submit contact form
POST   /api/newsletter/subscribe                 # Subscribe to newsletter
POST   /api/newsletter/unsubscribe               # Unsubscribe
```

### **Payments (Stripe)**
```
POST   /api/payments/create-intent               # Create payment intent
POST   /api/payments/webhook                     # Stripe webhook handler
GET    /api/payments/history                     # Get payment history
```

### **Admin APIs (Staff Only)**
```
GET    /api/admin/dashboard                      # Dashboard stats
GET    /api/admin/bookings                       # All bookings
GET    /api/admin/users                          # All users
PUT    /api/admin/users/:id                      # Update user
GET    /api/admin/orders                         # All orders
POST   /api/admin/menu/items                     # Create menu item
PUT    /api/admin/menu/items/:id                 # Update menu item
DELETE /api/admin/menu/items/:id                 # Delete menu item
```

---

## 🔐 AUTHENTICATION SYSTEM REQUIREMENTS

1. **JWT-based authentication** with access & refresh tokens
2. **Session management** with Supabase Auth or custom implementation
3. **Web3 wallet integration** (WalletConnect/RainbowKit) to verify NFT ownership
4. **Role-based access control (RBAC)**:
   - Guest (unauthenticated)
   - Member (authenticated user)
   - NFT Holder (verified NFT ownership)
   - Staff (admin access)
5. **NFT verification system**:
   - Check wallet address against smart contract
   - Verify token ownership via blockchain query
   - Cache verification results
   - Auto-apply 50% workspace discount & 10% cafe discount

---

## 💳 PAYMENT PROCESSING REQUIREMENTS

### **Stripe Integration**
1. **Checkout Sessions** for bookings & memberships
2. **Payment Intents** for cafe orders
3. **Webhook handling** for:
   - `payment_intent.succeeded`
   - `payment_intent.failed`
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. **Refund handling** for cancelled bookings
5. **Subscription management** for monthly memberships

### **Pricing Logic**
```typescript
// NFT holder discount calculation
if (user.nft_holder) {
  workspacePrice = basePrice * 0.5; // 50% off
  cafePrice = basePrice * 0.9;      // 10% off
}
```

---

## 📊 REAL-TIME FEATURES NEEDED

1. **Live workspace availability** (check bookings in real-time)
2. **Order status updates** (cafe orders: preparing → ready)
3. **Seat occupancy tracking** (how many seats available now)
4. **Event capacity tracking** (spots remaining)
5. **Notification system**:
   - Booking confirmations
   - Order ready notifications
   - Event reminders

---

## 🔄 DATA MIGRATION FROM MOCK TO REAL

Currently hardcoded in `/lib/data.ts`:
- ✅ Membership plans → needs to move to database
- ✅ Menu items → needs to move to database
- ✅ Events → needs to move to database
- ✅ Site settings → needs admin CMS
- ✅ Workspace options (in booking page) → needs database

---

## 🛠️ TECHNOLOGY STACK RECOMMENDATIONS

### **Backend Framework**
- **Option 1:** Next.js API Routes (already using Next.js)
- **Option 2:** Separate Node.js/Express backend
- **Option 3:** Serverless (Vercel Functions, AWS Lambda)

### **Database**
- **PostgreSQL** (recommended) via Supabase or Neon
- Already have `@supabase/supabase-js` in dependencies

### **Authentication**
- **Supabase Auth** (built-in)
- **NextAuth.js** (alternative)
- **Custom JWT** implementation

### **Web3 Integration**
- Already have RainbowKit/Wagmi in NFT site
- Needs integration into main app for wallet connect
- Use Viem/Ethers to query blockchain for NFT ownership

### **Payment Processing**
- **Stripe** (standard for SaaS)
- `stripe` npm package
- Stripe Checkout for bookings
- Payment Intents for cafe orders

### **File Storage**
- **Cloudinary** or **S3** for images (menu, events, blog)

### **Email Service**
- **Resend**, **SendGrid**, or **Postmark** for transactional emails

---

## 📝 IMPLEMENTATION PRIORITY ORDER

### **Phase 1: Core Backend (Weeks 1-2)**
1. Set up Supabase database with schema
2. Create authentication system
3. Build booking system APIs
4. Integrate Stripe payments

### **Phase 2: Cafe & Membership (Week 3)**
5. Menu management & ordering APIs
6. Membership subscription flow
7. NFT verification system

### **Phase 3: Events & Content (Week 4)**
8. Events RSVP system
9. Blog CMS integration
10. Contact form backend

### **Phase 4: Admin & Polish (Week 5)**
11. Admin dashboard
12. Real-time features
13. Email notifications
14. Testing & deployment

---

## 🚨 CRITICAL GAPS IN CURRENT CODE

1. **NO DATABASE** - Everything is mock data
2. **NO API LAYER** - All interactions are client-side only
3. **NO PAYMENT PROCESSING** - Stripe not integrated
4. **NO USER ACCOUNTS** - No login/registration
5. **NO NFT VERIFICATION** - Can't check wallet ownership
6. **NO BOOKING CONFIRMATION** - Just console.log()
7. **NO ORDER PROCESSING** - Cafe orders don't go anywhere
8. **NO ADMIN PANEL** - Can't manage content
9. **NO EMAIL SYSTEM** - No confirmations sent
10. **NO AVAILABILITY CHECKING** - Can book overlapping times

---

## 🎯 SUCCESS METRICS

### **Technical Metrics**
- ✅ All API endpoints return real data from database
- ✅ Authentication system allows login/registration
- ✅ NFT holders see discounted prices automatically
- ✅ Stripe payments process successfully
- ✅ Bookings prevent double-booking
- ✅ Cafe orders trigger notifications
- ✅ Admin can manage content via CMS

### **Business Metrics**
- Track booking conversion rate
- Monitor NFT holder adoption
- Measure cafe order frequency
- Event RSVP rates
- Newsletter signup rate

---

## 📋 NEXT STEPS

1. **Choose Database Provider** (Supabase recommended)
2. **Set up development environment**
3. **Create database schema**
4. **Build authentication system**
5. **Implement booking APIs**
6. **Integrate Stripe payments**
7. **Add NFT verification**
8. **Build admin dashboard**
9. **Deploy to production**

---

## 🎫 BOOKING LOGIC & BUSINESS RULES

### **Scenario 1: Hourly Hot Desk Rental (Pay-as-you-go)**

**Use Case:** User without membership wants to rent a desk for 3 hours

**Flow:**
1. User selects "Hot Desk" and duration (3 hours)
2. System checks availability in real-time
3. System calculates price:
   ```typescript
   basePrice = 2.50 per hour
   duration = 3 hours
   subtotal = basePrice * duration = $7.50

   if (user.nft_holder) {
     discount = subtotal * 0.50 = $3.75
     subtotal = $3.75
   }

   processingFee = $2.00
   total = subtotal + processingFee
   ```
4. User pays upfront via Stripe
5. Booking created with `booking_type: 'hourly-desk'`
6. User checks in → `check_in_time` recorded
7. User checks out → `check_out_time` recorded
8. System calculates `actual_duration_hours`
9. If actual < booked: Partial refund
10. If actual > booked: Charge overage

**Database Updates:**
- Insert into `bookings` with `payment_method: 'card'`
- No credit deduction (user has no membership)

---

### **Scenario 2: Meeting Room with Membership Credits**

**Use Case:** Member with "Resident" plan (8 hours/month credits) books 2-hour meeting room

**Flow:**
1. User selects "Focus Room" for 2 hours
2. System checks user's credit balance:
   ```sql
   SELECT remaining_amount
   FROM membership_credits
   WHERE user_id = ?
     AND credit_type = 'meeting-room'
     AND status = 'active'
   ```
3. User has 8 hours available
4. System deducts 2 hours from credits:
   ```typescript
   creditsUsed = 2 hours
   creditsRemaining = 8 - 2 = 6 hours
   totalPrice = $0 (covered by credits)
   ```
5. Booking created with:
   - `booking_type: 'meeting-room'`
   - `payment_method: 'credits'`
   - `credits_used: 2`
   - `total_price: 0`

**Database Updates:**
- Insert into `bookings`
- Update `membership_credits.used_amount` = 2
- Update `membership_credits.remaining_amount` = 6
- Insert into `credit_transactions`:
  ```sql
  {
    transaction_type: 'usage',
    amount: -2,
    balance_after: 6,
    description: 'Meeting room booking - Focus Room'
  }
  ```

---

### **Scenario 3: Meeting Room - Credits Exceeded (Overage)**

**Use Case:** Member with 2 hours remaining wants to book 4-hour meeting

**Flow:**
1. User selects "Boardroom" for 4 hours
2. System checks credits: only 2 hours remaining
3. System calculates overage:
   ```typescript
   requestedHours = 4
   availableCredits = 2
   overageHours = 4 - 2 = 2

   creditsUsed = 2 (use all remaining)
   overageCharge = overageHours * basePrice * (nft_holder ? 0.5 : 1)

   // Example: Boardroom = $60/hr base
   if (user.nft_holder) {
     overageCharge = 2 * 60 * 0.5 = $60
   } else {
     overageCharge = 2 * 60 = $120
   }

   processingFee = $2
   totalPrice = overageCharge + processingFee
   ```
4. User pays overage via Stripe
5. Booking created with:
   - `credits_used: 2`
   - `credits_overage_hours: 2`
   - `overage_charge: $60`
   - `total_price: $62`

**Database Updates:**
- Insert into `bookings`
- Update `membership_credits` to use remaining 2 hours
- Insert credit transaction for usage
- Process Stripe payment for overage

---

### **Scenario 4: Day Pass User**

**Use Case:** User purchased $25 day pass (includes hot desk access)

**Flow:**
1. User buys day pass → Creates entry in `bookings` table:
   ```sql
   {
     booking_type: 'day-pass',
     booking_date: '2025-09-30',
     payment_method: 'card',
     total_price: 25.00,
     status: 'confirmed'
   }
   ```
2. User can work at any hot desk all day (no additional charge)
3. If user wants meeting room:
   - Day pass holders have NO credits
   - Must pay full hourly rate
   - Apply NFT discount if applicable

---

### **Scenario 5: Monthly Member with Hot Desk Included**

**Use Case:** "Cafe Membership" ($150/mo) includes hot desk 9am-5pm

**Flow:**
1. User with active membership doesn't need to "book" hot desk
2. User checks in via app → System verifies:
   ```typescript
   if (user.membership_status === 'active' &&
       user.membership_plan.includes_hot_desk &&
       currentTime within accessHours) {
     // Allow access
     createBooking({
       booking_type: 'hourly-desk',
       payment_method: 'membership',
       total_price: 0,
       status: 'confirmed'
     })
   }
   ```
3. No charge - included in monthly fee
4. If user needs meeting room → use credits or pay overage

---

## 📊 PRICING CALCULATION LOGIC

### **Hot Desk Pricing Matrix**

| User Type | Base Rate | NFT Holder Rate | Payment Method |
|-----------|-----------|-----------------|----------------|
| Walk-in (no membership) | $2.50/hr | $1.25/hr | Card (upfront) |
| Day Pass Holder | $0 (included) | $0 (included) | Already paid |
| Monthly Member (with hot desk access) | $0 (included) | $0 (included) | Monthly subscription |
| Monthly Member (no hot desk access) | $2.50/hr | $1.25/hr | Card |

### **Meeting Room Pricing Matrix**

| Room Type | Base Rate | With Credits | Overage Rate | NFT Overage |
|-----------|-----------|--------------|--------------|-------------|
| Focus Room (2-4 ppl) | $25/hr | Free (if credits available) | $25/hr | $12.50/hr |
| Collaborate Room (4-6 ppl) | $40/hr | Free (if credits available) | $40/hr | $20/hr |
| Boardroom (6-8 ppl) | $60/hr | Free (if credits available) | $60/hr | $30/hr |
| Communications Pod | $5/hr | Free (if credits available) | $5/hr | $2.50/hr |

### **Credit Allocation Schedule**

Monthly members receive credits on their billing cycle:
```typescript
// On subscription renewal:
async function allocateMonthlyCredits(user) {
  const plan = user.membership_plan;

  // Create new credit allocation
  await createMembershipCredit({
    user_id: user.id,
    credit_type: 'meeting-room',
    allocated_amount: plan.meeting_room_credits_hours,
    used_amount: 0,
    remaining_amount: plan.meeting_room_credits_hours,
    billing_cycle_start: today,
    billing_cycle_end: addMonths(today, 1),
    status: 'active'
  });

  // Expire previous cycle
  await expireOldCredits(user.id);
}
```

---

## 🔄 CREDIT ROLLOVER POLICY

**Default Behavior:** Credits DO NOT roll over
- Unused credits expire at end of billing cycle
- New credits allocated on renewal

**Premium Option (Future):** Allow rollover for premium plans
- Max 1 month rollover
- Capped at 2x monthly allocation

---

## ✅ BOOKING VALIDATION RULES

### **Hot Desk Booking**
```typescript
function validateHotDeskBooking(request) {
  // 1. Check desk availability
  const isAvailable = await checkAvailability(
    request.workspace_id,
    request.date,
    request.start_time,
    request.end_time
  );

  // 2. Validate user access
  if (user.membership_plan?.includes_hot_desk) {
    // Check access hours
    if (!isWithinAccessHours(request.time, user.membership_plan.access_hours)) {
      throw new Error('Outside membership access hours');
    }
  }

  // 3. Calculate pricing
  const pricing = calculatePricing(user, request);

  return { isAvailable, pricing };
}
```

### **Meeting Room Booking**
```typescript
function validateMeetingRoomBooking(request) {
  // 1. Check room availability
  const isAvailable = await checkAvailability(...);

  // 2. Check user credits
  const credits = await getUserCredits(user.id, 'meeting-room');

  // 3. Calculate credit usage vs overage
  const creditsUsed = Math.min(request.duration, credits.remaining_amount);
  const overageHours = Math.max(0, request.duration - creditsUsed);

  // 4. Calculate overage charge
  const overageCharge = overageHours * workspace.base_price_hourly * (user.nft_holder ? 0.5 : 1);

  return {
    isAvailable,
    creditsUsed,
    overageHours,
    overageCharge,
    totalPrice: overageCharge + (overageCharge > 0 ? processingFee : 0)
  };
}
```

---

## 🔔 NOTIFICATION TRIGGERS

### **Booking Notifications**
- ✉️ Booking confirmed → Email + SMS
- ⏰ 1 hour before start → Reminder
- ✅ Check-in successful → Confirmation
- 💰 Final charge calculated → Receipt

### **Credit Notifications**
- 📊 Monthly allocation → "Your 8 hours of meeting room credits are available"
- ⚠️ Low credits → "You have 1 hour remaining"
- ❌ Credits expired → "Your unused 3 hours have expired"
- 💳 Overage charge → "Your meeting exceeded credits by 2 hours"

---

**Document Version:** 2.0
**Last Updated:** 2025-09-29
**Status:** Updated with Hourly Desk & Credit Logic