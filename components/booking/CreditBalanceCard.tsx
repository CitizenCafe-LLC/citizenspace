/**
 * CreditBalanceCard Component
 * Displays member credit balance and usage for booking
 */

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useBookingStore } from '@/lib/stores/bookingStore'
import { Clock, AlertCircle, TrendingUp } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CreditData {
  meeting_room_hours: number
  printing_credits: number
  guest_passes: number
  membership_plan: string
  billing_period: string
}

export function CreditBalanceCard() {
  const {
    isMember,
    creditBalance,
    setUserInfo,
    selectedWorkspace,
    duration,
  } = useBookingStore()

  const [credits, setCredits] = useState<CreditData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCredits = async () => {
      if (!isMember) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch('/api/memberships/credits')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch credits')
        }

        const creditData: CreditData = {
          meeting_room_hours: data.data.credits.meeting_room.hours_available || 0,
          printing_credits: data.data.credits.printing.pages_available || 0,
          guest_passes: data.data.credits.guest_passes.passes_available || 0,
          membership_plan: data.data.membership.plan_name || 'Unknown',
          billing_period: data.data.membership.billing_period || 'monthly',
        }

        setCredits(creditData)
        setUserInfo({ creditBalance: creditData.meeting_room_hours })
      } catch (err) {
        console.error('Error fetching credits:', err)
        setError(err instanceof Error ? err.message : 'Failed to load credits')
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()
  }, [isMember, setUserInfo])

  // Don't show card if not a member
  if (!isMember) {
    return null
  }

  // Don't show card if not a meeting room booking
  if (selectedWorkspace?.resource_category !== 'meeting-room') {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Meeting Room Credits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Meeting Room Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!credits) {
    return null
  }

  const creditsToUse = Math.min(duration, credits.meeting_room_hours)
  const remainingCredits = credits.meeting_room_hours - creditsToUse
  const overageHours = Math.max(0, duration - credits.meeting_room_hours)
  const creditsPercentage = (credits.meeting_room_hours / 10) * 100 // Assuming 10 hours max

  return (
    <Card className="border-cs-blue/20 bg-gradient-to-br from-cs-blue/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-cs-blue" />
          Meeting Room Credits
        </CardTitle>
        <CardDescription>
          {credits.membership_plan} • Renews {credits.billing_period}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Available Credits */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Available Hours</span>
            <Badge variant="outline" className="text-cs-blue border-cs-blue">
              {credits.meeting_room_hours} hrs
            </Badge>
          </div>
          <Progress value={creditsPercentage} className="h-2" />
        </div>

        {/* Booking Usage */}
        {duration > 0 && (
          <>
            <div className="space-y-2 pt-2 border-t">
              <h4 className="text-sm font-semibold">This Booking</h4>

              {/* Credits to be used */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Credits Used:</span>
                <span className="font-medium text-green-600">
                  {creditsToUse} {creditsToUse === 1 ? 'hour' : 'hours'}
                </span>
              </div>

              {/* Remaining credits */}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining:</span>
                <span className="font-medium">
                  {remainingCredits} {remainingCredits === 1 ? 'hour' : 'hours'}
                </span>
              </div>

              {/* Overage hours */}
              {overageHours > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overage Hours:</span>
                  <span className="font-medium text-amber-600">
                    {overageHours} {overageHours === 1 ? 'hour' : 'hours'}
                  </span>
                </div>
              )}
            </div>

            {/* Overage Warning */}
            {overageHours > 0 && (
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  You'll be charged for {overageHours} overage{' '}
                  {overageHours === 1 ? 'hour' : 'hours'} at the hourly rate
                  {selectedWorkspace && (
                    <> (${selectedWorkspace.base_price_hourly.toFixed(2)}/hr)</>
                  )}
                  .
                </AlertDescription>
              </Alert>
            )}

            {/* Fully Covered Notice */}
            {overageHours === 0 && creditsToUse > 0 && (
              <Alert>
                <AlertDescription className="text-green-600">
                  This booking is fully covered by your credits!
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Additional Credits Info */}
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Print Credits</p>
              <p className="font-medium">{credits.printing_credits} pages</p>
            </div>
            <div>
              <p className="text-muted-foreground">Guest Passes</p>
              <p className="font-medium">{credits.guest_passes} passes</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}