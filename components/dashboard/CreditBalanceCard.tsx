'use client'

import { format } from 'date-fns'
import { AlertCircle, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CreditBalance {
  type: 'meeting_room_hours' | 'printing_credits' | 'guest_passes'
  total: number
  used: number
  remaining: number
  last_allocated: string | null
  expires_at: string | null
}

interface CreditBalanceCardProps {
  credit: CreditBalance
}

const creditConfig = {
  meeting_room_hours: {
    title: 'Meeting Room Hours',
    unit: 'hours',
    color: 'bg-blue-500',
    icon: '🏢',
  },
  printing_credits: {
    title: 'Printing Credits',
    unit: 'pages',
    color: 'bg-purple-500',
    icon: '🖨️',
  },
  guest_passes: {
    title: 'Guest Passes',
    unit: 'passes',
    color: 'bg-green-500',
    icon: '👥',
  },
}

export function CreditBalanceCard({ credit }: CreditBalanceCardProps) {
  const config = creditConfig[credit.type]
  const percentageUsed = credit.total > 0 ? (credit.used / credit.total) * 100 : 0
  const percentageRemaining = 100 - percentageUsed

  const isLowBalance = percentageRemaining < 25 && percentageRemaining > 0
  const isExpiringSoon = credit.expires_at
    ? new Date(credit.expires_at).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
    : false

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <CardTitle className="text-lg">{config.title}</CardTitle>
          </div>
          {isLowBalance && (
            <Badge variant="destructive" className="text-xs">
              Low Balance
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Usage</span>
            <span className="font-medium">
              {credit.remaining} / {credit.total} {config.unit} remaining
            </span>
          </div>
          <Progress
            value={percentageRemaining}
            className="h-2"
            indicatorClassName={config.color}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 border-t pt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-cs-blue">{credit.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">{credit.used}</p>
            <p className="text-xs text-muted-foreground">Used</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{credit.remaining}</p>
            <p className="text-xs text-muted-foreground">Left</p>
          </div>
        </div>

        {/* Allocation Info */}
        {credit.last_allocated && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Last allocated:{' '}
              <span className="font-medium text-foreground">
                {format(new Date(credit.last_allocated), 'MMM d, yyyy')}
              </span>
            </span>
          </div>
        )}

        {/* Expiration Warning */}
        {isExpiringSoon && credit.expires_at && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Credits expire on {format(new Date(credit.expires_at), 'MMMM d, yyyy')}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}