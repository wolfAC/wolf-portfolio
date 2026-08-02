import { Link } from 'react-router'
import type { Project } from '../../data/projects'
import { SectionTitle, Meta, Body } from '../typography'
import { ArrowIcon } from '../ui/icons'

interface ProductPreviewCardProps {
  project: Project
  index: number
}

export function ProductPreviewCard({ project, index }: ProductPreviewCardProps) {
  return (
    <li className="border-t border-border py-12 first:border-t-0 first:pt-0">
      <Meta as="p">{String(index + 1).padStart(2, '0')}</Meta>

      <SectionTitle as="h3" className="mt-4">
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
        className="mt-8 inline-flex items-center gap-2 text-fg transition-colors hover:text-accent"
      >
        <Meta as="span">Explore product</Meta>
        <ArrowIcon className="size-4" />
      </Link>
    </li>
  )
}
