/**
 * Admin Edit Workspace Page
 * Edit existing workspace
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { AdminRoute } from '@/components/admin/AdminRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { WorkspaceForm } from '@/components/admin/WorkspaceForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

// Mock data
const mockWorkspace = {
  name: 'Hot Desk #1',
  type: 'hot-desk' as const,
  description: 'Comfortable desk near the window with natural light',
  capacity: 1,
  hourlyRate: 10,
  dayRate: 40,
  amenities: ['WiFi', 'Monitor', 'Coffee'],
  available: true,
}

export default function AdminEditWorkspacePage({ params }: { params: { id: string } }) {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      // TODO: Call API to update workspace
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Workspace updated successfully')
      router.push('/admin/workspaces')
    } catch (error) {
      toast.error('Failed to update workspace')
      throw error
    }
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
            <div>
              <h1 className="text-3xl font-bold">Edit Workspace</h1>
              <p className="text-muted-foreground">Update workspace information</p>
            </div>
          </div>

          {/* Form */}
          <WorkspaceForm defaultValues={mockWorkspace} onSubmit={handleSubmit} />
        </div>
      </AdminLayout>
    </AdminRoute>
  )
}