import type { ProjectSystemNode } from '../../data/projects'
import { Meta, Body } from '../typography'

interface ProjectSystemsGridProps {
  systems: ProjectSystemNode[]
}

export function ProjectSystemsGrid({ systems }: ProjectSystemsGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {systems.map((system) => (
        <li
          key={system.id}
          className="border border-border bg-bg-elevated p-6 transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-fg hover:glow-accent motion-reduce:hover:translate-y-0"
        >
          <Meta as="p" className="text-fg">
            {system.label}
          </Meta>
          {system.role && <Body className="mt-2">{system.role}</Body>}
        </li>
      ))}
    </ul>
  )
}
