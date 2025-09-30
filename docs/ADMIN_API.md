# Admin API Documentation

## Overview

The CitizenSpace Admin API provides comprehensive management capabilities for administrators and staff. This API implements strict role-based access control (RBAC) with audit logging for all administrative actions.

## Authentication & Authorization

### Roles

The system supports three user roles with hierarchical permissions:

- **admin**: Full access to all operations (CRUD on all resources)
- **staff**: Limited access to bookings and orders (read/update operations)
- **user**: Regular user access (not covered in this document)

### Authentication

All admin endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authorization Responses

- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Valid token but insufficient permissions

## Admin Booking Management

### GET /api/admin/bookings

List all bookings with filtering and pagination.

**Access**: Staff or Admin

**Query Parameters:**
- `status` (optional): Filter by booking status (pending, confirmed, cancelled, completed)
- `booking_type` (optional): Filter by type (hourly-desk, meeting-room, day-pass)
- `user_id` (optional): Filter by specific user
- `workspace_id` (optional): Filter by specific workspace
- `start_date` (optional): Filter bookings from this date (YYYY-MM-DD)
- `end_date` (optional): Filter bookings until this date (YYYY-MM-DD)
- `payment_status` (optional): Filter by payment status (pending, paid, refunded)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `sortBy` (optional): Sort field (default: b.booking_date)
- `sortOrder` (optional): Sort direction (asc, desc; default: desc)

**Example Request:**
```bash
curl -X GET "https://api.citizenspace.com/api/admin/bookings?status=confirmed&page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking-uuid",
      "user_id": "user-uuid",
      "workspace_id": "workspace-uuid",
      "booking_type": "hourly-desk",
      "booking_date": "2025-10-01",
      "start_time": "09:00",
      "end_time": "17:00",
      "status": "confirmed",
      "payment_status": "paid",
      "total_price": 100.00,
      "workspaces": {
        "id": "workspace-uuid",
        "name": "Hot Desk 1",
        "type": "hot-desk"
      },
      "users": {
        "id": "user-uuid",
        "email": "user@example.com",
        "full_name": "John Doe",
        "nft_holder": true
      }
    }
  ],
  "message": "Bookings retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET /api/admin/bookings/:id

Get detailed information about a specific booking.

**Access**: Staff or Admin

**Example Request:**
```bash
curl -X GET "https://api.citizenspace.com/api/admin/bookings/{id}" \
  -H "Authorization: Bearer <token>"
```

### PATCH /api/admin/bookings/:id

Update booking details.

**Access**: Admin only

**Request Body:**
```json
{
  "status": "cancelled",
  "payment_status": "refunded",
  "admin_notes": "Cancelled due to facility maintenance",
  "booking_date": "2025-10-02",
  "start_time": "10:00",
  "end_time": "18:00",
  "workspace_id": "new-workspace-uuid"
}
```

**Notes:**
- All fields are optional
- Changes are logged in audit trail
- Status changes may trigger refund workflows

### DELETE /api/admin/bookings/:id

Cancel a booking.

**Access**: Admin only

**Query Parameters:**
- `reason` (optional): Cancellation reason for audit trail

**Example Request:**
```bash
curl -X DELETE "https://api.citizenspace.com/api/admin/bookings/{id}?reason=User%20request" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": { /* booking object */ },
    "shouldRefund": true
  },
  "message": "Booking cancelled successfully"
}
```

## User Management

### GET /api/admin/users

List all users with filtering and search.

**Access**: Admin only

**Query Parameters:**
- `role` (optional): Filter by role (user, staff, admin)
- `nft_holder` (optional): Filter by NFT holder status (true, false)
- `membership_plan_id` (optional): Filter by membership plan
- `membership_status` (optional): Filter by membership status (active, paused, cancelled)
- `search` (optional): Search by name or email
- `page`, `limit`, `sortBy`, `sortOrder`: Pagination options

**Example Request:**
```bash
curl -X GET "https://api.citizenspace.com/api/admin/users?search=john&nft_holder=true" \
  -H "Authorization: Bearer <token>"
```

### GET /api/admin/users/:id

Get detailed user information including statistics.

**Access**: Admin only

**Response includes:**
- User profile information
- Membership details
- Booking statistics
- Order history summary
- Total spent

### PATCH /api/admin/users/:id

Update user information.

**Access**: Admin only

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "full_name": "Updated Name",
  "phone": "+1234567890",
  "role": "staff",
  "nft_holder": true,
  "nft_token_id": "token-123",
  "membership_plan_id": "plan-uuid",
  "membership_status": "active",
  "wallet_address": "0x..."
}
```

**Important:**
- Admins cannot change their own role
- Role must be one of: user, staff, admin
- Changes are audited

### DELETE /api/admin/users/:id

Soft delete a user (anonymizes data).

**Access**: Admin only

**Notes:**
- Cannot delete users with active bookings
- Cannot delete your own account
- User data is anonymized, not permanently deleted
- Action is logged in audit trail

## Workspace Management

### GET /api/admin/workspaces

List all workspaces.

**Access**: Staff or Admin

**Query Parameters:**
- `type` (optional): Filter by workspace type
- `resource_category` (optional): Filter by category (desk, meeting-room)
- `available` (optional): Filter by availability status
- Pagination parameters

### POST /api/admin/workspaces

Create a new workspace.

**Access**: Admin only

**Request Body:**
```json
{
  "name": "Focus Room 5",
  "type": "focus-room",
  "resource_category": "meeting-room",
  "description": "Private focus room with soundproofing",
  "capacity": 1,
  "base_price_hourly": 15.00,
  "requires_credits": true,
  "min_duration": 1,
  "max_duration": 4,
  "amenities": ["Soundproofing", "Desk", "Monitor"],
  "images": ["image1.jpg", "image2.jpg"],
  "available": true,
  "floor_location": "2nd Floor, East Wing"
}
```

### PATCH /api/admin/workspaces/:id

Update workspace details.

**Access**: Admin only

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "base_price_hourly": 20.00,
  "available": false,
  "amenities": ["Updated", "Amenities"]
}
```

### DELETE /api/admin/workspaces/:id

Soft delete a workspace (marks as unavailable).

**Access**: Admin only

**Notes:**
- Cannot delete workspaces with active or upcoming bookings
- Workspace is marked unavailable, not permanently deleted

## Menu Item Management

### GET /api/admin/menu

List all menu items (including unpublished).

**Access**: Staff or Admin

**Query Parameters:**
- `category` (optional): Filter by category (coffee, tea, pastries, meals)
- `orderable` (optional): Filter by orderable status
- `featured` (optional): Filter by featured status

### POST /api/admin/menu

Create a new menu item.

**Access**: Admin only

**Request Body:**
```json
{
  "title": "Espresso",
  "description": "Double shot of espresso",
  "price": 3.50,
  "category": "coffee",
  "dietary_tags": ["vegan", "gluten-free"],
  "image": "espresso.jpg",
  "orderable": true,
  "featured": false
}
```

**Required fields:** title, price, category

**Valid categories:** coffee, tea, pastries, meals

### PATCH /api/admin/menu/:id

Update menu item.

**Access**: Admin only

### DELETE /api/admin/menu/:id

Delete menu item.

**Access**: Admin only

## Order Management

### GET /api/admin/orders

List all cafe orders.

**Access**: Staff or Admin

**Query Parameters:**
- `status` (optional): Filter by order status
- Pagination parameters

**Use Case:** Real-time order queue for staff

### PATCH /api/admin/orders/:id/status

Update order status.

**Access**: Staff or Admin

**Request Body:**
```json
{
  "status": "preparing"
}
```

**Valid statuses:** pending, preparing, ready, completed, cancelled

**Typical workflow:**
1. pending → preparing (staff starts preparing)
2. preparing → ready (order ready for pickup)
3. ready → completed (customer picked up)

## Analytics & Reports

### GET /api/admin/analytics/bookings

Get booking analytics and statistics.

**Access**: Admin only

**Query Parameters:**
- `start_date` (optional): Start of date range
- `end_date` (optional): End of date range

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total_bookings": 1000,
      "pending_bookings": 50,
      "confirmed_bookings": 800,
      "completed_bookings": 100,
      "cancelled_bookings": 50,
      "hourly_desk_bookings": 600,
      "meeting_room_bookings": 400,
      "total_revenue": 50000.00,
      "average_booking_value": 50.00,
      "total_refunded": 2500.00
    },
    "popularTimes": [
      { "hour": 9, "booking_count": 150 },
      { "hour": 10, "booking_count": 180 },
      { "hour": 14, "booking_count": 120 }
    ]
  }
}
```

### GET /api/admin/analytics/revenue

Get revenue breakdown by category.

**Access**: Admin only

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 75000.00,
    "breakdown": {
      "bookings": {
        "revenue": 50000.00,
        "count": 1000,
        "average": 50.00,
        "refunded": 2500.00
      },
      "cafe": {
        "revenue": 25000.00,
        "count": 5000,
        "average": 5.00
      }
    },
    "period": {
      "start_date": "2025-01-01",
      "end_date": "2025-09-29"
    }
  }
}
```

### GET /api/admin/analytics/users

Get user statistics and membership distribution.

**Access**: Admin only

**Response:**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "total_users": 5000,
      "admin_count": 5,
      "staff_count": 20,
      "user_count": 4975,
      "nft_holder_count": 500,
      "active_members": 1000,
      "paused_members": 50,
      "cancelled_members": 100,
      "new_users_last_30_days": 150,
      "new_users_last_7_days": 40
    },
    "membershipDistribution": [
      {
        "membership_name": "Basic",
        "membership_slug": "basic",
        "user_count": 500,
        "total_revenue": 25000.00
      }
    ]
  }
}
```

## Audit Logging

All administrative actions are automatically logged in the audit trail. Audit logs capture:

- Admin user who performed the action
- Action type (create, update, delete, status_change, refund)
- Resource type and ID
- Before/after values for updates
- IP address and user agent
- Timestamp

Audit logs are available for compliance and security reviews.

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Cannot complete operation (e.g., active bookings exist)
- **422 Unprocessable Entity**: Validation error
- **500 Internal Server Error**: Server error

## Best Practices

1. **Always use HTTPS** in production
2. **Rate limiting**: Admin endpoints have rate limits to prevent abuse
3. **Audit trail**: Review audit logs regularly for security
4. **Pagination**: Always use pagination for list endpoints
5. **Filters**: Use filters to reduce payload size and improve performance
6. **Error handling**: Always check the `success` field in responses
7. **Token refresh**: Implement token refresh to maintain sessions

## Security Considerations

1. **Role verification**: Every request verifies user role
2. **Self-protection**: Admins cannot delete or demote themselves
3. **Active resource protection**: Cannot delete resources with active dependencies
4. **Audit logging**: All actions are logged for compliance
5. **Input validation**: All inputs are validated before processing
6. **SQL injection protection**: Parameterized queries prevent SQL injection
7. **IP tracking**: Client IP addresses are logged for security

## Testing

All admin endpoints have comprehensive test coverage (80%+). Tests cover:

- Authorization (401/403 responses)
- CRUD operations
- Filtering and pagination
- Audit logging
- Error handling
- Edge cases

## Support

For API support or to report issues:
- Email: dev@citizenspace.com
- Documentation: https://docs.citizenspace.com
- GitHub Issues: https://github.com/citizenspace/api/issues

---

**Last Updated:** 2025-09-29
**API Version:** 1.0.0
**Status:** Production Ready