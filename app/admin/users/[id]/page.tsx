/**
 * Admin User Details Page
 * View and edit individual user
 */

'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AdminRoute } from '@/components/admin/AdminRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { ArrowLeft, Mail, Phone, Calendar, Wallet, Save, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data - replace with API call
const mockUser = {
  id: '1',
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '+1 (555) 123-4567',
  walletAddress: '0x1234...5678',
  role: 'user' as const,
  nftHolder: true,
  avatarUrl: undefined,
  createdAt: new Date('2025-01-15'),
  bookings: [
    {
      id: 'b1',
      workspace: 'Hot Desk #1',
      date: new Date('2025-09-30'),
      status: 'upcoming',
      total: 45.0,
    },
    {
      id: 'b2',
      workspace: 'Meeting Room A',
      date: new Date('2025-09-28'),
      status: 'completed',
      total: 80.0,
    },
  ],
  orders: [
    {
      id: 'o1',
      items: 'Cappuccino, Croissant',
      date: new Date('2025-09-29'),
      status: 'completed',
      total: 12.5,
    },
  ],
  notes: 'VIP customer, prefers window seats.',
}

export default function AdminUserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'

  const [user, setUser] = useState(mockUser)
  const [isEditing, setIsEditing] = useState(isEditMode)
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    nftHolder: user.nftHolder,
    notes: user.notes,
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500 hover:bg-purple-600'
      case 'staff':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'user':
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'completed':
        return 'bg-gray-500 hover:bg-gray-600'
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600'
      default:
        return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const handleSave = async () => {
    try {
      // TODO: Call API to update user
      setUser({ ...user, ...formData })
      setIsEditing(false)
      toast.success('User updated successfully')
    } catch (error) {
      toast.error('Failed to update user')
    }
  }

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      nftHolder: user.nftHolder,
      notes: user.notes,
    })
    setIsEditing(false)
  }

  return (
    <AdminRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">User Details</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>Edit User</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* User Info */}
              <Card>
                <CardHeader>
                  <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isEditing ? (
                    <>
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                          <AvatarFallback>
                            {user.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-semibold">{user.fullName}</h3>
                          <Badge className={cn('mt-1', getRoleBadgeColor(user.role))}>
                            {user.role}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Phone</p>
                            <p className="text-sm text-muted-foreground">{user.phone || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Wallet className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Wallet</p>
                            <p className="text-sm text-muted-foreground">
                              {user.walletAddress || '—'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Joined</p>
                            <p className="text-sm text-muted-foreground">
                              {format(user.createdAt, 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) =>
                            setFormData({ ...formData, role: value as any })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="nftHolder">NFT Holder</Label>
                        <Switch
                          id="nftHolder"
                          checked={formData.nftHolder}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, nftHolder: checked })
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activity Tabs */}
              <Card>
                <Tabs defaultValue="bookings">
                  <CardHeader>
                    <TabsList className="w-full">
                      <TabsTrigger value="bookings" className="flex-1">
                        Bookings
                      </TabsTrigger>
                      <TabsTrigger value="orders" className="flex-1">
                        Orders
                      </TabsTrigger>
                      <TabsTrigger value="notes" className="flex-1">
                        Notes
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <CardContent>
                    <TabsContent value="bookings" className="space-y-4">
                      {user.bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div>
                            <p className="font-medium">{booking.workspace}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(booking.date, 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                            <span className="font-semibold">${booking.total.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="orders" className="space-y-4">
                      {user.orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between rounded-lg border p-4"
                        >
                          <div>
                            <p className="font-medium">{order.items}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(order.date, 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                            <span className="font-semibold">${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="notes">
                      {!isEditing ? (
                        <p className="text-sm text-muted-foreground">{user.notes || 'No notes'}</p>
                      ) : (
                        <Textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          rows={6}
                          placeholder="Add admin notes..."
                        />
                      )}
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold">{user.bookings.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-bold">{user.orders.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lifetime Value</p>
                    <p className="text-2xl font-bold">
                      $
                      {(
                        user.bookings.reduce((sum, b) => sum + b.total, 0) +
                        user.orders.reduce((sum, o) => sum + o.total, 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* NFT Status */}
              <Card>
                <CardHeader>
                  <CardTitle>NFT Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {user.nftHolder ? (
                    <div className="text-center">
                      <Badge className="bg-green-500 hover:bg-green-600 text-lg">
                        NFT Holder
                      </Badge>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Eligible for 50% booking discounts and 10% cafe discounts
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Badge variant="outline" className="text-lg">
                        Not a Holder
                      </Badge>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Standard pricing applies
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  )
}