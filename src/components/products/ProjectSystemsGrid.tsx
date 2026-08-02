import type { ProjectSystemNode } from '../../data/projects'
import { Meta, Body } from '../typography'

interface ProjectSystemsGridProps {
  systems: ProjectSystemNode[]
}

export function ProjectSystemsGrid({ systems }: ProjectSystemsGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {systems.map((system) => (
        <li key={system.id} className="border border-border bg-bg-elevated p-6">
          <Meta as="p" className="text-fg">
            {system.label}
          </Meta>
          {system.role && <Body className="mt-2">{system.role}</Body>}
        </li>
      ))}
    </ul>
  )
}
