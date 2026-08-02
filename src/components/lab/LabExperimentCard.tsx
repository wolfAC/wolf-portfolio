import { Link } from 'react-router'
import type { LabExperiment } from '../../data/lab'
import { SectionTitle, Meta, Body } from '../typography'
import { ArrowIcon } from '../ui/icons'

interface LabExperimentCardProps {
  experiment: LabExperiment
  /** Heading level for the title — 'h3' when nested under a section's own h2
   * (unused today, kept for parity with ProductPreviewCard), 'h2' when used
   * directly under a page h1 (the lab index). Defaults to 'h3'. */
  headingLevel?: 'h2' | 'h3'
}

export function LabExperimentCard({
  experiment,
  headingLevel = 'h3',
}: LabExperimentCardProps) {
  return (
    <li className="border-t border-border py-12 first:border-t-0 first:pt-0">
      <Meta as="p">LAB / {experiment.number}</Meta>

      <SectionTitle as={headingLevel} className="mt-4">
        {experiment.title}
      </SectionTitle>

      <Body className="mt-2 max-w-xl">{experiment.description}</Body>

      <ul className="mt-6 flex flex-wrap gap-2">
        {experiment.technologies.map((tech) => (
          <li key={tech}>
            <Meta as="span" className="border border-border px-3 py-1">
              {tech}
            </Meta>
          </li>
        ))}
      </ul>

      <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
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

      <Link
        to={`/lab/${experiment.slug}`}
        className="mt-8 inline-flex items-center gap-2 text-fg transition-colors hover:text-accent"
      >
        <Meta as="span">View experiment</Meta>
        <ArrowIcon className="size-4" />
      </Link>
    </li>
  )
}
