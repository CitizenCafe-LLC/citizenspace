'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface CheckoutFormProps {
  clientSecret: string
  onSuccess: () => void
}

function CheckoutForm({ clientSecret, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || 'An error occurred')
        setProcessing(false)
        return
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/cafe/orders/confirmation`,
        },
      })

      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
        setProcessing(false)
      } else {
        onSuccess()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || processing}
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </Button>
    </form>
  )
}

export interface StripeCheckoutFormProps {
  amount: number
  orderId?: string
  onSuccess: () => void
}

export function StripeCheckoutForm({ amount, orderId, onSuccess }: StripeCheckoutFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    createPaymentIntent()
  }, [amount])

  const createPaymentIntent = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          order_id: orderId,
          payment_type: 'order',
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to create payment intent')
      }

      const data = await res.json()
      setClientSecret(data.client_secret)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !clientSecret) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || 'Failed to initialize payment. Please try again.'}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#3B82F6',
          },
        },
      }}
    >
      <CheckoutForm clientSecret={clientSecret} onSuccess={onSuccess} />
    </Elements>
  )
}