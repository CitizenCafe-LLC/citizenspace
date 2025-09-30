# Workspace Management API Documentation

## Overview

The Workspace Management API provides endpoints for managing coworking spaces, hot desks, meeting rooms, and their availability. This API implements sophisticated booking conflict detection and availability checking to prevent double-booking.

**Base URL:** `/api/workspaces`

**Authentication:** Currently public endpoints (authentication will be added in Task 1.2)

---

## Table of Contents

1. [Endpoints](#endpoints)
   - [List All Workspaces](#1-list-all-workspaces)
   - [Get Workspace by ID](#2-get-workspace-by-id)
   - [List Hot Desks](#3-list-hot-desks)
   - [List Meeting Rooms](#4-list-meeting-rooms)
   - [Check Availability](#5-check-availability)
2. [Data Models](#data-models)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Examples](#examples)

---

## Endpoints

### 1. List All Workspaces

Get a paginated list of all workspaces with optional filtering.

**Endpoint:** `GET /api/workspaces`

#### Query Parameters

| Parameter           | Type    | Required | Default    | Description                                      |
| ------------------- | ------- | -------- | ---------- | ------------------------------------------------ |
| `page`              | integer | No       | 1          | Page number for pagination                       |
| `limit`             | integer | No       | 20         | Items per page (max: 100)                        |
| `sortBy`            | string  | No       | created_at | Field to sort by                                 |
| `sortOrder`         | string  | No       | desc       | Sort order: `asc` or `desc`                      |
| `type`              | string  | No       | -          | Filter by workspace type                         |
| `resource_category` | string  | No       | -          | Filter by category: `desk` or `meeting-room`     |
| `min_capacity`      | integer | No       | -          | Minimum capacity                                 |
| `max_capacity`      | integer | No       | -          | Maximum capacity                                 |
| `min_price`         | number  | No       | -          | Minimum hourly price                             |
| `max_price`         | number  | No       | -          | Maximum hourly price                             |
| `amenities`         | string  | No       | -          | Comma-separated amenities (e.g., "WiFi,Monitor") |
| `available`         | boolean | No       | -          | Filter by availability status                    |

#### Workspace Types

- `hot-desk` - Flexible desk in open coworking area
- `focus-room` - Private room for individual focus work
- `collaborate-room` - Room for team collaboration
- `boardroom` - Large meeting room with presentation equipment
- `communications-pod` - Private pod for calls/video meetings

#### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Hot Desk 1",
      "type": "hot-desk",
      "resource_category": "desk",
      "description": "Comfortable hot desk with power outlets",
      "capacity": 1,
      "base_price_hourly": 2.5,
      "requires_credits": false,
      "min_duration": 1,
      "max_duration": 8,
      "amenities": ["WiFi", "Power", "Monitor"],
      "images": ["/images/desk1.jpg"],
      "available": true,
      "floor_location": "Main Floor",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "message": "Workspaces retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

#### Example Requests

```bash
# Get all workspaces
GET /api/workspaces

# Get hot desks only
GET /api/workspaces?resource_category=desk

# Filter by capacity and price
GET /api/workspaces?min_capacity=4&max_capacity=10&max_price=20

# Search with multiple amenities
GET /api/workspaces?amenities=WiFi,Whiteboard,Monitor

# Paginated results
GET /api/workspaces?page=2&limit=10&sortBy=name&sortOrder=asc
```

---

### 2. Get Workspace by ID

Get detailed information about a specific workspace.

**Endpoint:** `GET /api/workspaces/:id`

#### Path Parameters

| Parameter | Type | Required | Description                 |
| --------- | ---- | -------- | --------------------------- |
| `id`      | UUID | Yes      | Workspace unique identifier |

#### Response

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Focus Room A",
    "type": "focus-room",
    "resource_category": "meeting-room",
    "description": "Private room perfect for focused work or small meetings",
    "capacity": 4,
    "base_price_hourly": 15.0,
    "requires_credits": true,
    "min_duration": 1,
    "max_duration": 4,
    "amenities": ["WiFi", "Whiteboard", "Monitor", "Conference Phone"],
    "images": ["/images/room1.jpg", "/images/room1-2.jpg"],
    "available": true,
    "floor_location": "Second Floor",
    "created_at": "2025-01-01T00:00:00Z"
  },
  "message": "Workspace retrieved successfully"
}
```

#### Error Responses

**404 Not Found**

```json
{
  "success": false,
  "error": "Workspace not found"
}
```

**400 Bad Request**

```json
{
  "success": false,
  "error": "Invalid workspace ID format"
}
```

#### Example Requests

```bash
# Get specific workspace
GET /api/workspaces/123e4567-e89b-12d3-a456-426614174000
```

---

### 3. List Hot Desks

Get all hot desks (workspaces with `resource_category = 'desk'`).

**Endpoint:** `GET /api/workspaces/hot-desks`

#### Query Parameters

Same pagination parameters as [List All Workspaces](#1-list-all-workspaces):

- `page`, `limit`, `sortBy`, `sortOrder`

#### Response

Same structure as List All Workspaces, but filtered to only include desks.

#### Example Requests

```bash
# Get all hot desks
GET /api/workspaces/hot-desks

# Paginated hot desks
GET /api/workspaces/hot-desks?page=1&limit=10
```

---

### 4. List Meeting Rooms

Get all meeting rooms (workspaces with `resource_category = 'meeting-room'`).

**Endpoint:** `GET /api/workspaces/meeting-rooms`

#### Query Parameters

Same pagination parameters as [List All Workspaces](#1-list-all-workspaces):

- `page`, `limit`, `sortBy`, `sortOrder`

#### Response

Same structure as List All Workspaces, but filtered to only include meeting rooms.

#### Example Requests

```bash
# Get all meeting rooms
GET /api/workspaces/meeting-rooms

# Sorted meeting rooms
GET /api/workspaces/meeting-rooms?sortBy=capacity&sortOrder=desc
```

---

### 5. Check Availability

Check workspace availability for a specific date and time. This endpoint implements sophisticated availability logic with double-booking prevention.

**Endpoint:** `GET /api/workspaces/availability`

#### Query Parameters

| Parameter           | Type   | Required | Description                        |
| ------------------- | ------ | -------- | ---------------------------------- |
| `date`              | string | Yes      | Date in YYYY-MM-DD format          |
| `workspace_id`      | UUID   | No       | Check specific workspace           |
| `start_time`        | string | No       | Start time in HH:MM format         |
| `end_time`          | string | No       | End time in HH:MM format           |
| `duration_hours`    | number | No       | Minimum duration in hours          |
| `resource_category` | string | No       | Filter by `desk` or `meeting-room` |

#### Business Rules

1. **Date Validation:** Date must be today or in the future
2. **Time Range:** Both `start_time` and `end_time` must be provided together
3. **Business Hours:** 7:00 AM - 10:00 PM (07:00 - 22:00)
4. **Time Logic:** End time must be after start time

#### Availability Logic

The endpoint performs the following checks:

1. **Query Bookings:** Retrieves all confirmed/pending bookings for the specified date
2. **Conflict Detection:** Checks for time slot overlaps using the formula:
   ```
   Overlap exists if: (StartA < EndB) AND (EndA > StartB)
   ```
3. **Slot Generation:** If no specific time requested, generates all available time slots
4. **Double-Booking Prevention:** Returns `is_available: false` for conflicting slots

#### Response

```json
{
  "success": true,
  "data": {
    "date": "2025-10-01",
    "workspaces": [
      {
        "workspace": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Hot Desk 1",
          "type": "hot-desk",
          "resource_category": "desk",
          "capacity": 1,
          "base_price_hourly": 2.5,
          "amenities": ["WiFi", "Power"],
          "images": ["/images/desk1.jpg"],
          "min_duration": 1,
          "max_duration": 8
        },
        "is_available": true,
        "available_slots": [
          {
            "start_time": "07:00",
            "end_time": "09:00",
            "available": true,
            "workspace_id": "123e4567-e89b-12d3-a456-426614174000",
            "workspace_name": "Hot Desk 1"
          },
          {
            "start_time": "11:00",
            "end_time": "14:00",
            "available": true,
            "workspace_id": "123e4567-e89b-12d3-a456-426614174000",
            "workspace_name": "Hot Desk 1"
          },
          {
            "start_time": "16:00",
            "end_time": "22:00",
            "available": true,
            "workspace_id": "123e4567-e89b-12d3-a456-426614174000",
            "workspace_name": "Hot Desk 1"
          }
        ],
        "total_available_hours": 11
      }
    ],
    "summary": {
      "total_workspaces": 5,
      "available_workspaces": 3,
      "unavailable_workspaces": 2
    }
  },
  "message": "Availability check completed successfully"
}
```

#### Example Requests

```bash
# Check if specific workspace is available for time slot
GET /api/workspaces/availability?date=2025-10-01&workspace_id=123e4567-e89b-12d3-a456-426614174000&start_time=09:00&end_time=12:00

# Get all available meeting rooms for a date
GET /api/workspaces/availability?date=2025-10-01&resource_category=meeting-room

# Find desks available for at least 4 hours
GET /api/workspaces/availability?date=2025-10-01&resource_category=desk&duration_hours=4

# Get all available slots for all workspaces
GET /api/workspaces/availability?date=2025-10-01
```

#### Error Responses

**400 Bad Request - Past Date**

```json
{
  "success": false,
  "error": "Date must be today or in the future"
}
```

**400 Bad Request - Invalid Time Range**

```json
{
  "success": false,
  "error": "End time must be after start time"
}
```

**400 Bad Request - Outside Business Hours**

```json
{
  "success": false,
  "error": "Start time must be between 7:00 AM and 10:00 PM"
}
```

---

## Data Models

### Workspace Model

```typescript
interface Workspace {
  id: string // UUID
  name: string
  type: WorkspaceType
  resource_category: 'desk' | 'meeting-room'
  description: string
  capacity: number // Number of people
  base_price_hourly: number // Hourly rate in dollars
  requires_credits: boolean // Can use membership credits
  min_duration: number // Minimum booking hours
  max_duration: number // Maximum booking hours
  amenities: string[]
  images: string[]
  available: boolean
  floor_location: string
  created_at: string // ISO 8601 timestamp
}
```

### Availability Slot Model

```typescript
interface AvailabilitySlot {
  start_time: string // HH:MM format
  end_time: string // HH:MM format
  available: boolean
  workspace_id: string
  workspace_name: string
}
```

---

## Error Handling

All endpoints follow a consistent error response structure:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Description                               |
| ---- | ----------------------------------------- |
| 200  | Success                                   |
| 400  | Bad Request - Invalid parameters          |
| 404  | Not Found - Resource doesn't exist        |
| 422  | Validation Error - Data validation failed |
| 500  | Internal Server Error                     |

### Common Error Messages

- `"Invalid workspace ID format"` - Provided ID is not a valid UUID
- `"Workspace not found"` - Workspace with specified ID doesn't exist
- `"Invalid filters: ..."` - Query parameters failed validation
- `"Invalid pagination: ..."` - Pagination parameters are invalid
- `"Date must be today or in the future"` - Cannot check past availability
- `"Both start_time and end_time must be provided together"` - Missing time parameter
- `"Failed to fetch workspaces"` - Database error occurred

---

## Rate Limiting

Currently, no rate limiting is implemented. This will be added in future updates.

**Recommended limits for production:**

- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## Examples

### Example 1: Find Available Meeting Rooms for Tomorrow

```bash
# Get tomorrow's date
TOMORROW=$(date -d tomorrow +%Y-%m-%d)

# Check availability
curl "http://localhost:3000/api/workspaces/availability?date=${TOMORROW}&resource_category=meeting-room"
```

### Example 2: Book a 2-Hour Slot

```bash
# Step 1: Check if time slot is available
curl "http://localhost:3000/api/workspaces/availability?date=2025-10-01&workspace_id=123e4567-e89b-12d3-a456-426614174000&start_time=14:00&end_time=16:00"

# Step 2: If available, proceed with booking (see Booking API docs)
```

### Example 3: Find All Workspaces with Specific Amenities

```bash
# Search for workspaces with whiteboard and monitor
curl "http://localhost:3000/api/workspaces?amenities=Whiteboard,Monitor&available=true"
```

### Example 4: Get Meeting Rooms for Large Group

```bash
# Find rooms that can accommodate 8+ people
curl "http://localhost:3000/api/workspaces/meeting-rooms?min_capacity=8&sortBy=capacity&sortOrder=desc"
```

---

## Testing

### Running Tests

```bash
# Run all workspace API tests
npm test __tests__/api/workspaces.test.ts

# Run with coverage
npm run test:coverage

# Watch mode during development
npm run test:watch
```

### Test Coverage

The test suite achieves **80%+ coverage** and includes:

- ✅ All endpoint scenarios (success and error cases)
- ✅ Query parameter validation
- ✅ Filtering and pagination
- ✅ Availability logic and double-booking prevention
- ✅ Edge cases and boundary conditions
- ✅ Error handling

---

## Implementation Notes

### Double-Booking Prevention Algorithm

The availability checking uses an efficient overlap detection algorithm:

```typescript
function hasOverlap(booking1, booking2) {
  const start1 = timeToMinutes(booking1.start_time)
  const end1 = timeToMinutes(booking1.end_time)
  const start2 = timeToMinutes(booking2.start_time)
  const end2 = timeToMinutes(booking2.end_time)

  // Overlap exists if: (StartA < EndB) AND (EndA > StartB)
  return start1 < end2 && end1 > start2
}
```

### Performance Considerations

1. **Database Indexing:** Ensure indexes on:
   - `workspaces.type`
   - `workspaces.resource_category`
   - `bookings.booking_date`
   - `bookings.workspace_id`

2. **Query Optimization:**
   - Fetch only necessary columns
   - Use pagination to limit result sets
   - Filter in database, not in application code

3. **Caching Strategy:**
   - Cache workspace data (changes infrequently)
   - Do NOT cache availability (changes frequently)

---

## Future Enhancements

- [ ] Add authentication and authorization
- [ ] Implement rate limiting
- [ ] Add real-time availability updates via WebSockets
- [ ] Support recurring availability checks
- [ ] Add workspace calendar export (iCal format)
- [ ] Implement advance booking limits
- [ ] Add bulk availability check endpoint

---

## Support

For questions or issues:

- Email: hello@citizenspace.com
- GitHub: [Report an issue](https://github.com/citizenspace/api/issues)

---

**Last Updated:** 2025-09-29
**API Version:** 1.0.0
**Author:** Backend API Architect
