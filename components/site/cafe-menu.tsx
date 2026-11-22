'use client'

import { useState } from 'react'
import { MENU_SECTIONS, MENU_PRICES, DELIVERY_SEATS, ZACHARYS_HOURS } from '@/lib/site/content'
import { addItem, removeItem, cartLines, cartTotal, money, type Cart } from '@/lib/cafe/cart'

/**
 * Member menu from Zachary’s. Ordering is client-side for now: wire `onSend` to the
 * existing app/api orders route (or a Zachary’s POS/email hook) once the partnership is live.
 */
export function CafeMenu({
  onSend,
}: {
  onSend?: (order: { lines: ReturnType<typeof cartLines>; seat: string; note: string }) => void
}) {
  const [sectionId, setSectionId] = useState(MENU_SECTIONS[0]!.id)
  const [cart, setCart] = useState<Cart>({})
  const [seat, setSeat] = useState<string>(DELIVERY_SEATS[0]!)
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)
  const section = MENU_SECTIONS.find(s => s.id === sectionId)!
  const lines = cartLines(cart, MENU_PRICES)

  const update = (next: Cart) => {
    setCart(next)
    setSent(false)
  }
  const send = () => {
    if (!lines.length) {
      return
    }
    onSend?.({ lines, seat, note })
    setCart({})
    setNote('')
    setSent(true)
  }

  return (
    <div className="flex flex-col gap-8">
      <div
        role="tablist"
        aria-label="Menu sections"
        className="flex flex-wrap justify-center gap-2 border-b border-brand-hairline pb-4"
      >
        {MENU_SECTIONS.map(s => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === sectionId}
            onClick={() => setSectionId(s.id)}
            className={`min-h-[44px] rounded-xl px-4 text-base font-bold ${s.id === sectionId ? 'bg-brand-forest text-brand-bone' : 'text-brand-forest'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-start gap-12">
        <div
          role="tabpanel"
          aria-label={section.label}
          className="flex min-w-0 flex-[999_1_560px] flex-col"
        >
          <h3 className="m-0 mb-2 font-display text-[30px] font-semibold">{section.label}</h3>
          <p className="m-0 mb-4 text-[15px] text-brand-muted">{section.note}</p>
          {section.items.map(item => (
            <div
              key={item.name}
              className="flex items-center gap-4 border-b border-dashed border-brand-hairline py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-[19px] font-bold">{item.name}</span>
                  <span
                    aria-hidden
                    className="min-w-[24px] flex-1 -translate-y-1 border-b-2 border-dotted border-[#C9BFAE]"
                  />
                  <span className="font-display text-xl font-semibold">{money(item.price)}</span>
                </div>
                <p className="m-0 mt-1 text-[15px] leading-snug text-brand-muted">
                  {item.description}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Add ${item.name}`}
                onClick={() => update(addItem(cart, item.name))}
                className="h-11 min-w-[44px] shrink-0 rounded-xl border-2 border-brand-forest px-3 text-[15px] font-bold text-brand-forest"
              >
                Add
              </button>
            </div>
          ))}
        </div>

        <aside
          aria-label="Your order"
          className="flex min-w-0 flex-[1_1_320px] flex-col gap-4 rounded-3xl bg-brand-bone p-7 lg:sticky lg:top-28"
        >
          <div className="h-1.5 rounded-full bg-[#C8734F]" />
          <h3 className="m-0 font-display text-[30px] font-semibold">Your order</h3>
          {lines.length === 0 && (
            <p className="m-0 text-base text-brand-muted">
              Nothing yet. Tap Add on anything from the menu.
            </p>
          )}
          {lines.map(l => (
            <div
              key={l.name}
              className="flex items-center justify-between gap-3 border-b border-brand-hairline pb-2.5"
            >
              <span className="min-w-0 text-base">
                <strong>{l.qty}×</strong> {l.name}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="font-bold">{money(l.subtotal)}</span>
                <button
                  type="button"
                  aria-label={`Remove one ${l.name}`}
                  onClick={() => update(removeItem(cart, l.name))}
                  className="h-11 w-11 rounded-xl text-[22px] text-brand-brick"
                >
                  −
                </button>
              </span>
            </div>
          ))}
          <div className="flex justify-between text-[19px] font-bold">
            <span>Subtotal</span>
            <span>{money(cartTotal(cart, MENU_PRICES))}</span>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Deliver to
            <select
              value={seat}
              onChange={e => setSeat(e.target.value)}
              className="min-h-[48px] rounded-xl border border-brand-hairline bg-brand-paper px-3 text-base font-normal"
            >
              {DELIVERY_SEATS.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-bold">
            Notes for the kitchen
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. tofu instead of eggs"
              className="min-h-[48px] rounded-xl border border-brand-hairline bg-brand-paper px-3 text-base font-normal"
            />
          </label>
          <button
            type="button"
            onClick={send}
            className="min-h-[52px] rounded-xl bg-brand-brick text-[17px] font-bold text-brand-bone"
          >
            Send order to Zachary’s
          </button>
          {sent && (
            <p
              role="status"
              className="m-0 rounded-xl bg-brand-mist p-3 text-[15px] text-brand-forest"
            >
              Order sent. Zachary’s will bring it up to your seat. Pay with your member account.
            </p>
          )}
          <p className="m-0 text-[13px] leading-normal text-brand-muted">
            Prices are Zachary’s. Kitchen orders {ZACHARYS_HOURS}.
          </p>
        </aside>
      </div>
    </div>
  )
}
