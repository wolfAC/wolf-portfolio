import { Meta } from '../typography'
import { cn } from '../../lib/cn'

interface ProjectPreviewGalleryProps {
  /** One preview tile is rendered per module — e.g. project.modules. */
  modules: string[]
  className?: string
}

/** Small deterministic hash so each module gets a stable, distinct-looking
 * cover instead of every tile rendering identical art. */
function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const LINE_COUNT = 4

/** Hash-seeded gradient angle + a small set of abstract line segments —
 * every module gets a stable, distinct "cover" with zero fabricated content. */
function buildCover(module: string) {
  const hash = hashString(module)
  const angle = hash % 360
  const lines = Array.from({ length: LINE_COUNT }, (_, i) => {
    const seed = hash >> (i * 6)
    return {
      x1: seed % 100,
      y1: (seed >> 2) % 100,
      x2: (seed >> 4) % 100,
      y2: (seed >> 6) % 100,
    }
  })
  return { angle, lines }
}

/** Every product still lacks real screenshots, so instead of a fake mockup
 * this renders a generative abstract cover per module — a stable, hash-seeded
 * gradient + line arrangement that reads as an intentional design choice
 * rather than a coming-soon empty state. */
export function ProjectPreviewGallery({ modules, className }: ProjectPreviewGalleryProps) {
  if (modules.length === 0) return null

  return (
    <ul
      // This is a horizontally-scrollable region; tabIndex is required for
      // keyboard users (esp. Safari) to scroll it, per axe's
      // scrollable-region-focusable rule.
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      aria-label="Module previews"
      className={cn(
        'flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4',
        className,
      )}
    >
      {modules.map((module, index) => {
        const { angle, lines } = buildCover(module)

        return (
          <li
            key={module}
            className="group relative flex aspect-video w-[min(80vw,420px)] flex-none snap-start flex-col justify-between overflow-hidden border border-border p-6 transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:border-fg hover:glow-accent motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
            style={{
              backgroundImage: `linear-gradient(${angle}deg, var(--color-bg-elevated), var(--color-bg))`,
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-40 transition-opacity duration-300 group-hover:opacity-70"
            >
              {lines.map((line, lineIndex) => (
                <line
                  key={lineIndex}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke={lineIndex === 0 ? 'var(--color-accent)' : 'var(--color-border)'}
                  strokeWidth={lineIndex === 0 ? 0.6 : 0.4}
                />
              ))}
            </svg>

            <Meta as="span" className="relative text-fg">
              {String(index + 1).padStart(2, '0')} / {module}
            </Meta>

            <span aria-hidden="true" className="relative h-px w-10 bg-accent" />
          </li>
        )
      })}
    </ul>
  )
}
