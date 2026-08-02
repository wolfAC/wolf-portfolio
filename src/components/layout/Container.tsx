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
  const Tag = as || 'div'
  return (
    <Tag
      className={cn('mx-auto w-full max-w-[90rem] px-gutter', className)}
      {...props}
    />
  )
}
