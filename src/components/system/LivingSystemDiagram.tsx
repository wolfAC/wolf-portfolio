import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { m, useScroll, useTransform, type MotionValue } from 'framer-motion'
import {
  buildDiagramGraph,
  HUB_ID,
  type DiagramEdge,
  type DiagramGraph,
  type DiagramNode,
  type DiagramNodeKind,
  type ProjectNode,
  type RailNode,
  type SkillNode,
} from '../../data/livingSystemGraph'
import { Meta, Body } from '../typography'
import { FadeSwap } from '../motion/FadeSwap'
import { cn } from '../../lib/cn'
import { useIsDesktopViewport } from '../../hooks/useIsDesktopViewport'
import { LivingSystemDiagramMobile } from './LivingSystemDiagramMobile'

interface Position {
  x: number
  y: number
}

const TIER_X = { hub: 6, skill: 34, project: 64, rail: 94 } as const

/** Evenly spaces `count` rows between `top` and `bottom` (percent of the
 * 0–100 viewBox) — a single node is centered rather than pinned to `top`. */
function evenRows(count: number, top = 6, bottom = 94): number[] {
  if (count <= 1) return [50]
  const step = (bottom - top) / (count - 1)
  return Array.from({ length: count }, (_, i) => top + i * step)
}

/** Hand-authored 4-tier grid layout (hub → skills → projects → rails). The
 * graph is small and strictly layered (no back-edges, no tier-skipping), so
 * this is plain arithmetic rather than a layout algorithm/library. Rails
 * are positioned at the sorted centroid of their connected projects' rows,
 * then evenly spaced in that order — keeps a rail whose projects cluster
 * near the top (e.g. the Independent Product rail) above one whose
 * projects cluster lower (Client Product), rather than an arbitrary order. */
function buildPositions(graph: DiagramGraph): Map<string, Position> {
  const positions = new Map<string, Position>()
  positions.set(HUB_ID, { x: TIER_X.hub, y: 50 })

  const skills = graph.nodes.filter((node): node is SkillNode => node.kind === 'skill')
  evenRows(skills.length).forEach((y, i) => positions.set(skills[i].id, { x: TIER_X.skill, y }))

  const projects = graph.nodes.filter((node): node is ProjectNode => node.kind === 'project')
  evenRows(projects.length).forEach((y, i) =>
    positions.set(projects[i].id, { x: TIER_X.project, y }),
  )

  const rails = graph.nodes.filter((node): node is RailNode => node.kind === 'rail')
  const withCentroid = rails.map((rail) => {
    const connectedYs = graph.edges
      .filter((edge) => edge.to === rail.id)
      .map((edge) => positions.get(edge.from)?.y)
      .filter((y): y is number => y !== undefined)
    const centroid = connectedYs.reduce((sum, y) => sum + y, 0) / (connectedYs.length || 1)
    return { rail, centroid }
  })
  withCentroid.sort((a, b) => a.centroid - b.centroid)
  evenRows(withCentroid.length).forEach((y, i) =>
    positions.set(withCentroid[i].rail.id, { x: TIER_X.rail, y }),
  )

  return positions
}

/** The elbow bend x-coordinate for every edge, keyed by edge id.
 *
 * A naive shared midpoint (`(from.x + to.x) / 2` for every edge in a
 * tier-pair) looks fine for one edge in isolation, but breaks down the
 * moment several edges in the same tier-pair have *different* targets:
 * their vertical bend segments all sit on the same x and their y-ranges
 * overlap, visually chaining into what reads as one continuous trace
 * spanning every row — e.g. every project→rail edge would appear to run
 * from the first project down to the last, falsely implying every project
 * connects to every rail. (Confirmed by rendering it that way first.)
 *
 * Fix: give each *distinct target* in a tier-pair its own lane, ordered by
 * the target's row. Edges converging on the same target correctly share a
 * lane (that convergence is real); edges bound for different targets get
 * different lanes, so they never visually merge. */
function computeBendX(graph: DiagramGraph, positions: Map<string, Position>): Map<string, number> {
  const bendX = new Map<string, number>()
  const tierGroups = new Map<string, DiagramEdge[]>()

  for (const edge of graph.edges) {
    const from = positions.get(edge.from)
    const to = positions.get(edge.to)
    if (!from || !to) continue
    const key = `${from.x}->${to.x}`
    const group = tierGroups.get(key)
    if (group) group.push(edge)
    else tierGroups.set(key, [edge])
  }

  for (const [key, groupEdges] of tierGroups) {
    const [fromX, toX] = key.split('->').map(Number)
    const targetIds = Array.from(new Set(groupEdges.map((edge) => edge.to)))
    targetIds.sort((a, b) => (positions.get(a)?.y ?? 0) - (positions.get(b)?.y ?? 0))
    const laneCount = targetIds.length
    const laneOf = new Map(targetIds.map((id, i) => [id, (i + 1) / (laneCount + 1)]))
    for (const edge of groupEdges) {
      const fraction = laneOf.get(edge.to) ?? 0.5
      bendX.set(edge.id, fromX + (toX - fromX) * fraction)
    }
  }

  return bendX
}

/** Skill nodes point *to* their projects; rail nodes are pointed *at* by
 * their projects — this reads the graph in whichever direction applies. */
function getConnectedProjects(node: DiagramNode, graph: DiagramGraph): ProjectNode[] {
  const nodeIsSource = node.kind === 'skill'
  return graph.edges
    .filter((edge) => (nodeIsSource ? edge.from === node.id : edge.to === node.id))
    .map((edge) => graph.nodes.find((n) => n.id === (nodeIsSource ? edge.to : edge.from)))
    .filter((n): n is ProjectNode => n?.kind === 'project')
}

// Each edge's source tier gets its own slice of the diagram's scroll
// range, so the three waves (hub→skill, skill→project, project→rail)
// light up one after another rather than all at once. Small gaps between
// ranges give each wave a brief settle instead of blurring together.
const STAGE_RANGES: Partial<Record<DiagramNodeKind, [number, number]>> = {
  hub: [0, 0.3],
  skill: [0.35, 0.65],
  project: [0.7, 1],
}

interface Segments {
  seg1: number
  seg2: number
  seg3: number
  total: number
}

/** The 3 axis-aligned segment lengths of an elbow path
 * (`M x1 y1 L xMid y1 L xMid y2 L x2 y2`) — computed directly from the
 * endpoints, no `getTotalLength()` DOM call and no dependence on the SVG
 * `pathLength` attribute's normalization. See the plan doc for why: those
 * are the two mechanisms behind the dasharray reveal bugs hit earlier on
 * the splash screen's hannya mask, and this sidesteps both by construction
 * — a 3-segment axis-aligned polyline's length is exact, closed-form
 * arithmetic. */
function computeSegments(from: Position, xMid: number, to: Position): Segments {
  const seg1 = Math.abs(xMid - from.x)
  const seg2 = Math.abs(to.y - from.y)
  const seg3 = Math.abs(to.x - xMid)
  return { seg1, seg2, seg3, total: seg1 + seg2 + seg3 }
}

/** The point at fraction `t` (0–1) of the way along the same 3 segments —
 * used to position the small leading dot during an edge's reveal. */
function pointAtFraction(from: Position, xMid: number, to: Position, segments: Segments, t: number): Position {
  const { seg1, seg2, total } = segments
  const target = t * total
  if (target <= seg1) {
    const frac = seg1 === 0 ? 0 : target / seg1
    return { x: from.x + (xMid - from.x) * frac, y: from.y }
  }
  if (target <= seg1 + seg2) {
    const frac = seg2 === 0 ? 0 : (target - seg1) / seg2
    return { x: xMid, y: from.y + (to.y - from.y) * frac }
  }
  const seg3 = total - seg1 - seg2
  const frac = seg3 === 0 ? 0 : (target - seg1 - seg2) / seg3
  return { x: xMid + (to.x - xMid) * frac, y: to.y }
}

interface PulseEdgeProps {
  from: Position
  to: Position
  xMid: number
  stageRange: [number, number]
  scrollYProgress: MotionValue<number>
}

/** The scroll-linked "current traveling the trace": an amber overlay of
 * the same elbow path, revealed via manually-computed `stroke-dasharray`/
 * `stroke-dashoffset` (not Framer Motion's `pathLength` prop — see the
 * file-level note above), plus a small leading dot visible only while this
 * specific edge is mid-reveal. Its own component (not inlined in a
 * `.map()`) so its `useTransform` calls are hooks at a real component's
 * top level, one instance per edge. */
function PulseEdge({ from, to, xMid, stageRange, scrollYProgress }: PulseEdgeProps) {
  const segments = useMemo(() => computeSegments(from, xMid, to), [from, xMid, to])
  const edgeProgress = useTransform(scrollYProgress, stageRange, [0, 1], { clamp: true })
  const dashOffset = useTransform(edgeProgress, [0, 1], [segments.total, 0])
  const dotOpacity = useTransform(edgeProgress, [0, 0.02, 0.98, 1], [0, 1, 1, 0])
  const dotX = useTransform(edgeProgress, (t) => pointAtFraction(from, xMid, to, segments, t).x)
  const dotY = useTransform(edgeProgress, (t) => pointAtFraction(from, xMid, to, segments, t).y)

  if (segments.total === 0) return null

  return (
    <>
      <m.path
        d={`M ${from.x} ${from.y} L ${xMid} ${from.y} L ${xMid} ${to.y} L ${to.x} ${to.y}`}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="0.4"
        style={{ strokeDasharray: segments.total, strokeDashoffset: dashOffset }}
      />
      <m.circle r="0.7" fill="var(--color-accent)" style={{ cx: dotX, cy: dotY, opacity: dotOpacity }} />
    </>
  )
}

/** The Living System Diagram's desktop renderer: nodes are real, focusable
 * HTML elements (buttons/links) absolutely positioned from
 * `buildPositions()`; SVG draws only the right-angle ("PCB trace") edges
 * underneath (`pointer-events-none`, `aria-hidden`) — the same "SVG for
 * lines, real HTML for interaction" split already proven by
 * CarcaranSystemMap/SystemHub, generalized from a circular hub-and-spoke to
 * a 4-tier grid. The static cyan trace is always visible; `PulseEdge`
 * layers a scroll-linked amber reveal on top of it as the diagram scrolls
 * into view (sub-phase 1c). */
function DesktopDiagram({ graph }: { graph: DiagramGraph }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const positions = useMemo(() => buildPositions(graph), [graph])
  const bendX = useMemo(() => computeBendX(graph, positions), [graph, positions])
  const selected = graph.nodes.find((node) => node.id === selectedId)
  const connectedProjects = selected ? getConnectedProjects(selected, graph) : []

  const diagramRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: diagramRef,
    offset: ['start center', 'end center'],
  })

  return (
    <div>
      <div ref={diagramRef} className="relative mx-auto aspect-3/4 w-full max-w-3xl">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full text-cyan"
        >
          {graph.edges.map((edge) => {
            const from = positions.get(edge.from)
            const to = positions.get(edge.to)
            const xMid = bendX.get(edge.id)
            if (!from || !to || xMid === undefined) return null
            return (
              <g key={edge.id}>
                <path
                  d={`M ${from.x} ${from.y} L ${xMid} ${from.y} L ${xMid} ${to.y} L ${to.x} ${to.y}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.3"
                  opacity="0.5"
                />
                <circle cx={xMid} cy={from.y} r="0.5" fill="currentColor" opacity="0.7" />
                <circle cx={xMid} cy={to.y} r="0.5" fill="currentColor" opacity="0.7" />
              </g>
            )
          })}
          {graph.edges.map((edge) => {
            const from = positions.get(edge.from)
            const to = positions.get(edge.to)
            const xMid = bendX.get(edge.id)
            const sourceKind = graph.nodes.find((node) => node.id === edge.from)?.kind
            const stageRange = sourceKind ? STAGE_RANGES[sourceKind] : undefined
            if (!from || !to || xMid === undefined || !stageRange) return null
            return (
              <PulseEdge
                key={`pulse-${edge.id}`}
                from={from}
                to={to}
                xMid={xMid}
                stageRange={stageRange}
                scrollYProgress={scrollYProgress}
              />
            )
          })}
        </svg>

        {graph.nodes.map((node) => {
          const pos = positions.get(node.id)
          if (!pos) return null
          const style = { left: `${pos.x}%`, top: `${pos.y}%` }

          if (node.kind === 'hub') {
            return (
              <div
                key={node.id}
                style={style}
                data-debug-label="diagram-node--hub"
                data-cursor="node"
                className="absolute -translate-x-1/2 -translate-y-1/2 border border-border bg-bg-elevated px-4 py-3"
              >
                <Meta as="span">{node.label}</Meta>
              </div>
            )
          }

          if (node.kind === 'project') {
            return (
              <Link
                key={node.id}
                to={`/products/${node.slug}`}
                style={style}
                aria-label={`Project: ${node.label} — ${node.status}, ${node.category}`}
                data-debug-label={`diagram-node--${node.slug} (${node.status})`}
                data-cursor="node"
                className="absolute max-w-36 -translate-x-1/2 -translate-y-1/2 border border-border bg-bg px-3 py-2 text-center text-fg transition-colors hover:border-accent hover:text-accent"
              >
                <Meta as="span">{node.label}</Meta>
              </Link>
            )
          }

          const isSelected = node.id === selectedId
          const connectionCount = getConnectedProjects(node, graph).length
          // Rails always have >=2 connections by construction (see
          // buildDiagramGraph) — only skill nodes ever get the muted
          // "no real project uses this yet" treatment.
          const hasConnections = node.kind === 'rail' || connectionCount > 0
          const debugValue = node.kind === 'skill' ? node.techName : node.value
          const debugLabel = `diagram-node--${debugValue} (connections: ${connectionCount})`

          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelectedId(node.id)}
              aria-pressed={isSelected}
              aria-label={
                node.kind === 'skill' ? `Skill: ${node.label}` : `Shared trait: ${node.label}`
              }
              data-debug-label={debugLabel}
              data-cursor="node"
              style={style}
              className={cn(
                'absolute -translate-x-1/2 -translate-y-1/2 border bg-bg text-center transition-colors',
                node.kind === 'rail' ? 'px-2 py-1' : 'max-w-36 px-3 py-2',
                isSelected
                  ? 'border-accent text-accent'
                  : hasConnections
                    ? 'border-border text-fg hover:border-fg'
                    : 'border-border/60 text-fg-muted hover:border-fg-muted',
              )}
            >
              <Meta as="span">{node.label}</Meta>
            </button>
          )
        })}
      </div>

      <div aria-live="polite" className="mt-16 min-h-16 border-t border-border pt-8">
        <FadeSwap swapKey={selectedId ?? 'empty'}>
          {selected && (selected.kind === 'skill' || selected.kind === 'rail') ? (
            <>
              <Meta as="p" className="text-fg">
                {selected.label}
              </Meta>
              {connectedProjects.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-4">
                  {connectedProjects.map((project) => (
                    <li key={project.slug}>
                      <Meta
                        as={Link}
                        to={`/products/${project.slug}`}
                        className="text-fg transition-colors hover:text-accent"
                      >
                        {project.label}
                      </Meta>
                    </li>
                  ))}
                </ul>
              ) : (
                <Body className="mt-2 max-w-xl">Not yet used in a showcased project.</Body>
              )}
            </>
          ) : (
            <Body className="max-w-xl">
              Select a skill or shared trait to see where it connects. Click a project to open it.
            </Body>
          )}
        </FadeSwap>
      </div>
    </div>
  )
}

/** Replaces `/system`'s Technology Map with a real architecture-diagram
 * rendering of `buildDiagramGraph()`'s node/edge data — see
 * `audit/plan-redesign-phase-1b.md` for the full data-honesty audit of
 * which nodes/edges are real. Below 768px, mounts the stacked-list
 * `LivingSystemDiagramMobile` instead of the SVG/grid renderer — decided
 * once via `useIsDesktopViewport`, not CSS-hidden, so mobile never pays for
 * the desktop tree. */
export function LivingSystemDiagram() {
  const isDesktop = useIsDesktopViewport()
  const graph = useMemo(() => buildDiagramGraph(), [])

  if (!isDesktop) return <LivingSystemDiagramMobile graph={graph} />

  return <DesktopDiagram graph={graph} />
}
