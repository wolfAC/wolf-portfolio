import { m } from 'framer-motion'
import type { ProjectFlowStep } from '../../data/projects'
import { Meta } from '../typography'

interface ProjectFlowDiagramProps {
  steps: ProjectFlowStep[]
  /** Reveal steps in a staggered sequence instead of all at once. */
  animated?: boolean
}

export function ProjectFlowDiagram({ steps, animated = false }: ProjectFlowDiagramProps) {
  return (
    <ol className="flex flex-col items-start gap-2">
      {steps.map((step, index) => {
        const content = (
          <>
            <Meta as="span" className="border border-border px-4 py-2 text-fg">
              {step.label}
            </Meta>
            {index < steps.length - 1 && (
              <span aria-hidden="true" className="pl-4 text-fg-muted">
                ↓
              </span>
            )}
          </>
        )

        if (!animated) {
          return (
            <li key={step.label} className="flex flex-col items-start gap-2">
              {content}
            </li>
          )
        }

        return (
          <m.li
            key={step.label}
            className="flex flex-col items-start gap-2"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.4, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            {content}
          </m.li>
        )
      })}
    </ol>
  )
}
