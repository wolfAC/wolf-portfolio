import { useParams } from 'react-router'
import { getProjectBySlug } from '../../data/projects'
import { SectionShell } from '../../components/layout/SectionShell'
import { Display, Body, Meta } from '../../components/typography'

export function ProductStubPage() {
  const { slug } = useParams()
  const project = slug ? getProjectBySlug(slug) : undefined

  if (!project) {
    return (
      <SectionShell index="02" title="PRODUCTS" eyebrowAs="p">
        <Display as="h1">NOT FOUND</Display>
        <Body className="mt-6">No product matches &ldquo;{slug}&rdquo;.</Body>
      </SectionShell>
    )
  }

  return (
    <SectionShell index="02" title={project.name}>
      <Display as="h1">
        {project.positioningLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </Display>

      <Body className="mt-6 max-w-2xl">{project.summary}</Body>

      <dl className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
        <div>
          <Meta as="dt">Category</Meta>
          <Body as="dd" className="mt-1 text-fg">
            {project.category}
          </Body>
        </div>
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
        {project.technologies.length > 0 && (
          <div>
            <Meta as="dt">Stack</Meta>
            <Body as="dd" className="mt-1 text-fg">
              {project.technologies.join(' · ')}
            </Body>
          </div>
        )}
      </dl>

      <Meta as="p" className="mt-16">
        Full case study — coming soon.
      </Meta>
    </SectionShell>
  )
}
