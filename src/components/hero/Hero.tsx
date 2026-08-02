import { useRef, useState } from 'react'
import { m, useTransform } from 'framer-motion'
import { usePointer } from '../../hooks/usePointer'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { Container } from '../layout/Container'
import { Body, Meta } from '../typography'
import { HeroCursorField } from './HeroCursorField'
import { ScrollCue } from './ScrollCue'
import { site } from '../../data/site'

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const [pointerFine] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches,
  )
  const interactive = !reducedMotion && pointerFine

  const { x, y } = usePointer(sectionRef, { enabled: interactive })

  const nameX = useTransform(x, (v) => v * 6)
  const nameY = useTransform(y, (v) => v * 4)
  const roleX = useTransform(x, (v) => v * -10)
  const roleY = useTransform(y, (v) => v * 6)
  const taglineX = useTransform(x, (v) => v * 4)
  const taglineY = useTransform(y, (v) => v * -3)

  const year = new Date().getFullYear()

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden"
    >
      {interactive && <HeroCursorField x={x} y={y} />}

      <Container className="flex flex-1 flex-col justify-center gap-8 py-section-y">
        <Meta as="p">
          {site.statusLabel} / {year}
        </Meta>

        <h1 className="flex flex-col">
          <m.span style={{ x: nameX, y: nameY }} className="text-display text-fg">
            {site.name}
          </m.span>
          <m.span
            style={{ x: roleX, y: roleY }}
            className="text-display text-fg-muted"
          >
            {site.role}
          </m.span>
        </h1>

        <m.p
          style={{ x: taglineX, y: taglineY }}
          className="text-section max-w-3xl text-accent"
        >
          {site.tagline}
        </m.p>

        <Body className="max-w-xl">{site.secondary}</Body>
      </Container>

      <ScrollCue />
    </section>
  )
}
