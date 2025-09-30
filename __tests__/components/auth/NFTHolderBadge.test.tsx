/**
 * NFTHolderBadge Component Tests
 */

import { render, screen } from '@testing-library/react'
import {
  NFTHolderBadge,
  NFTStatusIndicator,
  NFTHolderBanner,
} from '@/components/auth/NFTHolderBadge'

describe('NFTHolderBadge', () => {
  it('renders the badge with default props', () => {
    render(<NFTHolderBadge />)

    expect(screen.getByText(/nft holder - 50% off/i)).toBeInTheDocument()
  })

  it('shows icon by default', () => {
    const { container } = render(<NFTHolderBadge />)

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('hides icon when showIcon is false', () => {
    const { container } = render(<NFTHolderBadge showIcon={false} />)

    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<NFTHolderBadge className="custom-class" />)

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('renders different sizes correctly', () => {
    const { rerender } = render(<NFTHolderBadge size="sm" />)
    expect(screen.getByText(/nft holder - 50% off/i)).toBeInTheDocument()

    rerender(<NFTHolderBadge size="md" />)
    expect(screen.getByText(/nft holder - 50% off/i)).toBeInTheDocument()

    rerender(<NFTHolderBadge size="lg" />)
    expect(screen.getByText(/nft holder - 50% off/i)).toBeInTheDocument()
  })
})

describe('NFTStatusIndicator', () => {
  it('shows NFT holder badge when isHolder is true', () => {
    render(<NFTStatusIndicator isHolder={true} />)

    expect(screen.getByText(/nft holder - 50% off/i)).toBeInTheDocument()
  })

  it('shows standard member badge when isHolder is false', () => {
    render(<NFTStatusIndicator isHolder={false} />)

    expect(screen.getByText(/standard member/i)).toBeInTheDocument()
    expect(screen.queryByText(/nft holder/i)).not.toBeInTheDocument()
  })
})

describe('NFTHolderBanner', () => {
  it('renders the banner with benefit information', () => {
    render(<NFTHolderBanner />)

    expect(screen.getByText(/nft holder benefits active/i)).toBeInTheDocument()
    expect(
      screen.getByText(/50% off all hourly desk bookings and 10% off cafe orders/i)
    ).toBeInTheDocument()
  })

  it('displays the sparkles icon', () => {
    const { container } = render(<NFTHolderBanner />)

    const icons = container.querySelectorAll('svg')
    expect(icons.length).toBeGreaterThan(0)
  })

  it('has proper styling classes for gradient background', () => {
    const { container } = render(<NFTHolderBanner />)

    expect(container.firstChild?.firstChild).toHaveClass('bg-gradient-to-r')
  })
})