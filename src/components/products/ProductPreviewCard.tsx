import { Link } from 'react-router'
import type { Project } from '../../data/projects'
import { SectionTitle, Meta, Body } from '../typography'
import { ArrowIcon } from '../ui/icons'

interface ProductPreviewCardProps {
  project: Project
  index: number
  /** Heading level for the project name — 'h3' when nested under a section's
   * own h2 (e.g. the homepage), 'h2' when used directly under a page h1
   * (e.g. the standalone products index). Defaults to 'h3'. */
  headingLevel?: 'h2' | 'h3'
}

export function ProductPreviewCard({
  project,
  index,
  headingLevel = 'h3',
}: ProductPreviewCardProps) {
  return (
    <li
      id={`project-${project.slug}`}
      className="scroll-mt-24 border-t border-border py-12 first:border-t-0 first:pt-0"
    >
      <Meta as="p">{String(index + 1).padStart(2, '0')}</Meta>

      <SectionTitle as={headingLevel} className="mt-4">
        {project.name}
      </SectionTitle>

      <Body className="mt-2 max-w-xl">{project.tagline}</Body>

      <div
        aria-hidden="true"
        className="mt-8 flex flex-wrap gap-2 border border-border bg-bg-elevated p-6"
      >
        {project.modules.map((module) => (
          <Meta as="span" key={module} className="border border-border px-3 py-1">
            {module}
          </Meta>
        ))}
      </div>

      <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
        <div>
          <Meta as="dt">Role</Meta>
          <Body as="dd" className="mt-1 text-fg">
            {project.role}
          </Body>
        </div>
        <div>
          <Meta as="dt">Status</Meta>
          <Body as="dd" className="mt-1 text-fg capitalize">
            {project.status}
          </Body>
        </div>
        <div>
          <Meta as="dt">Category</Meta>
          <Body as="dd" className="mt-1 text-fg">
            {project.category}
          </Body>
        </div>
      </dl>

      <Link
        to={`/products/${project.slug}`}
        className="group mt-8 inline-flex items-center gap-2 text-fg transition-colors hover:text-accent"
      >
        <Meta as="span">Explore product</Meta>
        <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </li>
  )
}
