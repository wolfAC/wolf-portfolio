import type { ElementType, ComponentPropsWithoutRef } from 'react'
import { cn } from '../../lib/cn'

type SectionProps<T extends ElementType> = {
  as?: T
} & Omit<ComponentPropsWithoutRef<T>, 'as'>

export function SectionTitle<T extends ElementType = 'h2'>({
  as,
  className,
  ...props
}: SectionProps<T>) {
  const Tag = as || 'h2'
  return <Tag className={cn('text-section', className)} {...props} />
}
