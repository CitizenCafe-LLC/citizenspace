/**
 * Admin Orders Management Page
 * Real-time order queue for staff
 */

'use client'

import React, { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/admin/AdminRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { OrderQueue } from '@/components/admin/OrderQueue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { RefreshCw, Bell, BellOff } from 'lucide-react'

// Mock data - replace with API calls
const initialOrders = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
    },
    items: [
      { id: 'i1', name: 'Cappuccino', quantity: 1 },
      { id: 'i2', name: 'Croissant', quantity: 2, notes: 'Warm it up please' },
    ],
    status: 'pending' as const,
    total: 12.5,
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customer: {
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
    items: [
      { id: 'i3', name: 'Latte', quantity: 2 },
      { id: 'i4', name: 'Blueberry Muffin', quantity: 1 },
    ],
    status: 'preparing' as const,
    total: 15.75,
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    customer: {
      name: 'Mike Johnson',
      email: 'mike@example.com',
    },
    items: [
      { id: 'i5', name: 'Espresso', quantity: 1 },
    ],
    status: 'ready' as const,
    total: 3.5,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 1000),
  },
  {
    id: '4',
    orderNumber: 'ORD-004',
    customer: {
      name: 'Sarah Brown',
      email: 'sarah@example.com',
    },
    items: [
      { id: 'i6', name: 'Iced Coffee', quantity: 1 },
      { id: 'i7', name: 'Cookie', quantity: 3 },
    ],
    status: 'completed' as const,
    total: 9.0,
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000),
  },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(initialOrders)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const handleUpdateStatus = async (orderId: string, status: any) => {
    try {
      // TODO: Call API to update order status
      const updatedOrders = orders.map((order) =>
        order.id === orderId ? { ...order, status, updatedAt: new Date() } : order
      )
      setOrders(updatedOrders)
      toast.success(`Order ${status}`)

      // Play sound notification if enabled
      if (soundEnabled) {
        // TODO: Implement sound notification
      }
    } catch (error) {
      toast.error('Failed to update order status')
    }
  }

  const handleRefresh = () => {
    // TODO: Call API to fetch latest orders
    setLastRefresh(new Date())
    toast.success('Orders refreshed')
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
    toast.success(soundEnabled ? 'Sound notifications disabled' : 'Sound notifications enabled')
  }

  return (
    <AdminRoute requiredRole="staff">
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order Queue</h1>
              <p className="text-muted-foreground">
                Manage cafe orders in real-time
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={toggleSound}>
                {soundEnabled ? (
                  <Bell className="h-5 w-5" />
                ) : (
                  <BellOff className="h-5 w-5" />
                )}
              </Button>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {orders.filter((o) => o.status === 'pending').length}
                  </p>
                </div>
                <Badge className="bg-yellow-500 hover:bg-yellow-600">New</Badge>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Preparing</p>
                  <p className="text-2xl font-bold">
                    {orders.filter((o) => o.status === 'preparing').length}
                  </p>
                </div>
                <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ready</p>
                  <p className="text-2xl font-bold">
                    {orders.filter((o) => o.status === 'ready').length}
                  </p>
                </div>
                <Badge className="bg-green-500 hover:bg-green-600">Done</Badge>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">
                    {orders.filter((o) => o.status === 'completed').length}
                  </p>
                </div>
                <Badge variant="outline">Today</Badge>
              </div>
            </Card>
          </div>

          {/* Order Queue */}
          <OrderQueue
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
            autoRefresh={true}
            refreshInterval={30000}
          />

          {/* Last Refresh Info */}
          <p className="text-center text-xs text-muted-foreground">
            Last refreshed: {lastRefresh.toLocaleTimeString()} • Auto-refresh every 30 seconds
          </p>
        </div>
      </AdminLayout>
    </AdminRoute>
  )
}