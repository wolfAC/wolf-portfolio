import { getProjectBySlug } from '../data/projects'
import { Container } from '../components/layout/Container'
import { Display, Body, Meta } from '../components/typography'
import { ProjectMediaPlaceholder } from '../components/products/ProjectMediaPlaceholder'
import { ProjectFlowDiagram } from '../components/products/ProjectFlowDiagram'
import { ProgressBar } from '../components/ui/ProgressBar'
import { MoreProducts } from '../components/products/MoreProducts'

export function PulsePage() {
  const project = getProjectBySlug('pulse')
  if (!project) return null

  return (
    <article className="py-section-y">
      <Container>
        <Meta as="p" className="mb-6">
          02 / PULSE
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

        <ProjectMediaPlaceholder className="mt-12" label="DASHBOARD PREVIEW" />

        <Meta as="h2" className="mb-4 mt-16">
          01 — Overview
        </Meta>
        <dl className="mb-8 grid grid-cols-2 gap-8 sm:grid-cols-3">
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
        {project.progress != null && (
          <div className="max-w-md">
            <ProgressBar
              value={project.progress}
              label={`${project.name} build progress`}
            />
          </div>
        )}

        {project.flow && (
          <>
            <Meta as="h2" className="mb-4 mt-16">
              02 — Architecture
            </Meta>
            <ProjectFlowDiagram steps={project.flow} animated />
          </>
        )}

        {project.technicalHighlights && (
          <>
            <Meta as="h2" className="mb-4 mt-16">
              03 — Product DNA
            </Meta>
            <ul className="flex flex-wrap gap-2">
              {project.technicalHighlights.map((highlight) => (
                <li key={highlight}>
                  <Meta as="span" className="border border-border px-3 py-1">
                    {highlight}
                  </Meta>
                </li>
              ))}
            </ul>
          </>
        )}

        {project.technologies.length > 0 && (
          <>
            <Meta as="h2" className="mb-4 mt-16">
              04 — Stack
            </Meta>
            <Body className="max-w-2xl">{project.technologies.join(' · ')}</Body>
          </>
        )}

        <MoreProducts currentSlug="pulse" />
      </Container>
    </article>
  )
}
