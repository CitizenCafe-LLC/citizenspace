/**
 * Menu Repository
 * Handles all database operations for menu items
 * Implements data access layer with proper error handling
 */

import { executeQuery, executeQuerySingle } from '../postgres'
import type { MenuItem, PaginationParams } from '../types'

/**
 * Interface for menu item filters
 */
export interface MenuItemFilters {
  category?: 'coffee' | 'tea' | 'pastries' | 'meals'
  orderable?: boolean
  featured?: boolean
  dietary_tags?: string[]
}

/**
 * Database representation of a menu item
 */
export interface DbMenuItem {
  id: string
  title: string
  description: string | null
  price: string // Decimal returned as string from DB
  category: 'coffee' | 'tea' | 'pastries' | 'meals'
  dietary_tags: string[]
  image: string | null
  orderable: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

/**
 * Get all menu items with optional filtering and pagination
 */
export async function getAllMenuItems(
  filters?: MenuItemFilters,
  pagination?: PaginationParams
) {
  try {
    const whereClauses: string[] = []
    const params: any[] = []
    let paramCount = 1

    // Build WHERE clauses based on filters
    if (filters) {
      if (filters.category) {
        whereClauses.push(`category = $${paramCount++}`)
        params.push(filters.category)
      }
      if (filters.orderable !== undefined) {
        whereClauses.push(`orderable = $${paramCount++}`)
        params.push(filters.orderable)
      }
      if (filters.featured !== undefined) {
        whereClauses.push(`featured = $${paramCount++}`)
        params.push(filters.featured)
      }
      if (filters.dietary_tags && filters.dietary_tags.length > 0) {
        whereClauses.push(`dietary_tags && $${paramCount++}::text[]`)
        params.push(filters.dietary_tags)
      }
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    // Build ORDER BY clause
    const sortBy = pagination?.sortBy || 'category, title'
    const sortOrder = pagination?.sortOrder === 'asc' ? 'ASC' : 'ASC' // Default to ASC for menu
    const orderClause = `ORDER BY ${sortBy} ${sortOrder}`

    // Build LIMIT and OFFSET
    const page = pagination?.page || 1
    const limit = pagination?.limit || 100 // Higher default for menu items
    const offset = (page - 1) * limit
    const limitClause = `LIMIT $${paramCount++} OFFSET $${paramCount++}`
    params.push(limit, offset)

    // Count total records
    const countQuery = `SELECT COUNT(*) FROM menu_items ${whereClause}`
    const countResult = await executeQuerySingle<{ count: string }>(
      countQuery,
      params.slice(0, params.length - 2) // Exclude LIMIT and OFFSET params
    )

    if (countResult.error) {
      return { data: null, error: countResult.error, count: 0 }
    }

    const count = parseInt(countResult.data?.count || '0')

    // Fetch data
    const dataQuery = `
      SELECT * FROM menu_items
      ${whereClause}
      ${orderClause}
      ${limitClause}
    `

    const result = await executeQuery<DbMenuItem>(dataQuery, params)

    if (result.error) {
      return { data: null, error: result.error, count: 0 }
    }

    // Convert price from string to number
    const menuItems = result.data?.map(item => ({
      ...item,
      price: parseFloat(item.price),
    }))

    return { data: menuItems, error: null, count }
  } catch (error) {
    console.error('Error in getAllMenuItems:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch menu items',
      count: 0,
    }
  }
}

/**
 * Get menu items by category
 */
export async function getMenuItemsByCategory(
  category: 'coffee' | 'tea' | 'pastries' | 'meals',
  pagination?: PaginationParams
) {
  return getAllMenuItems({ category, orderable: true }, pagination)
}

/**
 * Get featured menu items
 */
export async function getFeaturedMenuItems() {
  return getAllMenuItems({ featured: true, orderable: true })
}

/**
 * Get menu item by ID
 */
export async function getMenuItemById(id: string) {
  try {
    const query = 'SELECT * FROM menu_items WHERE id = $1'
    const result = await executeQuerySingle<DbMenuItem>(query, [id])

    if (result.error) {
      console.error('Error fetching menu item:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'Menu item not found' }
    }

    // Convert price from string to number
    const menuItem = {
      ...result.data,
      price: parseFloat(result.data.price),
    }

    return { data: menuItem, error: null }
  } catch (error) {
    console.error('Error in getMenuItemById:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch menu item',
    }
  }
}

/**
 * Calculate price with NFT holder discount
 * NFT holders get 10% off cafe items
 */
export function calculateMenuItemPrice(basePrice: number, isNftHolder: boolean): number {
  if (isNftHolder) {
    return Number((basePrice * 0.9).toFixed(2)) // 10% discount
  }
  return basePrice
}

/**
 * Get menu items with pricing adjusted for NFT holders
 */
export async function getMenuItemsWithPricing(
  isNftHolder: boolean,
  filters?: MenuItemFilters,
  pagination?: PaginationParams
) {
  const result = await getAllMenuItems(filters, pagination)

  if (result.error || !result.data) {
    return result
  }

  // Apply NFT discount if applicable
  const itemsWithPricing = result.data.map(item => ({
    ...item,
    originalPrice: item.price,
    price: calculateMenuItemPrice(item.price, isNftHolder),
    discountApplied: isNftHolder,
  }))

  return { data: itemsWithPricing, error: null, count: result.count }
}

/**
 * Create a new menu item (admin only)
 */
export async function createMenuItem(data: {
  title: string
  description?: string
  price: number
  category: 'coffee' | 'tea' | 'pastries' | 'meals'
  dietary_tags?: string[]
  image?: string
  orderable?: boolean
  featured?: boolean
}) {
  try {
    const query = `
      INSERT INTO menu_items (
        title, description, price, category, dietary_tags,
        image, orderable, featured
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const params = [
      data.title,
      data.description || null,
      data.price,
      data.category,
      data.dietary_tags || [],
      data.image || null,
      data.orderable !== undefined ? data.orderable : true,
      data.featured !== undefined ? data.featured : false,
    ]

    const result = await executeQuerySingle<DbMenuItem>(query, params)

    if (result.error) {
      console.error('Error creating menu item:', result.error)
      return { data: null, error: result.error }
    }

    const menuItem = result.data
      ? {
          ...result.data,
          price: parseFloat(result.data.price),
        }
      : null

    return { data: menuItem, error: null }
  } catch (error) {
    console.error('Error in createMenuItem:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create menu item',
    }
  }
}

/**
 * Update a menu item (admin only)
 */
export async function updateMenuItem(
  id: string,
  data: Partial<{
    title: string
    description: string
    price: number
    category: 'coffee' | 'tea' | 'pastries' | 'meals'
    dietary_tags: string[]
    image: string
    orderable: boolean
    featured: boolean
  }>
) {
  try {
    const setClauses: string[] = []
    const params: any[] = []
    let paramCount = 1

    // Build SET clauses dynamically based on provided fields
    if (data.title !== undefined) {
      setClauses.push(`title = $${paramCount++}`)
      params.push(data.title)
    }
    if (data.description !== undefined) {
      setClauses.push(`description = $${paramCount++}`)
      params.push(data.description)
    }
    if (data.price !== undefined) {
      setClauses.push(`price = $${paramCount++}`)
      params.push(data.price)
    }
    if (data.category !== undefined) {
      setClauses.push(`category = $${paramCount++}`)
      params.push(data.category)
    }
    if (data.dietary_tags !== undefined) {
      setClauses.push(`dietary_tags = $${paramCount++}`)
      params.push(data.dietary_tags)
    }
    if (data.image !== undefined) {
      setClauses.push(`image = $${paramCount++}`)
      params.push(data.image)
    }
    if (data.orderable !== undefined) {
      setClauses.push(`orderable = $${paramCount++}`)
      params.push(data.orderable)
    }
    if (data.featured !== undefined) {
      setClauses.push(`featured = $${paramCount++}`)
      params.push(data.featured)
    }

    if (setClauses.length === 0) {
      return { data: null, error: 'No fields to update' }
    }

    params.push(id)

    const query = `
      UPDATE menu_items
      SET ${setClauses.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `

    const result = await executeQuerySingle<DbMenuItem>(query, params)

    if (result.error) {
      console.error('Error updating menu item:', result.error)
      return { data: null, error: result.error }
    }

    if (!result.data) {
      return { data: null, error: 'Menu item not found' }
    }

    const menuItem = {
      ...result.data,
      price: parseFloat(result.data.price),
    }

    return { data: menuItem, error: null }
  } catch (error) {
    console.error('Error in updateMenuItem:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update menu item',
    }
  }
}

/**
 * Delete a menu item (admin only)
 */
export async function deleteMenuItem(id: string) {
  try {
    const query = 'DELETE FROM menu_items WHERE id = $1 RETURNING id'
    const result = await executeQuerySingle<{ id: string }>(query, [id])

    if (result.error) {
      console.error('Error deleting menu item:', result.error)
      return { success: false, error: result.error }
    }

    if (!result.data) {
      return { success: false, error: 'Menu item not found' }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error in deleteMenuItem:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete menu item',
    }
  }
}