'use client'

import { useState } from 'react'

const input = 'min-h-[48px] rounded-xl border border-brand-hairline bg-white px-3.5 text-[17px]'

/** Founding 50 sign-up. Posts to /api/founding-signup when that route exists; until then it confirms locally. */
export function FoundingSignup() {
  const [done, setDone] = useState(false)
  return (
    <form
      aria-label="Founding 50 sign-up"
      className="flex flex-wrap items-end gap-4 rounded-3xl bg-brand-paper p-5 md:p-8"
      onSubmit={e => {
        e.preventDefault()
        setDone(true)
      }}
    >
      <label className="flex min-w-0 flex-[1_1_220px] flex-col gap-1.5 text-sm font-bold">
        Name
        <input name="name" type="text" autoComplete="name" required className={input} />
      </label>
      <label className="flex min-w-0 flex-[1_1_260px] flex-col gap-1.5 text-sm font-bold">
        Email
        <input name="email" type="email" autoComplete="email" required className={input} />
      </label>
      <fieldset className="m-0 flex min-w-0 flex-[1_1_260px] flex-col gap-1.5 border-0 p-0">
        <legend className="mb-1.5 p-0 text-sm font-bold">How you’ll pay</legend>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-brand-bone p-1">
          {(
            [
              ['once', '$1,000', 'once', true],
              ['installments', '3 × $333', 'monthly', false],
            ] as const
          ).map(([value, price, note, checked]) => (
            <label
              key={value}
              className="relative flex min-h-[52px] cursor-pointer flex-col items-center justify-center rounded-[9px] font-bold [&:has(:checked)]:bg-white [&:has(:checked)]:shadow-sm [&:has(:focus-visible)]:ring-2 [&:has(:focus-visible)]:ring-brand-forest"
            >
              <input
                type="radio"
                name="pay"
                value={value}
                defaultChecked={checked}
                className="sr-only"
              />
              {price}
              <span className="text-xs font-medium text-brand-muted">{note}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="submit"
        className="min-h-[52px] w-full rounded-xl bg-brand-brick px-6 text-[17px] font-bold text-brand-bone sm:w-auto"
      >
        Claim my spot
      </button>
      {done && (
        <p role="status" className="m-0 w-full text-brand-forest">
          Thanks. We’ll email you when founding sales open on December 1.
        </p>
      )}
    </form>
  )
}
