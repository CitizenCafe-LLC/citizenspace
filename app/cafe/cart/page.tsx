'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingCart, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useCartStore } from '@/lib/store/cart-store'
import { CartItem } from '@/components/menu/CartItem'
import { StripeCheckoutForm } from '@/components/menu/StripeCheckoutForm'
import { toast } from 'sonner'

export default function CartPage() {
  const router = useRouter()
  const { items, getSubtotal, getDiscount, getTotal, clearCart } = useCartStore()
  const [nftHolder, setNftHolder] = useState(false)
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setNftHolder(data.user?.nft_holder || false)
      }
    } catch (error) {
      // User not logged in
    }
  }

  const handleProceedToPayment = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    setCreatingOrder(true)
    try {
      // Create order first
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            special_instructions: item.specialInstructions,
          })),
          special_instructions: specialInstructions,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to create order')
      }

      const data = await res.json()
      setOrderId(data.data.id)
      setCheckingOut(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create order')
    } finally {
      setCreatingOrder(false)
    }
  }

  const handlePaymentSuccess = () => {
    clearCart()
    toast.success('Payment successful! Your order has been placed.')

    if (orderId) {
      router.push(`/cafe/orders/${orderId}`)
    } else {
      router.push('/dashboard/orders')
    }
  }

  const subtotal = getSubtotal()
  const discount = getDiscount()
  const total = getTotal(nftHolder)

  if (items.length === 0 && !checkingOut) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="flex h-96 flex-col items-center justify-center rounded-lg border-2 border-dashed">
          <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold">Your cart is empty</h2>
          <p className="mb-6 text-muted-foreground">
            Add some delicious items from our menu
          </p>
          <Button asChild>
            <Link href="/cafe/menu">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Menu
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-12">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/cafe/menu">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Your Cart</h1>
        <p className="text-muted-foreground">Review your order and proceed to checkout</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({items.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <CartItem key={item.id} item={item} nftHolder={nftHolder} />
              ))}

              <Separator className="my-4" />

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any dietary restrictions or special requests..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                  disabled={checkingOut}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary & Payment */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {nftHolder && discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>NFT Holder Discount (10%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-cs-blue">${total.toFixed(2)}</span>
                </div>

                {nftHolder && discount > 0 && (
                  <p className="text-center text-xs text-green-600">
                    You're saving ${discount.toFixed(2)} with your NFT!
                  </p>
                )}
              </div>

              {!checkingOut ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleProceedToPayment}
                  disabled={creatingOrder || items.length === 0}
                >
                  {creatingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <Separator />
                  <div>
                    <h3 className="mb-4 font-semibold">Payment Details</h3>
                    <StripeCheckoutForm
                      amount={total}
                      orderId={orderId || undefined}
                      onSuccess={handlePaymentSuccess}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}