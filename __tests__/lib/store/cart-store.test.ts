import { renderHook, act } from '@testing-library/react'
import { useCartStore } from '@/lib/store/cart-store'

describe('CartStore', () => {
  const mockItem = {
    id: 'item-1',
    name: 'Cappuccino',
    description: 'Rich espresso with steamed milk',
    price: 4.5,
    category: 'coffee',
    available: true,
  }

  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useCartStore())
    act(() => {
      result.current.clearCart()
    })
  })

  it('starts with empty cart', () => {
    const { result } = renderHook(() => useCartStore())

    expect(result.current.items).toEqual([])
    expect(result.current.getItemCount()).toBe(0)
    expect(result.current.getSubtotal()).toBe(0)
  })

  it('adds item to cart', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockItem)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].id).toBe('item-1')
    expect(result.current.items[0].quantity).toBe(1)
    expect(result.current.getItemCount()).toBe(1)
  })

  it('adds multiple quantities of item', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockItem, 3)
    })

    expect(result.current.items[0].quantity).toBe(3)
    expect(result.current.getItemCount()).toBe(3)
  })

  it('increments quantity when adding existing item', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockItem, 2)
      result.current.addItem(mockItem, 3)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(5)
    expect(result.current.getItemCount()).toBe(5)
  })

  it('removes item from cart', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockItem)
      result.current.removeItem('item-1')
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.getItemCount()).toBe(0)
  })

  it('updates item quantity', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockItem)
      result.current.updateQuantity('item-1', 5)
    })

    expect(result.current.items[0].quantity).toBe(5)
    expect(result.current.getItemCount()).toBe(5)
  })

  it('removes item when quantity updated to 0', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockItem)
      result.current.updateQuantity('item-1', 0)
    })

    expect(result.current.items).toHaveLength(0)
  })

  it('updates special instructions', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockItem)
      result.current.updateSpecialInstructions('item-1', 'Extra hot')
    })

    expect(result.current.items[0].specialInstructions).toBe('Extra hot')
  })

  it('clears entire cart', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockItem, 2)
      result.current.addItem({ ...mockItem, id: 'item-2', name: 'Croissant' })
      result.current.clearCart()
    })

    expect(result.current.items).toHaveLength(0)
    expect(result.current.getItemCount()).toBe(0)
  })

  it('calculates subtotal correctly', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem(mockItem, 2) // 4.5 * 2 = 9
      result.current.addItem({ ...mockItem, id: 'item-2', price: 5.0 }, 1) // 5 * 1 = 5
    })

    expect(result.current.getSubtotal()).toBe(14.0)
  })

  it('calculates discount correctly (10%)', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem({ ...mockItem, price: 10.0 })
    })

    expect(result.current.getDiscount()).toBe(1.0) // 10% of 10
  })

  it('calculates total with NFT discount', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.addItem({ ...mockItem, price: 10.0 })
    })

    expect(result.current.getTotal(false)).toBe(10.0) // No discount
    expect(result.current.getTotal(true)).toBe(9.0) // 10% discount
  })

  it('toggles cart open/close', () => {
    const { result } = renderHook(() => useCartStore())

    expect(result.current.isOpen).toBe(false)

    act(() => {
      result.current.toggleCart()
    })

    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.toggleCart()
    })

    expect(result.current.isOpen).toBe(false)
  })

  it('opens and closes cart explicitly', () => {
    const { result } = renderHook(() => useCartStore())

    act(() => {
      result.current.openCart()
    })

    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.closeCart()
    })

    expect(result.current.isOpen).toBe(false)
  })
})