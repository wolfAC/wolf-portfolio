import { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import { useWindowPointer } from '../../hooks/useWindowPointer'
import { useDebugMode } from '../../context/DebugModeContext'

type CursorVariant = 'default' | 'link' | 'hero' | 'node' | 'debug'

const SCALE_BY_VARIANT: Record<CursorVariant, number> = {
  default: 1,
  link: 1.6,
  hero: 1,
  node: 1.15,
  debug: 1.15,
}

function CrosshairGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-6">
      <path
        d="M12 2 V8 M12 16 V22 M2 12 H8 M16 12 H22"
        stroke="var(--color-cyan)"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  )
}

function NodeGlyph() {
  return <span className="font-mono text-sm font-medium text-cyan">{'{}'}</span>
}

function DebugGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-5">
      <circle cx="10" cy="10" r="6" stroke="var(--color-accent)" strokeWidth="1.5" fill="none" />
      <path
        d="M14.5 14.5 L20 20"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Global cursor replacement that reflects what's under the pointer: the
 * resting ring by default, the same ring scaled up over links/buttons, a
 * crosshair over the 3D hero, a `{}` bracket over Living Diagram nodes, and
 * — overriding everything else, since it's a global mode rather than a
 * hover state — a magnifying glass whenever Debug Mode is on. Only active
 * on precise pointers (a fine-pointer device is a hardware prerequisite,
 * not a motion preference) — otherwise the real OS cursor is left
 * completely untouched, never hidden without a working replacement. */
export function CustomCursor() {
  const [pointerFine] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches,
  )
  const enabled = pointerFine
  const { x, y } = useWindowPointer({ enabled })
  const [variant, setVariant] = useState<CursorVariant>('default')
  const [hasMoved, setHasMoved] = useState(false)
  const { enabled: debugEnabled } = useDebugMode()

  useEffect(() => {
    if (!enabled) return

    document.body.classList.add('cursor-none')

    function handlePointerMove() {
      setHasMoved(true)
    }

    function handlePointerOver(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Element)) {
        setVariant('default')
        return
      }
      // Debug Mode is a global state, not a hover state — it wins
      // regardless of what's under the pointer, checked first.
      if (debugEnabled) {
        setVariant('debug')
      } else if (target.closest('[data-cursor="node"]')) {
        setVariant('node')
      } else if (target.closest('[data-cursor="hero"]')) {
        setVariant('hero')
      } else if (target.closest('a, button')) {
        setVariant('link')
      } else {
        setVariant('default')
      }
    }

    // Real cursor position is unknown until the first move — render nothing
    // until then rather than flashing a ring at the (0, 0) default.
    window.addEventListener('pointermove', handlePointerMove, { once: true })
    window.addEventListener('pointerover', handlePointerOver)
    return () => {
      document.body.classList.remove('cursor-none')
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerover', handlePointerOver)
    }
  }, [enabled, debugEnabled])

  if (!enabled || !hasMoved) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
      <m.div
        className="absolute left-0 top-0 flex size-6 items-center justify-center"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: SCALE_BY_VARIANT[variant] }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {variant === 'hero' ? (
          <CrosshairGlyph />
        ) : variant === 'node' ? (
          <NodeGlyph />
        ) : variant === 'debug' ? (
          <DebugGlyph />
        ) : (
          <span className="size-6 rounded-full border border-accent" />
        )}
      </m.div>
    </div>
  )
}
