'use client'

import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Wallet } from 'lucide-react'

interface OrderSummaryProps {
  subtotal: number
  discount?: number
  total: number
  nftHolder?: boolean
  showSavings?: boolean
}

export function OrderSummary({
  subtotal,
  discount = 0,
  total,
  nftHolder = false,
  showSavings = true,
}: OrderSummaryProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      {nftHolder && discount > 0 && (
        <>
          <div className="flex justify-between text-sm text-green-600">
            <span className="flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              NFT Holder Discount (10%)
            </span>
            <span>-${discount.toFixed(2)}</span>
          </div>
          {showSavings && (
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950/20">
              <p className="text-center text-sm font-medium text-green-700 dark:text-green-400">
                You're saving ${discount.toFixed(2)} with your NFT!
              </p>
            </div>
          )}
        </>
      )}

      <Separator />

      <div className="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span className="text-cs-blue">${total.toFixed(2)}</span>
      </div>
    </div>
  )
}