'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, CreditCard, ShoppingBag, Plus } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { QuickStats } from '@/components/dashboard/QuickStats'
import { BookingCard } from '@/components/dashboard/BookingCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

interface DashboardData {
  user: {
    name: string
    email: string
    avatar?: string
    nft_holder?: boolean
  }
  stats: {
    totalBookingsThisMonth: number
    creditsUsed: number
    moneySaved: number
    totalSpent: number
  }
  upcomingBookings: any[]
  recentOrders: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch user data
      const userRes = await fetch('/api/auth/me')
      if (!userRes.ok) {
        if (userRes.status === 401) {
          window.location.href = '/login'
          return
        }
        throw new Error('Failed to fetch user data')
      }
      const userData = await userRes.json()

      // Fetch bookings
      const bookingsRes = await fetch('/api/bookings?status=confirmed,pending&limit=3')
      const bookingsData = await bookingsRes.ok ? await bookingsRes.json() : { data: [] }

      // Fetch orders
      const ordersRes = await fetch('/api/orders?limit=3')
      const ordersData = await ordersRes.ok ? await ordersRes.json() : { data: [] }

      // Calculate stats (simplified - would normally aggregate from multiple endpoints)
      const stats = {
        totalBookingsThisMonth: 0,
        creditsUsed: 0,
        moneySaved: userData.user?.nft_holder ? 150.0 : 0,
        totalSpent: 0,
      }

      setData({
        user: userData.user,
        stats,
        upcomingBookings: bookingsData.data || [],
        recentOrders: ordersData.data || [],
      })
    } catch (error) {
      console.error('Dashboard error:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <p className="text-muted-foreground">Failed to load dashboard</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={data.user}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {data.user.name.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Quick Stats */}
        <QuickStats stats={data.stats} />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get things done faster</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/booking">
                <Calendar className="mr-2 h-4 w-4" />
                Book Workspace
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cafe/menu">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Order Food
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/credits">
                <CreditCard className="mr-2 h-4 w-4" />
                View Credits
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Bookings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>Your next scheduled workspaces</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/bookings">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.upcomingBookings.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed">
                  <Calendar className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No upcoming bookings</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/booking">
                      <Plus className="mr-1 h-4 w-4" />
                      Book Now
                    </Link>
                  </Button>
                </div>
              ) : (
                data.upcomingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onUpdate={loadDashboardData}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest cafe orders</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/orders">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.recentOrders.length === 0 ? (
                <div className="flex h-32 flex-col items-center justify-center rounded-lg border-2 border-dashed">
                  <ShoppingBag className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No recent orders</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link href="/cafe/menu">
                      <Plus className="mr-1 h-4 w-4" />
                      Order Now
                    </Link>
                  </Button>
                </div>
              ) : (
                data.recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items?.length || 0} items • ${order.total_price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/orders/${order.id}`}>View</Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}