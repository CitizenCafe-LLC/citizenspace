import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MobileTabBar, TABS } from '@/components/site/mobile-tab-bar'
import { BottomSheet } from '@/components/site/bottom-sheet'
import { Navigation } from '@/components/navigation'
import { CafeMenu } from '@/components/site/cafe-menu'
import { FaqList } from '@/components/site/faq-list'
import { Disclosure } from '@/components/site/disclosure'
import { SwipeRow } from '@/components/site/swipe-row'
import { FAQ_GROUPS } from '@/lib/site/content'

let mockPath = '/cafe'
jest.mock('next/navigation', () => ({ usePathname: () => mockPath }))
jest.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: {
    Custom: ({ children }: { children: (p: unknown) => React.ReactNode }) =>
      children({ mounted: true, openConnectModal: jest.fn() }),
  },
}))

describe('MobileTabBar', () => {
  it('has the five native-style tabs and marks the current one', () => {
    mockPath = '/cafe'
    render(<MobileTabBar />)
    const bar = screen.getByRole('navigation', { name: 'Tabs' })
    expect(
      within(bar)
        .getAllByRole('link')
        .map(a => a.textContent)
    ).toEqual(TABS.map(t => t.label))
    expect(within(bar).getByRole('link', { name: 'Cafe' })).toHaveAttribute('aria-current', 'page')
    expect(within(bar).getByRole('link', { name: 'Join' })).toHaveAttribute('href', '/membership')
  })

  it('treats the home tab as current only on the home page', () => {
    mockPath = '/blog'
    render(<MobileTabBar />)
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })
})

describe('BottomSheet', () => {
  it('renders a labelled modal dialog that closes on Escape and on the close button', () => {
    const onClose = jest.fn()
    render(
      <BottomSheet open label="Your order" onClose={onClose}>
        <p>inside</p>
      </BottomSheet>
    )
    const dialog = screen.getByRole('dialog', { name: 'Your order' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    fireEvent.keyDown(dialog, { key: 'Escape' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('renders nothing when closed', () => {
    render(
      <BottomSheet open={false} label="Hidden" onClose={() => {}}>
        <p>x</p>
      </BottomSheet>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('Menu sheet', () => {
  it('opens from the top bar with every page, the Founding 50 and Connect Wallet', () => {
    mockPath = '/'
    render(<Navigation />)
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    const sheet = screen.getByRole('dialog', { name: 'Site menu' })
    const nav = within(sheet).getByRole('navigation', { name: 'Mobile' })
    for (const name of ['Workspaces', 'Membership', 'Cafe', 'Gallery', 'Blog', 'FAQ']) {
      expect(within(nav).getByRole('link', { name: new RegExp(`^${name}`) })).toBeInTheDocument()
    }
    expect(within(sheet).getByRole('button', { name: 'Connect Wallet' })).toBeInTheDocument()
    fireEvent.keyDown(sheet, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('Cafe on mobile', () => {
  it('turns Add into a quantity stepper and shows the cart bar', () => {
    render(<CafeMenu />)
    fireEvent.click(screen.getByRole('button', { name: 'Add The Basic Breakfast' }))
    fireEvent.click(screen.getByRole('button', { name: 'Add another The Basic Breakfast' }))
    expect(screen.getByLabelText('2 in order')).toBeInTheDocument()
    const bar = screen.getByRole('button', { name: /View order, 2 items, \$21\.00/ })
    fireEvent.click(bar)
    const sheet = screen.getByRole('dialog', { name: 'Your order' })
    expect(within(sheet).getByText('Send order to Zachary’s')).toBeInTheDocument()
  })

  it('hides the cart bar while the order is empty', () => {
    render(<CafeMenu />)
    expect(screen.queryByRole('button', { name: /View order/ })).not.toBeInTheDocument()
  })
})

describe('FaqList', () => {
  const total = FAQ_GROUPS.reduce((n, g) => n + g.items.length, 0)

  it('shows every question until you search', () => {
    const { container } = render(<FaqList groups={FAQ_GROUPS} />)
    expect(container.querySelectorAll('details')).toHaveLength(total)
  })

  it('filters questions and answers as you type', () => {
    const { container } = render(<FaqList groups={FAQ_GROUPS} />)
    fireEvent.change(screen.getByRole('searchbox', { name: /Search/ }), {
      target: { value: 'notary' },
    })
    const shown = container.querySelectorAll('details')
    expect(shown.length).toBeGreaterThan(0)
    expect(shown.length).toBeLessThan(total)
    shown.forEach(d => expect(d.textContent).toMatch(/notar/i))
  })

  it('says so when nothing matches', () => {
    render(<FaqList groups={FAQ_GROUPS} />)
    fireEvent.change(screen.getByRole('searchbox', { name: /Search/ }), {
      target: { value: 'zzqx' },
    })
    expect(screen.getByRole('status')).toHaveTextContent(/No questions match/)
  })
})

describe('Disclosure', () => {
  it('toggles its panel with aria-expanded', () => {
    render(
      <Disclosure title="Parking">
        <p>Meters run 8am–8pm</p>
      </Disclosure>
    )
    const btn = screen.getByRole('button', { name: /Parking/ })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })
})

describe('SwipeRow', () => {
  it('is a labelled list a screen reader can step through', () => {
    render(
      <SwipeRow label="Rates">
        <div>a</div>
        <div>b</div>
      </SwipeRow>
    )
    expect(
      within(screen.getByRole('list', { name: 'Rates' })).getAllByRole('listitem')
    ).toHaveLength(2)
  })
})

import { HeroCarousel } from '@/components/site/hero-carousel'
import { HERO_SLIDES } from '@/lib/site/content'

describe('HeroCarousel swipe', () => {
  it('moves one photo per horizontal flick, like a native pager', () => {
    render(<HeroCarousel slides={HERO_SLIDES} />)
    const region = screen.getByRole('region', { name: 'Photos of 819 Pacific Ave' })
    fireEvent.touchStart(region, { touches: [{ clientX: 300 }] })
    fireEvent.touchEnd(region, { changedTouches: [{ clientX: 120 }] })
    expect(screen.getByText(HERO_SLIDES[1]!.title)).toBeInTheDocument()
    fireEvent.touchStart(region, { touches: [{ clientX: 100 }] })
    fireEvent.touchEnd(region, { changedTouches: [{ clientX: 280 }] })
    expect(screen.getByText(HERO_SLIDES[0]!.title)).toBeInTheDocument()
  })
})
