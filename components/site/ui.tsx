import Link from 'next/link'
import { cn } from '@/lib/utils'

/** Small uppercase label above a heading (brick on light grounds, peach on forest). */
export function Eyebrow({
  children,
  onDark,
  className,
}: {
  children: React.ReactNode
  onDark?: boolean
  className?: string
}) {
  return (
    <p
      className={cn(
        'm-0 text-[13px] font-bold uppercase tracking-[2.5px]',
        onDark ? 'text-brand-peach' : 'text-brand-brick',
        className
      )}
    >
      {children}
    </p>
  )
}

/** A full-width band with the standard 1280px container and section rhythm. */
export function Section({
  children,
  tone = 'paper',
  className,
  innerClassName,
  ...rest
}: React.HTMLAttributes<HTMLElement> & {
  tone?: 'paper' | 'bone' | 'forest'
  innerClassName?: string
}) {
  const tones = {
    paper: 'bg-brand-paper',
    bone: 'bg-brand-bone',
    forest: 'bg-brand-forest text-brand-bone',
  }
  return (
    <section className={cn(tones[tone], className)} {...rest}>
      <div
        className={cn(
          'mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-12 sm:px-8 sm:py-16 md:gap-12 md:py-24',
          innerClassName
        )}
      >
        {children}
      </div>
    </section>
  )
}

export function H1({
  children,
  onDark,
  id,
  className,
}: {
  children: React.ReactNode
  onDark?: boolean
  id?: string
  className?: string
}) {
  return (
    <h1
      id={id}
      className={cn(
        'm-0 font-display text-[38px] font-semibold leading-[1.05] tracking-[-0.5px] sm:text-[44px] md:text-[64px]',
        onDark ? 'text-brand-bone' : 'text-brand-ink',
        className
      )}
    >
      {children}
    </h1>
  )
}

export function H2({
  children,
  onDark,
  id,
  className,
}: {
  children: React.ReactNode
  onDark?: boolean
  id?: string
  className?: string
}) {
  return (
    <h2
      id={id}
      className={cn(
        'm-0 font-display text-[28px] font-semibold leading-[1.12] sm:text-[34px] md:text-[44px]',
        onDark ? 'text-brand-bone' : 'text-brand-ink',
        className
      )}
    >
      {children}
    </h2>
  )
}

export function Lead({
  children,
  onDark,
  className,
}: {
  children: React.ReactNode
  onDark?: boolean
  className?: string
}) {
  return (
    <p
      className={cn(
        'm-0 max-w-[720px] text-[18px] leading-[1.45] sm:text-[20px] md:text-[22px]',
        onDark ? 'text-brand-mist' : 'text-brand-muted',
        className
      )}
    >
      {children}
    </p>
  )
}

/** The brand's card: a 6px top rule over plain text. No boxes, no shadows. */
export function RuleCard({
  color,
  title,
  children,
  className,
}: {
  color: string
  title?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn('flex flex-col gap-2 border-t-[6px] pt-5', className)}
      style={{ borderTopColor: color }}
    >
      {title && <h3 className="m-0 text-[22px] font-bold leading-tight">{title}</h3>}
      {children}
    </div>
  )
}

const buttonStyles = {
  brick: 'bg-brand-brick text-brand-bone hover:bg-[#87493A]',
  forest: 'bg-brand-forest text-brand-bone hover:bg-[#183128]',
  outlineLight: 'border-2 border-brand-bone text-brand-bone hover:bg-white/10',
  outlineDark: 'border-2 border-brand-forest text-brand-forest hover:bg-brand-forest/5',
}

export function ButtonLink({
  href,
  children,
  variant = 'brick',
  className,
}: {
  href: string
  children: React.ReactNode
  variant?: keyof typeof buttonStyles
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex min-h-[52px] items-center justify-center rounded-xl px-6 text-[17px] font-bold no-underline transition-colors md:min-h-[48px] md:text-base',
        buttonStyles[variant],
        className
      )}
    >
      {children}
    </Link>
  )
}

export function Photo({
  src,
  alt,
  ratio = '4 / 3',
  className,
  priority,
}: {
  src: string
  alt: string
  /** CSS aspect-ratio; pass null to size it with classes (e.g. square on phones). */
  ratio?: string | null
  className?: string
  priority?: boolean
}) {
  // Plain <img>: the 640×480 originals don't benefit from next/image resizing yet.
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      className={cn('block w-full rounded-3xl bg-brand-bone object-cover', className)}
      style={ratio ? { aspectRatio: ratio } : undefined}
    />
  )
}

export const usd = (n: number) =>
  Number.isInteger(n) ? `$${n.toLocaleString('en-US')}` : `$${n.toFixed(2)}`
