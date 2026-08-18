import { useState } from 'react'
import { useLocation } from 'react-router'
import { useMotionValueEvent, type MotionValue } from 'framer-motion'
import { useDebugMode } from '../../context/DebugModeContext'
import { useSound } from '../../context/SoundContext'
import { useQuoteToast } from '../../context/QuoteToastContext'
import { getQuote } from '../../content/quotes'
import { cn } from '../../lib/cn'

interface DebugStatProps {
  label: string
  value: MotionValue<number>
  suffix?: string
}

/** Subscribes to one `MotionValue` and re-renders only itself on change —
 * keeps the FPS/scroll samples (updated every ~500ms) from re-rendering
 * the toggle button or the rest of the HUD panel. */
function DebugStat({ label, value, suffix = '' }: DebugStatProps) {
  const [display, setDisplay] = useState(() => value.get())
  useMotionValueEvent(value, 'change', (latest) => setDisplay(latest))

  return (
    <div>
      {label}: {display}
      {suffix}
    </div>
  )
}

/** The floating corner switch that turns Debug Mode on/off, plus the small
 * live HUD shown while it's on. Fixed and reachable from any scroll
 * position on any route; off by default and never persisted (a hard
 * refresh always starts clean). */
export function DebugModeToggle() {
  const { enabled, toggle, fps, scrollPercent } = useDebugMode()
  const { playSwitchToggle } = useSound()
  const { showQuote } = useQuoteToast()
  const location = useLocation()
  const debugRotateQuote = getQuote('debug-rotate')

  function handleClick() {
    playSwitchToggle()
    if (!enabled) showQuote('debug-on')
    toggle()
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={enabled}
        className={cn(
          'fixed bottom-6 right-6 z-50 border bg-bg px-3 py-1.5 font-mono text-meta uppercase tracking-wide transition-colors',
          enabled ? 'border-accent text-accent' : 'border-border text-fg-muted hover:border-fg',
        )}
      >
        [ Debug {enabled ? 'On' : 'Off'} ]
      </button>

      {enabled ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed bottom-20 right-6 z-50 flex flex-col gap-1 border border-cyan bg-bg-elevated px-4 py-3 font-mono text-meta text-cyan"
        >
          <DebugStat label="FPS" value={fps} />
          <DebugStat label="SCROLL" value={scrollPercent} suffix="%" />
          <div>ROUTE: {location.pathname}</div>
          {debugRotateQuote ? <div className="mt-1 border-t border-cyan/40 pt-1">{debugRotateQuote}</div> : null}
        </div>
      ) : null}
    </>
  )
}
