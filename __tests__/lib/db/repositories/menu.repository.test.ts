/**
 * Menu Repository Tests
 * Comprehensive tests for menu item database operations
 */

import {
  getAllMenuItems,
  getMenuItemsByCategory,
  getFeaturedMenuItems,
  getMenuItemById,
  calculateMenuItemPrice,
  getMenuItemsWithPricing,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  type MenuItemFilters,
} from '@/lib/db/repositories/menu.repository'
import { executeQuery, executeQuerySingle, closePool } from '@/lib/db/postgres'

// Mock the postgres module
jest.mock('@/lib/db/postgres', () => ({
  executeQuery: jest.fn(),
  executeQuerySingle: jest.fn(),
  closePool: jest.fn(),
}))

const mockExecuteQuery = executeQuery as jest.MockedFunction<typeof executeQuery>
const mockExecuteQuerySingle = executeQuerySingle as jest.MockedFunction<typeof executeQuerySingle>

describe('Menu Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getAllMenuItems', () => {
    it('should fetch all menu items with default pagination', async () => {
      const mockMenuItems = [
        {
          id: 'item-1',
          title: 'Espresso',
          description: 'Strong coffee',
          price: '3.50',
          category: 'coffee',
          dietary_tags: ['vegan'],
          image: null,
          orderable: true,
          featured: false,
          created_at: '2025-10-01T12:00:00Z',
          updated_at: '2025-10-01T12:00:00Z',
        },
        {
          id: 'item-2',
          title: 'Green Tea',
          description: 'Organic green tea',
          price: '2.50',
          category: 'tea',
          dietary_tags: ['vegan', 'gluten-free'],
          image: 'tea.jpg',
          orderable: true,
          featured: true,
          created_at: '2025-10-01T12:00:00Z',
          updated_at: '2025-10-01T12:00:00Z',
        },
      ]

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '2' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: mockMenuItems,
        error: null,
      })

      const result = await getAllMenuItems()

      expect(result.error).toBeNull()
      expect(result.data).toHaveLength(2)
      expect(result.data?.[0].price).toBe(3.5)
      expect(result.data?.[1].price).toBe(2.5)
      expect(result.count).toBe(2)
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY'),
        expect.arrayContaining([100, 0])
      )
    })

    it('should filter by category', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: MenuItemFilters = { category: 'coffee' }
      const result = await getAllMenuItems(filters)

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE category = $1'),
        expect.arrayContaining(['coffee'])
      )
    })

    it('should filter by orderable status', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '5' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: MenuItemFilters = { orderable: true }
      const result = await getAllMenuItems(filters)

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE orderable = $1'),
        expect.arrayContaining([true])
      )
    })

    it('should filter by featured status', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '3' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: MenuItemFilters = { featured: true }
      const result = await getAllMenuItems(filters)

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE featured = $1'),
        expect.arrayContaining([true])
      )
    })

    it('should filter by dietary_tags', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '2' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: MenuItemFilters = { dietary_tags: ['vegan', 'gluten-free'] }
      const result = await getAllMenuItems(filters)

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE dietary_tags && $1::text[]'),
        expect.arrayContaining([['vegan', 'gluten-free']])
      )
    })

    it('should apply multiple filters together', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const filters: MenuItemFilters = {
        category: 'coffee',
        orderable: true,
        featured: true,
      }
      const result = await getAllMenuItems(filters)

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE category = $1 AND orderable = $2 AND featured = $3'),
        expect.arrayContaining(['coffee', true, true])
      )
    })

    it('should handle custom pagination', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '50' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const pagination = { page: 2, limit: 20 }
      const result = await getAllMenuItems(undefined, pagination)

      expect(result.error).toBeNull()
      expect(mockExecuteQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([20, 20])
      )
    })

    it('should handle count query errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Count query failed',
      })

      const result = await getAllMenuItems()

      expect(result.error).toBe('Count query failed')
      expect(result.data).toBeNull()
      expect(result.count).toBe(0)
    })

    it('should handle data query errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '10' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: null,
        error: 'Data query failed',
      })

      const result = await getAllMenuItems()

      expect(result.error).toBe('Data query failed')
      expect(result.data).toBeNull()
      expect(result.count).toBe(0)
    })

  })

  describe('getMenuItemsByCategory', () => {
    it('should fetch menu items by category', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getMenuItemsByCategory('coffee')

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE category = $1 AND orderable = $2'),
        expect.arrayContaining(['coffee', true])
      )
    })

    it('should handle all category types', async () => {
      const categories = ['coffee', 'tea', 'pastries', 'meals'] as const

      for (const category of categories) {
        mockExecuteQuerySingle.mockResolvedValue({
          data: { count: '1' },
          error: null,
        })

        mockExecuteQuery.mockResolvedValue({
          data: [],
          error: null,
        })

        const result = await getMenuItemsByCategory(category)
        expect(result.error).toBeNull()
      }
    })
  })

  describe('getFeaturedMenuItems', () => {
    it('should fetch featured menu items', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '2' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: [],
        error: null,
      })

      const result = await getFeaturedMenuItems()

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE featured = $1 AND orderable = $2'),
        expect.arrayContaining([true, true])
      )
    })
  })

  describe('getMenuItemById', () => {
    it('should fetch menu item by ID', async () => {
      const mockMenuItem = {
        id: 'item-123',
        title: 'Cappuccino',
        description: 'Classic cappuccino',
        price: '4.50',
        category: 'coffee',
        dietary_tags: [],
        image: null,
        orderable: true,
        featured: false,
        created_at: '2025-10-01T12:00:00Z',
        updated_at: '2025-10-01T12:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockMenuItem,
        error: null,
      })

      const result = await getMenuItemById('item-123')

      expect(result.error).toBeNull()
      expect(result.data?.id).toBe('item-123')
      expect(result.data?.price).toBe(4.5)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id = $1'),
        ['item-123']
      )
    })

    it('should return error when menu item not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await getMenuItemById('non-existent')

      expect(result.error).toBe('Menu item not found')
      expect(result.data).toBeNull()
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Database query failed',
      })

      const result = await getMenuItemById('item-123')

      expect(result.error).toBe('Database query failed')
      expect(result.data).toBeNull()
    })

  })

  describe('calculateMenuItemPrice', () => {
    it('should return base price for non-NFT holders', () => {
      const result = calculateMenuItemPrice(10.0, false)
      expect(result).toBe(10.0)
    })

    it('should apply 10% discount for NFT holders', () => {
      const result = calculateMenuItemPrice(10.0, true)
      expect(result).toBe(9.0)
    })

    it('should round to 2 decimal places', () => {
      const result = calculateMenuItemPrice(3.33, true)
      expect(result).toBe(3.0)
    })

    it('should handle zero price', () => {
      const result = calculateMenuItemPrice(0, true)
      expect(result).toBe(0)
    })
  })

  describe('getMenuItemsWithPricing', () => {
    it('should return items with NFT discount applied', async () => {
      const mockMenuItems = [
        {
          id: 'item-1',
          title: 'Coffee',
          price: '10.00',
          category: 'coffee',
        },
      ]

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: mockMenuItems,
        error: null,
      })

      const result = await getMenuItemsWithPricing(true)

      expect(result.error).toBeNull()
      expect(result.data?.[0].price).toBe(9.0)
      expect(result.data?.[0].originalPrice).toBe(10.0)
      expect(result.data?.[0].discountApplied).toBe(true)
    })

    it('should return items without discount for non-NFT holders', async () => {
      const mockMenuItems = [
        {
          id: 'item-1',
          title: 'Coffee',
          price: '10.00',
          category: 'coffee',
        },
      ]

      mockExecuteQuerySingle.mockResolvedValue({
        data: { count: '1' },
        error: null,
      })

      mockExecuteQuery.mockResolvedValue({
        data: mockMenuItems,
        error: null,
      })

      const result = await getMenuItemsWithPricing(false)

      expect(result.error).toBeNull()
      expect(result.data?.[0].price).toBe(10.0)
      expect(result.data?.[0].originalPrice).toBe(10.0)
      expect(result.data?.[0].discountApplied).toBe(false)
    })

    it('should handle errors from getAllMenuItems', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Query failed',
      })

      const result = await getMenuItemsWithPricing(true)

      expect(result.error).toBe('Query failed')
      expect(result.data).toBeNull()
    })
  })

  describe('createMenuItem', () => {
    it('should create a menu item successfully', async () => {
      const mockData = {
        title: 'New Coffee',
        description: 'Delicious coffee',
        price: 5.0,
        category: 'coffee' as const,
        dietary_tags: ['vegan'],
        image: 'coffee.jpg',
        orderable: true,
        featured: false,
      }

      const mockMenuItem = {
        id: 'item-123',
        ...mockData,
        price: '5.00',
        created_at: '2025-10-01T12:00:00Z',
        updated_at: '2025-10-01T12:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockMenuItem,
        error: null,
      })

      const result = await createMenuItem(mockData)

      expect(result.error).toBeNull()
      expect(result.data?.title).toBe('New Coffee')
      expect(result.data?.price).toBe(5.0)
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO menu_items'),
        expect.arrayContaining([
          'New Coffee',
          'Delicious coffee',
          5.0,
          'coffee',
          ['vegan'],
          'coffee.jpg',
          true,
          false,
        ])
      )
    })

    it('should create menu item with default values', async () => {
      const mockData = {
        title: 'Simple Coffee',
        price: 3.0,
        category: 'coffee' as const,
      }

      const mockMenuItem = {
        id: 'item-123',
        ...mockData,
        description: null,
        price: '3.00',
        dietary_tags: [],
        image: null,
        orderable: true,
        featured: false,
        created_at: '2025-10-01T12:00:00Z',
        updated_at: '2025-10-01T12:00:00Z',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockMenuItem,
        error: null,
      })

      const result = await createMenuItem(mockData)

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'Simple Coffee',
          null,
          3.0,
          'coffee',
          [],
          null,
          true,
          false,
        ])
      )
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Insert failed',
      })

      const result = await createMenuItem({
        title: 'Test',
        price: 1.0,
        category: 'coffee',
      })

      expect(result.error).toBe('Insert failed')
      expect(result.data).toBeNull()
    })

  })

  describe('updateMenuItem', () => {
    it('should update menu item title', async () => {
      const mockMenuItem = {
        id: 'item-123',
        title: 'Updated Coffee',
        price: '5.00',
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockMenuItem,
        error: null,
      })

      const result = await updateMenuItem('item-123', { title: 'Updated Coffee' })

      expect(result.error).toBeNull()
      expect(result.data?.title).toBe('Updated Coffee')
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE menu_items'),
        expect.arrayContaining(['Updated Coffee', 'item-123'])
      )
    })

    it('should update multiple fields', async () => {
      const mockMenuItem = {
        id: 'item-123',
        title: 'Updated Coffee',
        price: '6.00',
        orderable: false,
      }

      mockExecuteQuerySingle.mockResolvedValue({
        data: mockMenuItem,
        error: null,
      })

      const result = await updateMenuItem('item-123', {
        title: 'Updated Coffee',
        price: 6.0,
        orderable: false,
      })

      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('SET title = $1, price = $2, orderable = $3'),
        expect.arrayContaining(['Updated Coffee', 6.0, false, 'item-123'])
      )
    })

    it('should return error when no fields to update', async () => {
      const result = await updateMenuItem('item-123', {})

      expect(result.error).toBe('No fields to update')
      expect(result.data).toBeNull()
      expect(mockExecuteQuerySingle).not.toHaveBeenCalled()
    })

    it('should return error when menu item not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await updateMenuItem('non-existent', { title: 'Test' })

      expect(result.error).toBe('Menu item not found')
      expect(result.data).toBeNull()
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Update failed',
      })

      const result = await updateMenuItem('item-123', { title: 'Test' })

      expect(result.error).toBe('Update failed')
      expect(result.data).toBeNull()
    })

  })

  describe('deleteMenuItem', () => {
    it('should delete menu item successfully', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: { id: 'item-123' },
        error: null,
      })

      const result = await deleteMenuItem('item-123')

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(mockExecuteQuerySingle).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM menu_items WHERE id = $1'),
        ['item-123']
      )
    })

    it('should return error when menu item not found', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: null,
      })

      const result = await deleteMenuItem('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Menu item not found')
    })

    it('should handle database errors', async () => {
      mockExecuteQuerySingle.mockResolvedValue({
        data: null,
        error: 'Delete failed',
      })

      const result = await deleteMenuItem('item-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Delete failed')
    })

  })
})
