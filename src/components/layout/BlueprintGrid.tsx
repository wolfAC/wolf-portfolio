import { useDebugMode } from '../../context/DebugModeContext'

/** A fixed, page-wide hairline grid in Drafting Cyan — the "blueprint paper"
 * the whole site sits on. Two layered grids — minor 16px cells (faint) and
 * major 96px cells (matching the Living Diagram's grid unit, slightly
 * stronger) — at a near-invisible ambient opacity overall, in the same
 * range as the existing grain texture's 0.035 (see `body::after` in
 * index.css), so the two textures read as one consistent "paper" quality
 * rather than competing.
 *
 * Debug Mode makes the grid fully visible instead of ambient — the spec's
 * "reveal the internals" moment is literally seeing the full drafting
 * grid.
 *
 * `-z-10`: same stacking fix already used by HeroScene/HeroCursorField in
 * this codebase — a fixed/absolute layer with z-index:auto paints *after*
 * non-positioned in-flow siblings regardless of DOM order, which would
 * otherwise put this grid on top of the nav/page content instead of behind
 * it. Two separate layers (rather than one element with 4 background-image
 * gradients) because each needs its own opacity — a single element can't
 * vary opacity per background-image layer. */
export function BlueprintGrid() {
  const { enabled } = useDebugMode()

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: enabled ? 0.35 : 0.03,
          backgroundImage: [
            'linear-gradient(var(--color-cyan) 1px, transparent 1px)',
            'linear-gradient(90deg, var(--color-cyan) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '16px 16px',
        }}
      />
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: enabled ? 0.55 : 0.07,
          backgroundImage: [
            'linear-gradient(var(--color-cyan) 1px, transparent 1px)',
            'linear-gradient(90deg, var(--color-cyan) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '96px 96px',
        }}
      />
    </div>
  )
}
