/**
 * Admin Users Management Page
 * List and manage all users
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminRoute } from '@/components/admin/AdminRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { UserTable } from '@/components/admin/UserTable'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'

// Mock data - replace with API calls
const mockUsers = [
  {
    id: '1',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    role: 'user' as const,
    nftHolder: true,
    avatarUrl: undefined,
    createdAt: new Date('2025-01-15'),
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 (555) 234-5678',
    role: 'staff' as const,
    nftHolder: false,
    avatarUrl: undefined,
    createdAt: new Date('2025-02-20'),
  },
  {
    id: '3',
    fullName: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+1 (555) 345-6789',
    role: 'user' as const,
    nftHolder: false,
    avatarUrl: undefined,
    createdAt: new Date('2025-03-10'),
  },
  {
    id: '4',
    fullName: 'Sarah Brown',
    email: 'sarah@example.com',
    role: 'admin' as const,
    nftHolder: true,
    avatarUrl: undefined,
    createdAt: new Date('2025-01-05'),
  },
]

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState(mockUsers)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const handleView = (id: string) => {
    router.push(`/admin/users/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/admin/users/${id}?edit=true`)
  }

  const handleDelete = (id: string) => {
    setUserToDelete(id)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    try {
      // TODO: Call API to delete user (soft delete)
      setUsers(users.filter((user) => user.id !== userToDelete))
      toast.success('User deleted successfully')
      setUserToDelete(null)
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const handleExport = () => {
    // TODO: Implement CSV export
    toast.success('Exporting users to CSV...')
  }

  return (
    <AdminRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground">
                Manage all platform users and their permissions
              </p>
            </div>
            <Button onClick={() => router.push('/register')}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                View and manage all registered users across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserTable
                users={users}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onExport={handleExport}
              />
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the user account. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive">
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </AdminRoute>
  )
}