import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { useCartStore } from '@/lib/store/cart-store'
import { toast } from 'sonner'

jest.mock('@/lib/store/cart-store')
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('MenuItemCard', () => {
  const mockItem = {
    id: 'item-1',
    name: 'Cappuccino',
    description: 'Rich espresso with steamed milk',
    price: 4.5,
    category: 'coffee',
    image_url: 'https://example.com/cappuccino.jpg',
    dietary_tags: ['vegetarian'],
    available: true,
  }

  const mockAddItem = jest.fn()
  const mockOpenCart = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useCartStore as unknown as jest.Mock).mockReturnValue({
      addItem: mockAddItem,
      openCart: mockOpenCart,
    })
  })

  it('renders menu item with all information', () => {
    render(<MenuItemCard item={mockItem} />)

    expect(screen.getByText('Cappuccino')).toBeInTheDocument()
    expect(screen.getByText('Rich espresso with steamed milk')).toBeInTheDocument()
    expect(screen.getByText('$4.50')).toBeInTheDocument()
    expect(screen.getByAltText('Cappuccino')).toHaveAttribute(
      'src',
      'https://example.com/cappuccino.jpg'
    )
  })

  it('displays NFT holder discounted price', () => {
    render(<MenuItemCard item={mockItem} nftHolder={true} />)

    expect(screen.getByText('$4.05')).toBeInTheDocument() // 10% off
    expect(screen.getByText('$4.50')).toBeInTheDocument() // Original price crossed out
    expect(screen.getByText('Save $0.45')).toBeInTheDocument()
  })

  it('shows dietary tags', () => {
    render(<MenuItemCard item={mockItem} />)

    expect(screen.getByText('vegetarian')).toBeInTheDocument()
  })

  it('allows adding item to cart with quantity', () => {
    render(<MenuItemCard item={mockItem} />)

    // Increase quantity to 3
    const plusButton = screen.getAllByRole('button').find((btn) =>
      btn.querySelector('svg')?.classList.contains('lucide-plus')
    )
    fireEvent.click(plusButton!)
    fireEvent.click(plusButton!)

    // Add to cart
    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)

    expect(mockAddItem).toHaveBeenCalledWith(mockItem, 3)
    expect(mockOpenCart).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Added 3x Cappuccino to cart')
  })

  it('allows quick add with single quantity', () => {
    render(<MenuItemCard item={mockItem} />)

    const quickAddButton = screen.getAllByRole('button').find((btn) =>
      btn.className.includes('ghost')
    )
    fireEvent.click(quickAddButton!)

    expect(mockAddItem).toHaveBeenCalledWith(mockItem, 1)
    expect(toast.success).toHaveBeenCalledWith('Added Cappuccino to cart')
  })

  it('disables adding unavailable items', () => {
    const unavailableItem = { ...mockItem, available: false }
    render(<MenuItemCard item={unavailableItem} />)

    expect(screen.getByText('Unavailable')).toBeInTheDocument()

    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)

    expect(mockAddItem).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('This item is currently unavailable')
  })

  it('limits quantity to 10', () => {
    render(<MenuItemCard item={mockItem} />)

    const plusButton = screen.getAllByRole('button').find((btn) =>
      btn.querySelector('svg')?.classList.contains('lucide-plus')
    )

    // Try to add more than 10
    for (let i = 0; i < 15; i++) {
      fireEvent.click(plusButton!)
    }

    // Should display 10, not more
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('decreases quantity but not below 1', () => {
    render(<MenuItemCard item={mockItem} />)

    const minusButton = screen.getAllByRole('button').find((btn) =>
      btn.querySelector('svg')?.classList.contains('lucide-minus')
    )

    // Try to decrease below 1
    fireEvent.click(minusButton!)
    fireEvent.click(minusButton!)

    // Should still display 1
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('displays placeholder image when no image_url', () => {
    const noImageItem = { ...mockItem, image_url: undefined }
    render(<MenuItemCard item={noImageItem} />)

    expect(screen.getByText('🍽️')).toBeInTheDocument()
  })
})