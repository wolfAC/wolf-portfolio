import type { ElementType, ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/cn'

type MetaProps<T extends ElementType> = {
  as?: T
} & Omit<ComponentPropsWithoutRef<T>, 'as'>

export function Meta<T extends ElementType = 'span'>({
  as,
  className,
  ...props
}: MetaProps<T>) {
  // Cast needed for this call site only: TS can't resolve JSX prop types for
  // a still-generic `T`, collapsing them to `never` (a known TS/@types
  // limitation with this exact as-prop pattern). The public API above stays
  // fully typed — only this internal render escapes it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = (as || 'span') as any
  return (
    <Tag
      className={cn('text-meta font-mono uppercase text-fg-muted', className)}
      {...props}
    />
  )
}
