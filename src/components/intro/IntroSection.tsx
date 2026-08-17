import { SectionShell } from '../layout/SectionShell'
import { SectionTitle, Body } from '../typography'
import { Reveal } from '../motion/Reveal'

export function IntroSection() {
  return (
    <SectionShell id="intro" index="01" title="INTRO" rev="A">
      <Reveal>
        <SectionTitle as="p" className="max-w-3xl">
          I don&apos;t just write code. I design, architect, build, and ship digital
          products.
        </SectionTitle>
        <Body className="mt-8 max-w-2xl">
          Three products anchor this portfolio: a publishing platform, a multi-system
          automotive platform, and an offline-first personal operating system — each
          built end-to-end, from architecture to interface.
        </Body>
      </Reveal>
    </SectionShell>
  )
}
