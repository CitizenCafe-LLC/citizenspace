import { Children } from 'react'
import { cn } from '@/lib/utils'

/**
 * A row of cards that swipes sideways on phones (CSS scroll-snap, like a native
 * horizontal FlatList) and turns into a grid from `md` up via `gridClassName`.
 */
export function SwipeRow({
  label,
  children,
  gridClassName = 'md:grid-cols-[repeat(auto-fit,minmax(240px,1fr))]',
  itemClassName = 'basis-[78%]',
  className,
}: {
  label: string
  children: React.ReactNode
  gridClassName?: string
  itemClassName?: string
  className?: string
}) {
  return (
    <ul
      aria-label={label}
      className={cn(
        'scrollbar-none -mx-4 my-0 flex snap-x snap-mandatory scroll-px-4 list-none gap-4 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:scroll-px-8 sm:px-8',
        'md:mx-0 md:grid md:gap-8 md:overflow-visible md:px-0 md:pb-0',
        gridClassName,
        className
      )}
    >
      {Children.toArray(children).map((child, i) => (
        <li key={i} className={cn('min-w-0 shrink-0 snap-start md:basis-auto', itemClassName)}>
          {child}
        </li>
      ))}
    </ul>
  )
}
