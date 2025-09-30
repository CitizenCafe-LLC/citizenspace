/**
 * Tests for ActivityFeed component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { ActivityFeed } from '@/components/admin/ActivityFeed'

const mockActivities = [
  {
    id: '1',
    user: { name: 'John Doe', avatar: undefined },
    action: 'created booking for',
    target: 'Meeting Room A',
    timestamp: new Date('2025-09-29T10:00:00'),
  },
  {
    id: '2',
    user: { name: 'Jane Smith', avatar: 'https://example.com/avatar.jpg' },
    action: 'completed order',
    target: '#1234',
    timestamp: new Date('2025-09-29T09:30:00'),
  },
]

describe('ActivityFeed', () => {
  it('renders activity feed with title', () => {
    render(<ActivityFeed activities={mockActivities} />)

    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('displays all activities', () => {
    render(<ActivityFeed activities={mockActivities} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('created booking for')).toBeInTheDocument()
    expect(screen.getByText('Meeting Room A')).toBeInTheDocument()

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('completed order')).toBeInTheDocument()
    expect(screen.getByText('#1234')).toBeInTheDocument()
  })

  it('shows empty state when no activities', () => {
    render(<ActivityFeed activities={[]} />)

    expect(screen.getByText('No recent activity')).toBeInTheDocument()
  })

  it('displays relative timestamps', () => {
    render(<ActivityFeed activities={mockActivities} />)

    // Should show "X minutes ago" or similar
    expect(screen.getAllByText(/ago/i)).toHaveLength(2)
  })

  it('renders user avatars with fallback initials', () => {
    render(<ActivityFeed activities={mockActivities} />)

    expect(screen.getByText('JD')).toBeInTheDocument() // John Doe fallback
    expect(screen.getByText('JS')).toBeInTheDocument() // Jane Smith fallback
  })

  it('respects custom maxHeight prop', () => {
    const { container } = render(<ActivityFeed activities={mockActivities} maxHeight="600px" />)

    const scrollArea = container.querySelector('[style*="height"]')
    expect(scrollArea).toHaveStyle({ height: '600px' })
  })
})