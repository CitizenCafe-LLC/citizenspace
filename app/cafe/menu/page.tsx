'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, ShoppingCart, Wallet } from 'lucide-react'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { CartSidebar } from '@/components/menu/CartSidebar'
import { CategoryFilter } from '@/components/menu/CategoryFilter'
import { useCartStore } from '@/lib/store/cart-store'
import { toast } from 'sonner'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  dietary_tags?: string[]
  available: boolean
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [nftHolder, setNftHolder] = useState(false)

  const { openCart, getItemCount } = useCartStore()
  const cartItemCount = getItemCount()

  useEffect(() => {
    loadUserData()
    loadMenuItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [activeCategory, searchQuery, menuItems])

  const loadUserData = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setNftHolder(data.user?.nft_holder || false)
      }
    } catch (error) {
      // User not logged in - that's ok
    }
  }

  const loadMenuItems = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/menu')
      if (!res.ok) {
        throw new Error('Failed to fetch menu items')
      }

      const data = await res.json()
      setMenuItems(data.data || [])
    } catch (error) {
      console.error('Menu error:', error)
      toast.error('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

  const filterItems = () => {
    let filtered = menuItems

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.dietary_tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    setFilteredItems(filtered)
  }

  const categories = ['all', ...Array.from(new Set(menuItems.map((item) => item.category)))]

  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="pb-12">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              Full Menu
            </Badge>
            <h1 className="mb-6 font-display text-4xl font-bold lg:text-6xl">
              Fresh. Local. <span className="gradient-text">Delicious.</span>
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Every item is carefully sourced from local partners and crafted fresh daily. Order
              from your seat with our mobile app.
            </p>

            {/* NFT Benefits Notice */}
            {nftHolder && (
              <Card className="border-cs-sun/20 bg-gradient-to-r from-cs-sun/10 to-cs-apricot/10">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    <Wallet className="mr-1 inline h-4 w-4" />
                    <strong>NFT Holder Active:</strong> You're getting 10% off all items!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-12">
        <div className="container max-w-7xl">
          {/* Filters and Search */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Cart Button */}
              <Button onClick={openCart} className="relative">
                <ShoppingCart className="mr-2 h-4 w-4" />
                View Cart
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Category Filter */}
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Menu Items Grid */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-96" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed">
              <Search className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium">No items found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} nftHolder={nftHolder} />
              ))}
            </div>
          )}

          {/* Results Count */}
          {!loading && filteredItems.length > 0 && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Showing {filteredItems.length} of {menuItems.length} items
            </p>
          )}
        </div>
      </section>

      {/* Dietary Information */}
      <section className="bg-muted/30 py-12">
        <div className="container max-w-4xl">
          <div className="mb-8 text-center">
            <h2 className="mb-4 font-display text-2xl font-bold">Dietary Options</h2>
            <p className="mb-8 text-muted-foreground">
              We cater to various dietary needs and preferences. Let us know about any allergies or
              special requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Cart Sidebar */}
      <CartSidebar nftHolder={nftHolder} />
    </div>
  )
}