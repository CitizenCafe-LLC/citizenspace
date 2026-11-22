export type Cart = Record<string, number>
export type CartLine = { name: string; qty: number; subtotal: number }

const cents = (n: number) => Math.round(n * 100) / 100

export function addItem(cart: Cart, name: string): Cart {
  return { ...cart, [name]: (cart[name] ?? 0) + 1 }
}

export function removeItem(cart: Cart, name: string): Cart {
  const next = { ...cart }
  const qty = (next[name] ?? 0) - 1
  if (qty > 0) {
    next[name] = qty
  } else {
    delete next[name]
  }
  return next
}

export function cartLines(cart: Cart, prices: Record<string, number>): CartLine[] {
  return Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([name, qty]) => ({ name, qty, subtotal: cents((prices[name] ?? 0) * qty) }))
}

export function cartTotal(cart: Cart, prices: Record<string, number>): number {
  return cents(cartLines(cart, prices).reduce((sum, l) => sum + l.subtotal, 0))
}

export const money = (n: number) => `$${n.toFixed(2)}`
