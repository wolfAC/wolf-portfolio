import type { ElementType, ReactNode } from 'react'
import { Meta } from '../typography'
import { Container } from './Container'
import { cn } from '../../lib/cn'

interface SectionShellProps {
  id?: string
  index: string
  title: string
  children: ReactNode
  className?: string
  /** Heading level for the "NN / TITLE" eyebrow. Use 'p' when the section
   * provides its own h1 (e.g. a standalone stub page). Defaults to 'h2'. */
  eyebrowAs?: ElementType
}

export function SectionShell({
  id,
  index,
  title,
  children,
  className,
  eyebrowAs = 'h2',
}: SectionShellProps) {
  return (
    <section id={id} className={cn('py-section-y scroll-mt-24', className)}>
      <Container>
        <Meta as={eyebrowAs} className="mb-6">
          {index} / {title}
        </Meta>
        {children}
      </Container>
    </section>
  )
}
