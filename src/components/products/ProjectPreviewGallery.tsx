import { Meta } from '../typography'
import { cn } from '../../lib/cn'

interface ProjectPreviewGalleryProps {
  /** One preview card is rendered per module — e.g. project.modules. */
  modules: string[]
  className?: string
}

/** Small deterministic hash so each module gets a stable, distinct-looking
 * skeleton instead of every card rendering identical bars. */
function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function buildSkeleton(module: string) {
  const hash = hashString(module)
  return {
    headingWidth: 45 + (hash % 25),
    lineWidths: [0, 1].map((i) => 55 + ((hash >> (i * 4 + 3)) % 35)),
    accentWidth: 25 + (hash % 20),
  }
}

/** Every product still lacks real screenshots, so instead of a placeholder
 * box this renders an abstract wireframe per module — a stand-in "screen"
 * that reads as an intentional design choice rather than a coming-soon
 * empty state. */
export function ProjectPreviewGallery({ modules, className }: ProjectPreviewGalleryProps) {
  if (modules.length === 0) return null

  return (
    <ul
      className={cn(
        'flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4',
        className,
      )}
    >
      {modules.map((module, index) => {
        const { headingWidth, lineWidths, accentWidth } = buildSkeleton(module)

        return (
          <li
            key={module}
            className="flex aspect-video w-[min(80vw,420px)] flex-none snap-start flex-col justify-between border border-border bg-bg-elevated p-6 transition-colors hover:border-fg"
          >
            <Meta as="span">
              {String(index + 1).padStart(2, '0')} / {module}
            </Meta>

            <div aria-hidden="true" className="flex flex-col gap-2">
              <span
                className="h-3 bg-fg-muted/30"
                style={{ width: `${headingWidth}%` }}
              />
              {lineWidths.map((width, lineIndex) => (
                <span
                  key={lineIndex}
                  className="h-2 bg-border"
                  style={{ width: `${width}%` }}
                />
              ))}
              <span
                className="mt-2 h-2 border-t-2 border-accent"
                style={{ width: `${accentWidth}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
