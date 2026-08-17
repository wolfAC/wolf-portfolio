import { useState } from 'react'

const BREAKPOINT = '(min-width: 768px)'

/** Cheap, one-time viewport-width check (matches the `useLowPowerDevice`/
 * `useWebglSupported`/pointer-fine convention used across this codebase:
 * a `useState(() => ...)` snapshot, not resize-reactive) — decides which
 * Living System Diagram renderer actually *mounts*, so mobile never pays
 * for the desktop SVG tree. `768px` matches this codebase's existing
 * breakpoint precedent (the products scroll-spy rail). */
export function useIsDesktopViewport() {
  const [isDesktop] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(BREAKPOINT).matches
  })

  return isDesktop
}
