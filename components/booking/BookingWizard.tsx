/**
 * BookingWizard Component
 * Multi-step booking wizard with progress tracking
 */

'use client'

import { useState, useEffect } from 'react'
import { useBookingStore, Workspace } from '@/lib/stores/bookingStore'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { WorkspaceSelector } from './WorkspaceSelector'
import { DateTimePicker } from './DateTimePicker'
import { WorkspaceCard } from './WorkspaceCard'
import { PricingSummary } from './PricingSummary'
import { CreditBalanceCard } from './CreditBalanceCard'
import { StripePaymentForm, FreeBookingConfirmation } from './StripePaymentForm'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

const STEPS = [
  { number: 1, title: 'Workspace Type', description: 'Choose your workspace' },
  { number: 2, title: 'Date & Time', description: 'Select when to book' },
  { number: 3, title: 'Select Space', description: 'Pick your workspace' },
  { number: 4, title: 'Review & Pay', description: 'Complete booking' },
]

export function BookingWizard() {
  const {
    currentStep,
    setCurrentStep,
    nextStep,
    previousStep,
    canProceedToNextStep,
    selectedWorkspaceType,
    selectedWorkspace,
    bookingDate,
    startTime,
    endTime,
    duration,
    attendees,
    specialRequests,
    totalPrice,
    resetBooking,
  } = useBookingStore()

  const [availableWorkspaces, setAvailableWorkspaces] = useState<Workspace[]>([])
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch available workspaces when reaching step 3
  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (currentStep !== 3 || !selectedWorkspaceType || !bookingDate || !startTime || !endTime) {
        return
      }

      setLoadingWorkspaces(true)
      setError(null)

      try {
        const dateStr = format(bookingDate, 'yyyy-MM-dd')
        const params = new URLSearchParams({
          date: dateStr,
          start_time: startTime,
          end_time: endTime,
          resource_category: selectedWorkspaceType === 'hot-desk' ? 'desk' : 'meeting-room',
        })

        const response = await fetch(`/api/workspaces/availability?${params}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch workspaces')
        }

        const available = data.data.workspaces
          .filter((w: any) => w.is_available)
          .map((w: any) => w.workspace)

        setAvailableWorkspaces(available)

        // Auto-select if only one workspace available or if hot desk
        if (selectedWorkspaceType === 'hot-desk' && available.length > 0) {
          // For hot desks, auto-select the first one
          // In a real app, might want to show options or just proceed
        }
      } catch (err) {
        console.error('Error fetching workspaces:', err)
        setError(err instanceof Error ? err.message : 'Failed to load workspaces')
      } finally {
        setLoadingWorkspaces(false)
      }
    }

    fetchWorkspaces()
  }, [currentStep, selectedWorkspaceType, bookingDate, startTime, endTime])

  // Create booking when reaching step 4
  const createBooking = async () => {
    if (!selectedWorkspace || !bookingDate || !startTime || !endTime) {
      setError('Missing required booking information')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const bookingEndpoint =
        selectedWorkspaceType === 'hot-desk'
          ? '/api/bookings/hourly-desk'
          : '/api/bookings/meeting-room'

      const bookingData = {
        workspace_id: selectedWorkspace.id,
        booking_date: format(bookingDate, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        attendees: attendees,
        special_requests: specialRequests || undefined,
      }

      const response = await fetch(bookingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking')
      }

      const newBookingId = data.data.booking.id
      setBookingId(newBookingId)

      // If payment is required, create payment intent
      if (data.data.requires_payment && data.data.pricing.total_price > 0) {
        const paymentResponse = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId: newBookingId,
            amount: data.data.pricing.total_price,
          }),
        })

        const paymentData = await paymentResponse.json()

        if (!paymentResponse.ok) {
          throw new Error(paymentData.error || 'Failed to create payment intent')
        }

        setClientSecret(paymentData.data.clientSecret)
      }
    } catch (err) {
      console.error('Error creating booking:', err)
      setError(err instanceof Error ? err.message : 'Failed to create booking')
    } finally {
      setCreating(false)
    }
  }

  // Trigger booking creation when moving to step 4
  useEffect(() => {
    if (currentStep === 4 && !bookingId && !creating) {
      createBooking()
    }
  }, [currentStep, bookingId, creating])

  const handleNext = () => {
    if (canProceedToNextStep()) {
      nextStep()
    }
  }

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment successful:', paymentIntentId)
    // The StripePaymentForm will handle the redirect
  }

  const progressPercentage = (currentStep / STEPS.length) * 100

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="space-y-4">
        <Progress value={progressPercentage} className="h-2" />

        <div className="flex justify-between">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className={`flex items-center gap-2 ${
                step.number === currentStep
                  ? 'text-cs-blue'
                  : step.number < currentStep
                  ? 'text-green-600'
                  : 'text-muted-foreground'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  step.number === currentStep
                    ? 'border-cs-blue bg-cs-blue text-white'
                    : step.number < currentStep
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-muted'
                }`}
              >
                {step.number < currentStep ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Step 1: Workspace Type Selection */}
          {currentStep === 1 && <WorkspaceSelector />}

          {/* Step 2: Date & Time Selection */}
          {currentStep === 2 && <DateTimePicker />}

          {/* Step 3: Workspace Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Choose Your Workspace</h2>
                <p className="text-muted-foreground">
                  Select from available{' '}
                  {selectedWorkspaceType === 'hot-desk' ? 'hot desks' : 'meeting rooms'}
                </p>
              </div>

              {loadingWorkspaces ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading available workspaces...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : availableWorkspaces.length === 0 ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No workspaces available for the selected date and time. Please go back and
                    choose a different time.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {availableWorkspaces.map((workspace) => (
                    <WorkspaceCard key={workspace.id} workspace={workspace} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review & Payment */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Review & Payment</h2>
                <p className="text-muted-foreground">
                  Complete your booking by confirming the details and processing payment
                </p>
              </div>

              {creating ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating your booking...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : bookingId && totalPrice === 0 ? (
                <FreeBookingConfirmation bookingId={bookingId} />
              ) : bookingId && clientSecret ? (
                <StripePaymentForm
                  bookingId={bookingId}
                  clientSecret={clientSecret}
                  amount={totalPrice}
                  onSuccess={handlePaymentSuccess}
                />
              ) : null}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {currentStep >= 2 && <PricingSummary />}
          {currentStep >= 3 && <CreditBalanceCard />}
        </div>
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={previousStep}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceedToNextStep()}
            className="btn-primary"
          >
            {currentStep === STEPS.length ? 'Complete Booking' : 'Next Step'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}