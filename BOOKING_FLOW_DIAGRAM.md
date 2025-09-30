# CitizenSpace Booking Flow - Visual Diagram

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BOOKING PAGE (/booking)                           │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         Hero Section                              │   │
│  │  "Reserve Your Perfect Workspace"                                 │   │
│  │  - Real-time Availability                                         │   │
│  │  - Instant Confirmation                                           │   │
│  │  - Secure Payment                                                 │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    NFT Holder Banner                              │   │
│  │  "Get 50% off all bookings - Connect Wallet" [Connect Button]    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           BOOKING WIZARD                                 │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │  Progress: [●────○────○────○]  25%                            │     │
│  │  Step 1/4: Workspace Type → Date & Time → Select Space → Pay  │     │
│  └───────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    STEP 1: WORKSPACE TYPE SELECTION                      │
│  ┌─────────────────────────┐  ┌─────────────────────────┐              │
│  │   🖥️  HOT DESK          │  │   👥  MEETING ROOM     │ [POPULAR]    │
│  │                          │  │                         │              │
│  │   $2.50/hour            │  │   $25.00/hour          │              │
│  │   ($1.25 with NFT)      │  │   ($12.50 with NFT)    │              │
│  │                          │  │                         │              │
│  │   ✓ Any available desk  │  │   ✓ Privacy            │              │
│  │   ✓ High-speed WiFi     │  │   ✓ Whiteboard & AV    │              │
│  │   ✓ Power outlets        │  │   ✓ Video conferencing │              │
│  │   ✓ Common areas        │  │   ✓ Use member credits │              │
│  │                          │  │                         │              │
│  │   [Select]              │  │   [✓ Selected]         │              │
│  └─────────────────────────┘  └─────────────────────────┘              │
│                                                                           │
│  [Back (disabled)]                              [Next Step →]           │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    STEP 2: DATE & TIME SELECTION                         │
│  ┌──────────────────────────┐  ┌──────────────────────────┐            │
│  │   📅 Calendar            │  │   🕐 Time Selection      │            │
│  │                          │  │                          │            │
│  │   October 2025           │  │   Start Time: 09:00 AM   │            │
│  │   Su Mo Tu We Th Fr Sa   │  │   Duration: 2 hours      │            │
│  │        1  2  3  4  5     │  │   End Time: 11:00 AM     │            │
│  │    6  7  8  9 10 11 12   │  │                          │            │
│  │   13 14 15 [16] ...      │  │   Max Duration: 8 hours  │            │
│  │                          │  │   (until 10 PM)          │            │
│  │   (Past dates disabled)  │  │                          │            │
│  └──────────────────────────┘  │   ┌──────────────────┐  │            │
│                                 │   │  ✓ Available     │  │            │
│  ┌──────────────────────────┐  │   │  This time slot  │  │            │
│  │  Pricing Summary     💰  │  │   │  is available    │  │            │
│  │  Meeting Room 1          │  │   └──────────────────┘  │            │
│  │  $25/hour × 2 hours      │  └──────────────────────────┘            │
│  │                          │                                           │
│  │  Base Price:     $50.00  │  Selected: Thursday, Oct 16, 2025        │
│  │  Processing Fee:  $1.75  │  from 9:00 AM to 11:00 AM (2 hours)      │
│  │  Total:          $51.75  │                                           │
│  └──────────────────────────┘                                           │
│                                                                           │
│  [← Back]                                   [Next Step →]               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    STEP 3: SELECT SPECIFIC WORKSPACE                     │
│                    (Meeting Rooms Only)                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌────────────────┐ │
│  │  Focus Room         │  │  Collaborate Room   │  │  Boardroom     │ │
│  │  [Image]            │  │  [Image]            │  │  [Image]       │ │
│  │                     │  │                     │  │                │ │
│  │  $25/hour           │  │  $40/hour           │  │  $60/hour      │ │
│  │  Capacity: 4        │  │  Capacity: 6        │  │  Capacity: 8   │ │
│  │  ✓ WiFi  ✓ Monitor  │  │  ✓ WiFi  ✓ TV      │  │  ✓ WiFi  ✓ AV  │ │
│  │                     │  │                     │  │                │ │
│  │  [✓ Selected]       │  │  [Select]           │  │  [Select]      │ │
│  └─────────────────────┘  └─────────────────────┘  └────────────────┘ │
│                                                                           │
│  ┌──────────────────────────┐  ┌──────────────────────────┐            │
│  │  Pricing Summary     💰  │  │  Credit Balance   ⏱️     │            │
│  │  Focus Room              │  │  Professional Plan       │            │
│  │  $25/hour × 2 hours      │  │  Available: 5 hours      │            │
│  │                          │  │                          │            │
│  │  Base Price:     $50.00  │  │  This Booking:           │            │
│  │  Credits Used:  -$50.00  │  │  Credits Used: 2 hrs     │            │
│  │  (2 hours)               │  │  Remaining: 3 hrs        │            │
│  │  ────────────────────    │  │                          │            │
│  │  Total:           $0.00  │  │  ✓ Fully Covered!       │            │
│  │                          │  │                          │            │
│  │  [✓ Fully Covered]      │  └──────────────────────────┘            │
│  └──────────────────────────┘                                           │
│                                                                           │
│  [← Back]                                   [Next Step →]               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    STEP 4: REVIEW & PAYMENT                              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Creating your booking...                       │   │
│  │                    [Loading spinner]                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                            ↓ (Booking Created)                           │
│                                                                           │
│  SCENARIO A: Payment Required ($51.75)                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  💳 Payment Details                                              │   │
│  │  Enter your payment information to complete your booking         │   │
│  │                                                                   │   │
│  │  [Stripe Payment Element]                                        │   │
│  │  Card Number:    [____________]                                  │   │
│  │  Expiry:         [____] CVC: [___]                              │   │
│  │  Postal Code:    [_______]                                       │   │
│  │                                                                   │   │
│  │  [Pay $51.75] ←─ Stripe Elements                               │   │
│  │                                                                   │   │
│  │  🔒 Secure payment processed by Stripe                          │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  SCENARIO B: Fully Covered by Credits ($0.00)                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ✅ Booking Confirmed!                                           │   │
│  │  Your booking is fully covered by credits.                       │   │
│  │  No payment required.                                            │   │
│  │                                                                   │   │
│  │  [View Confirmation →]                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                        ┌──────────▼──────────┐
                        │  Payment Success    │
                        │  or Skip Payment    │
                        └──────────┬──────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              CONFIRMATION PAGE (/booking/confirmation/[id])              │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  ✅ Booking Confirmed!                                           │   │
│  │  Your workspace has been reserved                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │  Booking Details     │  │  QR Code             │                    │
│  │                      │  │  ┌────────────────┐  │                    │
│  │  📍 Focus Room       │  │  │  [QR Code]     │  │                    │
│  │  Meeting Room        │  │  │                │  │                    │
│  │                      │  │  │                │  │                    │
│  │  📅 Oct 16, 2025     │  │  └────────────────┘  │                    │
│  │  Thursday            │  │  ABC123             │                    │
│  │                      │  │  Confirmation Code   │                    │
│  │  🕐 9:00 AM - 11:00  │  │                      │                    │
│  │  2 hours             │  │  [Download QR Code]  │                    │
│  │                      │  └──────────────────────┘                    │
│  │  👥 4 people         │                                              │
│  │                      │  ┌──────────────────────┐                    │
│  │  💰 Total: $0.00     │  │  Actions             │                    │
│  │  [confirmed] [paid]  │  │                      │                    │
│  └──────────────────────┘  │  [📅 Google Cal]     │                    │
│                             │  [📥 Download iCal]  │                    │
│  ┌──────────────────────┐  │  [🔗 Share Booking]  │                    │
│  │  Next Steps          │  │  [🖨️  Print Receipt] │                    │
│  │  1. Save QR code     │  └──────────────────────┘                    │
│  │  2. Add to calendar  │                                              │
│  │  3. Arrive & check in│  📧 Confirmation email sent                  │
│  │  4. Show QR code     │  with all details and QR code               │
│  └──────────────────────┘                                              │
│                                                                           │
│  [Contact Support]                      [Make Another Booking]          │
└─────────────────────────────────────────────────────────────────────────┘
```

## State Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                        ZUSTAND STORE                            │
│                     (bookingStore.ts)                           │
│                                                                  │
│  State:                                                         │
│  ├── selectedWorkspaceType: 'hot-desk' | 'meeting-room'       │
│  ├── selectedWorkspace: Workspace | null                       │
│  ├── bookingDate: Date | null                                  │
│  ├── startTime: string | null                                  │
│  ├── endTime: string | null                                    │
│  ├── duration: number                                          │
│  ├── attendees: number                                         │
│  ├── pricing: { subtotal, discount, fees, total }             │
│  ├── userInfo: { isNftHolder, isMember, creditBalance }       │
│  └── currentStep: 1-4                                          │
│                                                                  │
│  Actions:                                                       │
│  ├── setWorkspaceType()                                        │
│  ├── setBookingDate()                                          │
│  ├── setStartTime() → auto-calculate duration                 │
│  ├── setEndTime() → auto-calculate duration                   │
│  ├── setPricing()                                              │
│  ├── nextStep() → validate & advance                          │
│  ├── previousStep()                                            │
│  ├── canProceedToNextStep() → validation                      │
│  └── resetBooking()                                            │
└────────────────────────────────────────────────────────────────┘
```

## API Integration Flow

```
FRONTEND                     BACKEND                    STRIPE
    │                           │                          │
    │  Select Workspace Type    │                          │
    ├──────────────────────────►│                          │
    │                           │                          │
    │  Select Date/Time         │                          │
    ├──────────────────────────►│                          │
    │  GET /api/workspaces/     │                          │
    │       availability         │                          │
    │◄──────────────────────────┤                          │
    │  Available Workspaces     │                          │
    │                           │                          │
    │  Select Workspace         │                          │
    ├──────────────────────────►│                          │
    │                           │                          │
    │  Review & Confirm         │                          │
    ├──────────────────────────►│                          │
    │  POST /api/bookings/      │                          │
    │       meeting-room        │                          │
    │◄──────────────────────────┤                          │
    │  Booking Created          │                          │
    │  (ID: booking-123)        │                          │
    │                           │                          │
    │  IF PAYMENT REQUIRED:     │                          │
    ├──────────────────────────►│                          │
    │  POST /api/payments/      │                          │
    │       create-intent       │                          │
    │                           ├─────────────────────────►│
    │                           │  Create PaymentIntent    │
    │                           │◄─────────────────────────┤
    │◄──────────────────────────┤  Client Secret           │
    │  Client Secret            │                          │
    │                           │                          │
    │  Load Stripe.js           │                          │
    ├────────────────────────────────────────────────────►│
    │  Initialize Elements      │                          │
    │◄────────────────────────────────────────────────────┤
    │                           │                          │
    │  User enters card         │                          │
    │  Submit payment           │                          │
    ├────────────────────────────────────────────────────►│
    │  Confirm Payment          │                          │
    │                           │◄─────────────────────────┤
    │                           │  Webhook: payment.success│
    │                           │  Update booking status   │
    │◄────────────────────────────────────────────────────┤
    │  Payment Success          │                          │
    │                           │                          │
    │  Redirect to confirmation │                          │
    │  /booking/confirmation/   │                          │
    │  booking-123              │                          │
    ├──────────────────────────►│                          │
    │  GET /api/bookings/       │                          │
    │      booking-123          │                          │
    │◄──────────────────────────┤                          │
    │  Booking Details +        │                          │
    │  Confirmation Code        │                          │
    │                           │                          │
    │  Generate QR Code         │                          │
    │  (Client-side)            │                          │
```

## Component Hierarchy

```
BookingPage
└── BookingWizard
    ├── ProgressBar (always visible)
    │
    ├── Step 1: WorkspaceSelector
    │   └── WorkspaceTypeCard × 2
    │
    ├── Step 2: DateTimePicker
    │   ├── Calendar (react-day-picker)
    │   ├── TimeSelector
    │   └── DurationSelector
    │
    ├── Step 3: WorkspaceList
    │   └── WorkspaceCard × N
    │       ├── Image
    │       ├── Details
    │       ├── Amenities
    │       └── SelectButton
    │
    ├── Step 4: Review & Payment
    │   ├── BookingSummary
    │   └── StripePaymentForm (if payment required)
    │       ├── Elements (Stripe)
    │       └── PaymentElement (Stripe)
    │   OR
    │   └── FreeBookingConfirmation (if $0)
    │
    └── Sidebar (Steps 2-4)
        ├── PricingSummary
        │   ├── LineItems
        │   ├── Discounts
        │   └── Total
        └── CreditBalanceCard (if member)
            ├── AvailableCredits
            ├── CreditsToUse
            └── OverageWarning

ConfirmationPage
└── BookingConfirmation
    ├── SuccessMessage
    ├── BookingDetails
    │   ├── Workspace
    │   ├── DateTime
    │   ├── Attendees
    │   └── Price
    ├── BookingQRCode
    │   ├── QRCanvas
    │   └── ConfirmationCode
    ├── NextSteps
    └── ActionButtons
        ├── AddToCalendar (Google/iCal)
        ├── Share
        └── Print
```

## Data Flow: Pricing Calculation Example

```
User Selection:
├── Workspace: Meeting Room ($25/hr)
├── Duration: 5 hours
├── Member: Yes (5 credits available)
└── NFT Holder: Yes

Step-by-Step Calculation:
┌─────────────────────────────────────┐
│ 1. Base Price                       │
│    $25/hr × 5 hrs = $125.00         │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 2. Apply Credits (Members Only)     │
│    Credits: 5 hrs available         │
│    Use: 5 hrs (max available)       │
│    Credit Value: $25 × 5 = $125.00  │
│    Remaining: $125 - $125 = $0.00   │
│    Overage: 0 hrs                   │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 3. Apply NFT Discount (if overage)  │
│    Overage: $0.00                   │
│    Discount: $0.00 (no overage)     │
│    Subtotal: $0.00                  │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 4. Processing Fee                   │
│    If Subtotal > 0:                 │
│      Fee = Subtotal × 0.029 + $0.30 │
│    Else:                            │
│      Fee = $0.00                    │
│    Fee: $0.00                       │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│ 5. FINAL TOTAL                      │
│    Total: $0.00                     │
│    Payment Required: NO             │
│    Show: FreeBookingConfirmation    │
└─────────────────────────────────────┘
```

## File Organization

```
citizenspace/
├── app/
│   └── booking/
│       ├── page.tsx ..................... Main booking page
│       └── confirmation/
│           └── [id]/
│               └── page.tsx ............. Confirmation page
│
├── components/
│   └── booking/
│       ├── BookingWizard.tsx ............ Orchestrator
│       ├── WorkspaceSelector.tsx ........ Step 1
│       ├── DateTimePicker.tsx ........... Step 2
│       ├── AvailabilityCalendar.tsx ..... Availability view
│       ├── WorkspaceCard.tsx ............ Step 3
│       ├── PricingSummary.tsx ........... Sidebar
│       ├── CreditBalanceCard.tsx ........ Sidebar (members)
│       ├── StripePaymentForm.tsx ........ Step 4
│       ├── BookingQRCode.tsx ............ Confirmation
│       └── BookingConfirmation.tsx ...... Confirmation
│
├── lib/
│   ├── stores/
│   │   └── bookingStore.ts .............. State management
│   └── stripe/
│       └── config.ts .................... Stripe setup
│
└── __tests__/
    ├── components/
    │   └── booking/
    │       ├── BookingStore.test.ts
    │       ├── WorkspaceSelector.test.tsx
    │       ├── PricingSummary.test.tsx
    │       ├── BookingWizard.test.tsx
    │       └── StripePaymentForm.test.tsx
    └── integration/
        └── booking-flow.test.tsx
```

---

This visual diagram provides a complete overview of the booking flow implementation, showing user journey, component hierarchy, data flow, and system architecture.