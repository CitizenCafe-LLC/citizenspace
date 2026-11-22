'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { MENU_SECTIONS, MENU_PRICES, DELIVERY_SEATS, ZACHARYS_HOURS } from '@/lib/site/content'
import { addItem, removeItem, cartLines, cartTotal, money, type Cart } from '@/lib/cafe/cart'
import { BottomSheet } from '@/components/site/bottom-sheet'
import { cn } from '@/lib/utils'

type Order = { lines: ReturnType<typeof cartLines>; seat: string; note: string }

/**
 * Member menu from Zachary’s. Ordering is client-side for now: wire `onSend` to an
 * orders endpoint (see docs/MOBILE_HANDOFF.md) once the Zachary’s partnership is live.
 * Phones get + / − steppers, a floating cart bar and an order bottom sheet;
 * from `md` up the order panel sits beside the menu.
 */
export function CafeMenu({ onSend }: { onSend?: (order: Order) => void }) {
  const [sectionId, setSectionId] = useState(MENU_SECTIONS[0]!.id)
  const [cart, setCart] = useState<Cart>({})
  const [seat, setSeat] = useState<string>(DELIVERY_SEATS[0]!)
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)
  const [sheet, setSheet] = useState(false)
  const section = MENU_SECTIONS.find(s => s.id === sectionId)!
  const lines = cartLines(cart, MENU_PRICES)
  const total = cartTotal(cart, MENU_PRICES)
  const count = lines.reduce((n, l) => n + l.qty, 0)

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

  const panel = (
    <OrderPanel
      lines={lines}
      total={total}
      seat={seat}
      note={note}
      sent={sent}
      onSeat={setSeat}
      onNote={setNote}
      onRemove={name => update(removeItem(cart, name))}
      onSend={send}
    />
  )

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <div
        role="tablist"
        aria-label="Menu sections"
        className="scrollbar-none sticky top-14 z-30 -mx-4 flex gap-2 overflow-x-auto border-b border-brand-hairline bg-brand-paper px-4 py-2.5 sm:-mx-8 sm:px-8 md:static md:mx-0 md:flex-wrap md:justify-center md:px-0 md:pb-4 md:pt-0"
      >
        {MENU_SECTIONS.map(s => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === sectionId}
            onClick={() => setSectionId(s.id)}
            className={cn(
              'min-h-[44px] shrink-0 whitespace-nowrap rounded-full px-4 text-base font-bold md:rounded-xl',
              s.id === sectionId
                ? 'bg-brand-forest text-brand-bone'
                : 'border border-brand-hairline bg-white text-brand-forest md:border-0 md:bg-transparent'
            )}
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
          {section.items.map(item => {
            const qty = cart[item.name] ?? 0
            return (
              <div
                key={item.name}
                className="flex items-center gap-4 border-b border-dashed border-brand-hairline py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-0.5 md:flex-row md:items-baseline md:gap-2.5">
                    <span className="text-[17px] font-bold md:text-[19px]">{item.name}</span>
                    <span
                      aria-hidden
                      className="hidden min-w-[24px] flex-1 -translate-y-1 border-b-2 border-dotted border-[#C9BFAE] md:block"
                    />
                    <span className="order-last font-display text-lg font-semibold md:order-none md:text-xl">
                      {money(item.price)}
                    </span>
                  </div>
                  <p className="m-0 mt-1 text-[15px] leading-snug text-brand-muted">
                    {item.description}
                  </p>
                </div>
                {qty === 0 ? (
                  <button
                    type="button"
                    aria-label={`Add ${item.name}`}
                    onClick={() => update(addItem(cart, item.name))}
                    className="flex h-11 min-w-[44px] shrink-0 items-center justify-center rounded-full border-2 border-brand-brick px-0 text-[15px] font-bold text-brand-brick md:rounded-xl md:border-brand-forest md:px-3 md:text-brand-forest"
                  >
                    <Plus aria-hidden className="h-5 w-5 md:hidden" />
                    <span className="hidden md:inline">Add</span>
                  </button>
                ) : (
                  <span className="flex shrink-0 items-center rounded-full bg-brand-brick text-brand-bone">
                    <button
                      type="button"
                      aria-label={`Remove one ${item.name}`}
                      onClick={() => update(removeItem(cart, item.name))}
                      className="flex h-11 w-10 items-center justify-center"
                    >
                      <Minus aria-hidden className="h-4 w-4" />
                    </button>
                    <span
                      aria-label={`${qty} in order`}
                      aria-live="polite"
                      className="min-w-[16px] text-center font-bold"
                    >
                      {qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`Add another ${item.name}`}
                      onClick={() => update(addItem(cart, item.name))}
                      className="flex h-11 w-10 items-center justify-center"
                    >
                      <Plus aria-hidden className="h-4 w-4" />
                    </button>
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <aside
          aria-label="Your order"
          className="hidden min-w-0 flex-[1_1_320px] flex-col gap-4 rounded-3xl bg-brand-bone p-7 md:flex lg:sticky lg:top-28"
        >
          <div className="h-1.5 rounded-full bg-[#C8734F]" />
          <h3 className="m-0 font-display text-[30px] font-semibold">Your order</h3>
          {panel}
        </aside>
      </div>

      {count > 0 && (
        <div
          className="fixed inset-x-0 z-30 px-3 md:hidden"
          style={{ bottom: 'calc(var(--tabbar-space) + 8px)' }}
        >
          <button
            type="button"
            onClick={() => setSheet(true)}
            aria-label={`View order, ${count} item${count === 1 ? '' : 's'}, ${money(total)}`}
            className="flex min-h-[58px] w-full items-center gap-3 rounded-2xl bg-brand-forest px-4 text-left text-brand-bone shadow-[0_8px_24px_rgba(30,36,34,0.25)]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-peach font-bold text-brand-ink">
              {count}
            </span>
            <span className="flex-1 text-[17px] font-bold">View order</span>
            <span className="text-[17px] font-bold">{money(total)}</span>
          </button>
        </div>
      )}

      <BottomSheet open={sheet} label="Your order" onClose={() => setSheet(false)}>
        <div className="flex flex-col gap-4 pb-2">{panel}</div>
      </BottomSheet>
    </div>
  )
}

function OrderPanel({
  lines,
  total,
  seat,
  note,
  sent,
  onSeat,
  onNote,
  onRemove,
  onSend,
}: {
  lines: ReturnType<typeof cartLines>
  total: number
  seat: string
  note: string
  sent: boolean
  onSeat: (s: string) => void
  onNote: (s: string) => void
  onRemove: (name: string) => void
  onSend: () => void
}) {
  const field =
    'min-h-[48px] rounded-xl border border-brand-hairline bg-brand-paper px-3 text-base font-normal'
  return (
    <>
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
              onClick={() => onRemove(l.name)}
              className="h-11 w-11 rounded-xl text-[22px] text-brand-brick"
            >
              −
            </button>
          </span>
        </div>
      ))}
      <div className="flex justify-between text-[19px] font-bold">
        <span>Subtotal</span>
        <span>{money(total)}</span>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-bold">
        Deliver to
        <select value={seat} onChange={e => onSeat(e.target.value)} className={field}>
          {DELIVERY_SEATS.map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-bold">
        Notes for the kitchen
        <input
          value={note}
          onChange={e => onNote(e.target.value)}
          placeholder="e.g. tofu instead of eggs"
          className={field}
        />
      </label>
      <button
        type="button"
        onClick={onSend}
        className="min-h-[52px] rounded-xl bg-brand-brick text-[17px] font-bold text-brand-bone"
      >
        Send order to Zachary’s
      </button>
      {sent && (
        <p role="status" className="m-0 rounded-xl bg-brand-mist p-3 text-[15px] text-brand-forest">
          Order sent. Zachary’s will bring it up to your seat. Pay with your member account.
        </p>
      )}
      <p className="m-0 text-[13px] leading-normal text-brand-muted">
        Prices are Zachary’s. Kitchen orders {ZACHARYS_HOURS}.
      </p>
    </>
  )
}
