import { useEffect, useState } from 'react'
import { Display } from '../typography'
import { cn } from '../../lib/cn'

const SPLASH_KEY = 'wolf-splash-shown'
const FADE_MS = 300
const MIN_VISIBLE_MS = 600

function shouldShow() {
  if (typeof window === 'undefined') return false
  return !window.sessionStorage.getItem(SPLASH_KEY)
}

type Phase = 'visible' | 'fading' | 'gone'

/** Shown once per browser session while real assets (fonts) load. Waits for
 * both `document.fonts.ready` and a minimum visible duration — fonts are
 * often already cached and ready in well under a millisecond, which without
 * a floor made the splash imperceptible rather than a real loading state. */
export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>(() => (shouldShow() ? 'visible' : 'gone'))

  useEffect(() => {
    if (phase === 'gone') {
      window.sessionStorage.setItem(SPLASH_KEY, '1')
      return
    }
    if (phase !== 'visible') return

    let cancelled = false
    const minVisible = new Promise((resolve) => window.setTimeout(resolve, MIN_VISIBLE_MS))

    Promise.all([document.fonts.ready, minVisible]).then(() => {
      if (!cancelled) setPhase('fading')
    })
    return () => {
      cancelled = true
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'fading') return
    const timeout = window.setTimeout(() => setPhase('gone'), FADE_MS)
    return () => window.clearTimeout(timeout)
  }, [phase])

  if (phase === 'gone') return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-[60] flex items-center justify-center bg-bg transition-opacity ease-out',
        phase === 'fading' ? 'opacity-0' : 'opacity-100',
      )}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <Display>WOLF</Display>
    </div>
  )
}
