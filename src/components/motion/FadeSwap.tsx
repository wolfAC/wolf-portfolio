import { AnimatePresence, m } from 'framer-motion'
import type { ReactNode } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface FadeSwapProps {
  /** Changing this key cross-fades out the old content and in the new. */
  swapKey: string | number
  children: ReactNode
  className?: string
}

/** Small cross-fade for detail-panel content that changes on selection
 * (system maps, tech maps, etc.) instead of swapping instantly. */
export function FadeSwap({ swapKey, children, className }: FadeSwapProps) {
  const reducedMotion = usePrefersReducedMotion()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <AnimatePresence mode="wait">
      <m.div
        key={swapKey}
        className={className}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  )
}
