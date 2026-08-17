import { projects, type ProjectStatus } from './projects'
import { site } from './site'
import { buildReverseIndex } from '../lib/buildReverseIndex'

export type DiagramNodeKind = 'hub' | 'skill' | 'project' | 'rail'

interface BaseNode {
  id: string
  kind: DiagramNodeKind
  label: string
}

export interface HubNode extends BaseNode {
  kind: 'hub'
}

export interface SkillNode extends BaseNode {
  kind: 'skill'
  techName: string
}

export interface ProjectNode extends BaseNode {
  kind: 'project'
  slug: string
  category: string
  status: ProjectStatus
}

export interface RailNode extends BaseNode {
  kind: 'rail'
  railKind: 'category' | 'module'
  value: string
}

export type DiagramNode = HubNode | SkillNode | ProjectNode | RailNode

export interface DiagramEdge {
  id: string
  from: string
  to: string
}

export interface DiagramGraph {
  nodes: DiagramNode[]
  edges: DiagramEdge[]
}

export const HUB_ID = 'hub'

export function skillId(tech: string) {
  return `skill:${tech}`
}
export function projectId(slug: string) {
  return `project:${slug}`
}
export function categoryRailId(category: string) {
  return `rail:category:${category}`
}
export function moduleRailId(module: string) {
  return `rail:module:${module}`
}

/** Builds the Living System Diagram's node/edge graph entirely from real
 * site data — `site.coreStack` (skills) and `projects[]` (projects,
 * categories, modules) — with every edge derived by exact-string matching,
 * never hand-listed or invented. See
 * `audit/plan-redesign-phase-1b.md` for the full audit of what's real:
 * only 3 skill→project edges exist today (React↔Pulse, Next.js↔Pulse,
 * Next.js↔Ninto) because only Pulse and Ninto currently declare any
 * `technologies[]` that match `coreStack` — Node.js/Electron/Express.js
 * stay real, connection-less leaf nodes rather than being padded out with
 * fabricated edges. */
export function buildDiagramGraph(): DiagramGraph {
  const nodes: DiagramNode[] = []
  const edges: DiagramEdge[] = []

  nodes.push({ id: HUB_ID, kind: 'hub', label: 'SYSTEM CORE' })

  for (const tech of site.coreStack) {
    nodes.push({ id: skillId(tech), kind: 'skill', label: tech, techName: tech })
    edges.push({ id: `${HUB_ID}->${skillId(tech)}`, from: HUB_ID, to: skillId(tech) })
  }

  for (const project of projects) {
    nodes.push({
      id: projectId(project.slug),
      kind: 'project',
      label: project.name,
      slug: project.slug,
      category: project.category,
      status: project.status,
    })
  }

  // skill -> project: exact-match reverse index of coreStack against every
  // project's technologies[] — reuses the same helper TechnologyMap uses.
  const techToProjects = buildReverseIndex(projects, (project) => project.technologies)
  for (const tech of site.coreStack) {
    for (const project of techToProjects.get(tech) ?? []) {
      edges.push({
        id: `${skillId(tech)}->${projectId(project.slug)}`,
        from: skillId(tech),
        to: projectId(project.slug),
      })
    }
  }

  // project -> category rail: every project has a real category, so every
  // project gets exactly one of these edges.
  const categories = Array.from(new Set(projects.map((project) => project.category)))
  for (const category of categories) {
    nodes.push({
      id: categoryRailId(category),
      kind: 'rail',
      railKind: 'category',
      label: category.toUpperCase(),
      value: category,
    })
  }
  for (const project of projects) {
    edges.push({
      id: `${projectId(project.slug)}->${categoryRailId(project.category)}`,
      from: projectId(project.slug),
      to: categoryRailId(project.category),
    })
  }

  // project -> module rail: only modules shared by 2+ projects (exact
  // string match, no fuzzy matching — "ADMIN" and "ADMIN DASHBOARD" are
  // deliberately treated as unrelated).
  const moduleToProjects = buildReverseIndex(projects, (project) => project.modules)
  for (const [module, matchingProjects] of moduleToProjects) {
    if (matchingProjects.length < 2) continue
    nodes.push({
      id: moduleRailId(module),
      kind: 'rail',
      railKind: 'module',
      label: module,
      value: module,
    })
    for (const project of matchingProjects) {
      edges.push({
        id: `${projectId(project.slug)}->${moduleRailId(module)}`,
        from: projectId(project.slug),
        to: moduleRailId(module),
      })
    }
  }

  return { nodes, edges }
}
