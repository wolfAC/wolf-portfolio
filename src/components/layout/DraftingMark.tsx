import { Meta } from '../typography'

interface DraftingMarkProps {
  /** Hand-authored per call site, e.g. "C" — same authorship level as
   * SectionShell's existing hand-picked `index`/`title` eyebrow, decorative
   * chrome rather than a claim about real revision history. Omit to render
   * only the corner registration cross, no REV stamp. */
  rev?: string
}

/** A small corner registration cross (drafting-sheet alignment mark) and an
 * optional "REV X" stamp — the per-section chrome that ties every section
 * back to the blueprint/drafting-sheet visual language. Purely decorative:
 * `pointer-events-none` and `aria-hidden` so it never intercepts clicks or
 * gets announced to screen readers. Expects a `relative` ancestor. */
export function DraftingMark({ rev }: DraftingMarkProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <svg
        viewBox="0 0 16 16"
        className="absolute left-2 top-2 size-4 text-cyan opacity-40"
      >
        <path d="M8 2 V6 M8 10 V14 M2 8 H6 M10 8 H14" stroke="currentColor" strokeWidth="1" />
      </svg>
      {rev ? (
        <Meta as="span" className="absolute right-2 top-2 text-cyan opacity-40">
          REV {rev}
        </Meta>
      ) : null}
    </div>
  )
}
