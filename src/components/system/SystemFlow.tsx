import { useState } from 'react'
import { systemFlow } from '../../data/system'
import { Meta, Body } from '../typography'
import { cn } from '../../lib/cn'

export function SystemFlow() {
  const [selectedId, setSelectedId] = useState(systemFlow[0].id)
  const selected = systemFlow.find((stage) => stage.id === selectedId)

  return (
    <div>
      <ol className="flex flex-wrap gap-2">
        {systemFlow.map((stage) => {
          const isSelected = stage.id === selectedId
          return (
            <li key={stage.id}>
              <button
                type="button"
                onClick={() => setSelectedId(stage.id)}
                aria-pressed={isSelected}
                className={cn(
                  'border px-4 py-2 transition-colors',
                  isSelected
                    ? 'border-accent text-accent'
                    : 'border-border text-fg hover:border-fg',
                )}
              >
                <Meta as="span">{stage.label}</Meta>
              </button>
            </li>
          )
        })}
      </ol>

      <div aria-live="polite" className="mt-8 min-h-16 border-t border-border pt-8">
        {selected && (
          <>
            <Meta as="p" className="text-fg">
              {selected.label}
            </Meta>
            <Body className="mt-2 max-w-xl">{selected.description}</Body>
          </>
        )}
      </div>
    </div>
  )
}
