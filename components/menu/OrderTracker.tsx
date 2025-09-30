'use client'

import { CheckCircle2, Clock, Package, ChefHat } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'

interface OrderTrackerProps {
  status: OrderStatus
  estimatedTime?: number
}

const statusSteps = [
  {
    key: 'pending',
    label: 'Order Placed',
    icon: Clock,
    description: 'Your order has been received',
  },
  {
    key: 'preparing',
    label: 'Preparing',
    icon: ChefHat,
    description: 'Your order is being prepared',
  },
  {
    key: 'ready',
    label: 'Ready',
    icon: Package,
    description: 'Your order is ready for pickup',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    description: 'Order completed',
  },
]

const statusIndex: Record<OrderStatus, number> = {
  pending: 0,
  preparing: 1,
  ready: 2,
  completed: 3,
  cancelled: -1,
}

export function OrderTracker({ status, estimatedTime }: OrderTrackerProps) {
  const currentIndex = statusIndex[status]

  if (status === 'cancelled') {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
        <Badge variant="destructive" className="mb-2">
          Cancelled
        </Badge>
        <p className="text-sm text-muted-foreground">This order has been cancelled</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estimated Time */}
      {estimatedTime && currentIndex < 3 && (
        <div className="rounded-lg border bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">Estimated ready time</p>
          <p className="text-2xl font-bold">{estimatedTime} minutes</p>
        </div>
      )}

      {/* Progress Steps */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute left-8 top-8 h-[calc(100%-4rem)] w-0.5 bg-border">
          <div
            className="bg-primary transition-all duration-500"
            style={{
              height: `${(currentIndex / (statusSteps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {statusSteps.map((step, index) => {
            const isActive = index === currentIndex
            const isCompleted = index < currentIndex
            const Icon = step.icon

            return (
              <div key={step.key} className="relative flex items-start gap-4">
                {/* Icon Circle */}
                <div
                  className={cn(
                    'relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-background',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isActive && 'animate-pulse bg-primary text-primary-foreground',
                    !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <div className="flex-1 pt-3">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        'font-semibold',
                        (isActive || isCompleted) && 'text-foreground',
                        !isActive && !isCompleted && 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </h3>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                    {isCompleted && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-sm',
                      (isActive || isCompleted) && 'text-muted-foreground',
                      !isActive && !isCompleted && 'text-muted-foreground/60'
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}