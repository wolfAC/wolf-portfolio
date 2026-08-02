import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface PageTransitionProps {
  children: ReactNode
}

/** Entrance-only fade on route change — no exit animation, since page
 * heights vary too widely across routes to make an unmount transition
 * worth the complexity. */
export function PageTransition({ children }: PageTransitionProps) {
  const { pathname } = useLocation()
  const reducedMotion = usePrefersReducedMotion()

  if (reducedMotion) {
    return <div>{children}</div>
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
