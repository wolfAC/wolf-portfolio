import { useEffect, type RefObject } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

interface UsePointerOptions {
  enabled: boolean
}

/** Normalized (-1..1) cursor position relative to `ref`, spring-smoothed. */
export function usePointer(
  ref: RefObject<HTMLElement | null>,
  { enabled }: UsePointerOptions,
) {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 60, damping: 20, mass: 0.5 })
  const y = useSpring(rawY, { stiffness: 60, damping: 20, mass: 0.5 })

  useEffect(() => {
    const node = ref.current
    if (!enabled || !node) return

    let frame = 0
    let latestEvent: PointerEvent | null = null

    function flush() {
      frame = 0
      if (!latestEvent || !node) return
      const rect = node.getBoundingClientRect()
      rawX.set(((latestEvent.clientX - rect.left) / rect.width) * 2 - 1)
      rawY.set(((latestEvent.clientY - rect.top) / rect.height) * 2 - 1)
    }

    function handlePointerMove(event: PointerEvent) {
      latestEvent = event
      if (!frame) frame = requestAnimationFrame(flush)
    }

    node.addEventListener('pointermove', handlePointerMove)
    return () => {
      node.removeEventListener('pointermove', handlePointerMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ref, enabled, rawX, rawY])

  return { x, y }
}
