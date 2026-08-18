import { createContext, useContext } from 'react'

export interface SoundContextValue {
  enabled: boolean
  toggle: () => void
  /** No-ops when `enabled` is false — call sites never branch on mute
   * state themselves, they just call these. */
  playRelayClick: () => void
  playSwitchToggle: () => void
  playVoiceConfirm: () => void
}

export const SoundContext = createContext<SoundContextValue | null>(null)

export function useSound(): SoundContextValue {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error('useSound must be used within a SoundProvider')
  }
  return context
}
