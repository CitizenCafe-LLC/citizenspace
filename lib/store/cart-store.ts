import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  dietary_tags?: string[]
  available: boolean
}

export interface CartItem extends MenuItem {
  quantity: number
  specialInstructions?: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: MenuItem, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateSpecialInstructions: (itemId: string, instructions: string) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
  getTotal: (nftDiscount?: boolean) => number
  getDiscount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item: MenuItem, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            }
          }

          return {
            items: [...state.items, { ...item, quantity }],
          }
        })
      },

      removeItem: (itemId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }))
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        }))
      },

      updateSpecialInstructions: (itemId: string, instructions: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, specialInstructions: instructions } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }))
      },

      openCart: () => {
        set({ isOpen: true })
      },

      closeCart: () => {
        set({ isOpen: false })
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getDiscount: () => {
        const subtotal = get().getSubtotal()
        return subtotal * 0.1 // 10% discount for NFT holders
      },

      getTotal: (nftDiscount = false) => {
        const subtotal = get().getSubtotal()
        const discount = nftDiscount ? get().getDiscount() : 0
        return subtotal - discount
      },
    }),
    {
      name: 'cart-storage',
      partialialize: (state) => ({ items: state.items }),
    }
  )
)