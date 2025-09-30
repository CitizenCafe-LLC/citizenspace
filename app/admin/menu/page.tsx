/**
 * Admin Menu Management Page
 * List and manage all menu items
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminRoute } from '@/components/admin/AdminRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Plus, MoreVertical, Edit, Trash, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data
const mockMenuItems = [
  {
    id: '1',
    name: 'Cappuccino',
    category: 'coffee',
    price: 4.5,
    orderable: true,
    featured: true,
    dietary: ['vegetarian'],
  },
  {
    id: '2',
    name: 'Croissant',
    category: 'pastries',
    price: 3.5,
    orderable: true,
    featured: false,
    dietary: ['vegetarian'],
  },
  {
    id: '3',
    name: 'Caesar Salad',
    category: 'lunch',
    price: 12.0,
    orderable: false,
    featured: false,
    dietary: [],
  },
]

export default function AdminMenuPage() {
  const router = useRouter()
  const [menuItems, setMenuItems] = useState(mockMenuItems)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const toggleOrderable = async (id: string) => {
    try {
      const updated = menuItems.map((item) =>
        item.id === id ? { ...item, orderable: !item.orderable } : item
      )
      setMenuItems(updated)
      toast.success('Menu item updated')
    } catch (error) {
      toast.error('Failed to update menu item')
    }
  }

  const toggleFeatured = async (id: string) => {
    try {
      const updated = menuItems.map((item) =>
        item.id === id ? { ...item, featured: !item.featured } : item
      )
      setMenuItems(updated)
      toast.success('Featured status updated')
    } catch (error) {
      toast.error('Failed to update featured status')
    }
  }

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      coffee: 'bg-brown-500 hover:bg-brown-600',
      pastries: 'bg-orange-500 hover:bg-orange-600',
      lunch: 'bg-green-500 hover:bg-green-600',
      snacks: 'bg-blue-500 hover:bg-blue-600',
    }
    return colors[category] || 'bg-gray-500 hover:bg-gray-600'
  }

  return (
    <AdminRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Menu Management</h1>
              <p className="text-muted-foreground">Manage cafe menu items</p>
            </div>
            <Button onClick={() => router.push('/admin/menu/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Menu Item
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="coffee">Coffee</SelectItem>
                <SelectItem value="pastries">Pastries</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="snacks">Snacks</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Menu Items Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.featured && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                      </div>
                      <p className="text-lg font-bold text-primary mt-1">${item.price.toFixed(2)}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/admin/menu/${item.id}/edit`)}
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

                  <Badge className={cn('capitalize', getCategoryBadge(item.category))}>
                    {item.category}
                  </Badge>

                  {item.dietary.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.dietary.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Orderable</span>
                      <Switch
                        checked={item.orderable}
                        onCheckedChange={() => toggleOrderable(item.id)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Featured</span>
                      <Switch
                        checked={item.featured}
                        onCheckedChange={() => toggleFeatured(item.id)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No menu items found</p>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  )
}