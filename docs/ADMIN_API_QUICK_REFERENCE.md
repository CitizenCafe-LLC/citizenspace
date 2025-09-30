# Admin API Quick Reference

## Quick Access Guide for Developers

### Authentication Header
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoints by Role

### Admin Only (Full Access)
```
PATCH /api/admin/bookings/:id          # Update booking
DELETE /api/admin/bookings/:id         # Cancel booking
GET /api/admin/users                   # List users
PATCH /api/admin/users/:id             # Update user
DELETE /api/admin/users/:id            # Delete user
POST /api/admin/workspaces             # Create workspace
PATCH /api/admin/workspaces/:id        # Update workspace
DELETE /api/admin/workspaces/:id       # Delete workspace
POST /api/admin/menu                   # Create menu item
PATCH /api/admin/menu/:id              # Update menu item
DELETE /api/admin/menu/:id             # Delete menu item
GET /api/admin/analytics/*             # All analytics
```

### Staff or Admin
```
GET /api/admin/bookings                # List bookings
GET /api/admin/bookings/:id            # View booking
GET /api/admin/workspaces              # List workspaces
GET /api/admin/menu                    # List menu items
GET /api/admin/orders                  # List orders
PATCH /api/admin/orders/:id/status     # Update order status
```

---

## Common Query Parameters

### Pagination (all list endpoints)
```
?page=1              # Page number (default: 1)
&limit=20            # Items per page (default: 20)
&sortBy=created_at   # Sort field
&sortOrder=desc      # asc or desc
```

### Bookings Filters
```
?status=confirmed
&booking_type=hourly-desk
&user_id=<uuid>
&workspace_id=<uuid>
&start_date=2025-10-01
&end_date=2025-10-31
&payment_status=paid
```

### Users Filters
```
?role=admin
&nft_holder=true
&membership_status=active
&search=john
```

### Analytics Filters
```
?start_date=2025-01-01
&end_date=2025-12-31
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* resource or array */ },
  "message": "Operation successful",
  "meta": { /* pagination info */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### HTTP Status Codes
- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Server Error

---

## Quick Examples

### List All Bookings
```bash
curl -X GET "https://api.citizenspace.com/api/admin/bookings?status=confirmed&page=1" \
  -H "Authorization: Bearer <token>"
```

### Update User Role
```bash
curl -X PATCH "https://api.citizenspace.com/api/admin/users/<id>" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"role": "staff"}'
```

### Create Workspace
```bash
curl -X POST "https://api.citizenspace.com/api/admin/workspaces" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hot Desk 5",
    "type": "hot-desk",
    "resource_category": "desk",
    "description": "Shared workspace",
    "capacity": 1,
    "base_price_hourly": 10.00,
    "floor_location": "1st Floor"
  }'
```

### Update Order Status
```bash
curl -X PATCH "https://api.citizenspace.com/api/admin/orders/<id>/status" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "ready"}'
```

### Get Revenue Analytics
```bash
curl -X GET "https://api.citizenspace.com/api/admin/analytics/revenue" \
  -H "Authorization: Bearer <token>"
```

---

## Common Workflows

### Cancel a Booking
1. GET /api/admin/bookings/:id (verify booking)
2. DELETE /api/admin/bookings/:id?reason=User%20request
3. Check `shouldRefund` in response
4. Process refund if needed

### Process Order (Staff)
1. GET /api/admin/orders?status=pending
2. PATCH /api/admin/orders/:id/status {"status": "preparing"}
3. PATCH /api/admin/orders/:id/status {"status": "ready"}
4. PATCH /api/admin/orders/:id/status {"status": "completed"}

### Create New Admin
1. First create user via regular registration
2. PATCH /api/admin/users/:id {"role": "admin"}
3. Verify in GET /api/admin/users

### Daily Analytics Check
1. GET /api/admin/analytics/bookings
2. GET /api/admin/analytics/revenue
3. GET /api/admin/analytics/users

---

## Security Reminders

- Never share JWT tokens
- Tokens expire, implement refresh logic
- Admins cannot delete/demote themselves
- All actions are audit logged
- Use HTTPS in production
- Rate limits apply

---

## Repository Functions

### Import and Use
```typescript
import { getAllBookings } from '@/lib/db/repositories/booking.repository'
import { getAllUsers } from '@/lib/db/repositories/users.repository'
import { createAuditLog } from '@/lib/db/repositories/audit.repository'

// Use in API routes
const { data, error, count } = await getAllBookings(filters)
```

### RBAC Middleware
```typescript
import { withAdminAuth, withStaffOrAdminAuth } from '@/lib/auth/rbac'

// Protect route handler
export const GET = withStaffOrAdminAuth(handleGet)
export const PATCH = withAdminAuth(handlePatch)
```

---

## Testing

### Run Admin Tests
```bash
npm test -- __tests__/api/admin/
```

### Run RBAC Tests
```bash
npm test -- __tests__/lib/auth/rbac.test.ts
```

### Coverage Report
```bash
npm test -- --coverage
```

---

## Support & Documentation

- Full API Docs: `/docs/ADMIN_API.md`
- Implementation Summary: `/TASK_7.2_IMPLEMENTATION_SUMMARY.md`
- Project Backlog: `/BACKLOG.md`

---

**Quick Reference Version:** 1.0.0
**Last Updated:** 2025-09-29