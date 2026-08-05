import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>[]{}—_+=?/\\'
const FRAME_MS = 32
const DURATION_MS = 520

interface ScrambleNameProps {
  defaultText: string
  hoverText: string
  className?: string
}

/** Hover the resume name to decode it into the WOLF handle, and back on exit. */
export function ScrambleName({ defaultText, hoverText, className }: ScrambleNameProps) {
  const [display, setDisplay] = useState(defaultText)
  const intervalRef = useRef<number | null>(null)

  // Reserves layout space for whichever text is wider, so the animated overlay
  // below can shrink/grow freely without ever resizing the hoverable box itself
  // — a resize would pull the box's edge out from under a stationary cursor,
  // firing a spurious mouseleave that restarts the animation forever.
  const sizerText = defaultText.length >= hoverText.length ? defaultText : hoverText

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
    }
  }, [])

  function scrambleTo(target: string) {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current)

    const maxLength = Math.max(display.length, target.length)
    const totalFrames = Math.round(DURATION_MS / FRAME_MS)
    const revealFrame = Array.from({ length: maxLength }, (_, i) =>
      Math.floor((i / maxLength) * totalFrames * 0.6 + Math.random() * totalFrames * 0.4),
    )

    let frame = 0
    intervalRef.current = window.setInterval(() => {
      frame += 1
      if (frame >= totalFrames) {
        if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
        setDisplay(target)
        return
      }
      let next = ''
      for (let i = 0; i < maxLength; i += 1) {
        next += frame >= revealFrame[i] ? target[i] ?? '' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }
      setDisplay(next)
    }, FRAME_MS)
  }

  function handleEnter() {
    scrambleTo(hoverText)
  }

  function handleLeave() {
    scrambleTo(defaultText)
  }

  return (
    <span
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={cn('relative inline-block', className)}
    >
      <span aria-hidden="true" className="invisible">
        {sizerText}
      </span>
      <span aria-hidden="true" className="absolute inset-0">
        {display}
      </span>
      <span className="sr-only">{defaultText}</span>
    </span>
  )
}
