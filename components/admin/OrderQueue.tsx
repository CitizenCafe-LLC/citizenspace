/**
 * OrderQueue Component
 * Real-time order queue for staff management
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDistanceToNow } from 'date-fns'
import { Clock, CheckCircle, Package, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderItem {
  id: string
  name: string
  quantity: number
  notes?: string
}

interface Order {
  id: string
  orderNumber: string
  customer: {
    name: string
    email: string
  }
  items: OrderItem[]
  status: 'pending' | 'preparing' | 'ready' | 'completed'
  total: number
  createdAt: Date
  updatedAt: Date
}

interface OrderQueueProps {
  orders: Order[]
  onUpdateStatus: (orderId: string, status: Order['status']) => void
  autoRefresh?: boolean
  refreshInterval?: number
}

export function OrderQueue({
  orders,
  onUpdateStatus,
  autoRefresh = true,
  refreshInterval = 30000,
}: OrderQueueProps) {
  const [activeTab, setActiveTab] = useState<Order['status']>('pending')
  const [notification, setNotification] = useState(false)

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Trigger a refresh (would call API in real implementation)
      setNotification(true)
      setTimeout(() => setNotification(false), 3000)
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const filteredOrders = orders.filter((order) => order.status === activeTab)

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4" />
      case 'preparing':
        return <Package className="h-4 w-4" />
      case 'ready':
        return <CheckCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500 hover:bg-yellow-600'
      case 'preparing':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'ready':
        return 'bg-green-500 hover:bg-green-600'
      case 'completed':
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    switch (currentStatus) {
      case 'pending':
        return 'preparing'
      case 'preparing':
        return 'ready'
      case 'ready':
        return 'completed'
      default:
        return null
    }
  }

  const getStatusCount = (status: Order['status']) => {
    return orders.filter((order) => order.status === status).length
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Order Queue</CardTitle>
          {notification && (
            <Badge variant="outline" className="animate-pulse">
              Auto-refreshed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Order['status'])}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending" className="relative">
              Pending
              {getStatusCount('pending') > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {getStatusCount('pending')}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="preparing" className="relative">
              Preparing
              {getStatusCount('preparing') > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {getStatusCount('preparing')}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ready" className="relative">
              Ready
              {getStatusCount('ready') > 0 && (
                <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {getStatusCount('ready')}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {(['pending', 'preparing', 'ready', 'completed'] as Order['status'][]).map((status) => (
            <TabsContent key={status} value={status} className="space-y-4 pt-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {status} orders
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                          <p className="text-sm text-muted-foreground">{order.customer.name}</p>
                        </div>
                        <Badge className={cn('gap-1', getStatusColor(order.status))}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Order Items */}
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            {item.notes && (
                              <span className="text-muted-foreground italic">{item.notes}</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Time and Total */}
                      <div className="flex items-center justify-between border-t pt-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(order.createdAt, { addSuffix: true })}
                        </div>
                        <span className="font-semibold">${order.total.toFixed(2)}</span>
                      </div>

                      {/* Action Buttons */}
                      {getNextStatus(order.status) && (
                        <Button
                          className="w-full"
                          onClick={() => onUpdateStatus(order.id, getNextStatus(order.status)!)}
                        >
                          Mark as {getNextStatus(order.status)}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}