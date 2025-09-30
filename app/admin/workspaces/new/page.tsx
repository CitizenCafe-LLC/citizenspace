/**
 * Admin New Workspace Page
 * Create new workspace
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

export default function AdminNewWorkspacePage() {
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      // TODO: Call API to create workspace
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Workspace created successfully')
      router.push('/admin/workspaces')
    } catch (error) {
      toast.error('Failed to create workspace')
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
              <h1 className="text-3xl font-bold">Create New Workspace</h1>
              <p className="text-muted-foreground">Add a new workspace to the platform</p>
            </div>
          </div>

          {/* Form */}
          <WorkspaceForm onSubmit={handleSubmit} />
        </div>
      </AdminLayout>
    </AdminRoute>
  )
}