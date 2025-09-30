/**
 * Orders Repository
 * Handles all database operations for cafe orders
 * Implements data access layer with proper error handling and transaction support
 */

import { getClient, query, transaction } from '../connection'
import type { PoolClient } from 'pg'
import type { PaginationParams } from '../types'

/**
 * Order status types
 */
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'

/**
 * Database representation of an order
 */
export interface DbOrder {
  id: string
  user_id: string | null
  subtotal: string // Decimal returned as string from DB
  discount_amount: string
  nft_discount_applied: boolean
  processing_fee: string
  total_price: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_intent_id: string | null
  special_instructions: string | null
  created_at: string
  updated_at: string
}

/**
 * Database representation of an order item
 */
export interface DbOrderItem {
  id: string
  order_id: string
  menu_item_id: string | null
  quantity: number
  unit_price: string
  subtotal: string
  created_at: string
}

/**
 * Order with items
 */
export interface OrderWithItems extends Omit<DbOrder, 'subtotal' | 'discount_amount' | 'processing_fee' | 'total_price'> {
  subtotal: number
  discount_amount: number
  processing_fee: number
  total_price: number
  items: Array<Omit<DbOrderItem, 'unit_price' | 'subtotal'> & {
    unit_price: number
    subtotal: number
    menu_item?: {
      id: string
      title: string
      category: string
      image?: string
    }
  }>
}

/**
 * Order creation data
 */
export interface CreateOrderData {
  user_id?: string
  items: Array<{
    menu_item_id: string
    quantity: number
    unit_price: number
  }>
  special_instructions?: string
  is_nft_holder?: boolean
}

/**
 * Calculate order totals with NFT discount
 */
export function calculateOrderTotals(
  items: Array<{ quantity: number; unit_price: number }>,
  isNftHolder: boolean = false
) {
  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)

  // Apply NFT holder discount (10% off)
  const discountAmount = isNftHolder ? subtotal * 0.1 : 0

  // Calculate processing fee (2.9% + $0.30 for Stripe)
  const subtotalAfterDiscount = subtotal - discountAmount
  const processingFee = subtotalAfterDiscount * 0.029 + 0.3

  // Calculate total
  const totalPrice = subtotalAfterDiscount + processingFee

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    processingFee: Number(processingFee.toFixed(2)),
    totalPrice: Number(totalPrice.toFixed(2)),
  }
}

/**
 * Create a new order with items (uses transaction)
 */
export async function createOrder(data: CreateOrderData) {
  try {
    return await transaction(async client => {
      // Calculate totals
      const totals = calculateOrderTotals(data.items, data.is_nft_holder)

      // Insert order
      const orderQuery = `
        INSERT INTO orders (
          user_id, subtotal, discount_amount, nft_discount_applied,
          processing_fee, total_price, status, payment_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `

      const orderParams = [
        data.user_id || null,
        totals.subtotal,
        totals.discountAmount,
        data.is_nft_holder || false,
        totals.processingFee,
        totals.totalPrice,
        'pending',
        'pending',
      ]

      const orderResult = await client.query<DbOrder>(orderQuery, orderParams)
      const order = orderResult.rows[0]

      if (!order) {
        throw new Error('Failed to create order')
      }

      // Insert order items
      const orderItems: DbOrderItem[] = []
      for (const item of data.items) {
        const itemSubtotal = item.quantity * item.unit_price

        const itemQuery = `
          INSERT INTO order_items (
            order_id, menu_item_id, quantity, unit_price, subtotal
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `

        const itemParams = [order.id, item.menu_item_id, item.quantity, item.unit_price, itemSubtotal]

        const itemResult = await client.query<DbOrderItem>(itemQuery, itemParams)
        if (itemResult.rows[0]) {
          orderItems.push(itemResult.rows[0])
        }
      }

      // Update special instructions if provided
      if (data.special_instructions) {
        await client.query('UPDATE orders SET special_instructions = $1 WHERE id = $2', [
          data.special_instructions,
          order.id,
        ])
      }

      // Convert to proper types
      const orderWithItems: OrderWithItems = {
        ...order,
        subtotal: parseFloat(order.subtotal),
        discount_amount: parseFloat(order.discount_amount),
        processing_fee: parseFloat(order.processing_fee),
        total_price: parseFloat(order.total_price),
        items: orderItems.map(item => ({
          ...item,
          unit_price: parseFloat(item.unit_price),
          subtotal: parseFloat(item.subtotal),
        })),
      }

      return { data: orderWithItems, error: null }
    })
  } catch (error) {
    console.error('Error in createOrder:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create order',
    }
  }
}

/**
 * Get order by ID with items and menu item details
 */
export async function getOrderById(orderId: string) {
  try {
    // Get order
    const orderQuery = 'SELECT * FROM orders WHERE id = $1'
    const orderResult = await query<DbOrder>(orderQuery, [orderId])

    if (orderResult.rows.length === 0) {
      return { data: null, error: 'Order not found' }
    }

    const order = orderResult.rows[0]

    // Get order items with menu item details
    const itemsQuery = `
      SELECT
        oi.*,
        mi.id as menu_item_id,
        mi.title as menu_item_title,
        mi.category as menu_item_category,
        mi.image as menu_item_image
      FROM order_items oi
      LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
      WHERE oi.order_id = $1
      ORDER BY oi.created_at
    `

    const itemsResult = await query(itemsQuery, [orderId])

    // Format order with items
    const orderWithItems: OrderWithItems = {
      ...order,
      subtotal: parseFloat(order.subtotal),
      discount_amount: parseFloat(order.discount_amount),
      processing_fee: parseFloat(order.processing_fee),
      total_price: parseFloat(order.total_price),
      items: itemsResult.rows.map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price),
        subtotal: parseFloat(item.subtotal),
        created_at: item.created_at,
        menu_item: item.menu_item_id
          ? {
              id: item.menu_item_id,
              title: item.menu_item_title,
              category: item.menu_item_category,
              image: item.menu_item_image,
            }
          : undefined,
      })),
    }

    return { data: orderWithItems, error: null }
  } catch (error) {
    console.error('Error in getOrderById:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch order',
    }
  }
}

/**
 * Get orders for a specific user with pagination
 */
export async function getUserOrders(userId: string, pagination?: PaginationParams) {
  try {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 20
    const offset = (page - 1) * limit
    const sortBy = pagination?.sortBy || 'created_at'
    const sortOrder = pagination?.sortOrder === 'asc' ? 'ASC' : 'DESC'

    // Count total orders
    const countQuery = 'SELECT COUNT(*) FROM orders WHERE user_id = $1'
    const countResult = await query<{ count: string }>(countQuery, [userId])
    const count = parseInt(countResult.rows[0]?.count || '0')

    // Get orders
    const ordersQuery = `
      SELECT * FROM orders
      WHERE user_id = $1
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $2 OFFSET $3
    `

    const ordersResult = await query<DbOrder>(ordersQuery, [userId, limit, offset])

    // Get items for each order
    const ordersWithItems: OrderWithItems[] = []
    for (const order of ordersResult.rows) {
      const { data: orderWithItems } = await getOrderById(order.id)
      if (orderWithItems) {
        ordersWithItems.push(orderWithItems)
      }
    }

    return { data: ordersWithItems, error: null, count }
  } catch (error) {
    console.error('Error in getUserOrders:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch user orders',
      count: 0,
    }
  }
}

/**
 * Get all orders with pagination (admin/staff)
 */
export async function getAllOrders(pagination?: PaginationParams, statusFilter?: OrderStatus) {
  try {
    const page = pagination?.page || 1
    const limit = pagination?.limit || 20
    const offset = (page - 1) * limit
    const sortBy = pagination?.sortBy || 'created_at'
    const sortOrder = pagination?.sortOrder === 'asc' ? 'ASC' : 'DESC'

    // Build WHERE clause
    const whereClause = statusFilter ? `WHERE status = $1` : ''
    const params: any[] = []
    let paramCount = 1

    if (statusFilter) {
      params.push(statusFilter)
      paramCount++
    }

    // Count total orders
    const countQuery = `SELECT COUNT(*) FROM orders ${whereClause}`
    const countResult = await query<{ count: string }>(countQuery, statusFilter ? [statusFilter] : [])
    const count = parseInt(countResult.rows[0]?.count || '0')

    // Get orders
    const ordersQuery = `
      SELECT * FROM orders
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramCount++} OFFSET $${paramCount++}
    `

    params.push(limit, offset)
    const ordersResult = await query<DbOrder>(ordersQuery, params)

    // Get items for each order
    const ordersWithItems: OrderWithItems[] = []
    for (const order of ordersResult.rows) {
      const { data: orderWithItems } = await getOrderById(order.id)
      if (orderWithItems) {
        ordersWithItems.push(orderWithItems)
      }
    }

    return { data: ordersWithItems, error: null, count }
  } catch (error) {
    console.error('Error in getAllOrders:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch orders',
      count: 0,
    }
  }
}

/**
 * Update order status (staff only)
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const updateQuery = `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING *
    `

    const result = await query<DbOrder>(updateQuery, [status, orderId])

    if (result.rows.length === 0) {
      return { data: null, error: 'Order not found' }
    }

    const order = result.rows[0]
    const orderData = {
      ...order,
      subtotal: parseFloat(order.subtotal),
      discount_amount: parseFloat(order.discount_amount),
      processing_fee: parseFloat(order.processing_fee),
      total_price: parseFloat(order.total_price),
    }

    return { data: orderData, error: null }
  } catch (error) {
    console.error('Error in updateOrderStatus:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update order status',
    }
  }
}

/**
 * Update payment status and payment intent ID
 */
export async function updateOrderPayment(
  orderId: string,
  paymentStatus: PaymentStatus,
  paymentIntentId?: string
) {
  try {
    const updateQuery = `
      UPDATE orders
      SET payment_status = $1, payment_intent_id = $2
      WHERE id = $3
      RETURNING *
    `

    const result = await query<DbOrder>(updateQuery, [paymentStatus, paymentIntentId || null, orderId])

    if (result.rows.length === 0) {
      return { data: null, error: 'Order not found' }
    }

    const order = result.rows[0]
    const orderData = {
      ...order,
      subtotal: parseFloat(order.subtotal),
      discount_amount: parseFloat(order.discount_amount),
      processing_fee: parseFloat(order.processing_fee),
      total_price: parseFloat(order.total_price),
    }

    return { data: orderData, error: null }
  } catch (error) {
    console.error('Error in updateOrderPayment:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update order payment',
    }
  }
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId: string, userId?: string) {
  try {
    // If userId provided, verify ownership
    let checkQuery = 'SELECT id, status, payment_status FROM orders WHERE id = $1'
    let checkParams: any[] = [orderId]

    if (userId) {
      checkQuery += ' AND user_id = $2'
      checkParams.push(userId)
    }

    const checkResult = await query<DbOrder>(checkQuery, checkParams)

    if (checkResult.rows.length === 0) {
      return { data: null, error: 'Order not found or access denied' }
    }

    const order = checkResult.rows[0]

    // Can only cancel pending or preparing orders
    if (order.status !== 'pending' && order.status !== 'preparing') {
      return { data: null, error: 'Cannot cancel order in current status' }
    }

    // Update order to cancelled
    const updateResult = await updateOrderStatus(orderId, 'cancelled')

    return updateResult
  } catch (error) {
    console.error('Error in cancelOrder:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to cancel order',
    }
  }
}

/**
 * Get order statistics (admin/staff)
 */
export async function getOrderStats() {
  try {
    const statsQuery = `
      SELECT
        COUNT(*) as total_orders,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_orders,
        COUNT(*) FILTER (WHERE status = 'preparing') as preparing_orders,
        COUNT(*) FILTER (WHERE status = 'ready') as ready_orders,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_orders,
        COALESCE(SUM(total_price) FILTER (WHERE payment_status = 'paid'), 0) as total_revenue,
        COALESCE(AVG(total_price) FILTER (WHERE payment_status = 'paid'), 0) as average_order_value
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `

    const result = await query(statsQuery)

    if (result.rows.length === 0) {
      return { data: null, error: 'Failed to fetch stats' }
    }

    const stats = {
      ...result.rows[0],
      total_revenue: parseFloat(result.rows[0].total_revenue || '0'),
      average_order_value: parseFloat(result.rows[0].average_order_value || '0'),
    }

    return { data: stats, error: null }
  } catch (error) {
    console.error('Error in getOrderStats:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch order statistics',
    }
  }
}