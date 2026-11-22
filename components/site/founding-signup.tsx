'use client'

import { useState } from 'react'

const input = 'min-h-[48px] rounded-xl border border-brand-hairline bg-white px-3.5 text-[17px]'

/** Founding 50 sign-up. Posts to /api/founding-signup when that route exists; until then it confirms locally. */
export function FoundingSignup() {
  const [done, setDone] = useState(false)
  return (
    <form
      aria-label="Founding 50 sign-up"
      className="flex flex-wrap items-end gap-4 rounded-3xl bg-brand-paper p-8"
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
        <div className="flex min-h-[48px] flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="pay" value="once" defaultChecked /> $1,000 once
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="pay" value="installments" /> 3 × $333
          </label>
        </div>
      </fieldset>
      <button
        type="submit"
        className="min-h-[48px] rounded-xl bg-brand-brick px-6 text-base font-bold text-brand-bone"
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
