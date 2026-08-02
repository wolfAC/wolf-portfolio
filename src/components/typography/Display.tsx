import type { ElementType, ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/cn'

type DisplayProps<T extends ElementType> = {
  as?: T
} & Omit<ComponentPropsWithoutRef<T>, 'as'>

export function Display<T extends ElementType = 'h1'>({
  as,
  className,
  ...props
}: DisplayProps<T>) {
  const Tag = as || 'h1'
  return <Tag className={cn('text-display', className)} {...props} />
}
