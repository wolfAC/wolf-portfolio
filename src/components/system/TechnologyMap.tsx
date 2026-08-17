import { useState } from 'react'
import { Link } from 'react-router'
import { projects, type Project } from '../../data/projects'
import { buildReverseIndex } from '../../lib/buildReverseIndex'
import { Meta, Body } from '../typography'
import { FadeSwap } from '../motion/FadeSwap'
import { cn } from '../../lib/cn'

interface TechEntry {
  technology: string
  projects: Project[]
}

function buildTechMap(): TechEntry[] {
  const map = buildReverseIndex(projects, (project) => project.technologies)
  return Array.from(map.entries()).map(([technology, usedBy]) => ({
    technology,
    projects: usedBy,
  }))
}

export function TechnologyMap() {
  const entries = buildTechMap()
  const [selectedTech, setSelectedTech] = useState<string | null>(null)
  const selected = entries.find((entry) => entry.technology === selectedTech)

  if (entries.length === 0) return null

  return (
    <div>
      <ul className="flex flex-wrap gap-2">
        {entries.map((entry) => {
          const isSelected = entry.technology === selectedTech
          return (
            <li key={entry.technology}>
              <button
                type="button"
                onClick={() => setSelectedTech(entry.technology)}
                aria-pressed={isSelected}
                className={cn(
                  'border px-3 py-1 transition-colors',
                  isSelected
                    ? 'border-accent text-accent'
                    : 'border-border text-fg hover:border-fg',
                )}
              >
                <Meta as="span">{entry.technology}</Meta>
              </button>
            </li>
          )
        })}
      </ul>

      <div aria-live="polite" className="mt-8 min-h-16 border-t border-border pt-8">
        <FadeSwap swapKey={selectedTech ?? 'empty'}>
          {selected ? (
            <>
              <Meta as="p" className="text-fg">
                {selected.technology}
              </Meta>
              <ul className="mt-2 flex flex-wrap gap-4">
                {selected.projects.map((project) => (
                  <li key={project.slug}>
                    <Meta
                      as={Link}
                      to={`/products/${project.slug}`}
                      className="text-fg transition-colors hover:text-accent"
                    >
                      {project.name}
                    </Meta>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <Body className="max-w-xl">Select a technology to see where it&apos;s used.</Body>
          )}
        </FadeSwap>
      </div>
    </div>
  )
}
