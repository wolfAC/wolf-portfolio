import { Container } from '../components/layout/Container'
import { Body, Meta } from '../components/typography'
import { AnimatedHeading } from '../components/motion/AnimatedHeading'
import { SystemFlow } from '../components/system/SystemFlow'
import { ProductDnaGrid } from '../components/system/ProductDnaGrid'
import { TechnologyMap } from '../components/system/TechnologyMap'
import { Reveal } from '../components/motion/Reveal'

export function SystemPage() {
  return (
    <article className="py-section-y">
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
            03 — Technology Map
          </Meta>
          <TechnologyMap />
        </Reveal>
      </Container>
    </article>
  )
}
