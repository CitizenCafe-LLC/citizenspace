#!/bin/bash

# Script to create GitHub issues from BACKLOG.md
# Repository: https://github.com/CitizenCafe-LLC/citizenspace
# Run: chmod +x create-github-issues.sh && ./create-github-issues.sh

REPO="CitizenCafe-LLC/citizenspace"
ASSIGNEE="ranveerd11"

echo "Creating GitHub issues for CitizenSpace backlog..."

# SPRINT 1: Database & Authentication Foundation

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 1] Task 1.1: Supabase Setup & Schema Implementation" \
  --body "**Priority:** P0 (Blocker)
**Estimated:** 4 hours
**Sprint:** 1 - Database & Authentication Foundation

**Deliverables:**
- [ ] Create Supabase project
- [ ] Implement all 13 database tables from PRD
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create database migrations
- [ ] Seed initial data (membership plans, workspaces)
- [ ] Write database schema tests

**Acceptance Criteria:**
- All tables created with correct schema
- RLS policies prevent unauthorized access
- Migration scripts run successfully
- Seed data populates correctly

**Test Coverage:** 80%+ required" \
  --label "P0-blocker,sprint-1,backend,database" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 1] Task 1.2: Authentication System" \
  --body "**Priority:** P0 (Blocker)
**Estimated:** 6 hours
**Sprint:** 1 - Database & Authentication Foundation

**Deliverables:**
- [ ] Implement Supabase Auth integration
- [ ] Create \`/api/auth/register\` endpoint
- [ ] Create \`/api/auth/login\` endpoint
- [ ] Create \`/api/auth/logout\` endpoint
- [ ] Create \`/api/auth/me\` endpoint
- [ ] Implement JWT token refresh
- [ ] Add password reset flow
- [ ] Write authentication middleware
- [ ] Tests: 80%+ coverage

**Acceptance Criteria:**
- Users can register/login
- JWT tokens issued correctly
- Protected routes check authentication
- Password reset emails sent
- All endpoints tested

**Test Coverage:** 80%+ required" \
  --label "P0-blocker,sprint-1,backend,authentication" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 1] Task 1.3: Web3 Wallet Integration & NFT Verification" \
  --body "**Priority:** P1 (High)
**Estimated:** 5 hours
**Sprint:** 1 - Database & Authentication Foundation

**Deliverables:**
- [ ] Integrate RainbowKit from NFT site into main app
- [ ] Create \`/api/auth/wallet-connect\` endpoint
- [ ] Create \`/api/auth/verify-nft\` endpoint
- [ ] Implement blockchain query for NFT ownership
- [ ] Cache NFT verification results
- [ ] Auto-update user.nft_holder flag
- [ ] Write NFT verification tests

**Acceptance Criteria:**
- Users can connect wallet
- System verifies NFT ownership on-chain
- Discounts auto-apply for NFT holders
- Verification cached for 24 hours
- Tests cover all verification scenarios

**Test Coverage:** 80%+ required" \
  --label "P1-high,sprint-1,web3,blockchain" \
  --assignee "$ASSIGNEE"

# SPRINT 2: Booking System Core

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 2] Task 2.1: Workspace Management APIs" \
  --body "**Priority:** P0 (Blocker)
**Estimated:** 4 hours
**Sprint:** 2 - Booking System Core

**Deliverables:**
- [ ] Create \`/api/workspaces\` GET endpoint
- [ ] Create \`/api/workspaces/:id\` GET endpoint
- [ ] Create \`/api/workspaces/hot-desks\` GET endpoint
- [ ] Create \`/api/workspaces/meeting-rooms\` GET endpoint
- [ ] Create \`/api/workspaces/availability\` GET endpoint
- [ ] Implement availability checking logic
- [ ] Write workspace API tests

**Acceptance Criteria:**
- All workspace endpoints return correct data
- Availability check prevents double-booking
- Tests: 80%+ coverage

**Test Coverage:** 80%+ required" \
  --label "P0-blocker,sprint-2,backend,api" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 2] Task 2.2: Hourly Desk Booking System" \
  --body "**Priority:** P0 (Blocker)
**Estimated:** 8 hours
**Sprint:** 2 - Booking System Core

**Deliverables:**
- [ ] Create \`/api/bookings/hourly-desk\` POST endpoint
- [ ] Implement pricing calculation logic
- [ ] Implement NFT discount calculation
- [ ] Create check-in/check-out endpoints
- [ ] Implement actual usage tracking
- [ ] Add overage/refund calculation
- [ ] Create \`/api/bookings/:id/extend\` endpoint
- [ ] Write booking tests with all scenarios

**Acceptance Criteria:**
- Hourly bookings created with correct pricing
- NFT holders get 50% discount
- Check-in/out tracking works
- Overage charges calculated correctly
- Refunds issued for early checkout
- Tests cover all 5 scenarios from PRD

**Test Coverage:** 80%+ required
**Reference:** See PRD.md Section \"BOOKING LOGIC & BUSINESS RULES\"" \
  --label "P0-blocker,sprint-2,backend,booking" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 2] Task 2.3: Meeting Room Booking with Credits" \
  --body "**Priority:** P0 (Blocker)
**Estimated:** 8 hours
**Sprint:** 2 - Booking System Core

**Deliverables:**
- [ ] Create \`/api/bookings/meeting-room\` POST endpoint
- [ ] Implement credit balance checking
- [ ] Implement credit deduction logic
- [ ] Implement overage charge calculation
- [ ] Create credit transaction records
- [ ] Add credit allocation on subscription
- [ ] Write credit system tests

**Acceptance Criteria:**
- Credits deducted automatically
- Overage charges when credits exhausted
- Credit transactions logged
- Monthly allocation works
- Tests: 80%+ coverage

**Test Coverage:** 80%+ required
**Reference:** See PRD.md Section \"Meeting Room Booking with Credits\"" \
  --label "P0-blocker,sprint-2,backend,booking,credits" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 2] Task 2.4: Membership Credits Management" \
  --body "**Priority:** P1 (High)
**Estimated:** 4 hours
**Sprint:** 2 - Booking System Core

**Deliverables:**
- [ ] Create \`/api/memberships/credits\` GET endpoint
- [ ] Create \`/api/memberships/credits/meeting-rooms\` GET endpoint
- [ ] Create \`/api/memberships/credits/transactions\` GET endpoint
- [ ] Implement credit expiration job (monthly)
- [ ] Add credit allocation on renewal
- [ ] Write credit management tests

**Acceptance Criteria:**
- Users can view credit balances
- Transaction history displayed
- Credits expire at cycle end
- Tests cover allocation and expiration

**Test Coverage:** 80%+ required" \
  --label "P1-high,sprint-2,backend,credits" \
  --assignee "$ASSIGNEE"

# SPRINT 3: Payment Processing

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 3] Task 3.1: Stripe Integration Setup" \
  --body "**Priority:** P0 (Blocker)
**Estimated:** 5 hours
**Sprint:** 3 - Payment Processing

**Deliverables:**
- [ ] Install Stripe SDK
- [ ] Configure Stripe API keys
- [ ] Create Stripe webhook endpoint
- [ ] Implement webhook signature verification
- [ ] Set up webhook event handling
- [ ] Write Stripe integration tests

**Acceptance Criteria:**
- Stripe SDK configured
- Webhooks receive events
- Signature verification works
- Tests mock Stripe API

**Test Coverage:** 80%+ required" \
  --label "P0-blocker,sprint-3,payments,stripe" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 3] Task 3.2: Booking Payment Processing" \
  --body "**Priority:** P0 (Blocker)
**Estimated:** 6 hours
**Sprint:** 3 - Payment Processing

**Deliverables:**
- [ ] Create \`/api/payments/create-intent\` endpoint
- [ ] Implement Stripe Checkout for bookings
- [ ] Handle payment success webhook
- [ ] Handle payment failure webhook
- [ ] Implement refund logic
- [ ] Write payment processing tests

**Acceptance Criteria:**
- Payments process successfully
- Booking confirmed on payment success
- Refunds work for cancellations
- Tests: 80%+ coverage

**Test Coverage:** 80%+ required" \
  --label "P0-blocker,sprint-3,payments,backend" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 3] Task 3.3: Membership Subscription Management" \
  --body "**Priority:** P1 (High)
**Estimated:** 6 hours
**Sprint:** 3 - Payment Processing

**Deliverables:**
- [ ] Create \`/api/memberships/subscribe\` endpoint
- [ ] Implement Stripe subscription creation
- [ ] Handle subscription webhooks
- [ ] Implement subscription update/cancel
- [ ] Add credit allocation on renewal
- [ ] Write subscription tests

**Acceptance Criteria:**
- Subscriptions created successfully
- Renewals trigger credit allocation
- Cancellations handled properly
- Tests cover all subscription events

**Test Coverage:** 80%+ required" \
  --label "P1-high,sprint-3,payments,subscriptions" \
  --assignee "$ASSIGNEE"

# SPRINT 4: Cafe & Menu System

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 4] Task 4.1: Menu Management APIs" \
  --body "**Priority:** P1 (High)
**Estimated:** 4 hours
**Sprint:** 4 - Cafe & Menu System

**Deliverables:**
- [ ] Create \`/api/menu\` GET endpoint
- [ ] Create \`/api/menu/:category\` GET endpoint
- [ ] Create \`/api/menu/items/:id\` GET endpoint
- [ ] Migrate menu data from lib/data.ts to database
- [ ] Implement NFT holder pricing
- [ ] Write menu API tests

**Acceptance Criteria:**
- Menu data served from database
- NFT holders see discounted prices
- Tests: 80%+ coverage

**Test Coverage:** 80%+ required" \
  --label "P1-high,sprint-4,backend,cafe" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 4] Task 4.2: Cafe Ordering System" \
  --body "**Priority:** P1 (High)
**Estimated:** 6 hours
**Sprint:** 4 - Cafe & Menu System

**Deliverables:**
- [ ] Create \`/api/orders\` POST endpoint
- [ ] Create \`/api/orders\` GET endpoint (user orders)
- [ ] Create \`/api/orders/:id\` GET endpoint
- [ ] Implement order status updates
- [ ] Add NFT discount calculation
- [ ] Integrate Stripe Payment Intents
- [ ] Write ordering tests

**Acceptance Criteria:**
- Orders created with correct pricing
- NFT holders get 10% discount
- Payment processed successfully
- Tests cover all order scenarios

**Test Coverage:** 80%+ required" \
  --label "P1-high,sprint-4,backend,cafe,orders" \
  --assignee "$ASSIGNEE"

# SPRINT 5: Events & Content

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 5] Task 5.1: Events System" \
  --body "**Priority:** P2 (Medium)
**Estimated:** 5 hours
**Sprint:** 5 - Events & Content

**Deliverables:**
- [ ] Create \`/api/events\` GET endpoint
- [ ] Create \`/api/events/:slug\` GET endpoint
- [ ] Create \`/api/events/:id/rsvp\` POST endpoint
- [ ] Migrate events data to database
- [ ] Implement capacity tracking
- [ ] Add payment for paid events
- [ ] Write events tests

**Acceptance Criteria:**
- Events displayed from database
- RSVP system works
- Capacity limits enforced
- Tests: 80%+ coverage

**Test Coverage:** 80%+ required" \
  --label "P2-medium,sprint-5,backend,events" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 5] Task 5.2: Blog/CMS Integration" \
  --body "**Priority:** P2 (Medium)
**Estimated:** 4 hours
**Sprint:** 5 - Events & Content

**Deliverables:**
- [ ] Create \`/api/blog/posts\` GET endpoint
- [ ] Create \`/api/blog/posts/:slug\` GET endpoint
- [ ] Create \`/api/blog/categories\` GET endpoint
- [ ] Migrate blog data to database
- [ ] Implement search functionality
- [ ] Write blog API tests

**Acceptance Criteria:**
- Blog posts served from database
- Search works correctly
- Tests: 80%+ coverage

**Test Coverage:** 80%+ required" \
  --label "P2-medium,sprint-5,backend,blog" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 5] Task 5.3: Contact & Newsletter" \
  --body "**Priority:** P2 (Medium)
**Estimated:** 3 hours
**Sprint:** 5 - Events & Content

**Deliverables:**
- [ ] Create \`/api/contact\` POST endpoint
- [ ] Create \`/api/newsletter/subscribe\` POST endpoint
- [ ] Store submissions in database
- [ ] Set up email notifications
- [ ] Write contact form tests

**Acceptance Criteria:**
- Submissions stored correctly
- Emails sent to admin
- Tests: 80%+ coverage

**Test Coverage:** 80%+ required" \
  --label "P2-medium,sprint-5,backend,contact" \
  --assignee "$ASSIGNEE"

# SPRINT 6: Frontend Integration

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 6] Task 6.1: Authentication UI Updates" \
  --body "**Priority:** P0 (Blocker)
**Estimated:** 6 hours
**Sprint:** 6 - Frontend Integration

**Deliverables:**
- [ ] Create login/register pages
- [ ] Create user profile page
- [ ] Add authentication context
- [ ] Implement protected routes
- [ ] Add wallet connect button
- [ ] Display NFT holder status
- [ ] Write UI component tests

**Acceptance Criteria:**
- Users can login/register via UI
- Wallet connection works
- Protected pages redirect if not logged in
- Tests: 80%+ coverage

**Test Coverage:** 80%+ required" \
  --label "P0-blocker,sprint-6,frontend,authentication" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 6] Task 6.2: Booking Flow Integration" \
  --body "**Priority:** P0 (Blocker)
**Estimated:** 8 hours
**Sprint:** 6 - Frontend Integration

**Deliverables:**
- [ ] Update booking page to use real APIs
- [ ] Implement availability checking UI
- [ ] Add credit balance display for members
- [ ] Show pricing with NFT discounts
- [ ] Integrate Stripe payment UI
- [ ] Add booking confirmation flow
- [ ] Write booking flow tests

**Acceptance Criteria:**
- Booking flow works end-to-end
- Real-time availability displayed
- Stripe checkout completes
- Tests cover happy path and errors

**Test Coverage:** 80%+ required" \
  --label "P0-blocker,sprint-6,frontend,booking" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 6] Task 6.3: Member Dashboard" \
  --body "**Priority:** P1 (High)
**Estimated:** 6 hours
**Sprint:** 6 - Frontend Integration

**Deliverables:**
- [ ] Create member dashboard page
- [ ] Display current bookings
- [ ] Show credit balances
- [ ] Display transaction history
- [ ] Add booking management (cancel/extend)
- [ ] Write dashboard tests

**Acceptance Criteria:**
- Dashboard shows all user data
- Bookings can be managed
- Tests: 80%+ coverage

**Test Coverage:** 80%+ required" \
  --label "P1-high,sprint-6,frontend,dashboard" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 6] Task 6.4: Menu & Ordering UI" \
  --body "**Priority:** P1 (High)
**Estimated:** 5 hours
**Sprint:** 6 - Frontend Integration

**Deliverables:**
- [ ] Update menu page to use API data
- [ ] Create ordering flow UI
- [ ] Add cart functionality
- [ ] Show NFT holder prices
- [ ] Integrate Stripe payment
- [ ] Write ordering UI tests

**Acceptance Criteria:**
- Menu loaded from API
- Orders can be placed
- Payment processed
- Tests: 80%+ coverage

**Test Coverage:** 80%+ required" \
  --label "P1-high,sprint-6,frontend,cafe" \
  --assignee "$ASSIGNEE"

# SPRINT 7: Admin & Operations

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 7] Task 7.1: Admin Dashboard" \
  --body "**Priority:** P2 (Medium)
**Estimated:** 8 hours
**Sprint:** 7 - Admin & Operations

**Deliverables:**
- [ ] Create admin dashboard page
- [ ] Show booking analytics
- [ ] Display order queue
- [ ] Add user management
- [ ] Create workspace management UI
- [ ] Write admin UI tests

**Acceptance Criteria:**
- Admins can view all data
- Staff can manage orders
- Tests: 80%+ coverage

**Test Coverage:** 80%+ required" \
  --label "P2-medium,sprint-7,frontend,admin" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 7] Task 7.2: Admin APIs" \
  --body "**Priority:** P2 (Medium)
**Estimated:** 5 hours
**Sprint:** 7 - Admin & Operations

**Deliverables:**
- [ ] Create admin booking management endpoints
- [ ] Create user management endpoints
- [ ] Create workspace management endpoints
- [ ] Create menu item CRUD endpoints
- [ ] Add role-based access control
- [ ] Write admin API tests

**Acceptance Criteria:**
- Admins can perform CRUD operations
- RBAC prevents unauthorized access
- Tests: 80%+ coverage

**Test Coverage:** 80%+ required" \
  --label "P2-medium,sprint-7,backend,admin" \
  --assignee "$ASSIGNEE"

# SPRINT 8: Notifications & Polish

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 8] Task 8.1: Email Notification System" \
  --body "**Priority:** P1 (High)
**Estimated:** 5 hours
**Sprint:** 8 - Notifications & Polish

**Deliverables:**
- [ ] Set up email service (Resend/SendGrid)
- [ ] Create email templates
- [ ] Implement booking confirmation emails
- [ ] Add payment receipt emails
- [ ] Create credit allocation notifications
- [ ] Write email sending tests

**Acceptance Criteria:**
- Emails sent for all key events
- Templates look professional
- Tests mock email service

**Test Coverage:** 80%+ required" \
  --label "P1-high,sprint-8,notifications,email" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 8] Task 8.2: Real-time Features" \
  --body "**Priority:** P2 (Medium)
**Estimated:** 4 hours
**Sprint:** 8 - Notifications & Polish

**Deliverables:**
- [ ] Set up Supabase Realtime
- [ ] Implement live booking updates
- [ ] Add order status notifications
- [ ] Create seat availability tracker
- [ ] Write realtime tests

**Acceptance Criteria:**
- UI updates without refresh
- Notifications appear instantly
- Tests verify realtime events

**Test Coverage:** 80%+ required" \
  --label "P2-medium,sprint-8,realtime,backend" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 8] Task 8.3: Testing & QA" \
  --body "**Priority:** P0 (Blocker)
**Estimated:** 6 hours
**Sprint:** 8 - Notifications & Polish

**Deliverables:**
- [ ] Run full test suite
- [ ] Verify 80%+ coverage on all modules
- [ ] Perform E2E testing of critical flows
- [ ] Load test booking system
- [ ] Security audit of APIs
- [ ] Document all bugs found

**Acceptance Criteria:**
- All tests pass
- Coverage meets requirements
- No critical bugs
- Performance acceptable

**Test Coverage:** 80%+ required" \
  --label "P0-blocker,sprint-8,qa,testing" \
  --assignee "$ASSIGNEE"

gh issue create \
  --repo "$REPO" \
  --title "[SPRINT 8] Task 8.4: Deployment" \
  --body "**Priority:** P0 (Blocker)
**Estimated:** 4 hours
**Sprint:** 8 - Notifications & Polish

**Deliverables:**
- [ ] Set up Vercel deployment
- [ ] Configure environment variables
- [ ] Set up Stripe webhooks in production
- [ ] Configure domain/SSL
- [ ] Set up monitoring (Sentry)
- [ ] Create deployment documentation

**Acceptance Criteria:**
- App deployed to production
- Webhooks working
- Monitoring active
- Documentation complete" \
  --label "P0-blocker,sprint-8,devops,deployment" \
  --assignee "$ASSIGNEE"

echo ""
echo "✅ All 31 GitHub issues created successfully!"
echo "View issues at: https://github.com/$REPO/issues"