/**
 * Admin Workspaces Management Page
 * List and manage all workspaces
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminRoute } from '@/components/admin/AdminRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Plus, MoreVertical, Edit, Eye, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data
const mockWorkspaces = [
  {
    id: '1',
    name: 'Hot Desk #1',
    type: 'hot-desk',
    capacity: 1,
    hourlyRate: 10,
    dayRate: 40,
    available: true,
    amenities: ['WiFi', 'Monitor', 'Coffee'],
  },
  {
    id: '2',
    name: 'Meeting Room A',
    type: 'meeting-room',
    capacity: 8,
    hourlyRate: 40,
    dayRate: 200,
    available: true,
    amenities: ['WiFi', 'Whiteboard', 'TV', 'Video Conference'],
  },
  {
    id: '3',
    name: 'Private Office #1',
    type: 'private-office',
    capacity: 4,
    hourlyRate: 50,
    dayRate: 250,
    available: false,
    amenities: ['WiFi', 'Monitor', 'Whiteboard', 'Phone'],
  },
]

export default function AdminWorkspacesPage() {
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState(mockWorkspaces)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const filteredWorkspaces = workspaces.filter((ws) => {
    const matchesSearch = ws.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || ws.type === typeFilter
    return matchesSearch && matchesType
  })

  const toggleAvailability = async (id: string) => {
    try {
      const updated = workspaces.map((ws) =>
        ws.id === id ? { ...ws, available: !ws.available } : ws
      )
      setWorkspaces(updated)
      toast.success('Workspace availability updated')
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      'hot-desk': 'bg-blue-500 hover:bg-blue-600',
      'dedicated-desk': 'bg-purple-500 hover:bg-purple-600',
      'private-office': 'bg-green-500 hover:bg-green-600',
      'meeting-room': 'bg-orange-500 hover:bg-orange-600',
    }
    return colors[type] || 'bg-gray-500 hover:bg-gray-600'
  }

  const formatType = (type: string) => {
    return type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <AdminRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Workspace Management</h1>
              <p className="text-muted-foreground">Manage all available workspaces</p>
            </div>
            <Button onClick={() => router.push('/admin/workspaces/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Workspace
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Input
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hot-desk">Hot Desk</SelectItem>
                <SelectItem value="dedicated-desk">Dedicated Desk</SelectItem>
                <SelectItem value="private-office">Private Office</SelectItem>
                <SelectItem value="meeting-room">Meeting Room</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Workspaces Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredWorkspaces.map((workspace) => (
              <Card key={workspace.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{workspace.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Capacity: {workspace.capacity} {workspace.capacity === 1 ? 'person' : 'people'}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/workspaces/${workspace.id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/workspaces/${workspace.id}/edit`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge className={cn(getTypeBadge(workspace.type))}>
                    {formatType(workspace.type)}
                  </Badge>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hourly Rate</span>
                      <span className="font-medium">${workspace.hourlyRate}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Day Rate</span>
                      <span className="font-medium">${workspace.dayRate}/day</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Amenities</p>
                    <div className="flex flex-wrap gap-1">
                      {workspace.amenities.map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">Available</span>
                    <Switch
                      checked={workspace.available}
                      onCheckedChange={() => toggleAvailability(workspace.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredWorkspaces.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No workspaces found</p>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  )
}