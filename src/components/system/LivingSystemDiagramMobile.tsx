import { Link } from 'react-router'
import type { DiagramGraph, ProjectNode, RailNode, SkillNode } from '../../data/livingSystemGraph'
import { Meta } from '../typography'

interface LivingSystemDiagramMobileProps {
  graph: DiagramGraph
}

/** Below 768px, the orthogonal SVG/grid layout is replaced — not scaled —
 * by a simple stacked list reusing ProjectFlowDiagram's proven ↓-connector,
 * bordered-chip style: hub → skill chips → each project as a card listing
 * its real category/status/shared-module rails. Same `buildDiagramGraph()`
 * data as the desktop renderer, just laid out for a narrow viewport. */
export function LivingSystemDiagramMobile({ graph }: LivingSystemDiagramMobileProps) {
  const skills = graph.nodes.filter((node): node is SkillNode => node.kind === 'skill')
  const projects = graph.nodes.filter((node): node is ProjectNode => node.kind === 'project')

  // Only module rails — the category rail would just repeat the
  // `project.category` tag already rendered alongside it.
  function moduleRailsFor(projectId: string): RailNode[] {
    return graph.edges
      .filter((edge) => edge.from === projectId)
      .map((edge) => graph.nodes.find((node) => node.id === edge.to))
      .filter((node): node is RailNode => node?.kind === 'rail' && node.railKind === 'module')
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-2">
        <Meta as="span" className="border border-border px-4 py-2 text-fg">
          SYSTEM CORE
        </Meta>
        <span aria-hidden="true" className="pl-4 text-fg-muted">
          ↓
        </span>
      </div>

      <ul className="flex flex-wrap gap-2" aria-label="Core skills">
        {skills.map((skill) => (
          <li key={skill.id}>
            <Meta as="span" className="border border-border px-3 py-1 text-fg">
              {skill.label}
            </Meta>
          </li>
        ))}
      </ul>

      <ol className="flex flex-col gap-4" aria-label="Projects">
        {projects.map((project) => (
          <li key={project.id} className="border border-border p-4">
            <Meta
              as={Link}
              to={`/products/${project.slug}`}
              className="text-fg transition-colors hover:text-accent"
            >
              {project.label}
            </Meta>
            <div className="mt-3 flex flex-wrap gap-2">
              <Meta as="span" className="border border-border px-2 py-1">
                {project.category.toUpperCase()}
              </Meta>
              <Meta as="span" className="border border-border px-2 py-1">
                {project.status.toUpperCase()}
              </Meta>
              {moduleRailsFor(project.id).map((rail) => (
                <Meta key={rail.id} as="span" className="border border-border px-2 py-1">
                  {rail.label}
                </Meta>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
