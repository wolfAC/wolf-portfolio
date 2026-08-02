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
  const Tag = as || 'span'
  return (
    <Tag
      className={cn('text-meta font-mono uppercase text-fg-muted', className)}
      {...props}
    />
  )
}
