/**
 * AdminNav Component
 * Navigation menu for admin dashboard with role-based visibility
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  ShoppingCart,
  Users,
  Briefcase,
  Coffee,
  BarChart3,
} from 'lucide-react'
import { useAdminAccess } from './AdminRoute'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiredRole?: 'admin' | 'staff'
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Bookings',
    href: '/admin/bookings',
    icon: Calendar,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    requiredRole: 'admin',
  },
  {
    title: 'Workspaces',
    href: '/admin/workspaces',
    icon: Briefcase,
    requiredRole: 'admin',
  },
  {
    title: 'Menu',
    href: '/admin/menu',
    icon: Coffee,
    requiredRole: 'admin',
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    requiredRole: 'admin',
  },
]

export function AdminNav() {
  const pathname = usePathname()
  const { isAdmin } = useAdminAccess()

  const filteredNavItems = navItems.filter(
    (item) => !item.requiredRole || (item.requiredRole === 'admin' && isAdmin)
  )

  return (
    <nav className="space-y-1">
      {filteredNavItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}