import React from 'react'
import { render, screen, fireEvent, act, within } from '@testing-library/react'
import { HeroCarousel } from '@/components/site/hero-carousel'
import { RoomPicker } from '@/components/site/room-picker'
import { CafeMenu } from '@/components/site/cafe-menu'
import { Footer } from '@/components/footer'
import { Navigation } from '@/components/navigation'
import { HERO_SLIDES, ZONES } from '@/lib/site/content'

jest.mock('next/navigation', () => ({ usePathname: () => '/membership' }))

// RainbowKit ships ESM-only; next/jest's blanket node_modules ignore always
// wins over a custom transformIgnorePatterns entry, so it can't be
// transformed for tests. Mock it the same way __tests__/lib/web3/wagmi.test.ts
// does for the config module.
jest.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: {
    Custom: ({ children }: { children: (props: any) => React.ReactNode }) =>
      children({
        account: undefined,
        chain: undefined,
        openAccountModal: jest.fn(),
        openChainModal: jest.fn(),
        openConnectModal: jest.fn(),
        authenticationStatus: undefined,
        mounted: true,
      }),
  },
}))

describe('Footer', () => {
  it('names the public benefit corporation and its mission', () => {
    render(<Footer />)
    expect(screen.getByText(/Citizen Space, PBC/)).toBeInTheDocument()
    expect(screen.getByText(/grow the Santa Cruz founder economy/i)).toBeInTheDocument()
  })

  it('links every main page, including the FAQ', () => {
    render(<Footer />)
    for (const name of ['Desks', 'Events', 'Blog', 'Gallery', 'Location', 'Contact', 'FAQ']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument()
    }
  })
})

describe('Navigation', () => {
  it('links Workspaces (the old nav left it unlinked) and marks the current page', () => {
    render(<Navigation />)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Workspaces' })).toHaveAttribute(
      'href',
      '/workspaces'
    )
    expect(within(nav).getByRole('link', { name: 'Membership' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('shows Connect Wallet with an explanation of what it is for', () => {
    render(<Navigation />)
    const button = screen.getByText(/connect wallet/i)
    expect(button).toBeInTheDocument()
    // The wallet connects a founding member's NFT key — explained via a
    // title tooltip on desktop, not left as an unexplained raw button.
    expect(button.closest('[title]')).toHaveAttribute('title', expect.stringMatching(/NFT key/i))
  })
})

describe('HeroCarousel', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('starts on the first photo and steps forward and back', () => {
    render(<HeroCarousel slides={HERO_SLIDES} />)
    expect(screen.getByText(HERO_SLIDES[0].title)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Next photo' }))
    expect(screen.getByText(HERO_SLIDES[1].title)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Previous photo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Previous photo' }))
    expect(screen.getByText(HERO_SLIDES[HERO_SLIDES.length - 1].title)).toBeInTheDocument()
  })

  it('rotates on its own every few seconds', () => {
    render(<HeroCarousel slides={HERO_SLIDES} intervalMs={5000} />)
    act(() => {
      jest.advanceTimersByTime(5000)
    })
    expect(screen.getByText(HERO_SLIDES[1].title)).toBeInTheDocument()
  })
})

describe('RoomPicker', () => {
  it('shows the conference room first and switches rooms on click', () => {
    render(<RoomPicker zones={ZONES} />)
    expect(screen.getByRole('heading', { name: 'Conference room' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Hot desks/ }))
    expect(screen.getByRole('heading', { name: 'Hot desks' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Hot desks/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })
})

describe('CafeMenu', () => {
  it('adds items, totals the order and sends it', () => {
    render(<CafeMenu />)
    fireEvent.click(screen.getByRole('tab', { name: 'Brunch specials' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add Mike’s Mess' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add Mike’s Mess' }))
    expect(screen.getByText('2×')).toBeInTheDocument()
    expect(screen.getByText('Subtotal').parentElement).toHaveTextContent('$31.00')
    fireEvent.click(screen.getByRole('button', { name: /Send order to Zachary’s/ }))
    expect(screen.getByRole('status')).toHaveTextContent(/Order sent/)
  })
})

import { ArticleBlocks, articleHeadings } from '@/components/site/article-blocks'
import { SAMPLE_ARTICLES } from '@/lib/strapi/articles'

describe('ArticleBlocks', () => {
  const blocks = SAMPLE_ARTICLES[0].blocks
  it('builds the "On this page" list from rich-text headings', () => {
    expect(articleHeadings(blocks).map(h => h.id)).toContain('where-the-conference-room-went')
  })
  it('renders every Strapi block type', () => {
    render(<ArticleBlocks blocks={blocks} />)
    expect(screen.getByRole('heading', { name: 'Starting from the walls' })).toHaveAttribute(
      'id',
      'starting-from-the-walls'
    )
    expect(screen.getByText('We keep the brick. We fix the rest.')).toBeInTheDocument()
    expect(screen.getByText('The final numbers')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Join the Founding 50' })).toHaveAttribute(
      'href',
      '/membership'
    )
  })
})
