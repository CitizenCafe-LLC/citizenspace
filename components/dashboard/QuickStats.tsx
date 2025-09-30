'use client'

import { Calendar, CreditCard, DollarSign, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QuickStatsProps {
  stats: {
    totalBookingsThisMonth: number
    creditsUsed: number
    moneySaved: number
    totalSpent: number
  }
}

export function QuickStats({ stats }: QuickStatsProps) {
  const statCards = [
    {
      title: 'Bookings This Month',
      value: stats.totalBookingsThisMonth,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Credits Used',
      value: stats.creditsUsed,
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: 'Total Spent',
      value: `$${stats.totalSpent.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
    {
      title: 'Money Saved',
      value: `$${stats.moneySaved.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      subtitle: 'with NFT discount',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`rounded-full p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.subtitle && (
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}