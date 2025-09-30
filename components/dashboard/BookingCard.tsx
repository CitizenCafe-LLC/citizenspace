'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, MapPin, QrCode, MoreVertical, X, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Booking {
  id: string
  workspace_id: string
  workspace_name: string
  booking_date: string
  start_time: string
  end_time: string
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'completed' | 'cancelled'
  total_price: number
  qr_code?: string
}

interface BookingCardProps {
  booking: Booking
  onUpdate?: () => void
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'secondary' as const, color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmed', variant: 'default' as const, color: 'bg-blue-500' },
  checked_in: { label: 'Checked In', variant: 'default' as const, color: 'bg-green-500' },
  checked_out: { label: 'Checked Out', variant: 'secondary' as const, color: 'bg-gray-500' },
  completed: { label: 'Completed', variant: 'secondary' as const, color: 'bg-gray-500' },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const, color: 'bg-red-500' },
}

export function BookingCard({ booking, onUpdate }: BookingCardProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isUpcoming =
    booking.status === 'confirmed' || booking.status === 'pending'
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'
  const canExtend = booking.status === 'checked_in'
  const showQR = isUpcoming

  const handleCancel = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to cancel booking')
      }

      toast.success('Booking cancelled successfully')
      onUpdate?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel booking')
    } finally {
      setIsLoading(false)
      setShowCancelDialog(false)
    }
  }

  const handleExtend = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/bookings/${booking.id}/extend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hours: 1 }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to extend booking')
      }

      toast.success('Booking extended by 1 hour')
      onUpdate?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to extend booking')
    } finally {
      setIsLoading(false)
    }
  }

  const status = statusConfig[booking.status]

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{booking.workspace_name}</CardTitle>
              <div className="mt-2 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${status.color}`} />
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {showQR && (
                  <DropdownMenuItem onClick={() => setShowQRDialog(true)}>
                    <QrCode className="mr-2 h-4 w-4" />
                    View QR Code
                  </DropdownMenuItem>
                )}
                {canExtend && (
                  <DropdownMenuItem onClick={handleExtend} disabled={isLoading}>
                    <Clock className="mr-2 h-4 w-4" />
                    Extend Booking
                  </DropdownMenuItem>
                )}
                {canCancel && (
                  <DropdownMenuItem
                    onClick={() => setShowCancelDialog(true)}
                    className="text-destructive"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel Booking
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {booking.start_time} - {booking.end_time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>Workspace ID: {booking.workspace_id}</span>
          </div>
        </CardContent>

        <CardFooter className="border-t bg-muted/30 py-3">
          <div className="flex w-full items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-bold text-cs-blue">
              ${booking.total_price.toFixed(2)}
            </span>
          </div>
        </CardFooter>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone. A
              refund will be processed according to our cancellation policy.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={isLoading}>
              {isLoading ? 'Cancelling...' : 'Yes, cancel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-in QR Code</DialogTitle>
            <DialogDescription>
              Show this QR code at the front desk to check in
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-8">
            {booking.qr_code ? (
              <img
                src={booking.qr_code}
                alt="Booking QR Code"
                className="h-64 w-64"
              />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded-lg bg-muted">
                <div className="text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    QR code not available
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}