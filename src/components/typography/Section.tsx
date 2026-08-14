import type { ElementType, ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/cn'

type SectionProps<T extends ElementType> = {
  as?: T
} & Omit<ComponentPropsWithoutRef<T>, 'as'>

export function SectionTitle<T extends ElementType = 'h2'>({
  as,
  className,
  children,
  ...props
}: SectionProps<T>) {
  // Cast needed for this call site only: TS can't resolve JSX prop types for
  // a still-generic `T`, collapsing them to `never` (a known TS/@types
  // limitation with this exact as-prop pattern). The public API above stays
  // fully typed — only this internal render escapes it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = (as || 'h2') as any
  return (
    <Tag className={cn('spotlight-text text-section', className)} {...props}>
      {children}
      {/* Decorative cursor-spotlight duplicate — hidden from assistive tech,
       * masked invisible by default (see .spotlight-overlay in index.css). */}
      <span aria-hidden="true" className="spotlight-overlay pointer-events-none">
        {children}
      </span>
    </Tag>
  )
}
