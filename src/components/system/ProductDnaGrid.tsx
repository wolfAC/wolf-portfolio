import { useState } from 'react'
import { Link } from 'react-router'
import { productDna } from '../../data/system'
import { getProjectBySlug } from '../../data/projects'
import { Meta, Body } from '../typography'
import { cn } from '../../lib/cn'

export function ProductDnaGrid() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = productDna.find((item) => item.id === selectedId)
  const selectedProject = selected?.projectSlug
    ? getProjectBySlug(selected.projectSlug)
    : undefined

  return (
    <div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {productDna.map((item, index) => {
          const isSelected = item.id === selectedId
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelectedId(item.id)}
                aria-pressed={isSelected}
                className={cn(
                  'w-full border px-4 py-3 text-left transition-colors',
                  isSelected
                    ? 'border-accent text-accent'
                    : 'border-border text-fg hover:border-fg',
                )}
              >
                <Meta as="span">
                  {String(index + 1).padStart(2, '0')} {item.label}
                </Meta>
              </button>
            </li>
          )
        })}
      </ul>

      <div aria-live="polite" className="mt-8 min-h-24 border-t border-border pt-8">
        {selected ? (
          <>
            <Meta as="p" className="text-fg">
              {selected.label}
            </Meta>
            <Body className="mt-2 max-w-xl">{selected.description}</Body>

            {selected.technologies && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {selected.technologies.map((tech) => (
                  <li key={tech}>
                    <Meta as="span" className="border border-border px-3 py-1">
                      {tech}
                    </Meta>
                  </li>
                ))}
              </ul>
            )}

            {selectedProject && (
              <Meta
                as={Link}
                to={`/products/${selectedProject.slug}`}
                className="mt-4 inline-block text-fg transition-colors hover:text-accent"
              >
                Used in {selectedProject.name}
              </Meta>
            )}
          </>
        ) : (
          <Body className="max-w-xl">Select a principle to learn more.</Body>
        )}
      </div>
    </div>
  )
}
