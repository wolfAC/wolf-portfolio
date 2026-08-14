import { useEffect, useState } from 'react'
import { Logo } from './Logo'
import { cn } from '../../lib/cn'

const FADE_MS = 300
const VISIBLE_MS = 3000

type Phase = 'visible' | 'fading' | 'gone'

/** Shown on every full page load (not on client-side route changes — this
 * component only mounts once per app bootstrap) for a fixed, deliberate
 * brand moment: the logo path-draws in over VISIBLE_MS, then the whole
 * overlay fades out. Always exactly this long, regardless of how fast
 * assets actually load — a brand beat, not a real loading indicator. */
export function SplashScreen() {
  const [phase, setPhase] = useState<Phase>('visible')

  useEffect(() => {
    if (phase !== 'visible') return
    const timeout = window.setTimeout(() => setPhase('fading'), VISIBLE_MS)
    return () => window.clearTimeout(timeout)
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
      <Logo className="h-auto w-40 sm:w-48 md:w-56" />
    </div>
  )
}
