import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMotionValue } from 'framer-motion'
import type { ReactNode } from 'react'
import { DebugModeContext } from './DebugModeContext'

/** Debug Mode's shared state — the first Context in this codebase (nothing
 * else needed cross-cutting state; everywhere so far has been prop/hook
 * driven). `enabled`/`toggle` are plain state (rare updates, fine to
 * re-render on). `fps`/`scrollPercent` are Framer Motion `MotionValue`s
 * updated imperatively inside a `requestAnimationFrame` loop that only
 * runs while `enabled` — matching the "gate anything continuous behind a
 * check, update imperatively" convention already used by `usePointer`/
 * `SpotlightCursor`/`HeroScene` — so no consumer re-renders 60×/sec just
 * because a number changed, and toggling off has zero ongoing cost. */
export function DebugModeProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const fps = useMotionValue(0)
  const scrollPercent = useMotionValue(0)

  const toggle = useCallback(() => setEnabled((prev) => !prev), [])

  // The one DOM side-effect this feature needs: index.css's
  // `[data-debug-label]` outline/label rule is keyed off this attribute,
  // since the diagram's nodes are three different element types
  // (div/Link/button) that would each need re-plumbing to accept a debug
  // wrapper component — a single global attribute + CSS rule reaches all
  // of them without touching their existing positioning.
  useEffect(() => {
    document.documentElement.dataset.debugMode = String(enabled)
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    let frameId = 0
    let frameCount = 0
    let lastSampleTime = performance.now()

    function loop(now: number) {
      frameCount += 1
      if (now - lastSampleTime >= 500) {
        fps.set(Math.round((frameCount * 1000) / (now - lastSampleTime)))
        frameCount = 0
        lastSampleTime = now
      }

      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      scrollPercent.set(scrollable > 0 ? Math.round((window.scrollY / scrollable) * 100) : 0)

      frameId = requestAnimationFrame(loop)
    }

    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [enabled, fps, scrollPercent])

  const value = useMemo(
    () => ({ enabled, toggle, fps, scrollPercent }),
    [enabled, toggle, fps, scrollPercent],
  )

  return <DebugModeContext.Provider value={value}>{children}</DebugModeContext.Provider>
}
