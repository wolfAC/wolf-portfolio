import { useEffect } from 'react'
import { useMotionValue, useSpring } from 'framer-motion'

interface UseWindowPointerOptions {
  enabled: boolean
}

/** Viewport-wide raw cursor position (in px), spring-smoothed. */
export function useWindowPointer({ enabled }: UseWindowPointerOptions) {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 300, damping: 30, mass: 0.4 })
  const y = useSpring(rawY, { stiffness: 300, damping: 30, mass: 0.4 })

  useEffect(() => {
    if (!enabled) return

    let frame = 0
    let latestEvent: PointerEvent | null = null

    function flush() {
      frame = 0
      if (!latestEvent) return
      rawX.set(latestEvent.clientX)
      rawY.set(latestEvent.clientY)
    }

    function handlePointerMove(event: PointerEvent) {
      latestEvent = event
      if (!frame) frame = requestAnimationFrame(flush)
    }

    window.addEventListener('pointermove', handlePointerMove)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [enabled, rawX, rawY])

  return { x, y }
}
