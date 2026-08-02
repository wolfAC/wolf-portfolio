import type { ReactNode } from 'react'
import { SectionShell } from '../../components/layout/SectionShell'
import { Display, Body } from '../../components/typography'

interface StubPageProps {
  index: string
  title: string
  note?: string
  children?: ReactNode
}

export function StubPage({ index, title, note, children }: StubPageProps) {
  return (
    <SectionShell index={index} title={title} eyebrowAs="p" className="min-h-[60vh]">
      <Display as="h1">{title}</Display>
      <Body className="mt-6 max-w-xl">
        {note ?? 'This section is being built. Check back soon.'}
      </Body>
      {children}
    </SectionShell>
  )
}
