import { m, useTransform, type MotionValue } from 'framer-motion'

interface HeroCursorFieldProps {
  x: MotionValue<number>
  y: MotionValue<number>
  /** Scroll-linked drift, added on top of the cursor-driven offset — grows
   * as the user scrolls past the Hero, so the grid keeps drifting rather
   * than only reacting to the (now-departed) pointer. */
  scrollDrift: MotionValue<number>
}

export function HeroCursorField({ x, y, scrollDrift }: HeroCursorFieldProps) {
  const gridX = useTransform(x, (v) => v * 10)
  const cursorGridY = useTransform(y, (v) => v * 10)
  const gridY = useTransform<number, number>(
    [cursorGridY, scrollDrift],
    ([cursor, scroll]) => cursor + scroll,
  )

  return (
    <m.div
      aria-hidden="true"
      style={{
        x: gridX,
        y: gridY,
        // Fades the grid out near the bottom edge, matching HeroScene, so
        // ScrollCue's text isn't sitting on top of grid lines there.
        maskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
      }}
      // -z-10: same stacking fix as HeroScene — a plain absolute layer with
      // z-index:auto paints after non-positioned siblings regardless of DOM
      // order, which would otherwise sit on top of ScrollCue's text/arrow.
      className="pointer-events-none absolute inset-[-5%] -z-10 opacity-[0.06]"
    >
      <div
        className="h-full w-full"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-fg) 1px, transparent 1px), linear-gradient(90deg, var(--color-fg) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
    </m.div>
  )
}
