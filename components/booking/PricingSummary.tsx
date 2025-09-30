/**
 * PricingSummary Component
 * Displays booking cost breakdown with dynamic calculations
 */

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useBookingStore } from '@/lib/stores/bookingStore'
import { Calculator, Sparkles } from 'lucide-react'

interface PricingBreakdown {
  subtotal: number
  nftDiscount: number
  creditsUsed: number
  creditsValue: number
  overageHours: number
  overageCharge: number
  processingFee: number
  total: number
}

export function PricingSummary() {
  const {
    selectedWorkspace,
    duration,
    isNftHolder,
    isMember,
    creditBalance,
    setPricing,
  } = useBookingStore()

  const [pricing, setPricingState] = useState<PricingBreakdown>({
    subtotal: 0,
    nftDiscount: 0,
    creditsUsed: 0,
    creditsValue: 0,
    overageHours: 0,
    overageCharge: 0,
    processingFee: 0,
    total: 0,
  })

  const [calculating, setCalculating] = useState(false)

  useEffect(() => {
    const calculatePricing = () => {
      if (!selectedWorkspace || duration <= 0) {
        setPricingState({
          subtotal: 0,
          nftDiscount: 0,
          creditsUsed: 0,
          creditsValue: 0,
          overageHours: 0,
          overageCharge: 0,
          processingFee: 0,
          total: 0,
        })
        return
      }

      setCalculating(true)

      try {
        const hourlyRate = selectedWorkspace.base_price_hourly
        let subtotal = hourlyRate * duration
        let creditsUsed = 0
        let creditsValue = 0
        let overageHours = 0
        let overageCharge = 0
        let nftDiscount = 0

        // For meeting rooms, apply credits first (members only)
        if (selectedWorkspace.resource_category === 'meeting-room' && isMember) {
          if (creditBalance > 0) {
            if (duration <= creditBalance) {
              // All hours covered by credits
              creditsUsed = duration
              creditsValue = hourlyRate * duration
              subtotal = 0
            } else {
              // Partial coverage
              creditsUsed = creditBalance
              creditsValue = hourlyRate * creditBalance
              overageHours = duration - creditBalance
              overageCharge = hourlyRate * overageHours
              subtotal = overageCharge
            }
          } else {
            // No credits available
            overageHours = duration
            overageCharge = subtotal
          }
        }

        // Apply NFT discount to remaining charges (after credits)
        if (isNftHolder && subtotal > 0) {
          nftDiscount = subtotal * 0.5 // 50% discount
          subtotal = subtotal - nftDiscount
        }

        // Calculate processing fee (2.9% + $0.30)
        const processingFee = subtotal > 0 ? subtotal * 0.029 + 0.3 : 0

        // Calculate total
        const total = subtotal + processingFee

        const breakdown: PricingBreakdown = {
          subtotal,
          nftDiscount,
          creditsUsed,
          creditsValue,
          overageHours,
          overageCharge,
          processingFee,
          total,
        }

        setPricingState(breakdown)

        // Update store with pricing info
        setPricing({
          subtotal,
          discountAmount: nftDiscount,
          nftDiscountApplied: isNftHolder && nftDiscount > 0,
          processingFee,
          totalPrice: total,
          creditsUsed,
          overageHours,
        })
      } finally {
        setCalculating(false)
      }
    }

    calculatePricing()
  }, [
    selectedWorkspace,
    duration,
    isNftHolder,
    isMember,
    creditBalance,
    setPricing,
  ])

  if (!selectedWorkspace) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Pricing Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a workspace and date to see pricing
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Pricing Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {calculating ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <>
            {/* Base Pricing */}
            <div>
              <h4 className="font-semibold mb-2">Workspace</h4>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">{selectedWorkspace.name}</p>
                <p className="text-muted-foreground">
                  ${selectedWorkspace.base_price_hourly.toFixed(2)}/hour × {duration}{' '}
                  {duration === 1 ? 'hour' : 'hours'}
                </p>
              </div>
            </div>

            <Separator />

            {/* Line Items */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Base Price:</span>
                <span>
                  ${(selectedWorkspace.base_price_hourly * duration).toFixed(2)}
                </span>
              </div>

              {/* Credits Applied */}
              {pricing.creditsUsed > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>
                    Credits Applied ({pricing.creditsUsed}{' '}
                    {pricing.creditsUsed === 1 ? 'hour' : 'hours'}):
                  </span>
                  <span>-${pricing.creditsValue.toFixed(2)}</span>
                </div>
              )}

              {/* Overage Charge */}
              {pricing.overageHours > 0 && (
                <div className="flex justify-between text-sm">
                  <span>
                    Overage ({pricing.overageHours}{' '}
                    {pricing.overageHours === 1 ? 'hour' : 'hours'}):
                  </span>
                  <span>${pricing.overageCharge.toFixed(2)}</span>
                </div>
              )}

              {/* NFT Discount */}
              {pricing.nftDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>NFT Holder Discount (50%):</span>
                  </div>
                  <span>-${pricing.nftDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Subtotal */}
              <div className="flex justify-between text-sm font-medium">
                <span>Subtotal:</span>
                <span>${pricing.subtotal.toFixed(2)}</span>
              </div>

              {/* Processing Fee */}
              {pricing.processingFee > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Processing Fee:</span>
                  <span>${pricing.processingFee.toFixed(2)}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-cs-blue">${pricing.total.toFixed(2)}</span>
            </div>

            {/* Free Booking Badge */}
            {pricing.total === 0 && pricing.creditsUsed > 0 && (
              <Badge className="w-full justify-center bg-green-600">
                Fully Covered by Credits
              </Badge>
            )}

            {/* NFT Savings Badge */}
            {isNftHolder && pricing.nftDiscount > 0 && (
              <div className="p-3 rounded-lg bg-gradient-to-r from-cs-blue/10 to-cs-sun/10 border border-cs-blue/20">
                <p className="text-sm font-medium text-center">
                  You're saving ${pricing.nftDiscount.toFixed(2)} with your NFT!
                </p>
              </div>
            )}

            {/* Credit Reminder */}
            {!isMember && selectedWorkspace.resource_category === 'meeting-room' && (
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p className="font-medium mb-1">Members Save More</p>
                <p className="text-muted-foreground">
                  Get free meeting room hours with a membership
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}