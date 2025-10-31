/**
 * Orders Repository Tests
 * Comprehensive tests for cafe orders database operations
 */

import {
  calculateOrderTotals,
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrderPayment,
  cancelOrder,
  getOrderStats,
  type CreateOrderData,
  type OrderStatus,
  type PaymentStatus,
} from '@/lib/db/repositories/orders.repository'
import { query, transaction, getClient } from '@/lib/db/connection'

// Mock the connection module
jest.mock('@/lib/db/connection', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
  getClient: jest.fn(),
}))

const mockQuery = query as jest.MockedFunction<typeof query>
const mockTransaction = transaction as jest.MockedFunction<typeof transaction>

describe('Orders Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('calculateOrderTotals', () => {
    it('should calculate totals without NFT discount', () => {
      const items = [
        { quantity: 2, unit_price: 5.0 },
        { quantity: 1, unit_price: 3.5 },
      ]

      const result = calculateOrderTotals(items, false)

      expect(result.subtotal).toBe(13.5)
      expect(result.discountAmount).toBe(0)
      expect(result.processingFee).toBe(0.69) // 13.5 * 0.029 + 0.3
      expect(result.totalPrice).toBe(14.19)
    })

    it('should calculate totals with NFT discount (10% off)', () => {
      const items = [
        { quantity: 2, unit_price: 10.0 },
      ]

      const result = calculateOrderTotals(items, true)

      expect(result.subtotal).toBe(20.0)
      expect(result.discountAmount).toBe(2.0) // 10% of 20
      expect(result.processingFee).toBe(0.82) // 18.0 * 0.029 + 0.3
      expect(result.totalPrice).toBe(18.82)
    })

    it('should handle single item', () => {
      const items = [{ quantity: 1, unit_price: 5.0 }]

      const result = calculateOrderTotals(items, false)

      expect(result.subtotal).toBe(5.0)
      expect(result.discountAmount).toBe(0)
      expect(result.processingFee).toBe(0.45) // 5.0 * 0.029 + 0.3
      expect(result.totalPrice).toBe(5.45)
    })

    it('should round all values to 2 decimal places', () => {
      const items = [{ quantity: 3, unit_price: 3.33 }]

      const result = calculateOrderTotals(items, false)

      expect(result.subtotal).toBe(9.99)
      expect(result.totalPrice).toBeCloseTo(10.58, 2)
    })
  })

  describe('createOrder', () => {
    it('should create order with items in transaction', async () => {
      const mockData: CreateOrderData = {
        user_id: 'user-123',
        items: [
          { menu_item_id: 'item-1', quantity: 2, unit_price: 5.0 },
          { menu_item_id: 'item-2', quantity: 1, unit_price: 3.5 },
        ],
        special_instructions: 'No sugar',
        is_nft_holder: false,
      }

      const mockOrder = {
        id: 'order-123',
        user_id: 'user-123',
        subtotal: '13.50',
        discount_amount: '0.00',
        nft_discount_applied: false,
        processing_fee: '0.69',
        total_price: '14.19',
        status: 'pending',
        payment_status: 'pending',
        payment_intent_id: null,
        special_instructions: null,
        created_at: '2025-10-01T12:00:00Z',
        updated_at: '2025-10-01T12:00:00Z',
      }

      const mockOrderItems = [
        {
          id: 'item-1-order',
          order_id: 'order-123',
          menu_item_id: 'item-1',
          quantity: 2,
          unit_price: '5.00',
          subtotal: '10.00',
          created_at: '2025-10-01T12:00:00Z',
        },
        {
          id: 'item-2-order',
          order_id: 'order-123',
          menu_item_id: 'item-2',
          quantity: 1,
          unit_price: '3.50',
          subtotal: '3.50',
          created_at: '2025-10-01T12:00:00Z',
        },
      ]

      // Mock transaction
      mockTransaction.mockImplementation(async (callback) => {
        const mockClient = {
          query: jest.fn()
            .mockResolvedValueOnce({ rows: [mockOrder] }) // Create order
            .mockResolvedValueOnce({ rows: [mockOrderItems[0]] }) // First item
            .mockResolvedValueOnce({ rows: [mockOrderItems[1]] }) // Second item
            .mockResolvedValueOnce({ rows: [mockOrder] }), // Update instructions
        }
        return callback(mockClient as any)
      })

      const result = await createOrder(mockData)

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('order-123')
      expect(result.data?.subtotal).toBe(13.5)
      expect(result.data?.items).toHaveLength(2)
      expect(mockTransaction).toHaveBeenCalled()
    })

    it('should create order without user_id (guest order)', async () => {
      const mockData: CreateOrderData = {
        items: [
          { menu_item_id: 'item-1', quantity: 1, unit_price: 5.0 },
        ],
      }

      const mockOrder = {
        id: 'order-123',
        user_id: null,
        subtotal: '5.00',
        discount_amount: '0.00',
        nft_discount_applied: false,
        processing_fee: '0.45',
        total_price: '5.45',
        status: 'pending',
        payment_status: 'pending',
        payment_intent_id: null,
        special_instructions: null,
        created_at: '2025-10-01T12:00:00Z',
        updated_at: '2025-10-01T12:00:00Z',
      }

      mockTransaction.mockImplementation(async (callback) => {
        const mockClient = {
          query: jest.fn()
            .mockResolvedValueOnce({ rows: [mockOrder] })
            .mockResolvedValueOnce({ rows: [{ id: 'item-123' }] }),
        }
        return callback(mockClient as any)
      })

      const result = await createOrder(mockData)

      expect(result.error).toBeNull()
      expect(result.data?.user_id).toBeNull()
    })

    it('should apply NFT discount when is_nft_holder is true', async () => {
      const mockData: CreateOrderData = {
        user_id: 'user-123',
        items: [{ menu_item_id: 'item-1', quantity: 1, unit_price: 10.0 }],
        is_nft_holder: true,
      }

      const mockOrder = {
        id: 'order-123',
        user_id: 'user-123',
        subtotal: '10.00',
        discount_amount: '1.00',
        nft_discount_applied: true,
        processing_fee: '0.56',
        total_price: '9.56',
        status: 'pending',
        payment_status: 'pending',
        payment_intent_id: null,
        special_instructions: null,
        created_at: '2025-10-01T12:00:00Z',
        updated_at: '2025-10-01T12:00:00Z',
      }

      mockTransaction.mockImplementation(async (callback) => {
        const mockClient = {
          query: jest.fn()
            .mockResolvedValueOnce({ rows: [mockOrder] })
            .mockResolvedValueOnce({ rows: [{ id: 'item-123' }] }),
        }
        return callback(mockClient as any)
      })

      const result = await createOrder(mockData)

      expect(result.error).toBeNull()
      expect(result.data?.nft_discount_applied).toBe(true)
    })

    it('should handle transaction errors', async () => {
      mockTransaction.mockRejectedValue(new Error('Transaction failed'))

      const result = await createOrder({
        items: [{ menu_item_id: 'item-1', quantity: 1, unit_price: 5.0 }],
      })

      expect(result.error).toBe('Transaction failed')
      expect(result.data).toBeNull()
    })
  })

  describe('getOrderById', () => {
    it('should fetch order with items and menu details', async () => {
      const mockOrder = {
        id: 'order-123',
        user_id: 'user-123',
        subtotal: '13.50',
        discount_amount: '0.00',
        processing_fee: '0.69',
        total_price: '14.19',
        status: 'pending',
        payment_status: 'pending',
        payment_intent_id: null,
        special_instructions: null,
        created_at: '2025-10-01T12:00:00Z',
        updated_at: '2025-10-01T12:00:00Z',
      }

      const mockItems = [
        {
          id: 'item-order-1',
          order_id: 'order-123',
          menu_item_id: 'menu-1',
          quantity: 2,
          unit_price: '5.00',
          subtotal: '10.00',
          created_at: '2025-10-01T12:00:00Z',
          menu_item_title: 'Espresso',
          menu_item_category: 'coffee',
          menu_item_image: 'espresso.jpg',
        },
      ]

      mockQuery
        .mockResolvedValueOnce({ rows: [mockOrder] })
        .mockResolvedValueOnce({ rows: mockItems })

      const result = await getOrderById('order-123')

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('order-123')
      expect(result.data?.subtotal).toBe(13.5)
      expect(result.data?.items).toHaveLength(1)
      expect(result.data?.items[0].menu_item?.title).toBe('Espresso')
    })

    it('should return error when order not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] })

      const result = await getOrderById('non-existent')

      expect(result.error).toBe('Order not found')
      expect(result.data).toBeNull()
    })

  })

  describe('getUserOrders', () => {
    it('should fetch user orders with pagination', async () => {
      const mockOrder = {
        id: 'order-123',
        user_id: 'user-123',
        subtotal: '10.00',
        discount_amount: '0.00',
        processing_fee: '0.59',
        total_price: '10.59',
        status: 'completed',
        payment_status: 'paid',
        payment_intent_id: 'pi_123',
        special_instructions: null,
        created_at: '2025-10-01T12:00:00Z',
        updated_at: '2025-10-01T12:00:00Z',
      }

      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '1' }] }) // Count
        .mockResolvedValueOnce({ rows: [mockOrder] }) // Orders
        .mockResolvedValueOnce({ rows: [mockOrder] }) // getOrderById - order
        .mockResolvedValueOnce({ rows: [] }) // getOrderById - items

      const result = await getUserOrders('user-123')

      expect(result.error).toBeNull()
      expect(result.count).toBe(1)
      expect(result.data).toHaveLength(1)
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1'),
        expect.arrayContaining(['user-123', 20, 0])
      )
    })

    it('should handle custom pagination and sorting', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '10' }] })
        .mockResolvedValueOnce({ rows: [] })

      const pagination = { page: 2, limit: 5, sortBy: 'total_price', sortOrder: 'asc' as const }
      const result = await getUserOrders('user-123', pagination)

      expect(result.error).toBeNull()
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY total_price ASC'),
        expect.arrayContaining(['user-123', 5, 5])
      )
    })

  })

  describe('getAllOrders', () => {
    it('should fetch all orders with pagination', async () => {
      const mockOrder = {
        id: 'order-123',
        user_id: 'user-123',
        subtotal: '10.00',
        discount_amount: '0.00',
        processing_fee: '0.59',
        total_price: '10.59',
        status: 'pending',
        payment_status: 'pending',
        payment_intent_id: null,
        special_instructions: null,
        created_at: '2025-10-01T12:00:00Z',
        updated_at: '2025-10-01T12:00:00Z',
      }

      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '1' }] })
        .mockResolvedValueOnce({ rows: [mockOrder] })
        .mockResolvedValueOnce({ rows: [mockOrder] })
        .mockResolvedValueOnce({ rows: [] })

      const result = await getAllOrders()

      expect(result.error).toBeNull()
      expect(result.count).toBe(1)
    })

    it('should filter by status', async () => {
      mockQuery
        .mockResolvedValueOnce({ rows: [{ count: '2' }] })
        .mockResolvedValueOnce({ rows: [] })

      const result = await getAllOrders(undefined, 'preparing')

      expect(result.error).toBeNull()
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status = $1'),
        ['preparing']
      )
    })

  })

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const mockOrder = {
        id: 'order-123',
        user_id: 'user-123',
        subtotal: '10.00',
        discount_amount: '0.00',
        processing_fee: '0.59',
        total_price: '10.59',
        status: 'preparing',
        payment_status: 'paid',
        payment_intent_id: 'pi_123',
        special_instructions: null,
        created_at: '2025-10-01T12:00:00Z',
        updated_at: '2025-10-01T12:00:00Z',
      }

      mockQuery.mockResolvedValue({ rows: [mockOrder] })

      const result = await updateOrderStatus('order-123', 'preparing')

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('preparing')
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE orders SET status = $1'),
        ['preparing', 'order-123']
      )
    })

    it('should handle all status types', async () => {
      const statuses: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed', 'cancelled']

      for (const status of statuses) {
        mockQuery.mockResolvedValue({
          rows: [{
            id: 'order-123',
            status,
            subtotal: '10.00',
            discount_amount: '0.00',
            processing_fee: '0.59',
            total_price: '10.59',
          }],
        })

        const result = await updateOrderStatus('order-123', status)
        expect(result.error).toBeNull()
        expect(result.data?.status).toBe(status)
      }
    })

    it('should return error when order not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] })

      const result = await updateOrderStatus('non-existent', 'preparing')

      expect(result.error).toBe('Order not found')
      expect(result.data).toBeNull()
    })

  })

  describe('updateOrderPayment', () => {
    it('should update payment status and intent ID', async () => {
      const mockOrder = {
        id: 'order-123',
        payment_status: 'paid',
        payment_intent_id: 'pi_123',
        subtotal: '10.00',
        discount_amount: '0.00',
        processing_fee: '0.59',
        total_price: '10.59',
      }

      mockQuery.mockResolvedValue({ rows: [mockOrder] })

      const result = await updateOrderPayment('order-123', 'paid', 'pi_123')

      expect(result.error).toBeNull()
      expect(result.data?.payment_status).toBe('paid')
      expect(result.data?.payment_intent_id).toBe('pi_123')
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE orders SET payment_status = $1, payment_intent_id = $2'),
        ['paid', 'pi_123', 'order-123']
      )
    })

    it('should handle all payment statuses', async () => {
      const statuses: PaymentStatus[] = ['pending', 'paid', 'refunded']

      for (const status of statuses) {
        mockQuery.mockResolvedValue({
          rows: [{
            id: 'order-123',
            payment_status: status,
            payment_intent_id: null,
            subtotal: '10.00',
            discount_amount: '0.00',
            processing_fee: '0.59',
            total_price: '10.59',
          }],
        })

        const result = await updateOrderPayment('order-123', status)
        expect(result.error).toBeNull()
        expect(result.data?.payment_status).toBe(status)
      }
    })

    it('should return error when order not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] })

      const result = await updateOrderPayment('non-existent', 'paid')

      expect(result.error).toBe('Order not found')
      expect(result.data).toBeNull()
    })

  })

  describe('cancelOrder', () => {
    it('should cancel pending order', async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [{
            id: 'order-123',
            status: 'pending',
            payment_status: 'pending',
          }],
        })
        .mockResolvedValueOnce({
          rows: [{
            id: 'order-123',
            status: 'cancelled',
            subtotal: '10.00',
            discount_amount: '0.00',
            processing_fee: '0.59',
            total_price: '10.59',
          }],
        })

      const result = await cancelOrder('order-123')

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('cancelled')
    })

    it('should cancel preparing order', async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [{
            id: 'order-123',
            status: 'preparing',
            payment_status: 'paid',
          }],
        })
        .mockResolvedValueOnce({
          rows: [{
            id: 'order-123',
            status: 'cancelled',
            subtotal: '10.00',
            discount_amount: '0.00',
            processing_fee: '0.59',
            total_price: '10.59',
          }],
        })

      const result = await cancelOrder('order-123')

      expect(result.error).toBeNull()
      expect(result.data?.status).toBe('cancelled')
    })

    it('should verify ownership when userId provided', async () => {
      mockQuery.mockResolvedValue({
        rows: [{
          id: 'order-123',
          status: 'pending',
        }],
      })

      await cancelOrder('order-123', 'user-123')

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('AND user_id = $2'),
        ['order-123', 'user-123']
      )
    })

    it('should return error when order not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] })

      const result = await cancelOrder('non-existent')

      expect(result.error).toBe('Order not found or access denied')
      expect(result.data).toBeNull()
    })

    it('should not cancel ready orders', async () => {
      mockQuery.mockResolvedValue({
        rows: [{
          id: 'order-123',
          status: 'ready',
        }],
      })

      const result = await cancelOrder('order-123')

      expect(result.error).toBe('Cannot cancel order in current status')
      expect(result.data).toBeNull()
    })

    it('should not cancel completed orders', async () => {
      mockQuery.mockResolvedValue({
        rows: [{
          id: 'order-123',
          status: 'completed',
        }],
      })

      const result = await cancelOrder('order-123')

      expect(result.error).toBe('Cannot cancel order in current status')
      expect(result.data).toBeNull()
    })

  })

  describe('getOrderStats', () => {
    it('should fetch order statistics', async () => {
      const mockStats = {
        total_orders: '100',
        pending_orders: '10',
        preparing_orders: '5',
        ready_orders: '3',
        completed_orders: '80',
        cancelled_orders: '2',
        total_revenue: '5000.50',
        average_order_value: '62.51',
      }

      mockQuery.mockResolvedValue({ rows: [mockStats] })

      const result = await getOrderStats()

      expect(result.error).toBeNull()
      expect(result.data?.total_revenue).toBe(5000.5)
      expect(result.data?.average_order_value).toBe(62.51)
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE created_at >= NOW() - INTERVAL '30 days'"),
        undefined
      )
    })

    it('should handle zero revenue', async () => {
      const mockStats = {
        total_orders: '0',
        pending_orders: '0',
        preparing_orders: '0',
        ready_orders: '0',
        completed_orders: '0',
        cancelled_orders: '0',
        total_revenue: null,
        average_order_value: null,
      }

      mockQuery.mockResolvedValue({ rows: [mockStats] })

      const result = await getOrderStats()

      expect(result.error).toBeNull()
      expect(result.data?.total_revenue).toBe(0)
      expect(result.data?.average_order_value).toBe(0)
    })

    it('should return error when no stats available', async () => {
      mockQuery.mockResolvedValue({ rows: [] })

      const result = await getOrderStats()

      expect(result.error).toBe('Failed to fetch stats')
      expect(result.data).toBeNull()
    })

  })
})
