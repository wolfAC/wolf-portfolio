import { useState } from 'react'
import { Body, Meta } from '../typography'
import { FadeSwap } from '../motion/FadeSwap'
import { cn } from '../../lib/cn'

export interface SystemHubNode {
  id: string
  label: string
}

interface SystemHubProps {
  nodes: SystemHubNode[]
  centerLabel: string
}

const RADIUS = 40

/** Evenly spaces `total` nodes around a circle, starting at 12 o'clock —
 * generalizes CarcaranSystemMap's hardcoded 4-corner POSITIONS map to any
 * node count. */
function getPosition(index: number, total: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2
  return {
    x: 50 + RADIUS * Math.cos(angle),
    y: 50 + RADIUS * Math.sin(angle),
  }
}

/** Generalized hub-and-spoke system map — the pattern CarcaranSystemMap
 * proved out, for products whose modules read better as nodes radiating
 * from a central product than a fixed layout. Unlike Carcaran (which has
 * real per-system copy from the resume), selecting a node here only
 * highlights it; it never synthesizes a description, so it only ever
 * shows real data (the node's own label). */
export function SystemHub({ nodes, centerLabel }: SystemHubProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = nodes.find((node) => node.id === selectedId)

  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-lg">
        <svg
          viewBox="0 0 100 100"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full text-border"
        >
          {nodes.map((node, index) => {
            const pos = getPosition(index, nodes.length)
            return (
              <line
                key={node.id}
                x1="50"
                y1="50"
                x2={pos.x}
                y2={pos.y}
                stroke="currentColor"
                strokeWidth="0.5"
              />
            )
          })}
        </svg>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-border bg-bg-elevated px-4 py-3">
          <Meta as="span">{centerLabel}</Meta>
        </div>

        {nodes.map((node, index) => {
          const pos = getPosition(index, nodes.length)
          const isSelected = node.id === selectedId
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelectedId(node.id)}
              aria-pressed={isSelected}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className={cn(
                'absolute max-w-[8rem] -translate-x-1/2 -translate-y-1/2 border bg-bg px-4 py-2 text-center transition-colors',
                isSelected
                  ? 'border-accent text-accent'
                  : 'border-border text-fg hover:border-fg',
              )}
            >
              <Meta as="span">{node.label}</Meta>
            </button>
          )
        })}
      </div>

      <div aria-live="polite" className="mt-16 min-h-16 border-t border-border pt-8 text-center">
        <FadeSwap swapKey={selectedId ?? 'empty'} className="flex justify-center">
          {selected ? (
            <Body className="text-fg">{selected.label}</Body>
          ) : (
            <Body>Select a module to highlight it.</Body>
          )}
        </FadeSwap>
      </div>
    </div>
  )
}
