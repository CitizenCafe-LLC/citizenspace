/**
 * Tests for Order Real-time Service
 * Validates integration between order operations and real-time events
 */

import * as orderService from '@/lib/realtime/order-service'
import * as orderRepo from '@/lib/db/repositories/orders.repository'
import { realtimeEvents } from '@/lib/realtime/events'

// Mock dependencies
jest.mock('@/lib/db/repositories/orders.repository')
jest.mock('@/lib/realtime/events')

describe('Order Real-time Service', () => {
  const mockOrderData: orderRepo.OrderWithItems = {
    id: 'order-123',
    user_id: 'user-456',
    subtotal: 20,
    discount_amount: 2,
    nft_discount_applied: true,
    processing_fee: 0.58,
    total_price: 18.58,
    status: 'pending',
    payment_status: 'paid',
    payment_intent_id: 'pi_123',
    special_instructions: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    items: [
      {
        id: 'item-1',
        order_id: 'order-123',
        menu_item_id: 'menu-1',
        quantity: 2,
        unit_price: 10,
        subtotal: 20,
        created_at: new Date().toISOString(),
        menu_item: {
          id: 'menu-1',
          title: 'Latte',
          category: 'beverages',
        },
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createOrderWithRealtime', () => {
    it('should create order and broadcast event on success', async () => {
      const createData: orderRepo.CreateOrderData = {
        user_id: 'user-456',
        items: [
          {
            menu_item_id: 'menu-1',
            quantity: 2,
            unit_price: 10,
          },
        ],
        is_nft_holder: true,
      }

      ;(orderRepo.createOrder as jest.Mock).mockResolvedValue({
        data: mockOrderData,
        error: null,
      })

      const result = await orderService.createOrderWithRealtime(createData)

      expect(result.data).toEqual(mockOrderData)
      expect(result.error).toBeNull()
      expect(realtimeEvents.order.orderCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockOrderData.id,
          user_id: mockOrderData.user_id,
          status: mockOrderData.status,
          total_price: mockOrderData.total_price,
          item_count: mockOrderData.items.length,
        })
      )
    })

    it('should create guest order without user_id', async () => {
      const guestOrder = { ...mockOrderData, user_id: null }
      const createData: orderRepo.CreateOrderData = {
        items: [
          {
            menu_item_id: 'menu-1',
            quantity: 2,
            unit_price: 10,
          },
        ],
      }

      ;(orderRepo.createOrder as jest.Mock).mockResolvedValue({
        data: guestOrder,
        error: null,
      })

      const result = await orderService.createOrderWithRealtime(createData)

      expect(result.data).toEqual(guestOrder)
      expect(realtimeEvents.order.orderCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          id: guestOrder.id,
          user_id: undefined,
        })
      )
    })

    it('should not broadcast event on failure', async () => {
      const createData: orderRepo.CreateOrderData = {
        items: [
          {
            menu_item_id: 'menu-1',
            quantity: 2,
            unit_price: 10,
          },
        ],
      }

      ;(orderRepo.createOrder as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Database error',
      })

      const result = await orderService.createOrderWithRealtime(createData)

      expect(result.error).toBe('Database error')
      expect(realtimeEvents.order.orderCreated).not.toHaveBeenCalled()
    })
  })

  describe('updateOrderStatusWithRealtime', () => {
    it('should update to preparing status and broadcast event', async () => {
      const preparingOrder = { ...mockOrderData, status: 'preparing' as const }

      ;(orderRepo.updateOrderStatus as jest.Mock).mockResolvedValue({
        data: { ...preparingOrder, items: undefined },
        error: null,
      })

      ;(orderRepo.getOrderById as jest.Mock).mockResolvedValue({
        data: preparingOrder,
        error: null,
      })

      const result = await orderService.updateOrderStatusWithRealtime('order-123', 'preparing')

      expect(result.data).toBeDefined()
      expect(realtimeEvents.order.orderStatusChanged).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'preparing',
        })
      )
    })

    it('should update to ready status and broadcast order ready event', async () => {
      const readyOrder = { ...mockOrderData, status: 'ready' as const }

      ;(orderRepo.updateOrderStatus as jest.Mock).mockResolvedValue({
        data: { ...readyOrder, items: undefined },
        error: null,
      })

      ;(orderRepo.getOrderById as jest.Mock).mockResolvedValue({
        data: readyOrder,
        error: null,
      })

      const result = await orderService.updateOrderStatusWithRealtime('order-123', 'ready')

      expect(realtimeEvents.order.orderReady).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ready',
        })
      )
    })

    it('should update to completed status and broadcast event', async () => {
      const completedOrder = { ...mockOrderData, status: 'completed' as const }

      ;(orderRepo.updateOrderStatus as jest.Mock).mockResolvedValue({
        data: { ...completedOrder, items: undefined },
        error: null,
      })

      ;(orderRepo.getOrderById as jest.Mock).mockResolvedValue({
        data: completedOrder,
        error: null,
      })

      await orderService.updateOrderStatusWithRealtime('order-123', 'completed')

      expect(realtimeEvents.order.orderCompleted).toHaveBeenCalled()
    })

    it('should update to cancelled status and broadcast event', async () => {
      const cancelledOrder = { ...mockOrderData, status: 'cancelled' as const }

      ;(orderRepo.updateOrderStatus as jest.Mock).mockResolvedValue({
        data: { ...cancelledOrder, items: undefined },
        error: null,
      })

      ;(orderRepo.getOrderById as jest.Mock).mockResolvedValue({
        data: cancelledOrder,
        error: null,
      })

      await orderService.updateOrderStatusWithRealtime('order-123', 'cancelled')

      expect(realtimeEvents.order.orderCancelled).toHaveBeenCalled()
    })

    it('should not broadcast if update fails', async () => {
      ;(orderRepo.updateOrderStatus as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Update failed',
      })

      await orderService.updateOrderStatusWithRealtime('order-123', 'preparing')

      expect(realtimeEvents.order.orderStatusChanged).not.toHaveBeenCalled()
    })
  })

  describe('cancelOrderWithRealtime', () => {
    it('should cancel order and broadcast event', async () => {
      const cancelledOrder = { ...mockOrderData, status: 'cancelled' as const }

      ;(orderRepo.getOrderById as jest.Mock).mockResolvedValue({
        data: mockOrderData,
        error: null,
      })

      ;(orderRepo.cancelOrder as jest.Mock).mockResolvedValue({
        data: { ...cancelledOrder, items: undefined },
        error: null,
      })

      const result = await orderService.cancelOrderWithRealtime('order-123', 'user-456')

      expect(result.data).toBeDefined()
      expect(realtimeEvents.order.orderCancelled).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockOrderData.id,
          status: 'cancelled',
        })
      )
    })

    it('should return error if order not found', async () => {
      ;(orderRepo.getOrderById as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Not found',
      })

      const result = await orderService.cancelOrderWithRealtime('order-123')

      expect(result.error).toBe('Order not found')
      expect(realtimeEvents.order.orderCancelled).not.toHaveBeenCalled()
    })

    it('should not broadcast if cancellation fails', async () => {
      ;(orderRepo.getOrderById as jest.Mock).mockResolvedValue({
        data: mockOrderData,
        error: null,
      })

      ;(orderRepo.cancelOrder as jest.Mock).mockResolvedValue({
        data: null,
        error: 'Cannot cancel',
      })

      await orderService.cancelOrderWithRealtime('order-123')

      expect(realtimeEvents.order.orderCancelled).not.toHaveBeenCalled()
    })
  })

  describe('updateOrderPaymentWithRealtime', () => {
    it('should update payment and notify staff when paid', async () => {
      ;(orderRepo.updateOrderPayment as jest.Mock).mockResolvedValue({
        data: { ...mockOrderData, payment_status: 'paid', items: undefined },
        error: null,
      })

      ;(orderRepo.getOrderById as jest.Mock).mockResolvedValue({
        data: mockOrderData,
        error: null,
      })

      await orderService.updateOrderPaymentWithRealtime('order-123', 'paid', 'pi_123')

      expect(realtimeEvents.order.orderCreated).toHaveBeenCalled()
    })

    it('should not notify staff if payment is not paid', async () => {
      ;(orderRepo.updateOrderPayment as jest.Mock).mockResolvedValue({
        data: { ...mockOrderData, payment_status: 'pending', items: undefined },
        error: null,
      })

      await orderService.updateOrderPaymentWithRealtime('order-123', 'pending')

      expect(realtimeEvents.order.orderCreated).not.toHaveBeenCalled()
    })
  })

  describe('batchUpdateOrdersStatus', () => {
    it('should update multiple orders and return results', async () => {
      const orderIds = ['order-1', 'order-2', 'order-3']

      ;(orderRepo.updateOrderStatus as jest.Mock)
        .mockResolvedValueOnce({
          data: { ...mockOrderData, id: 'order-1', items: undefined },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { ...mockOrderData, id: 'order-2', items: undefined },
          error: null,
        })
        .mockResolvedValueOnce({
          data: null,
          error: 'Update failed',
        })

      ;(orderRepo.getOrderById as jest.Mock).mockResolvedValue({
        data: mockOrderData,
        error: null,
      })

      const results = await orderService.batchUpdateOrdersStatus(orderIds, 'preparing')

      expect(results).toHaveLength(3)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(true)
      expect(results[2].success).toBe(false)
      expect(results[2].error).toBe('Update failed')
    })
  })

  describe('getOrderQueueStats', () => {
    it('should return order statistics', async () => {
      const mockStats = {
        total_orders: 100,
        pending_orders: 10,
        preparing_orders: 15,
        ready_orders: 5,
        completed_orders: 65,
        cancelled_orders: 5,
        total_revenue: 2500,
        average_order_value: 25,
      }

      ;(orderRepo.getOrderStats as jest.Mock).mockResolvedValue({
        data: mockStats,
        error: null,
      })

      const result = await orderService.getOrderQueueStats()

      expect(result.data).toEqual(mockStats)
    })
  })
})
