import { Container } from '../layout/Container'
import { DraftingMark } from '../layout/DraftingMark'
import { Reveal } from '../motion/Reveal'
import { SectionTitle, Meta, Body } from '../typography'
import { ProgressBar } from '../ui/ProgressBar'
import { getFeaturedProject } from '../../data/projects'

export function CurrentlyBuilding() {
  const project = getFeaturedProject()
  if (!project) return null

  return (
    <section className="relative border-t border-border py-section-y">
      <DraftingMark />
      <Container>
        <Reveal>
          <Meta as="h2">Currently building</Meta>

          <SectionTitle as="h3" className="mt-4">
            {project.name}
          </SectionTitle>

          <Body className="mt-2 max-w-xl">{project.tagline}</Body>

          <div className="mt-8 max-w-md">
            <ProgressBar
              value={project.progress ?? 0}
              label={`${project.name} build progress`}
            />
          </div>

          <ul className="mt-8 flex flex-wrap gap-3">
            {(project.highlightModules ?? project.modules).map((module) => (
              <li key={module}>
                <Meta as="span" className="border border-border px-3 py-1">
                  {module}
                </Meta>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  )
}
