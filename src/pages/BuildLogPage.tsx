import { Container } from '../components/layout/Container'
import { Meta, Body } from '../components/typography'
import { AnimatedHeading } from '../components/motion/AnimatedHeading'
import { buildLog } from '../data/build-log'
import { Reveal } from '../components/motion/Reveal'

function formatDate(iso: string) {
  const [year, month, day] = iso.split('-')
  return `${day}.${month}.${year.slice(2)}`
}

export function BuildLogPage() {
  return (
    <article className="py-section-y">
      <Container>
        <Reveal>
          <Meta as="p" className="mb-6">
            05 / BUILD LOG
          </Meta>

          <AnimatedHeading lines={['BUILD LOG']} />

          <ol className="mt-12">
            {buildLog.map((entry, index) => (
              <li
                key={`${entry.date}-${index}`}
                className="flex flex-col gap-2 border-t border-border py-6 first:border-t-0 first:pt-0 sm:flex-row sm:items-baseline sm:gap-8"
              >
                <Meta as="span" className="sm:w-24 sm:flex-none">
                  {formatDate(entry.date)}
                </Meta>
                <Meta as="span" className="text-fg sm:w-32 sm:flex-none">
                  {entry.project}
                </Meta>
                <Body className="sm:flex-1">{entry.description}</Body>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </article>
  )
}
