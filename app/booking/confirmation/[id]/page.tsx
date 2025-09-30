/**
 * Booking Confirmation Page
 * Displays booking confirmation with QR code and details
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BookingConfirmation } from '@/components/booking/BookingConfirmation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface BookingData {
  id: string
  confirmationCode: string
  workspace: {
    name: string
    type: string
    location?: string
  }
  bookingDate: string
  startTime: string
  endTime: string
  duration: number
  attendees: number
  status: string
  paymentStatus: string
  totalPrice: number
  specialRequests?: string
}

export default function BookingConfirmationPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<BookingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('Invalid booking ID')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/bookings/${bookingId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch booking')
        }

        // Transform API response to match BookingData interface
        const bookingData: BookingData = {
          id: data.data.id,
          confirmationCode: data.data.confirmation_code,
          workspace: {
            name: data.data.workspace?.name || 'Workspace',
            type: data.data.workspace?.type || data.data.booking_type,
            location: data.data.workspace?.location,
          },
          bookingDate: data.data.booking_date,
          startTime: data.data.start_time,
          endTime: data.data.end_time,
          duration: data.data.duration_hours,
          attendees: data.data.attendees || 1,
          status: data.data.status,
          paymentStatus: data.data.payment_status,
          totalPrice: data.data.total_price || 0,
          specialRequests: data.data.special_requests,
        }

        setBooking(bookingData)
      } catch (err) {
        console.error('Error fetching booking:', err)
        setError(err instanceof Error ? err.message : 'Failed to load booking details')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  if (loading) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading booking details...</span>
              </div>
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Booking not found'}</AlertDescription>
          </Alert>

          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find the booking you're looking for. It may have been cancelled or
                the link may be incorrect.
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild variant="outline">
                  <Link href="/booking">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Make New Booking
                  </Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard">View My Bookings</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Confirmation Component */}
        <BookingConfirmation booking={booking} />

        {/* Additional Actions */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">Need to make changes?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact us if you need to modify or cancel your booking
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/contact">Contact Support</Link>
                </Button>
                <Button asChild>
                  <Link href="/booking">Make Another Booking</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}