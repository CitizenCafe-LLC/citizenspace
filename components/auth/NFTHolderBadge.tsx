/**
 * NFTHolderBadge Component
 * Displays a badge for users who hold the CitizenSpace NFT
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NFTHolderBadgeProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outline' | 'secondary'
  showIcon?: boolean
}

export function NFTHolderBadge({
  className,
  size = 'md',
  variant = 'default',
  showIcon = true,
}: NFTHolderBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs py-0.5 px-2',
    md: 'text-sm py-1 px-3',
    lg: 'text-base py-1.5 px-4',
  }

  return (
    <Badge
      variant={variant}
      className={cn(
        'inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold',
        'animate-pulse hover:animate-none transition-all duration-300',
        'shadow-lg hover:shadow-xl',
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Sparkles className="h-3 w-3" />}
      <span>NFT Holder - 50% Off</span>
    </Badge>
  )
}

/**
 * Simple NFT status indicator for profile pages
 */
export function NFTStatusIndicator({ isHolder }: { isHolder: boolean }) {
  if (!isHolder) {
    return (
      <Badge variant="outline" className="text-xs">
        Standard Member
      </Badge>
    )
  }

  return <NFTHolderBadge size="sm" />
}

/**
 * NFT holder banner for prominent display
 */
export function NFTHolderBanner() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-6 dark:border-purple-800 dark:from-purple-950 dark:to-pink-950">
      <div className="relative z-10 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">
            NFT Holder Benefits Active
          </h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">
            You're enjoying 50% off all hourly desk bookings and 10% off cafe orders!
          </p>
        </div>
      </div>
      <div className="absolute right-4 top-4 opacity-10">
        <Sparkles className="h-24 w-24" />
      </div>
    </div>
  )
}