import { useEffect, useState } from 'react'
import { useLowPowerDevice } from '../../hooks/useLowPowerDevice'

/** Drives the site-wide cursor "spotlight" text effect. On every
 * rAF-throttled pointermove, computes each `.spotlight-text` element's own
 * cursor-relative offset via getBoundingClientRect — local per-element math,
 * not a shared viewport-fixed gradient — so it's correct regardless of how
 * Lenis implements smooth scroll under the hood. Gated behind pointer:fine +
 * !useLowPowerDevice, matching the Hero/CustomCursor convention: this is the
 * one place on the site that touches every piece of text each frame, so
 * that gate matters most here. */
export function SpotlightCursor() {
  const [pointerFine] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches,
  )
  const lowPowerDevice = useLowPowerDevice()
  const enabled = pointerFine && !lowPowerDevice

  useEffect(() => {
    if (!enabled) return

    let frame = 0
    let latestEvent: PointerEvent | null = null

    function flush() {
      frame = 0
      if (!latestEvent) return
      const x = latestEvent.clientX
      const y = latestEvent.clientY
      const elements = document.querySelectorAll<HTMLElement>('.spotlight-text')
      for (const el of elements) {
        const rect = el.getBoundingClientRect()
        el.style.setProperty('--spotlight-x', `${x - rect.left}px`)
        el.style.setProperty('--spotlight-y', `${y - rect.top}px`)
      }
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
  }, [enabled])

  return null
}
