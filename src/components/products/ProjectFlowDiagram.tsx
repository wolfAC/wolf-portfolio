import type { ProjectFlowStep } from '../../data/projects'
import { Meta } from '../typography'

interface ProjectFlowDiagramProps {
  steps: ProjectFlowStep[]
}

export function ProjectFlowDiagram({ steps }: ProjectFlowDiagramProps) {
  return (
    <ol className="flex flex-col items-start gap-2">
      {steps.map((step, index) => (
        <li key={step.label} className="flex flex-col items-start gap-2">
          <Meta as="span" className="border border-border px-4 py-2 text-fg">
            {step.label}
          </Meta>
          {index < steps.length - 1 && (
            <span aria-hidden="true" className="pl-4 text-fg-muted">
              ↓
            </span>
          )}
        </li>
      ))}
    </ol>
  )
}
