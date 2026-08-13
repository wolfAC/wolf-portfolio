import { getProjectBySlug } from '../data/projects'
import { Container } from '../components/layout/Container'
import { Body, Meta } from '../components/typography'
import { AnimatedHeading } from '../components/motion/AnimatedHeading'
import { ProjectPreviewGallery } from '../components/products/ProjectPreviewGallery'
import { ProjectFlowDiagram } from '../components/products/ProjectFlowDiagram'
import { ProgressBar } from '../components/ui/ProgressBar'
import { MoreProducts } from '../components/products/MoreProducts'
import { Reveal } from '../components/motion/Reveal'
import { SystemHub } from '../components/products/SystemHub'

export function PulsePage() {
  const project = getProjectBySlug('pulse')
  if (!project) return null

  const hubNodes = (project.highlightModules ?? project.modules).map((module) => ({
    id: module,
    label: module,
  }))

  return (
    <article className="py-section-y">
      <Container>
        <Reveal>
          <Meta as="p" className="mb-6">
            02 / PULSE
          </Meta>

          <AnimatedHeading lines={project.positioningLines} />

          <Body className="mt-6 max-w-2xl">{project.summary}</Body>

          {project.progress != null && (
            <div className="mt-8 max-w-md">
              <div className="mb-2 flex items-baseline justify-between">
                <Meta as="span">Build progress</Meta>
                <Meta as="span" className="text-fg">
                  {project.progress}%
                </Meta>
              </div>
              <ProgressBar
                value={project.progress}
                label={`${project.name} build progress`}
              />
            </div>
          )}
        </Reveal>

        <Reveal>
          <Meta as="h2" className="mb-8 mt-16">
            01 — System
          </Meta>
          <SystemHub nodes={hubNodes} centerLabel={project.name} />
        </Reveal>

        <Reveal>
          <Meta as="h2" className="mb-4 mt-16">
            02 — Preview
          </Meta>
          <ProjectPreviewGallery modules={project.highlightModules ?? project.modules} />
        </Reveal>

        <Reveal>
          <Meta as="h2" className="mb-4 mt-16">
            03 — Overview
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
        </Reveal>

        {project.flow && (
          <Reveal>
            <Meta as="h2" className="mb-4 mt-16">
              04 — Architecture
            </Meta>
            <ProjectFlowDiagram steps={project.flow} animated />
          </Reveal>
        )}

        {project.technicalHighlights && (
          <Reveal>
            <Meta as="h2" className="mb-4 mt-16">
              05 — Product DNA
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
          </Reveal>
        )}

        {project.technologies.length > 0 && (
          <Reveal>
            <Meta as="h2" className="mb-4 mt-16">
              06 — Stack
            </Meta>
            <Body className="max-w-2xl">{project.technologies.join(' · ')}</Body>
          </Reveal>
        )}

        <MoreProducts currentSlug="pulse" />
      </Container>
    </article>
  )
}
