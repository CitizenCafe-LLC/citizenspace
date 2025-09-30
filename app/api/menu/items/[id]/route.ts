import type { NextRequest } from 'next/server'
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
  badRequestResponse,
} from '@/lib/api/response'
import { getMenuItemById, calculateMenuItemPrice } from '@/lib/db/repositories/menu.repository'
import { getCurrentUser } from '@/lib/auth/middleware'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

/**
 * GET /api/menu/items/:id
 * Get a single menu item by ID
 *
 * Path Parameters:
 * - id: UUID of the menu item
 *
 * Authentication: Optional (shows NFT pricing if authenticated)
 *
 * Response:
 * - Returns menu item details with pricing adjusted for NFT holders if authenticated
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Validate UUID format (basic check)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      return badRequestResponse('Invalid menu item ID format')
    }

    // Check if user is authenticated (optional)
    const user = await getCurrentUser(request)
    const isNftHolder = user?.nftHolder || false

    // Fetch menu item
    const { data: menuItem, error } = await getMenuItemById(id)

    if (error) {
      console.error('Error fetching menu item:', error)
      if (error === 'Menu item not found') {
        return notFoundResponse('Menu item not found')
      }
      return serverErrorResponse('Failed to fetch menu item')
    }

    if (!menuItem) {
      return notFoundResponse('Menu item not found')
    }

    // Apply NFT pricing if applicable
    const itemWithPricing = {
      ...menuItem,
      originalPrice: menuItem.price,
      price: calculateMenuItemPrice(menuItem.price, isNftHolder),
      discountApplied: isNftHolder,
    }

    return successResponse(itemWithPricing, 'Menu item retrieved successfully')
  } catch (error) {
    console.error('Unexpected error in GET /api/menu/items/:id:', error)
    return serverErrorResponse('An unexpected error occurred')
  }
}