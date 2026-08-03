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
      style={{ x: gridX, y: gridY }}
      className="pointer-events-none absolute inset-[-5%] opacity-[0.06]"
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
