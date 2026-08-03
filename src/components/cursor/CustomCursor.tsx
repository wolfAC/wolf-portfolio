import { useEffect, useState } from 'react'
import { m } from 'framer-motion'
import { useWindowPointer } from '../../hooks/useWindowPointer'

/** Global accent-ring cursor replacement. Only active on precise pointers
 * (a fine-pointer device is a hardware prerequisite, not a motion
 * preference) — otherwise the real OS cursor is left completely
 * untouched, never hidden without a working replacement. */
export function CustomCursor() {
  const [pointerFine] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches,
  )
  const enabled = pointerFine
  const { x, y } = useWindowPointer({ enabled })
  const [hovering, setHovering] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)

  useEffect(() => {
    if (!enabled) return

    document.body.classList.add('cursor-none')

    function handlePointerMove() {
      setHasMoved(true)
    }

    function handlePointerOver(event: PointerEvent) {
      const target = event.target
      setHovering(target instanceof Element ? Boolean(target.closest('a, button')) : false)
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
  }, [enabled])

  if (!enabled || !hasMoved) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
      <m.div
        className="absolute left-0 top-0 size-6 rounded-full border border-accent"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
        animate={{ scale: hovering ? 1.6 : 1 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}
