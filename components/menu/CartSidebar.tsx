'use client'

import { X, ShoppingCart, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { CartItem } from './CartItem'

interface CartSidebarProps {
  nftHolder?: boolean
}

export function CartSidebar({ nftHolder = false }: CartSidebarProps) {
  const router = useRouter()
  const { items, isOpen, closeCart, getSubtotal, getDiscount, getTotal, getItemCount } =
    useCartStore()

  const subtotal = getSubtotal()
  const discount = getDiscount()
  const total = getTotal(nftHolder)
  const itemCount = getItemCount()

  const handleCheckout = () => {
    closeCart()
    router.push('/cafe/cart')
  }

  return (
    <Sheet open={isOpen} onOpenChange={closeCart}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart
              {itemCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Badge>
              )}
            </span>
            <Button variant="ghost" size="icon" onClick={closeCart}>
              <X className="h-5 w-5" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <p className="text-lg font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">
              Add items from the menu to get started
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    nftHolder={nftHolder}
                  />
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-4 border-t pt-4">
              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {nftHolder && discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>NFT Holder Discount (10%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-cs-blue">${total.toFixed(2)}</span>
                </div>

                {nftHolder && discount > 0 && (
                  <p className="text-center text-xs text-green-600">
                    You're saving ${discount.toFixed(2)} with your NFT!
                  </p>
                )}
              </div>

              {/* Checkout Button */}
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}