/**
 * StripePaymentForm Component
 * Integrates Stripe Elements for payment processing
 */

'use client'

import { useState, useEffect } from 'react'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
)

interface PaymentFormProps {
  bookingId: string
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onError?: (error: string) => void
}

function CheckoutForm({ bookingId, amount, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Confirm the payment
      const { error: submitError } = await elements.submit()
      if (submitError) {
        throw new Error(submitError.message)
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/confirmation/${bookingId}`,
        },
        redirect: 'if_required',
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        setSuccess(true)
        onSuccess(paymentIntent.id)

        // Redirect to confirmation page
        setTimeout(() => {
          router.push(`/booking/confirmation/${bookingId}`)
        }, 1500)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setProcessing(false)
    }
  }

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">Payment Successful!</h3>
            <p className="text-sm text-green-700">
              Redirecting to confirmation page...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </CardTitle>
          <CardDescription>
            Enter your payment information to complete your booking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaymentElement />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full btn-primary"
              disabled={!stripe || processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay ${amount.toFixed(2)}
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment processed by Stripe. Your payment information is encrypted and
            secure.
          </p>
        </CardContent>
      </Card>
    </form>
  )
}

interface StripePaymentFormProps {
  bookingId: string
  clientSecret: string
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onError?: (error: string) => void
}

export function StripePaymentForm({
  bookingId,
  clientSecret,
  amount,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const [options, setOptions] = useState<StripeElementsOptions | null>(null)

  useEffect(() => {
    if (clientSecret) {
      setOptions({
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0066cc',
            colorBackground: '#ffffff',
            colorText: '#1a1a1a',
            colorDanger: '#df1b41',
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
        },
      })
    }
  }, [clientSecret])

  if (!options) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading payment form...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        bookingId={bookingId}
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  )
}

/**
 * FreeBookingConfirmation Component
 * Shows confirmation for bookings that don't require payment
 */
export function FreeBookingConfirmation({ bookingId }: { bookingId: string }) {
  const router = useRouter()

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
          <div>
            <h3 className="text-xl font-bold text-green-900 mb-2">
              Booking Confirmed!
            </h3>
            <p className="text-sm text-green-700 mb-4">
              Your booking is fully covered by credits. No payment required.
            </p>
          </div>
          <Button
            onClick={() => router.push(`/booking/confirmation/${bookingId}`)}
            className="btn-primary"
          >
            View Confirmation
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}