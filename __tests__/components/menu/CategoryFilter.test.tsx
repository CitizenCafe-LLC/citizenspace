import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { CategoryFilter } from '@/components/menu/CategoryFilter'

describe('CategoryFilter', () => {
  const mockCategories = ['all', 'coffee', 'tea', 'pastries', 'meals']
  const mockOnCategoryChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all categories', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        activeCategory="all"
        onCategoryChange={mockOnCategoryChange}
      />
    )

    expect(screen.getByText('All Items')).toBeInTheDocument()
    expect(screen.getByText('coffee')).toBeInTheDocument()
    expect(screen.getByText('tea')).toBeInTheDocument()
    expect(screen.getByText('pastries')).toBeInTheDocument()
    expect(screen.getByText('meals')).toBeInTheDocument()
  })

  it('displays "All Items" for "all" category', () => {
    render(
      <CategoryFilter
        categories={['all']}
        activeCategory="all"
        onCategoryChange={mockOnCategoryChange}
      />
    )

    expect(screen.getByText('All Items')).toBeInTheDocument()
  })

  it('calls onCategoryChange when category clicked', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        activeCategory="all"
        onCategoryChange={mockOnCategoryChange}
      />
    )

    const coffeeTab = screen.getByText('coffee')
    fireEvent.click(coffeeTab)

    expect(mockOnCategoryChange).toHaveBeenCalledWith('coffee')
  })

  it('highlights active category', () => {
    const { container } = render(
      <CategoryFilter
        categories={mockCategories}
        activeCategory="coffee"
        onCategoryChange={mockOnCategoryChange}
      />
    )

    // Active tab should have specific styling
    const activeTab = container.querySelector('[data-state="active"]')
    expect(activeTab).toBeInTheDocument()
  })
})