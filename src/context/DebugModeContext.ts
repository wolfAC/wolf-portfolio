import { createContext, useContext } from 'react'
import type { MotionValue } from 'framer-motion'

export interface DebugModeContextValue {
  enabled: boolean
  toggle: () => void
  fps: MotionValue<number>
  scrollPercent: MotionValue<number>
}

export const DebugModeContext = createContext<DebugModeContextValue | null>(null)

export function useDebugMode() {
  const context = useContext(DebugModeContext)
  if (!context) {
    throw new Error('useDebugMode must be used within a DebugModeProvider')
  }
  return context
}
