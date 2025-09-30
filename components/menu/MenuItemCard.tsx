'use client'

import { useState } from 'react'
import { Plus, Minus, Leaf, Wheat, Milk } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart-store'
import { toast } from 'sonner'

interface MenuItemCardProps {
  item: {
    id: string
    name: string
    description: string
    price: number
    category: string
    image_url?: string
    dietary_tags?: string[]
    available: boolean
  }
  nftHolder?: boolean
}

const getDietaryIcon = (tag: string) => {
  const lowerTag = tag.toLowerCase()
  if (lowerTag.includes('vegetarian') || lowerTag.includes('vegan')) {
    return <Leaf className="h-3 w-3" />
  }
  if (lowerTag.includes('gluten')) {
    return <Wheat className="h-3 w-3" />
  }
  if (lowerTag.includes('dairy')) {
    return <Milk className="h-3 w-3" />
  }
  return null
}

export function MenuItemCard({ item, nftHolder = false }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem, openCart } = useCartStore()

  const regularPrice = item.price
  const nftPrice = item.price * 0.9 // 10% discount
  const displayPrice = nftHolder ? nftPrice : regularPrice
  const savings = nftHolder ? regularPrice - nftPrice : 0

  const handleAddToCart = () => {
    if (!item.available) {
      toast.error('This item is currently unavailable')
      return
    }

    addItem(item, quantity)
    toast.success(`Added ${quantity}x ${item.name} to cart`)
    openCart()
    setQuantity(1)
  }

  const handleQuickAdd = () => {
    if (!item.available) {
      toast.error('This item is currently unavailable')
      return
    }

    addItem(item, 1)
    toast.success(`Added ${item.name} to cart`)
  }

  return (
    <Card className={!item.available ? 'opacity-60' : ''}>
      <CardHeader className="p-0">
        {item.image_url ? (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg bg-muted">
            <img
              src={item.image_url}
              alt={item.name}
              className="h-full w-full object-cover"
            />
            {!item.available && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Badge variant="secondary">Unavailable</Badge>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-t-lg bg-muted">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold">{item.name}</h3>
          {item.dietary_tags && item.dietary_tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {item.dietary_tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {getDietaryIcon(tag)}
                  <span className="ml-1">{tag}</span>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <p className="mb-3 text-sm text-muted-foreground">{item.description}</p>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-cs-blue">
                ${displayPrice.toFixed(2)}
              </span>
              {nftHolder && (
                <span className="text-sm text-muted-foreground line-through">
                  ${regularPrice.toFixed(2)}
                </span>
              )}
            </div>
            {nftHolder && savings > 0 && (
              <p className="text-xs text-green-600">Save ${savings.toFixed(2)}</p>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleQuickAdd}
            disabled={!item.available}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="border-t p-4">
        <div className="flex w-full items-center gap-2">
          <div className="flex items-center rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={!item.available}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setQuantity(Math.min(10, quantity + 1))}
              disabled={!item.available}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <Button
            className="flex-1"
            onClick={handleAddToCart}
            disabled={!item.available}
          >
            Add to Cart
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}