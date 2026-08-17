import { useParams, Link } from 'react-router'
import { getLabExperimentBySlug } from '../data/lab'
import { SectionShell } from '../components/layout/SectionShell'
import { Body, Meta } from '../components/typography'
import { AnimatedHeading } from '../components/motion/AnimatedHeading'
import { Reveal } from '../components/motion/Reveal'

export function LabDetailPage() {
  const { slug } = useParams()
  const experiment = slug ? getLabExperimentBySlug(slug) : undefined

  if (!experiment) {
    return (
      <SectionShell index="03" title="LAB" eyebrowAs="p" rev="C">
        <AnimatedHeading lines={['NOT FOUND']} />
        <Body className="mt-6">No experiment matches &ldquo;{slug}&rdquo;.</Body>
      </SectionShell>
    )
  }

  return (
    <SectionShell index="03" title={experiment.title} eyebrowAs="p" rev="C">
      <Reveal>
        <AnimatedHeading lines={[experiment.title]} />

        <Body className="mt-6 max-w-2xl">{experiment.description}</Body>

        <dl className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <Meta as="dt">Type</Meta>
            <Body as="dd" className="mt-1 text-fg">
              {experiment.type}
            </Body>
          </div>
          <div>
            <Meta as="dt">Date</Meta>
            <Body as="dd" className="mt-1 text-fg">
              {experiment.date}
            </Body>
          </div>
          <div>
            <Meta as="dt">Status</Meta>
            <Body as="dd" className="mt-1 text-fg capitalize">
              {experiment.status}
            </Body>
          </div>
        </dl>
      </Reveal>

      <Reveal>
        <Meta as="h2" className="mb-4 mt-16">
          Stack
        </Meta>
        <ul className="flex flex-wrap gap-2">
          {experiment.technologies.map((tech) => (
            <li key={tech}>
              <Meta as="span" className="border border-border px-3 py-1">
                {tech}
              </Meta>
            </li>
          ))}
        </ul>
      </Reveal>

      {experiment.link && (
        <Meta
          as="a"
          href={experiment.link.href}
          target="_blank"
          rel="noreferrer"
          className="mt-16 inline-block text-fg transition-colors hover:text-accent"
        >
          {experiment.link.label} ↗
        </Meta>
      )}

      <nav aria-label="Lab" className="mt-16 border-t border-border pt-8">
        <Meta
          as={Link}
          to="/lab"
          className="text-fg transition-colors hover:text-accent"
        >
          ← Back to Lab
        </Meta>
      </nav>
    </SectionShell>
  )
}
