/**
 * Admin Dashboard Home Page
 * Overview of key metrics and analytics
 */

'use client'

import React, { useEffect, useState } from 'react'
import { AdminRoute } from '@/components/admin/AdminRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { StatCard } from '@/components/admin/StatCard'
import { ActivityFeed } from '@/components/admin/ActivityFeed'
import { BookingsLineChart, RevenueBarChart } from '@/components/admin/AnalyticsCharts'
import { Calendar, ShoppingCart, DollarSign, Users } from 'lucide-react'

// Mock data - replace with API calls
const mockStats = {
  todaysBookings: { value: 12, trend: { value: 15, isPositive: true } },
  pendingOrders: { value: 8, trend: { value: 5, isPositive: false } },
  revenue: { value: '$2,450', trend: { value: 12, isPositive: true } },
  activeUsers: { value: 142, trend: { value: 8, isPositive: true } },
}

const mockActivities = [
  {
    id: '1',
    user: { name: 'John Doe', avatar: undefined },
    action: 'created booking for',
    target: 'Meeting Room A',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: '2',
    user: { name: 'Jane Smith', avatar: undefined },
    action: 'completed order',
    target: '#1234',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: '3',
    user: { name: 'Admin', avatar: undefined },
    action: 'updated workspace',
    target: 'Hot Desk #3',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: '4',
    user: { name: 'Sarah Johnson', avatar: undefined },
    action: 'registered as',
    target: 'new member',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: '5',
    user: { name: 'Mike Brown', avatar: undefined },
    action: 'cancelled booking for',
    target: 'Private Office',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
  },
]

const mockBookingsData = [
  { date: 'Mon', bookings: 12 },
  { date: 'Tue', bookings: 19 },
  { date: 'Wed', bookings: 15 },
  { date: 'Thu', bookings: 22 },
  { date: 'Fri', bookings: 28 },
  { date: 'Sat', bookings: 18 },
  { date: 'Sun', bookings: 10 },
]

const mockRevenueData = [
  { category: 'Hot Desks', amount: 850 },
  { category: 'Meeting Rooms', amount: 650 },
  { category: 'Cafe Orders', amount: 550 },
  { category: 'Memberships', amount: 400 },
]

export default function AdminDashboardPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Today's Bookings"
              value={mockStats.todaysBookings.value}
              icon={Calendar}
              trend={mockStats.todaysBookings.trend}
            />
            <StatCard
              title="Pending Orders"
              value={mockStats.pendingOrders.value}
              icon={ShoppingCart}
              trend={mockStats.pendingOrders.trend}
            />
            <StatCard
              title="Today's Revenue"
              value={mockStats.revenue.value}
              icon={DollarSign}
              trend={mockStats.revenue.trend}
            />
            <StatCard
              title="Active Users"
              value={mockStats.activeUsers.value}
              icon={Users}
              trend={mockStats.activeUsers.trend}
            />
          </div>

          {/* Charts and Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            <BookingsLineChart data={mockBookingsData} />
            <RevenueBarChart data={mockRevenueData} />
          </div>

          {/* Recent Activity */}
          <ActivityFeed activities={mockActivities} maxHeight="500px" />
        </div>
      </AdminLayout>
    </AdminRoute>
  )
}