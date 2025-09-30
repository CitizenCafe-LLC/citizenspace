# CitizenSpace Booking API - Quick Reference

## Authentication
All endpoints require: `x-user-id: <user_uuid>` header (or JWT token in production)

---

## Endpoints Summary

### Workspace Management (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/workspaces` | List all workspaces |
| GET | `/api/workspaces/:id` | Get workspace details |
| GET | `/api/workspaces/hot-desks` | List hot desks only |
| GET | `/api/workspaces/meeting-rooms` | List meeting rooms only |
| GET | `/api/workspaces/availability` | Check availability |

### Booking Management (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings/hourly-desk` | Create hourly desk booking |
| GET | `/api/bookings` | List user bookings |
| GET | `/api/bookings/:id` | Get booking details |
| POST | `/api/bookings/:id/check-in` | Check in to booking |
| POST | `/api/bookings/:id/check-out` | Check out from booking |
| POST | `/api/bookings/:id/extend` | Extend active booking |
| GET | `/api/bookings/:id/calculate-cost` | Calculate estimated cost |
| DELETE | `/api/bookings/:id` | Cancel booking |

---

## Quick Examples

### Create Booking
```bash
curl -X POST http://localhost:3000/api/bookings/hourly-desk \
  -H "x-user-id: user-123" \
  -H "Content-Type: application/json" \
  -d '{
    "workspace_id": "workspace-456",
    "booking_date": "2025-10-01",
    "start_time": "09:00",
    "end_time": "12:00"
  }'
```

### Check In
```bash
curl -X POST http://localhost:3000/api/bookings/booking-789/check-in \
  -H "x-user-id: user-123"
```

### Check Out
```bash
curl -X POST http://localhost:3000/api/bookings/booking-789/check-out \
  -H "x-user-id: user-123"
```

### List Bookings
```bash
curl http://localhost:3000/api/bookings?status=confirmed \
  -H "x-user-id: user-123"
```

---

## Pricing Quick Reference

| User Type | Hot Desk Rate | NFT Rate | Processing Fee |
|-----------|---------------|----------|----------------|
| Walk-in | $2.50/hr | $1.25/hr | $2.00 |
| Member | $0 | $0 | $0 |
| Day Pass | $0 | $0 | $0 |

**Example Calculations:**

3-hour booking:
- Walk-in: $7.50 + $2.00 = **$9.50**
- NFT: $3.75 + $2.00 = **$5.75**
- Member: **$0.00**

---

## Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (time slot taken) |
| 500 | Server Error |

---

## Common Filters

### List Workspaces
```
?type=hot-desk
?resource_category=desk
?available=true
?min_capacity=1&max_capacity=4
```

### List Bookings
```
?status=confirmed
?booking_type=hourly-desk
?start_date=2025-10-01
?end_date=2025-10-31
```

---

## Time Formats

- **Date:** `YYYY-MM-DD` (e.g., `2025-10-01`)
- **Time:** `HH:MM` (e.g., `09:00`, `14:30`)
- **Timestamp:** ISO 8601 (e.g., `2025-10-01T09:00:00Z`)

---

## Booking Flow

```
1. Check availability      GET /api/workspaces/availability
2. Create booking         POST /api/bookings/hourly-desk
3. (Payment if required)
4. Check in              POST /api/bookings/:id/check-in
5. (Optional) Extend     POST /api/bookings/:id/extend
6. Check cost            GET /api/bookings/:id/calculate-cost
7. Check out            POST /api/bookings/:id/check-out
```

---

## Testing

Run tests:
```bash
npm test
npm run test:coverage
```

Run specific test:
```bash
npm test __tests__/services/pricing.service.test.ts
```

---

For detailed documentation, see `/docs/api-bookings.md`