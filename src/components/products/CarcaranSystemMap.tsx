import { useState } from 'react'
import type { ProjectSystemNode } from '../../data/projects'
import { Meta, Body } from '../typography'
import { cn } from '../../lib/cn'

interface CarcaranSystemMapProps {
  systems: ProjectSystemNode[]
}

const POSITIONS: Record<string, { x: number; y: number }> = {
  admin: { x: 50, y: 12 },
  user: { x: 12, y: 50 },
  dealer: { x: 88, y: 50 },
  drm: { x: 50, y: 88 },
}

export function CarcaranSystemMap({ systems }: CarcaranSystemMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = systems.find((system) => system.id === selectedId)

  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-md">
        <svg
          viewBox="0 0 100 100"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full text-border"
        >
          {systems.map((system) => {
            const pos = POSITIONS[system.id]
            if (!pos) return null
            return (
              <line
                key={system.id}
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
          <Meta as="span">CORE</Meta>
        </div>

        {systems.map((system) => {
          const pos = POSITIONS[system.id]
          if (!pos) return null
          const isSelected = system.id === selectedId
          return (
            <button
              key={system.id}
              type="button"
              onClick={() => setSelectedId(system.id)}
              aria-pressed={isSelected}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              className={cn(
                'absolute -translate-x-1/2 -translate-y-1/2 border bg-bg px-4 py-2 transition-colors',
                isSelected
                  ? 'border-accent text-accent'
                  : 'border-border text-fg hover:border-fg',
              )}
            >
              <Meta as="span">{system.label}</Meta>
            </button>
          )
        })}
      </div>

      <div aria-live="polite" className="mt-16 min-h-24 border-t border-border pt-8">
        {selected ? (
          <>
            <Meta as="p" className="text-fg">
              {selected.label}
            </Meta>
            <Body className="mt-2 max-w-xl">
              {selected.role ?? 'Detailed system breakdown — coming soon.'}
            </Body>
          </>
        ) : (
          <Body className="max-w-xl">Select a system to learn more.</Body>
        )}
      </div>
    </div>
  )
}
