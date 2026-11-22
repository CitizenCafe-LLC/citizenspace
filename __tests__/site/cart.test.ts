import { addItem, removeItem, cartLines, cartTotal, type Cart } from '@/lib/cafe/cart'

const prices = { 'Mike’s Mess': 15.5, Coffee: 3.25 }

describe('cafe cart', () => {
  it('adds items and counts quantities', () => {
    let cart: Cart = {}
    cart = addItem(cart, 'Coffee')
    cart = addItem(cart, 'Coffee')
    cart = addItem(cart, 'Mike’s Mess')
    expect(cart).toEqual({ Coffee: 2, 'Mike’s Mess': 1 })
  })

  it('never mutates the cart it was given', () => {
    const cart: Cart = { Coffee: 1 }
    addItem(cart, 'Coffee')
    expect(cart).toEqual({ Coffee: 1 })
  })

  it('drops a line when its quantity reaches zero', () => {
    expect(removeItem({ Coffee: 1 }, 'Coffee')).toEqual({})
    expect(removeItem({ Coffee: 2 }, 'Coffee')).toEqual({ Coffee: 1 })
    expect(removeItem({}, 'Coffee')).toEqual({})
  })

  it('totals lines to the cent', () => {
    const cart = { Coffee: 3, 'Mike’s Mess': 1 }
    expect(cartTotal(cart, prices)).toBeCloseTo(25.25, 2)
    expect(cartLines(cart, prices)).toEqual([
      { name: 'Coffee', qty: 3, subtotal: 9.75 },
      { name: 'Mike’s Mess', qty: 1, subtotal: 15.5 },
    ])
  })
})
