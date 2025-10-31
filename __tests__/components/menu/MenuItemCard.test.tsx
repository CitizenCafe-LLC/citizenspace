import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

  it('allows adding item to cart with quantity', async () => {
    const { container } = render(<MenuItemCard item={mockItem} />)

    // Find the plus button by its position and class
    const allButtons = screen.getAllByRole('button')
    // Filter for buttons with icon size (h-8 w-8)
    const iconButtons = allButtons.filter(btn => btn.className.includes('h-8 w-8'))
    const plusButton = iconButtons.find(btn => {
      const svg = btn.querySelector('svg')
      return svg?.classList.contains('lucide-plus')
    })

    // Increase quantity to 3 (starts at 1, so click twice)
    fireEvent.click(plusButton!)

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    fireEvent.click(plusButton!)

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    // Add to cart
    const addButton = screen.getByText('Add to Cart')
    fireEvent.click(addButton)

    expect(mockAddItem).toHaveBeenCalledWith(mockItem, 3)
    expect(mockOpenCart).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Added 3x Cappuccino to cart')
  })

  it('allows quick add with single quantity', () => {
    const { container } = render(<MenuItemCard item={mockItem} />)

    // Find the quick add button - it's in the card header with ghost + sm
    const buttons = screen.getAllByRole('button')
    // The quick add is the first button with Plus icon
    const plusButtons = buttons.filter((btn) =>
      btn.querySelector('svg.lucide-plus')
    )
    // The quick add button should be the first one (in the header)
    const quickAddButton = plusButtons[0]

    expect(quickAddButton).toBeTruthy()
    fireEvent.click(quickAddButton!)

    expect(mockAddItem).toHaveBeenCalledWith(mockItem, 1)
    expect(toast.success).toHaveBeenCalledWith('Added Cappuccino to cart')
  })

  it('disables adding unavailable items', () => {
    const unavailableItem = { ...mockItem, available: false }
    render(<MenuItemCard item={unavailableItem} />)

    expect(screen.getByText('Unavailable')).toBeInTheDocument()

    const addButton = screen.getByText('Add to Cart')
    expect(addButton).toBeDisabled()

    // Verify that disabled button prevents clicks
    expect(mockAddItem).not.toHaveBeenCalled()
  })

  it('limits quantity to 10', async () => {
    render(<MenuItemCard item={mockItem} />)

    const allButtons = screen.getAllByRole('button')
    const iconButtons = allButtons.filter(btn => btn.className.includes('h-8 w-8'))
    const plusButton = iconButtons.find(btn => {
      const svg = btn.querySelector('svg')
      return svg?.classList.contains('lucide-plus')
    })

    // Starts at 1, click 9 times to reach 10
    for (let i = 0; i < 9; i++) {
      fireEvent.click(plusButton!)
    }

    // Wait for state to update and verify displays 10
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument()
    })

    // One more click should not increase
    fireEvent.click(plusButton!)
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument()
    })
  })

  it('decreases quantity but not below 1', () => {
    render(<MenuItemCard item={mockItem} />)

    const buttons = screen.getAllByRole('button')
    const minusButton = buttons.find((btn) =>
      btn.querySelector('svg.lucide-minus')
    )

    // Try to decrease below 1 (starts at 1)
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