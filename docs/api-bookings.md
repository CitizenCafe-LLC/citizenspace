# CitizenSpace Booking API Documentation

Complete API documentation for workspace booking endpoints including hourly desk bookings, check-in/out management, and pricing calculations.

## Table of Contents

1. [Authentication](#authentication)
2. [Workspace Management](#workspace-management)
3. [Hourly Desk Booking](#hourly-desk-booking)
4. [Booking Management](#booking-management)
5. [Business Logic](#business-logic)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

---

## Authentication

All booking endpoints require authentication via JWT token in the `Authorization` header or `x-user-id` header (for testing).

```
Authorization: Bearer <jwt_token>
```

Or for testing:

```
x-user-id: <user_uuid>
```

---

## Workspace Management

### List All Workspaces

**Endpoint:** `GET /api/workspaces`

**Description:** Retrieve all available workspaces with filtering and pagination.

**Query Parameters:**

- `type`: Filter by workspace type (`hot-desk`, `focus-room`, `collaborate-room`, `boardroom`, `communications-pod`)
- `resource_category`: Filter by category (`desk`, `meeting-room`)
- `min_capacity`: Minimum capacity
- `max_capacity`: Maximum capacity
- `min_price`: Minimum hourly price
- `max_price`: Maximum hourly price
- `available`: Filter by availability (boolean)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Example Request:**

```bash
GET /api/workspaces?resource_category=desk&available=true
```

**Example Response:**

```json
{
  "success": true,
  "message": "Workspaces retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "Hot Desk 1",
      "type": "hot-desk",
      "resource_category": "desk",
      "capacity": 1,
      "base_price_hourly": 2.5,
      "min_duration": 1,
      "max_duration": 8,
      "amenities": ["WiFi", "Power Outlet"],
      "available": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

### Get Hot Desks

**Endpoint:** `GET /api/workspaces/hot-desks`

**Description:** Get all available hot desks.

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Hot Desk 1",
      "type": "hot-desk",
      "resource_category": "desk",
      "base_price_hourly": 2.5
    }
  ]
}
```

### Get Meeting Rooms

**Endpoint:** `GET /api/workspaces/meeting-rooms`

**Description:** Get all available meeting rooms.

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Focus Room",
      "type": "focus-room",
      "resource_category": "meeting-room",
      "base_price_hourly": 25.0,
      "capacity": 4,
      "requires_credits": true
    }
  ]
}
```

### Check Availability

**Endpoint:** `GET /api/workspaces/availability`

**Description:** Check workspace availability for a specific date and time.

**Query Parameters:**

- `workspace_id`: Specific workspace UUID (optional)
- `date`: Date in YYYY-MM-DD format (required)
- `start_time`: Start time in HH:MM format (optional)
- `end_time`: End time in HH:MM format (optional)
- `duration_hours`: Desired duration (optional)
- `resource_category`: Filter by category (optional)

**Example Request:**

```bash
GET /api/workspaces/availability?date=2025-10-01&start_time=09:00&end_time=12:00&resource_category=desk
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "workspace": {
        "id": "uuid",
        "name": "Hot Desk 1"
      },
      "is_available": true,
      "slots": [
        {
          "start_time": "09:00",
          "end_time": "12:00",
          "available": true
        }
      ]
    }
  ]
}
```

---

## Hourly Desk Booking

### Create Hourly Desk Booking

**Endpoint:** `POST /api/bookings/hourly-desk`

**Description:** Book a hot desk for hourly usage.

**Request Body:**

```json
{
  "workspace_id": "uuid",
  "booking_date": "2025-10-01",
  "start_time": "09:00",
  "end_time": "12:00",
  "attendees": 1,
  "special_requests": "Near window if possible"
}
```

**Example Response:**

```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "id": "uuid",
      "confirmation_code": "ABC12345",
      "workspace": {
        "id": "uuid",
        "name": "Hot Desk 1",
        "type": "hot-desk"
      },
      "booking_date": "2025-10-01",
      "start_time": "09:00",
      "end_time": "12:00",
      "duration_hours": 3,
      "status": "pending",
      "payment_status": "pending"
    },
    "pricing": {
      "subtotal": 7.5,
      "discount_amount": 0,
      "nft_discount_applied": false,
      "processing_fee": 2.0,
      "total_price": 9.5,
      "payment_method": "card"
    },
    "requires_payment": true
  }
}
```

### Pricing Scenarios

#### Scenario 1: Walk-in User (No Membership)

```
Duration: 3 hours
Base Rate: $2.50/hour
Subtotal: $7.50
Processing Fee: $2.00
Total: $9.50
```

#### Scenario 2: NFT Holder (50% Discount)

```
Duration: 3 hours
Base Rate: $2.50/hour
Subtotal: $7.50
NFT Discount (50%): -$3.75
After Discount: $3.75
Processing Fee: $2.00
Total: $5.75
```

#### Scenario 3: Member with Hot Desk Access

```
Duration: 3 hours
Total: $0.00 (Included in membership)
Payment Method: membership
```

---

## Booking Management

### List User Bookings

**Endpoint:** `GET /api/bookings`

**Description:** Get all bookings for the authenticated user.

**Query Parameters:**

- `status`: Filter by status (`pending`, `confirmed`, `cancelled`, `completed`)
- `booking_type`: Filter by type (`hourly-desk`, `meeting-room`, `day-pass`)
- `start_date`: Start date filter (YYYY-MM-DD)
- `end_date`: End date filter (YYYY-MM-DD)

**Example Response:**

```json
{
  "success": true,
  "data": {
    "bookings": [...],
    "summary": {
      "total": 10,
      "upcoming": 3,
      "active": 1,
      "past": 5,
      "cancelled": 1
    },
    "categorized": {
      "upcoming": [...],
      "active": [...],
      "past": [...],
      "cancelled": [...]
    }
  }
}
```

### Get Booking Details

**Endpoint:** `GET /api/bookings/:id`

**Description:** Get detailed information about a specific booking.

**Example Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "confirmation_code": "ABC12345",
      "workspace": {...},
      "booking_date": "2025-10-01",
      "start_time": "09:00",
      "end_time": "12:00",
      "status": "confirmed",
      "total_price": 9.50
    },
    "status_info": {
      "is_upcoming": true,
      "is_active": false,
      "is_past": false,
      "can_check_in": true,
      "can_cancel": true,
      "can_extend": false
    }
  }
}
```

### Check In

**Endpoint:** `POST /api/bookings/:id/check-in`

**Description:** Check in to an active booking.

**Restrictions:**

- Must be within 15 minutes before booking start time
- Cannot be more than 1 hour after booking end time
- Cannot have another active booking

**Example Response:**

```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "booking": {
      "id": "uuid",
      "confirmation_code": "ABC12345",
      "workspace": {...},
      "check_in_time": "2025-10-01T09:00:00Z",
      "status": "confirmed"
    }
  }
}
```

### Check Out

**Endpoint:** `POST /api/bookings/:id/check-out`

**Description:** Check out from a booking and calculate final charges.

**Example Response:**

```json
{
  "success": true,
  "message": "Checked out successfully",
  "data": {
    "booking": {
      "id": "uuid",
      "check_in_time": "2025-10-01T09:00:00Z",
      "check_out_time": "2025-10-01T11:30:00Z",
      "status": "completed"
    },
    "usage": {
      "booked_hours": 3,
      "actual_hours": 2.5,
      "description": "Used 2.5 hours of 3 hours booked. Refund issued."
    },
    "charges": {
      "initial_charge": 9.5,
      "final_charge": 8.25,
      "refund_amount": 1.25,
      "overage_charge": 0
    },
    "requires_additional_payment": false,
    "requires_refund": true
  }
}
```

### Extend Booking

**Endpoint:** `POST /api/bookings/:id/extend`

**Description:** Extend an active booking to a new end time.

**Request Body:**

```json
{
  "new_end_time": "14:00"
}
```

**Restrictions:**

- Must be checked in
- New end time must be after current end time
- Extended time must be available
- Cannot exceed workspace max duration

**Example Response:**

```json
{
  "success": true,
  "message": "Booking extended successfully",
  "data": {
    "booking": {
      "id": "uuid",
      "start_time": "09:00",
      "end_time": "14:00",
      "duration_hours": 5
    },
    "extension": {
      "additional_hours": 2,
      "additional_charge": 5.0,
      "new_total": 14.5
    },
    "requires_additional_payment": true
  }
}
```

### Calculate Cost

**Endpoint:** `GET /api/bookings/:id/calculate-cost`

**Description:** Calculate estimated final cost for an active booking.

**Example Response:**

```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "status": "confirmed"
    },
    "is_checked_out": false,
    "usage": {
      "booked_hours": 3,
      "hours_used_so_far": 2,
      "hours_remaining": 1,
      "is_overtime": false
    },
    "charges": {
      "initial_charge": 9.5,
      "estimated_final_charge": 9.5,
      "estimated_refund": 0,
      "estimated_overage": 0
    },
    "formatted_charges": {
      "initial_charge": "$9.50",
      "estimated_final_charge": "$9.50"
    },
    "message": "You have 1.0 hours remaining in your booking."
  }
}
```

### Cancel Booking

**Endpoint:** `DELETE /api/bookings/:id`

**Description:** Cancel a booking.

**Cancellation Policy:**

- **>24 hours before**: Full refund
- **<24 hours before**: No refund
- Cannot cancel if already checked in (must check out first)

**Example Response:**

```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking": {
      "id": "uuid",
      "confirmation_code": "ABC12345",
      "status": "cancelled"
    },
    "cancellation": {
      "cancelled_at": "2025-09-29T12:00:00Z",
      "refund_eligible": true,
      "refund_amount": 9.5,
      "cancellation_policy": "Full refund (cancelled more than 24 hours before booking)"
    }
  }
}
```

---

## Business Logic

### Pricing Matrix

#### Hot Desk Pricing

| User Type                  | Base Rate | NFT Rate | Payment Method |
| -------------------------- | --------- | -------- | -------------- |
| Walk-in                    | $2.50/hr  | $1.25/hr | Card           |
| Day Pass                   | $0        | $0       | Already paid   |
| Monthly Member (with desk) | $0        | $0       | Membership     |
| Monthly Member (no desk)   | $2.50/hr  | $1.25/hr | Card           |

#### Meeting Room Pricing

| Room Type          | Base Rate | With Credits | Overage Rate | NFT Overage |
| ------------------ | --------- | ------------ | ------------ | ----------- |
| Focus Room         | $25/hr    | Free         | $25/hr       | $12.50/hr   |
| Collaborate Room   | $40/hr    | Free         | $40/hr       | $20/hr      |
| Boardroom          | $60/hr    | Free         | $60/hr       | $30/hr      |
| Communications Pod | $5/hr     | Free         | $5/hr        | $2.50/hr    |

### Booking Flow

```
1. User selects workspace and time
2. System checks availability
3. System calculates pricing based on user type
4. User confirms booking
5. Payment processed (if required)
6. Confirmation code generated
7. User can check in (15 min before - 1 hr after start)
8. User can extend booking (if needed)
9. User checks out
10. Final charges calculated
11. Refund/overage processed
```

### Availability Checking

The system prevents double-booking by:

1. Checking existing bookings for the workspace
2. Comparing time slots for overlaps
3. Using formula: `(StartA < EndB) AND (EndA > StartB)`
4. Excluding cancelled bookings

### Final Charge Calculation

**Early Checkout (Refund):**

```
Actual < Booked
Refund = (Booked - Actual) * Rate
```

**Overage (Additional Charge):**

```
Actual > Booked
Overage = (Actual - Booked) * Rate
```

**Exact Usage:**

```
Actual == Booked
No adjustment
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code               | Status | Description                       |
| ------------------ | ------ | --------------------------------- |
| `UNAUTHORIZED`     | 401    | Missing or invalid authentication |
| `FORBIDDEN`        | 403    | User doesn't own this resource    |
| `NOT_FOUND`        | 404    | Resource not found                |
| `VALIDATION_ERROR` | 400    | Invalid request data              |
| `CONFLICT`         | 409    | Time slot already booked          |
| `INTERNAL_ERROR`   | 500    | Server error                      |

### Validation Errors

**Invalid Date Format:**

```json
{
  "success": false,
  "error": "Invalid request: Date must be in YYYY-MM-DD format"
}
```

**Invalid Time Range:**

```json
{
  "success": false,
  "error": "End time must be after start time"
}
```

**Booking in Past:**

```json
{
  "success": false,
  "error": "Cannot book in the past"
}
```

**Insufficient Credits:**

```json
{
  "success": false,
  "error": "Insufficient credits"
}
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test __tests__/services/pricing.service.test.ts
```

### Test Coverage Requirements

- Minimum coverage: 80%
- Unit tests for all services
- Integration tests for all endpoints
- All 5 PRD scenarios covered

### Example Test Cases

**Unit Test (Pricing):**

```typescript
it('should apply 50% NFT holder discount', () => {
  const pricing = calculateHourlyDeskPricing(3, {
    nft_holder: true,
    membership_plan_id: null,
  })

  expect(pricing.subtotal).toBe(3.75)
  expect(pricing.discountAmount).toBe(3.75)
  expect(pricing.nftDiscountApplied).toBe(true)
  expect(pricing.totalPrice).toBe(5.75)
})
```

**Integration Test (API):**

```typescript
it('should create hourly desk booking successfully', async () => {
  const request = new NextRequest(url, {
    method: 'POST',
    headers: { 'x-user-id': userId },
    body: JSON.stringify({ ... })
  });

  const response = await createHourlyDesk(request);
  expect(response.status).toBe(201);
  expect(json.data.booking).toBeDefined();
});
```

### Test Data

Use the following test data for development:

**Test User IDs:**

- Regular user: `user-123`
- NFT holder: `user-nft-456`
- Member with desk: `user-member-789`

**Test Workspace IDs:**

- Hot Desk: `workspace-desk-001`
- Focus Room: `workspace-focus-002`
- Boardroom: `workspace-board-003`

---

## Implementation Status

### Completed Features ✅

- [x] Workspace listing and filtering
- [x] Hot desk availability checking
- [x] Meeting room availability checking
- [x] Hourly desk booking creation
- [x] Check-in/check-out functionality
- [x] Booking extension
- [x] Cost calculation
- [x] Booking cancellation with refund logic
- [x] NFT holder discount (50% off)
- [x] Membership hot desk access
- [x] Credit-based meeting room booking
- [x] Overage charge calculation
- [x] Processing fees
- [x] Actual usage tracking
- [x] Unit tests (80%+ coverage)
- [x] Integration tests

### Pending Features 🔄

- [ ] Stripe payment integration
- [ ] Meeting room booking endpoint
- [ ] Credit allocation on subscription renewal
- [ ] Email notifications
- [ ] Real-time availability updates
- [ ] Webhook handlers for payments

---

## Support

For issues or questions, please contact:

- Email: support@citizenspace.com
- Documentation: https://docs.citizenspace.com
- GitHub Issues: https://github.com/citizenspace/api/issues

---

**Last Updated:** 2025-09-29
**API Version:** 1.0.0
**Status:** Production Ready
