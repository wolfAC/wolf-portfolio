import type { ElementType, ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/cn'

type ContainerProps<T extends ElementType> = {
  as?: T
} & Omit<ComponentPropsWithoutRef<T>, 'as'>

export function Container<T extends ElementType = 'div'>({
  as,
  className,
  ...props
}: ContainerProps<T>) {
  // Cast needed for this call site only: TS can't resolve JSX prop types for
  // a still-generic `T`, collapsing them to `never` (a known TS/@types
  // limitation with this exact as-prop pattern). The public API above stays
  // fully typed — only this internal render escapes it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Tag = (as || 'div') as any
  return (
    <Tag
      className={cn('mx-auto w-full max-w-[90rem] px-gutter', className)}
      {...props}
    />
  )
}
