import { useParams } from 'react-router'
import { getProjectBySlug } from '../data/projects'
import { SectionShell } from '../components/layout/SectionShell'
import { Body, Meta } from '../components/typography'
import { AnimatedHeading } from '../components/motion/AnimatedHeading'
import { ProjectPreviewGallery } from '../components/products/ProjectPreviewGallery'
import { ProjectFlowDiagram } from '../components/products/ProjectFlowDiagram'
import { ProjectSystemsGrid } from '../components/products/ProjectSystemsGrid'
import { ProgressBar } from '../components/ui/ProgressBar'
import { MoreProducts } from '../components/products/MoreProducts'
import { Reveal } from '../components/motion/Reveal'

export function ProductDetailPage() {
  const { slug } = useParams()
  const project = slug ? getProjectBySlug(slug) : undefined

  if (!project) {
    return (
      <SectionShell index="02" title="PRODUCTS" eyebrowAs="p">
        <AnimatedHeading lines={['NOT FOUND']} />
        <Body className="mt-6">No product matches &ldquo;{slug}&rdquo;.</Body>
      </SectionShell>
    )
  }

  return (
    <SectionShell index="02" title={project.name} eyebrowAs="p">
      <Reveal>
        <AnimatedHeading lines={project.positioningLines} />

        <Body className="mt-6 max-w-2xl">{project.summary}</Body>

        <dl className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3">
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

      {project.modules.length > 0 && (
        <Reveal>
          <Meta as="h2" className="mb-4 mt-16">
            Preview
          </Meta>
          <ProjectPreviewGallery modules={project.modules} />
        </Reveal>
      )}

      {project.flow && (
        <Reveal>
          <Meta as="h2" className="mb-4 mt-16">
            Flow
          </Meta>
          <ProjectFlowDiagram steps={project.flow} />
        </Reveal>
      )}

      {project.systems && (
        <Reveal>
          <Meta as="h2" className="mb-4 mt-16">
            Systems
          </Meta>
          <ProjectSystemsGrid systems={project.systems} />
        </Reveal>
      )}

      {project.progress != null && (
        <Reveal>
          <Meta as="h2" className="mb-4 mt-16">
            Build progress
          </Meta>
          <div className="max-w-md">
            <ProgressBar
              value={project.progress}
              label={`${project.name} build progress`}
            />
          </div>
        </Reveal>
      )}

      {project.technologies.length > 0 && (
        <Reveal>
          <Meta as="h2" className="mb-4 mt-16">
            Stack
          </Meta>
          <Body className="max-w-2xl">{project.technologies.join(' · ')}</Body>
        </Reveal>
      )}

      <Meta as="p" className="mt-16">
        Full case study — coming soon.
      </Meta>

      <MoreProducts currentSlug={project.slug} />
    </SectionShell>
  )
}
