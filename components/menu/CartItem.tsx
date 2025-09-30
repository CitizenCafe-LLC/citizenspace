'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore, type CartItem as CartItemType } from '@/lib/store/cart-store'

interface CartItemProps {
  item: CartItemType
  nftHolder?: boolean
}

export function CartItem({ item, nftHolder = false }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  const regularPrice = item.price
  const nftPrice = item.price * 0.9
  const displayPrice = nftHolder ? nftPrice : regularPrice
  const lineTotal = displayPrice * item.quantity

  return (
    <div className="flex gap-3">
      {/* Image */}
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            🍽️
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div className="flex-1">
            <h4 className="font-medium leading-tight">{item.name}</h4>
            <p className="text-sm text-muted-foreground">
              ${displayPrice.toFixed(2)} each
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Line Total */}
          <span className="font-semibold text-cs-blue">${lineTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}