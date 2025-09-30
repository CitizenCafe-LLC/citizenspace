/**
 * Tests for StatCard component
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { StatCard } from '@/components/admin/StatCard'
import { Calendar } from 'lucide-react'

describe('StatCard', () => {
  it('renders with basic props', () => {
    render(
      <StatCard
        title="Test Metric"
        value="100"
        icon={Calendar}
      />
    )

    expect(screen.getByText('Test Metric')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
  })

  it('renders numeric value correctly', () => {
    render(
      <StatCard
        title="Total Users"
        value={1234}
        icon={Calendar}
      />
    )

    expect(screen.getByText('1234')).toBeInTheDocument()
  })

  it('displays positive trend indicator', () => {
    render(
      <StatCard
        title="Revenue"
        value="$1,000"
        icon={Calendar}
        trend={{ value: 15, isPositive: true }}
      />
    )

    expect(screen.getByText('15%')).toBeInTheDocument()
    expect(screen.getByText('from last period')).toBeInTheDocument()
  })

  it('displays negative trend indicator', () => {
    render(
      <StatCard
        title="Revenue"
        value="$1,000"
        icon={Calendar}
        trend={{ value: -5, isPositive: false }}
      />
    )

    expect(screen.getByText('5%')).toBeInTheDocument()
    expect(screen.getByText('from last period')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <StatCard
        title="Active Users"
        value="142"
        icon={Calendar}
        description="Currently online"
      />
    )

    expect(screen.getByText('Currently online')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <StatCard
        title="Test"
        value="100"
        icon={Calendar}
        className="custom-class"
      />
    )

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})