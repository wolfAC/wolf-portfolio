import { Container } from '../components/layout/Container'
import { Display, Body, Meta } from '../components/typography'
import { SystemFlow } from '../components/system/SystemFlow'
import { ProductDnaGrid } from '../components/system/ProductDnaGrid'
import { TechnologyMap } from '../components/system/TechnologyMap'

export function SystemPage() {
  return (
    <article className="py-section-y">
      <Container>
        <Meta as="p" className="mb-6">
          04 / SYSTEM
        </Meta>

        <Display as="h1">MY SYSTEM</Display>

        <Body className="mt-6 max-w-2xl">
          Every product goes through the same process, from problem to shipped
          software — a repeatable system, not a one-off scramble.
        </Body>

        <Meta as="h2" className="mb-4 mt-16">
          01 — Process
        </Meta>
        <SystemFlow />

        <Meta as="h2" className="mb-4 mt-16">
          02 — Product DNA
        </Meta>
        <ProductDnaGrid />

        <Meta as="h2" className="mb-4 mt-16">
          03 — Technology Map
        </Meta>
        <TechnologyMap />
      </Container>
    </article>
  )
}
