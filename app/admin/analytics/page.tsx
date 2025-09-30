/**
 * Admin Analytics Page
 * Detailed analytics and reports
 */

'use client'

import React, { useState } from 'react'
import { AdminRoute } from '@/components/admin/AdminRoute'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { BookingsLineChart, RevenueBarChart, WorkspacePieChart } from '@/components/admin/AnalyticsCharts'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { CalendarIcon, Download, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data
const mockBookingsData = [
  { date: 'Mon', bookings: 12 },
  { date: 'Tue', bookings: 19 },
  { date: 'Wed', bookings: 15 },
  { date: 'Thu', bookings: 22 },
  { date: 'Fri', bookings: 28 },
  { date: 'Sat', bookings: 18 },
  { date: 'Sun', bookings: 10 },
]

const mockRevenueData = [
  { category: 'Hot Desks', amount: 850 },
  { category: 'Meeting Rooms', amount: 650 },
  { category: 'Cafe Orders', amount: 550 },
  { category: 'Memberships', amount: 400 },
  { category: 'Private Offices', amount: 1200 },
]

const mockWorkspaceData = [
  { name: 'Hot Desks', value: 35 },
  { name: 'Meeting Rooms', value: 25 },
  { name: 'Private Offices', value: 20 },
  { name: 'Dedicated Desks', value: 20 },
]

const mockUserGrowth = [
  { month: 'Jan', users: 50 },
  { month: 'Feb', users: 75 },
  { month: 'Mar', users: 100 },
  { month: 'Apr', users: 142 },
]

const mockPeakTimes = [
  { hour: '8 AM', bookings: 5 },
  { hour: '9 AM', bookings: 12 },
  { hour: '10 AM', bookings: 18 },
  { hour: '11 AM', bookings: 22 },
  { hour: '12 PM', bookings: 25 },
  { hour: '1 PM', bookings: 20 },
  { hour: '2 PM', bookings: 24 },
  { hour: '3 PM', bookings: 19 },
  { hour: '4 PM', bookings: 15 },
  { hour: '5 PM', bookings: 10 },
]

export default function AdminAnalyticsPage() {
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()

  const handleExport = () => {
    toast.success('Exporting analytics report...')
  }

  return (
    <AdminRoute requiredRole="admin">
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Analytics & Reports</h1>
              <p className="text-muted-foreground">Detailed insights and performance metrics</p>
            </div>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, 'MMM dd') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, 'MMM dd') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} />
                </PopoverContent>
              </Popover>
              <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$3,650</div>
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>12% from last period</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">124</div>
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>8% from last period</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Booking Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$29.44</div>
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <TrendingDown className="h-3 w-3" />
                  <span>3% from last period</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78%</div>
                <div className="flex items-center gap-1 text-xs text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span>5% from last period</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <BookingsLineChart data={mockBookingsData} />
                <Card>
                  <CardHeader>
                    <CardTitle>Peak Booking Times</CardTitle>
                    <CardDescription>Hourly booking distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mockPeakTimes.map((time) => (
                        <div key={time.hour} className="flex items-center gap-3">
                          <span className="w-16 text-sm text-muted-foreground">{time.hour}</span>
                          <div className="flex-1">
                            <div
                              className="h-8 rounded bg-primary transition-all"
                              style={{ width: `${(time.bookings / 25) * 100}%` }}
                            />
                          </div>
                          <span className="w-8 text-sm font-medium">{time.bookings}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="revenue" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <RevenueBarChart data={mockRevenueData} />
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Breakdown</CardTitle>
                    <CardDescription>By category</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockRevenueData.map((item) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.category}</span>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${(item.amount / 1200) * 100}%` }}
                            />
                          </div>
                          <span className="w-20 text-right text-sm font-semibold">
                            ${item.amount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="workspaces" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <WorkspacePieChart data={mockWorkspaceData} />
                <Card>
                  <CardHeader>
                    <CardTitle>Workspace Performance</CardTitle>
                    <CardDescription>Top performing workspaces</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockWorkspaceData
                      .sort((a, b) => b.value - a.value)
                      .map((workspace, index) => (
                        <div key={workspace.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                              {index + 1}
                            </span>
                            <span className="font-medium">{workspace.name}</span>
                          </div>
                          <span className="text-2xl font-bold">{workspace.value}%</span>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>Monthly new user registrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-end justify-around gap-4">
                    {mockUserGrowth.map((data) => (
                      <div key={data.month} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t bg-primary transition-all hover:opacity-80"
                          style={{ height: `${(data.users / 142) * 250}px` }}
                        />
                        <span className="text-sm font-semibold">{data.users}</span>
                        <span className="text-xs text-muted-foreground">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminRoute>
  )
}