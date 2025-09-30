'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, MapPin, Clock, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { OrderTracker } from '@/components/menu/OrderTracker'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  menu_item_id: string
  menu_item_name: string
  quantity: number
  price_per_item: number
  special_instructions?: string
}

interface Order {
  id: string
  order_number: string
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  total_price: number
  special_instructions?: string
  created_at: string
  estimated_ready_time?: number
  items: OrderItem[]
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      loadOrder()

      // Poll for order status updates every 30 seconds
      const interval = setInterval(loadOrder, 30000)
      return () => clearInterval(interval)
    }
  }, [orderId])

  const loadOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`)
      if (!res.ok) {
        throw new Error('Failed to fetch order')
      }

      const data = await res.json()
      setOrder(data.data)
    } catch (error) {
      console.error('Order error:', error)
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-12">
        <Skeleton className="mb-8 h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="flex h-96 flex-col items-center justify-center rounded-lg border-2 border-dashed">
          <Receipt className="mb-4 h-16 w-16 text-muted-foreground" />
          <h2 className="mb-2 text-2xl font-bold">Order not found</h2>
          <p className="mb-6 text-muted-foreground">
            The order you're looking for doesn't exist or you don't have access to it
          </p>
          <Button asChild>
            <Link href="/dashboard/orders">View All Orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price_per_item * item.quantity,
    0
  )

  return (
    <div className="container max-w-4xl py-12">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.order_number}</h1>
            <p className="text-muted-foreground">
              Placed on {format(new Date(order.created_at), 'MMMM d, yyyy · h:mm a')}
            </p>
          </div>
          <Badge
            variant={
              order.status === 'completed'
                ? 'default'
                : order.status === 'cancelled'
                  ? 'destructive'
                  : 'secondary'
            }
            className="text-sm"
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Order Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderTracker
              status={order.status}
              estimatedTime={order.estimated_ready_time}
            />

            {order.status === 'ready' && (
              <div className="mt-6 rounded-lg border border-primary bg-primary/10 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold">Pickup Location</h4>
                    <p className="text-sm text-muted-foreground">
                      Pick up your order at the cafe counter
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Items */}
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.quantity}x {item.menu_item_name}
                    </p>
                    {item.special_instructions && (
                      <p className="text-xs text-muted-foreground">
                        Note: {item.special_instructions}
                      </p>
                    )}
                  </div>
                  <span className="font-medium">
                    ${(item.price_per_item * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            {/* Special Instructions */}
            {order.special_instructions && (
              <>
                <div>
                  <p className="mb-1 text-sm font-medium">Special Instructions</p>
                  <p className="text-sm text-muted-foreground">
                    {order.special_instructions}
                  </p>
                </div>
                <Separator />
              </>
            )}

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {order.total_price < subtotal && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${(subtotal - order.total_price).toFixed(2)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-cs-blue">${order.total_price.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}