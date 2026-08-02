import { motion, useTransform, type MotionValue } from 'framer-motion'

interface HeroCursorFieldProps {
  x: MotionValue<number>
  y: MotionValue<number>
}

export function HeroCursorField({ x, y }: HeroCursorFieldProps) {
  const gridX = useTransform(x, (v) => v * 10)
  const gridY = useTransform(y, (v) => v * 10)

  return (
    <motion.div
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
    </motion.div>
  )
}
