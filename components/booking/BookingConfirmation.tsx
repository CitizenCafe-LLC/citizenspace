/**
 * BookingConfirmation Component
 * Displays booking confirmation with details and export options
 */

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BookingQRCode } from './BookingQRCode'
import { format } from 'date-fns'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Download,
  Share2,
  Printer,
  Mail,
} from 'lucide-react'

interface BookingDetails {
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

interface BookingConfirmationProps {
  booking: BookingDetails
}

export function BookingConfirmation({ booking }: BookingConfirmationProps) {
  const handleAddToGoogleCalendar = () => {
    const startDateTime = new Date(`${booking.bookingDate}T${booking.startTime}`)
    const endDateTime = new Date(`${booking.bookingDate}T${booking.endTime}`)

    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render')
    googleCalendarUrl.searchParams.append('action', 'TEMPLATE')
    googleCalendarUrl.searchParams.append(
      'text',
      `CitizenSpace Booking - ${booking.workspace.name}`
    )
    googleCalendarUrl.searchParams.append(
      'dates',
      `${format(startDateTime, "yyyyMMdd'T'HHmmss")}/${format(
        endDateTime,
        "yyyyMMdd'T'HHmmss"
      )}`
    )
    googleCalendarUrl.searchParams.append(
      'details',
      `Confirmation Code: ${booking.confirmationCode}\n\nWorkspace: ${booking.workspace.name}\nAttendees: ${booking.attendees}`
    )
    googleCalendarUrl.searchParams.append('location', 'CitizenSpace Coworking')

    window.open(googleCalendarUrl.toString(), '_blank')
  }

  const handleDownloadICS = () => {
    const startDateTime = new Date(`${booking.bookingDate}T${booking.startTime}`)
    const endDateTime = new Date(`${booking.bookingDate}T${booking.endTime}`)

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CitizenSpace//Booking//EN
BEGIN:VEVENT
UID:${booking.id}@citizenspace.com
DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}
DTSTART:${format(startDateTime, "yyyyMMdd'T'HHmmss")}
DTEND:${format(endDateTime, "yyyyMMdd'T'HHmmss")}
SUMMARY:CitizenSpace Booking - ${booking.workspace.name}
DESCRIPTION:Confirmation Code: ${booking.confirmationCode}\\nWorkspace: ${booking.workspace.name}\\nAttendees: ${booking.attendees}
LOCATION:CitizenSpace Coworking
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `booking-${booking.confirmationCode}.ics`
    link.click()
  }

  const handleShare = async () => {
    const shareData = {
      title: 'CitizenSpace Booking Confirmation',
      text: `Booking confirmed for ${booking.workspace.name} on ${format(
        new Date(booking.bookingDate),
        'MMMM d, yyyy'
      )}. Confirmation: ${booking.confirmationCode}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `${shareData.text}\n${shareData.url}`
      )
      alert('Booking details copied to clipboard!')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-transparent">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-green-900">Booking Confirmed!</h2>
              <p className="text-muted-foreground mt-1">
                Your workspace has been reserved
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>
                Confirmation: <span className="font-mono font-bold">{booking.confirmationCode}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{booking.workspace.name}</p>
                    <p className="text-sm text-muted-foreground">{booking.workspace.type}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(booking.bookingDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">Date</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {booking.startTime} - {booking.endTime}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.duration} {booking.duration === 1 ? 'hour' : 'hours'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {booking.attendees} {booking.attendees === 1 ? 'person' : 'people'}
                    </p>
                    <p className="text-sm text-muted-foreground">Attendees</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="font-medium">Total Paid:</span>
                <span className="text-xl font-bold text-cs-blue">
                  ${booking.totalPrice.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2">
                <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                  {booking.status}
                </Badge>
                <Badge
                  variant={booking.paymentStatus === 'paid' ? 'default' : 'secondary'}
                >
                  {booking.paymentStatus}
                </Badge>
              </div>

              {booking.specialRequests && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium mb-1">Special Requests:</p>
                    <p className="text-sm text-muted-foreground">{booking.specialRequests}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cs-blue text-white text-xs font-bold">
                    1
                  </span>
                  <span>Save your QR code or write down your confirmation code</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cs-blue text-white text-xs font-bold">
                    2
                  </span>
                  <span>Add the booking to your calendar</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cs-blue text-white text-xs font-bold">
                    3
                  </span>
                  <span>Arrive at CitizenSpace and check in with staff</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cs-blue text-white text-xs font-bold">
                    4
                  </span>
                  <span>Show your QR code or provide confirmation code</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* QR Code */}
        <div className="space-y-6">
          <BookingQRCode
            confirmationCode={booking.confirmationCode}
            bookingId={booking.id}
          />

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddToGoogleCalendar}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Add to Google Calendar
              </Button>

              <Button variant="outline" className="w-full" onClick={handleDownloadICS}>
                <Download className="mr-2 h-4 w-4" />
                Download iCal
              </Button>

              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Booking
              </Button>

              <Button variant="outline" className="w-full" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
            </CardContent>
          </Card>

          {/* Email Confirmation */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Confirmation Email Sent</p>
                  <p className="text-muted-foreground">
                    We've sent a confirmation email with all the details and your QR code to
                    your registered email address.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}