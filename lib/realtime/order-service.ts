/**
 * Order Real-time Service
 * Integrates real-time events with order operations
 *
 * This service wraps order repository operations and automatically
 * broadcasts real-time events when orders are created, updated, or status changes.
 */

import * as orderRepo from '@/lib/db/repositories/orders.repository'
import { realtimeEvents } from './events'
import type { OrderEventData } from './config'
import type { OrderWithItems } from '@/lib/db/repositories/orders.repository'

/**
 * Convert database Order to OrderEventData
 */
function toOrderEventData(order: OrderWithItems): OrderEventData {
  return {
    id: order.id,
    user_id: order.user_id || undefined,
    status: order.status,
    total_price: order.total_price,
    item_count: order.items?.length || 0,
  }
}

/**
 * Create order with real-time notification to staff
 */
export async function createOrderWithRealtime(data: orderRepo.CreateOrderData) {
  // Create order in database
  const result = await orderRepo.createOrder(data)

  // Broadcast real-time event if successful
  if (result.data && !result.error) {
    const eventData = toOrderEventData(result.data)
    await realtimeEvents.order.orderCreated(eventData)
  }

  return result
}

/**
 * Update order status with real-time notification
 */
export async function updateOrderStatusWithRealtime(
  orderId: string,
  status: orderRepo.OrderStatus
) {
  // Update status in database
  const result = await orderRepo.updateOrderStatus(orderId, status)

  // Broadcast real-time event if successful
  if (result.data && !result.error) {
    // Get full order details with items
    const orderResult = await orderRepo.getOrderById(orderId)

    if (orderResult.data) {
      const eventData = toOrderEventData(orderResult.data)

      // Send appropriate event based on new status
      switch (status) {
        case 'preparing':
          await realtimeEvents.order.orderStatusChanged(eventData)
          break
        case 'ready':
          await realtimeEvents.order.orderReady(eventData)
          break
        case 'completed':
          await realtimeEvents.order.orderCompleted(eventData)
          break
        case 'cancelled':
          await realtimeEvents.order.orderCancelled(eventData)
          break
        default:
          await realtimeEvents.order.orderStatusChanged(eventData)
      }
    }
  }

  return result
}

/**
 * Cancel order with real-time notification
 */
export async function cancelOrderWithRealtime(orderId: string, userId?: string) {
  // Get order details first
  const orderResult = await orderRepo.getOrderById(orderId)

  if (!orderResult.data) {
    return { data: null, error: 'Order not found' }
  }

  // Cancel order
  const result = await orderRepo.cancelOrder(orderId, userId)

  // Broadcast real-time event if successful
  if (result.data && !result.error) {
    const eventData = toOrderEventData(orderResult.data)
    await realtimeEvents.order.orderCancelled(eventData)
  }

  return result
}

/**
 * Update order payment status with notification
 */
export async function updateOrderPaymentWithRealtime(
  orderId: string,
  paymentStatus: orderRepo.PaymentStatus,
  paymentIntentId?: string
) {
  const result = await orderRepo.updateOrderPayment(orderId, paymentStatus, paymentIntentId)

  // If payment is confirmed, notify staff that order is ready to prepare
  if (paymentStatus === 'paid' && result.data && !result.error) {
    const orderResult = await orderRepo.getOrderById(orderId)

    if (orderResult.data) {
      const eventData = toOrderEventData(orderResult.data)
      await realtimeEvents.order.orderCreated(eventData)
    }
  }

  return result
}

/**
 * Batch update multiple orders status (admin/staff only)
 */
export async function batchUpdateOrdersStatus(
  orderIds: string[],
  status: orderRepo.OrderStatus
) {
  const results: Array<{ orderId: string; success: boolean; error?: string }> = []

  for (const orderId of orderIds) {
    const result = await updateOrderStatusWithRealtime(orderId, status)

    results.push({
      orderId,
      success: !result.error,
      error: result.error || undefined,
    })
  }

  return results
}

/**
 * Get order queue statistics with real-time capability
 * This is useful for dashboards that need periodic updates
 */
export async function getOrderQueueStats() {
  const stats = await orderRepo.getOrderStats()

  return stats
}
