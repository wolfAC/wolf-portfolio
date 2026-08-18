import { Container } from '../components/layout/Container'
import { Body, Meta } from '../components/typography'
import { DraftingMark } from '../components/layout/DraftingMark'
import { AnimatedHeading } from '../components/motion/AnimatedHeading'
import { SystemFlow } from '../components/system/SystemFlow'
import { ProductDnaGrid } from '../components/system/ProductDnaGrid'
import { LivingSystemDiagram } from '../components/system/LivingSystemDiagram'
import { VoiceQuery } from '../components/system/VoiceQuery'
import { Reveal } from '../components/motion/Reveal'

export function SystemPage() {
  return (
    <article className="relative py-section-y">
      <DraftingMark rev="D" />
      <Container>
        <Reveal>
          <Meta as="p" className="mb-6">
            04 / SYSTEM
          </Meta>

          <AnimatedHeading lines={['MY SYSTEM']} />

          <Body className="mt-6 max-w-2xl">
            Every product goes through the same process, from problem to shipped
            software — a repeatable system, not a one-off scramble.
          </Body>
        </Reveal>

        <Reveal>
          <Meta as="h2" className="mb-4 mt-16">
            01 — Process
          </Meta>
          <SystemFlow />
        </Reveal>

        <Reveal>
          <Meta as="h2" className="mb-4 mt-16">
            02 — Product DNA
          </Meta>
          <ProductDnaGrid />
        </Reveal>

        <Reveal>
          <Meta as="h2" className="mb-4 mt-16">
            03 — Living System
          </Meta>
          <LivingSystemDiagram />
          <VoiceQuery />
        </Reveal>
      </Container>
    </article>
  )
}
