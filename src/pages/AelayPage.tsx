import { getProjectBySlug } from '../data/projects'
import { Container } from '../components/layout/Container'
import { Body, Meta } from '../components/typography'
import { AnimatedHeading } from '../components/motion/AnimatedHeading'
import { ProjectPreviewGallery } from '../components/products/ProjectPreviewGallery'
import { ProjectFlowDiagram } from '../components/products/ProjectFlowDiagram'
import { MoreProducts } from '../components/products/MoreProducts'
import { Reveal } from '../components/motion/Reveal'

export function AelayPage() {
  const project = getProjectBySlug('aelay')
  if (!project) return null

  return (
    <article className="py-section-y">
      <Container>
        <Reveal>
          <Meta as="p" className="mb-6">
            02 / AELAY
          </Meta>

          <AnimatedHeading lines={project.positioningLines} />

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
        </Reveal>

        <Reveal>
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
        </Reveal>

        <Reveal>
          <Meta as="h2" className="mb-4 mt-16">
            02 — Preview
          </Meta>
          <ProjectPreviewGallery modules={project.modules} />
        </Reveal>

        {project.flow && (
          <Reveal>
            <Meta as="h2" className="mb-4 mt-16">
              03 — Content Flow
            </Meta>
            <ProjectFlowDiagram steps={project.flow} animated />
          </Reveal>
        )}

        <MoreProducts currentSlug="aelay" />
      </Container>
    </article>
  )
}
