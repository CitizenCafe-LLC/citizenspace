/**
 * Admin Bookings Management Page
 * List and manage all bookings
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminRoute } from '@/components/admin/AdminRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { BookingsList } from '@/components/admin/BookingsList'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

// Mock data - replace with API calls
const mockBookings = [
  {
    id: '1',
    workspaceName: 'Hot Desk #1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    startTime: new Date('2025-09-30T09:00:00'),
    endTime: new Date('2025-09-30T17:00:00'),
    status: 'upcoming' as const,
    total: 45.0,
  },
  {
    id: '2',
    workspaceName: 'Meeting Room A',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    startTime: new Date('2025-09-29T14:00:00'),
    endTime: new Date('2025-09-29T16:00:00'),
    status: 'active' as const,
    total: 80.0,
  },
  {
    id: '3',
    workspaceName: 'Private Office',
    userName: 'Mike Johnson',
    userEmail: 'mike@example.com',
    startTime: new Date('2025-09-28T10:00:00'),
    endTime: new Date('2025-09-28T15:00:00'),
    status: 'completed' as const,
    total: 120.0,
  },
  {
    id: '4',
    workspaceName: 'Hot Desk #3',
    userName: 'Sarah Brown',
    userEmail: 'sarah@example.com',
    startTime: new Date('2025-09-27T09:00:00'),
    endTime: new Date('2025-09-27T12:00:00'),
    status: 'cancelled' as const,
    total: 25.0,
  },
]

export default function AdminBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState(mockBookings)

  const handleView = (id: string) => {
    router.push(`/admin/bookings/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/admin/bookings/${id}?edit=true`)
  }

  const handleCancel = async (id: string) => {
    try {
      // TODO: Call API to cancel booking
      const updatedBookings = bookings.map((booking) =>
        booking.id === id ? { ...booking, status: 'cancelled' as const } : booking
      )
      setBookings(updatedBookings)
      toast.success('Booking cancelled successfully')
    } catch (error) {
      toast.error('Failed to cancel booking')
    }
  }

  const handleExport = () => {
    // TODO: Implement CSV export
    toast.success('Exporting bookings to CSV...')
  }

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Bookings Management</h1>
              <p className="text-muted-foreground">
                Manage all workspace bookings and reservations
              </p>
            </div>
            <Button onClick={() => router.push('/booking')}>
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </div>

          {/* Bookings List */}
          <Card>
            <CardHeader>
              <CardTitle>All Bookings</CardTitle>
              <CardDescription>
                View and manage all workspace bookings across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BookingsList
                bookings={bookings}
                onView={handleView}
                onEdit={handleEdit}
                onCancel={handleCancel}
                onExport={handleExport}
              />
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminRoute>
  )
}