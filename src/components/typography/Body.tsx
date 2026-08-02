import type { ElementType, ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/cn'

type BodyProps<T extends ElementType> = {
  as?: T
} & Omit<ComponentPropsWithoutRef<T>, 'as'>

export function Body<T extends ElementType = 'p'>({
  as,
  className,
  ...props
}: BodyProps<T>) {
  const Tag = as || 'p'
  return <Tag className={cn('text-body text-fg-muted', className)} {...props} />
}
