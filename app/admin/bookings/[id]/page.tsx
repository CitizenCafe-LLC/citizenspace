/**
 * Admin Booking Details Page
 * View and edit individual booking
 */

'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminRoute } from '@/components/admin/AdminRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { ArrowLeft, Calendar, Clock, DollarSign, Mail, Phone, MapPin, Edit2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data - replace with API call
const mockBooking = {
  id: '1',
  orderNumber: 'BK-2025-001',
  workspace: {
    id: 'ws1',
    name: 'Hot Desk #1',
    type: 'Hot Desk',
    location: 'Main Floor',
    image: undefined,
  },
  user: {
    id: 'u1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    avatar: undefined,
  },
  startTime: new Date('2025-09-30T09:00:00'),
  endTime: new Date('2025-09-30T17:00:00'),
  status: 'upcoming' as const,
  payment: {
    subtotal: 40.0,
    discount: 0,
    tax: 5.0,
    total: 45.0,
    method: 'Credit Card',
    status: 'paid',
  },
  history: [
    { action: 'Booking created', timestamp: new Date('2025-09-29T10:30:00'), user: 'John Doe' },
    { action: 'Payment processed', timestamp: new Date('2025-09-29T10:31:00'), user: 'System' },
  ],
}

export default function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'

  const [booking, setBooking] = useState(mockBooking)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [refundAmount, setRefundAmount] = useState(booking.payment.total.toString())
  const [sendNotification, setSendNotification] = useState(true)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'active':
        return 'bg-green-500 hover:bg-green-600'
      case 'completed':
        return 'bg-gray-500 hover:bg-gray-600'
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const handleCancelBooking = async () => {
    try {
      // TODO: Call API to cancel booking
      setBooking({ ...booking, status: 'cancelled' })
      setShowCancelDialog(false)
      toast.success('Booking cancelled successfully')
    } catch (error) {
      toast.error('Failed to cancel booking')
    }
  }

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">Booking Details</h1>
              <p className="text-muted-foreground">Order #{booking.orderNumber}</p>
            </div>
            <Badge className={cn('text-sm', getStatusColor(booking.status))}>
              {booking.status}
            </Badge>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Workspace Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 rounded-lg bg-muted" />
                    <div className="flex-1">
                      <h3 className="font-semibold">{booking.workspace.name}</h3>
                      <p className="text-sm text-muted-foreground">{booking.workspace.type}</p>
                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {booking.workspace.location}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Start Time</p>
                        <p className="text-sm text-muted-foreground">
                          {format(booking.startTime, 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">End Time</p>
                        <p className="text-sm text-muted-foreground">
                          {format(booking.endTime, 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Info */}
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={booking.user.avatar} alt={booking.user.name} />
                      <AvatarFallback>
                        {booking.user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{booking.user.name}</h3>
                      <p className="text-sm text-muted-foreground">Member since Jan 2025</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">{booking.user.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">{booking.user.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* History */}
              <Card>
                <CardHeader>
                  <CardTitle>Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {booking.history.map((item, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(item.timestamp, 'MMM d, yyyy h:mm a')} • {item.user}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Payment Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="text-sm font-medium">
                      ${booking.payment.subtotal.toFixed(2)}
                    </span>
                  </div>
                  {booking.payment.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Discount</span>
                      <span className="text-sm font-medium text-green-500">
                        -${booking.payment.discount.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tax</span>
                    <span className="text-sm font-medium">${booking.payment.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">${booking.payment.total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{booking.payment.method}</span>
                    <Badge variant="outline" className="ml-auto">
                      {booking.payment.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full">
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit Booking
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Booking
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Dialog */}
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="refund">Refund Amount</Label>
                <Input
                  id="refund"
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify"
                  checked={sendNotification}
                  onCheckedChange={(checked) => setSendNotification(checked as boolean)}
                />
                <Label htmlFor="notify">Send cancellation notification to user</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Close
              </Button>
              <Button variant="destructive" onClick={handleCancelBooking}>
                Confirm Cancellation
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </AdminRoute>
  )
}