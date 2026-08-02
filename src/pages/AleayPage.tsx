import { getProjectBySlug } from '../data/projects'
import { Container } from '../components/layout/Container'
import { Display, Body, Meta } from '../components/typography'
import { ProjectMediaPlaceholder } from '../components/products/ProjectMediaPlaceholder'
import { ProjectFlowDiagram } from '../components/products/ProjectFlowDiagram'
import { MoreProducts } from '../components/products/MoreProducts'

export function AleayPage() {
  const project = getProjectBySlug('aleay')
  if (!project) return null

  return (
    <article className="py-section-y">
      <Container>
        <Meta as="p" className="mb-6">
          02 / ALEAY
        </Meta>

        <Display as="h1">
          {project.positioningLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </Display>

        <Body className="mt-6 max-w-2xl">{project.summary}</Body>

        <ul className="mt-8 flex flex-wrap gap-2">
          {project.modules.map((module) => (
            <li key={module}>
              <Meta as="span" className="border border-border px-3 py-1">
                {module}
              </Meta>
            </li>
          ))}
        </ul>

        <Meta as="h2" className="mb-4 mt-16">
          01 — Product
        </Meta>
        <dl className="grid grid-cols-2 gap-8 sm:grid-cols-3">
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
        </dl>

        <Meta as="h2" className="mb-4 mt-16">
          02 — User Experience
        </Meta>
        <ProjectMediaPlaceholder label="APP PREVIEW" />

        <Meta as="h2" className="mb-4 mt-16">
          03 — Admin System
        </Meta>
        <ProjectMediaPlaceholder label="ADMIN PREVIEW" />

        {project.flow && (
          <>
            <Meta as="h2" className="mb-4 mt-16">
              04 — Content Flow
            </Meta>
            <ProjectFlowDiagram steps={project.flow} animated />
          </>
        )}

        <MoreProducts currentSlug="aleay" />
      </Container>
    </article>
  )
}
