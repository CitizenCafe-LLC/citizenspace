'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { BookingCard } from '@/components/dashboard/BookingCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar } from 'lucide-react'
import { toast } from 'sonner'

type BookingStatus = 'upcoming' | 'past' | 'cancelled'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<BookingStatus>('upcoming')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  useEffect(() => {
    loadBookings()
  }, [activeTab])

  const loadUserData = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    }
  }

  const loadBookings = async () => {
    try {
      setLoading(true)

      let statusFilter = ''
      if (activeTab === 'upcoming') {
        statusFilter = 'status=pending,confirmed,checked_in'
      } else if (activeTab === 'past') {
        statusFilter = 'status=completed,checked_out'
      } else if (activeTab === 'cancelled') {
        statusFilter = 'status=cancelled'
      }

      const res = await fetch(`/api/bookings?${statusFilter}`)
      if (!res.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await res.json()
      setBookings(data.data || [])
    } catch (error) {
      console.error('Bookings error:', error)
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const renderBookings = () => {
    if (loading) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      )
    }

    if (bookings.length === 0) {
      return (
        <div className="flex h-96 flex-col items-center justify-center rounded-lg border-2 border-dashed">
          <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-medium">No bookings found</h3>
          <p className="text-sm text-muted-foreground">
            {activeTab === 'upcoming' && "You don't have any upcoming bookings."}
            {activeTab === 'past' && "You don't have any past bookings."}
            {activeTab === 'cancelled' && "You don't have any cancelled bookings."}
          </p>
        </div>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} onUpdate={loadBookings} />
        ))}
      </div>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground">
            Manage your workspace reservations and bookings
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BookingStatus)}>
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {renderBookings()}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {renderBookings()}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            {renderBookings()}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}