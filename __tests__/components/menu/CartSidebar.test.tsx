import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { CartSidebar } from '@/components/menu/CartSidebar'
import { useCartStore } from '@/lib/store/cart-store'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/lib/store/cart-store')

describe('CartSidebar', () => {
  const mockPush = jest.fn()
  const mockCloseCart = jest.fn()
  const mockGetSubtotal = jest.fn()
  const mockGetDiscount = jest.fn()
  const mockGetTotal = jest.fn()
  const mockGetItemCount = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
  })

  it('displays empty cart message when no items', () => {
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [],
      isOpen: true,
      closeCart: mockCloseCart,
      getSubtotal: () => 0,
      getDiscount: () => 0,
      getTotal: () => 0,
      getItemCount: () => 0,
    })

    render(<CartSidebar />)

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    expect(screen.getByText('Add items from the menu to get started')).toBeInTheDocument()
  })

  it('displays cart items and totals', () => {
    const mockItems = [
      {
        id: 'item-1',
        name: 'Cappuccino',
        description: 'Rich espresso',
        price: 4.5,
        category: 'coffee',
        available: true,
        quantity: 2,
      },
      {
        id: 'item-2',
        name: 'Croissant',
        description: 'Buttery pastry',
        price: 3.5,
        category: 'pastries',
        available: true,
        quantity: 1,
      },
    ]

    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: mockItems,
      isOpen: true,
      closeCart: mockCloseCart,
      getSubtotal: () => 12.5,
      getDiscount: () => 0,
      getTotal: () => 12.5,
      getItemCount: () => 3,
    })

    render(<CartSidebar />)

    expect(screen.getByText('3 items')).toBeInTheDocument()
    expect(screen.getByText('Cappuccino')).toBeInTheDocument()
    expect(screen.getByText('Croissant')).toBeInTheDocument()
    expect(screen.getAllByText('$12.50')[0]).toBeInTheDocument()
  })

  it('displays NFT discount when applicable', () => {
    const mockItems = [
      {
        id: 'item-1',
        name: 'Cappuccino',
        description: 'Rich espresso',
        price: 10.0,
        category: 'coffee',
        available: true,
        quantity: 1,
      },
    ]

    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: mockItems,
      isOpen: true,
      closeCart: mockCloseCart,
      getSubtotal: () => 10.0,
      getDiscount: () => 1.0,
      getTotal: (nftHolder: boolean) => (nftHolder ? 9.0 : 10.0),
      getItemCount: () => 1,
    })

    render(<CartSidebar nftHolder={true} />)

    expect(screen.getByText('NFT Holder Discount (10%)')).toBeInTheDocument()
    expect(screen.getByText('-$1.00')).toBeInTheDocument()
    expect(screen.getByText("You're saving $1.00 with your NFT!")).toBeInTheDocument()
  })

  it('navigates to checkout when proceed button clicked', () => {
    const mockItems = [
      {
        id: 'item-1',
        name: 'Cappuccino',
        description: 'Rich espresso',
        price: 4.5,
        category: 'coffee',
        available: true,
        quantity: 1,
      },
    ]

    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: mockItems,
      isOpen: true,
      closeCart: mockCloseCart,
      getSubtotal: () => 4.5,
      getDiscount: () => 0,
      getTotal: () => 4.5,
      getItemCount: () => 1,
    })

    render(<CartSidebar />)

    const checkoutButton = screen.getByText('Proceed to Checkout')
    fireEvent.click(checkoutButton)

    expect(mockCloseCart).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/cafe/cart')
  })

  it('closes cart when close button clicked', () => {
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      items: [],
      isOpen: true,
      closeCart: mockCloseCart,
      getSubtotal: () => 0,
      getDiscount: () => 0,
      getTotal: () => 0,
      getItemCount: () => 0,
    })

    render(<CartSidebar />)

    // Click the close button (X icon)
    const closeButton = screen.getAllByRole('button')[0]
    fireEvent.click(closeButton)

    expect(mockCloseCart).toHaveBeenCalled()
  })
})