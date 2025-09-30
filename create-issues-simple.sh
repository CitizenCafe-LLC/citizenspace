#!/bin/bash

# Simple script to create issues without labels
REPO="CitizenCafe-LLC/citizenspace"

echo "Creating Sprint 1 issues..."

gh issue create --repo "$REPO" --title "[SPRINT 1] Task 1.1: Supabase Setup & Schema Implementation" --body "**Priority:** P0 (Blocker)
**Estimated:** 4 hours

**Deliverables:**
- [ ] Create Supabase project
- [ ] Implement all 13 database tables from PRD
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create database migrations
- [ ] Seed initial data (membership plans, workspaces)
- [ ] Write database schema tests

**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 1] Task 1.2: Authentication System" --body "**Priority:** P0 (Blocker)
**Estimated:** 6 hours

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

**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 1] Task 1.3: Web3 Wallet Integration & NFT Verification" --body "**Priority:** P1 (High)
**Estimated:** 5 hours

**Deliverables:**
- [ ] Integrate RainbowKit from NFT site into main app
- [ ] Create \`/api/auth/wallet-connect\` endpoint
- [ ] Create \`/api/auth/verify-nft\` endpoint
- [ ] Implement blockchain query for NFT ownership
- [ ] Cache NFT verification results
- [ ] Auto-update user.nft_holder flag
- [ ] Write NFT verification tests

**Test Coverage:** 80%+ required"

echo "Creating Sprint 2 issues..."

gh issue create --repo "$REPO" --title "[SPRINT 2] Task 2.1: Workspace Management APIs" --body "**Priority:** P0 (Blocker)
**Estimated:** 4 hours

**Deliverables:**
- [ ] Create \`/api/workspaces\` GET endpoint
- [ ] Create \`/api/workspaces/:id\` GET endpoint
- [ ] Create \`/api/workspaces/hot-desks\` GET endpoint
- [ ] Create \`/api/workspaces/meeting-rooms\` GET endpoint
- [ ] Create \`/api/workspaces/availability\` GET endpoint
- [ ] Implement availability checking logic
- [ ] Write workspace API tests

**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 2] Task 2.2: Hourly Desk Booking System" --body "**Priority:** P0 (Blocker)
**Estimated:** 8 hours

**Deliverables:**
- [ ] Create \`/api/bookings/hourly-desk\` POST endpoint
- [ ] Implement pricing calculation logic
- [ ] Implement NFT discount calculation
- [ ] Create check-in/check-out endpoints
- [ ] Implement actual usage tracking
- [ ] Add overage/refund calculation
- [ ] Create \`/api/bookings/:id/extend\` endpoint
- [ ] Write booking tests with all scenarios

**Reference:** See PRD.md Section 'BOOKING LOGIC & BUSINESS RULES'
**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 2] Task 2.3: Meeting Room Booking with Credits" --body "**Priority:** P0 (Blocker)
**Estimated:** 8 hours

**Deliverables:**
- [ ] Create \`/api/bookings/meeting-room\` POST endpoint
- [ ] Implement credit balance checking
- [ ] Implement credit deduction logic
- [ ] Implement overage charge calculation
- [ ] Create credit transaction records
- [ ] Add credit allocation on subscription
- [ ] Write credit system tests

**Reference:** See PRD.md Section 'Meeting Room Booking with Credits'
**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 2] Task 2.4: Membership Credits Management" --body "**Priority:** P1 (High)
**Estimated:** 4 hours

**Deliverables:**
- [ ] Create \`/api/memberships/credits\` GET endpoint
- [ ] Create \`/api/memberships/credits/meeting-rooms\` GET endpoint
- [ ] Create \`/api/memberships/credits/transactions\` GET endpoint
- [ ] Implement credit expiration job (monthly)
- [ ] Add credit allocation on renewal
- [ ] Write credit management tests

**Test Coverage:** 80%+ required"

echo "Creating Sprint 3 issues..."

gh issue create --repo "$REPO" --title "[SPRINT 3] Task 3.1: Stripe Integration Setup" --body "**Priority:** P0 (Blocker)
**Estimated:** 5 hours

**Deliverables:**
- [ ] Install Stripe SDK
- [ ] Configure Stripe API keys
- [ ] Create Stripe webhook endpoint
- [ ] Implement webhook signature verification
- [ ] Set up webhook event handling
- [ ] Write Stripe integration tests

**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 3] Task 3.2: Booking Payment Processing" --body "**Priority:** P0 (Blocker)
**Estimated:** 6 hours

**Deliverables:**
- [ ] Create \`/api/payments/create-intent\` endpoint
- [ ] Implement Stripe Checkout for bookings
- [ ] Handle payment success webhook
- [ ] Handle payment failure webhook
- [ ] Implement refund logic
- [ ] Write payment processing tests

**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 3] Task 3.3: Membership Subscription Management" --body "**Priority:** P1 (High)
**Estimated:** 6 hours

**Deliverables:**
- [ ] Create \`/api/memberships/subscribe\` endpoint
- [ ] Implement Stripe subscription creation
- [ ] Handle subscription webhooks
- [ ] Implement subscription update/cancel
- [ ] Add credit allocation on renewal
- [ ] Write subscription tests

**Test Coverage:** 80%+ required"

echo "Creating Sprint 4 issues..."

gh issue create --repo "$REPO" --title "[SPRINT 4] Task 4.1: Menu Management APIs" --body "**Priority:** P1 (High)
**Estimated:** 4 hours

**Deliverables:**
- [ ] Create \`/api/menu\` GET endpoint
- [ ] Create \`/api/menu/:category\` GET endpoint
- [ ] Create \`/api/menu/items/:id\` GET endpoint
- [ ] Migrate menu data from lib/data.ts to database
- [ ] Implement NFT holder pricing
- [ ] Write menu API tests

**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 4] Task 4.2: Cafe Ordering System" --body "**Priority:** P1 (High)
**Estimated:** 6 hours

**Deliverables:**
- [ ] Create \`/api/orders\` POST endpoint
- [ ] Create \`/api/orders\` GET endpoint (user orders)
- [ ] Create \`/api/orders/:id\` GET endpoint
- [ ] Implement order status updates
- [ ] Add NFT discount calculation
- [ ] Integrate Stripe Payment Intents
- [ ] Write ordering tests

**Test Coverage:** 80%+ required"

echo "Creating Sprint 5 issues..."

gh issue create --repo "$REPO" --title "[SPRINT 5] Task 5.1: Events System" --body "**Priority:** P2 (Medium)
**Estimated:** 5 hours

**Deliverables:**
- [ ] Create \`/api/events\` GET endpoint
- [ ] Create \`/api/events/:slug\` GET endpoint
- [ ] Create \`/api/events/:id/rsvp\` POST endpoint
- [ ] Migrate events data to database
- [ ] Implement capacity tracking
- [ ] Add payment for paid events
- [ ] Write events tests

**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 5] Task 5.2: Blog/CMS Integration" --body "**Priority:** P2 (Medium)
**Estimated:** 4 hours

**Deliverables:**
- [ ] Create \`/api/blog/posts\` GET endpoint
- [ ] Create \`/api/blog/posts/:slug\` GET endpoint
- [ ] Create \`/api/blog/categories\` GET endpoint
- [ ] Migrate blog data to database
- [ ] Implement search functionality
- [ ] Write blog API tests

**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 5] Task 5.3: Contact & Newsletter" --body "**Priority:** P2 (Medium)
**Estimated:** 3 hours

**Deliverables:**
- [ ] Create \`/api/contact\` POST endpoint
- [ ] Create \`/api/newsletter/subscribe\` POST endpoint
- [ ] Store submissions in database
- [ ] Set up email notifications
- [ ] Write contact form tests

**Test Coverage:** 80%+ required"

echo "Creating Sprint 6 issues..."

gh issue create --repo "$REPO" --title "[SPRINT 6] Task 6.1: Authentication UI Updates" --body "**Priority:** P0 (Blocker)
**Estimated:** 6 hours

**Deliverables:**
- [ ] Create login/register pages
- [ ] Create user profile page
- [ ] Add authentication context
- [ ] Implement protected routes
- [ ] Add wallet connect button
- [ ] Display NFT holder status
- [ ] Write UI component tests

**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 6] Task 6.2: Booking Flow Integration" --body "**Priority:** P0 (Blocker)
**Estimated:** 8 hours

**Deliverables:**
- [ ] Update booking page to use real APIs
- [ ] Implement availability checking UI
- [ ] Add credit balance display for members
- [ ] Show pricing with NFT discounts
- [ ] Integrate Stripe payment UI
- [ ] Add booking confirmation flow
- [ ] Write booking flow tests

**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 6] Task 6.3: Member Dashboard" --body "**Priority:** P1 (High)
**Estimated:** 6 hours

**Deliverables:**
- [ ] Create member dashboard page
- [ ] Display current bookings
- [ ] Show credit balances
- [ ] Display transaction history
- [ ] Add booking management (cancel/extend)
- [ ] Write dashboard tests

**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 6] Task 6.4: Menu & Ordering UI" --body "**Priority:** P1 (High)
**Estimated:** 5 hours

**Deliverables:**
- [ ] Update menu page to use API data
- [ ] Create ordering flow UI
- [ ] Add cart functionality
- [ ] Show NFT holder prices
- [ ] Integrate Stripe payment
- [ ] Write ordering UI tests

**Test Coverage:** 80%+ required"

echo "Creating Sprint 7 issues..."

gh issue create --repo "$REPO" --title "[SPRINT 7] Task 7.1: Admin Dashboard" --body "**Priority:** P2 (Medium)
**Estimated:** 8 hours

**Deliverables:**
- [ ] Create admin dashboard page
- [ ] Show booking analytics
- [ ] Display order queue
- [ ] Add user management
- [ ] Create workspace management UI
- [ ] Write admin UI tests

**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 7] Task 7.2: Admin APIs" --body "**Priority:** P2 (Medium)
**Estimated:** 5 hours

**Deliverables:**
- [ ] Create admin booking management endpoints
- [ ] Create user management endpoints
- [ ] Create workspace management endpoints
- [ ] Create menu item CRUD endpoints
- [ ] Add role-based access control
- [ ] Write admin API tests

**Test Coverage:** 80%+ required"

echo "Creating Sprint 8 issues..."

gh issue create --repo "$REPO" --title "[SPRINT 8] Task 8.1: Email Notification System" --body "**Priority:** P1 (High)
**Estimated:** 5 hours

**Deliverables:**
- [ ] Set up email service (Resend/SendGrid)
- [ ] Create email templates
- [ ] Implement booking confirmation emails
- [ ] Add payment receipt emails
- [ ] Create credit allocation notifications
- [ ] Write email sending tests

**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 8] Task 8.2: Real-time Features" --body "**Priority:** P2 (Medium)
**Estimated:** 4 hours

**Deliverables:**
- [ ] Set up Supabase Realtime
- [ ] Implement live booking updates
- [ ] Add order status notifications
- [ ] Create seat availability tracker
- [ ] Write realtime tests

**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 8] Task 8.3: Testing & QA" --body "**Priority:** P0 (Blocker)
**Estimated:** 6 hours

**Deliverables:**
- [ ] Run full test suite
- [ ] Verify 80%+ coverage on all modules
- [ ] Perform E2E testing of critical flows
- [ ] Load test booking system
- [ ] Security audit of APIs
- [ ] Document all bugs found

**Test Coverage:** 80%+ required"

gh issue create --repo "$REPO" --title "[SPRINT 8] Task 8.4: Deployment" --body "**Priority:** P0 (Blocker)
**Estimated:** 4 hours

**Deliverables:**
- [ ] Set up Vercel deployment
- [ ] Configure environment variables
- [ ] Set up Stripe webhooks in production
- [ ] Configure domain/SSL
- [ ] Set up monitoring (Sentry)
- [ ] Create deployment documentation"

echo ""
echo "✅ All 31 issues created!"
echo "View at: https://github.com/$REPO/issues"