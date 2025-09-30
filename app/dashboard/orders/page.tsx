'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ShoppingBag, Eye, RotateCcw } from 'lucide-react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/lib/store/cart-store'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  menu_item_id: string
  menu_item_name: string
  quantity: number
  price_per_item: number
}

interface Order {
  id: string
  order_number: string
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  total_price: number
  created_at: string
  items: OrderItem[]
}

const statusConfig = {
  pending: { label: 'Pending', variant: 'secondary' as const },
  preparing: { label: 'Preparing', variant: 'default' as const },
  ready: { label: 'Ready', variant: 'default' as const },
  completed: { label: 'Completed', variant: 'secondary' as const },
  cancelled: { label: 'Cancelled', variant: 'destructive' as const },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { addItem } = useCartStore()

  useEffect(() => {
    loadUserData()
    loadOrders()
  }, [])

  const loadUserData = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Failed to load user:', error)
    }
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/orders')
      if (!res.ok) {
        throw new Error('Failed to fetch orders')
      }

      const data = await res.json()
      setOrders(data.data || [])
    } catch (error) {
      console.error('Orders error:', error)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleReorder = async (order: Order) => {
    try {
      // Add all items from the order to cart
      order.items.forEach((item) => {
        addItem(
          {
            id: item.menu_item_id,
            name: item.menu_item_name,
            price: item.price_per_item,
            description: '',
            category: '',
            available: true,
          },
          item.quantity
        )
      })

      toast.success('Items added to cart')
    } catch (error) {
      toast.error('Failed to reorder')
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="mb-2 h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">View your order history and track current orders</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="flex h-96 flex-col items-center justify-center rounded-lg border-2 border-dashed">
            <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">No orders yet</h3>
            <p className="mb-6 text-sm text-muted-foreground">
              Order something delicious from our cafe menu
            </p>
            <Button asChild>
              <Link href="/cafe/menu">Browse Menu</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status]
              const isActive =
                order.status === 'pending' ||
                order.status === 'preparing' ||
                order.status === 'ready'

              return (
                <Card key={order.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.order_number}
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {format(new Date(order.created_at), 'MMMM d, yyyy · h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {isActive && (
                          <Badge variant="outline" className="animate-pulse">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.menu_item_name}
                          </span>
                          <span className="font-medium">
                            ${(item.price_per_item * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-muted-foreground">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>

                    <Separator />

                    {/* Total and Actions */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-lg font-bold text-cs-blue">
                          ${order.total_price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/cafe/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </Button>
                        {order.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReorder(order)}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reorder
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}