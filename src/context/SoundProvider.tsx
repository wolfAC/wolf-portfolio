import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  playRelayClick as synthRelayClick,
  playSwitchToggle as synthSwitchToggle,
  playVoiceConfirm as synthVoiceConfirm,
} from '../lib/sound'
import { SoundContext } from './SoundContext'

const STORAGE_KEY = 'wolf-portfolio:sound-enabled'

function readStoredPreference(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/** Sound preference — muted by default (per spec), persisted across the
 * session in `localStorage` once a visitor explicitly turns it on. Gates
 * both synthesized cues in one place (see `useSound` in `SoundContext.ts`)
 * so `DebugModeToggle`/`LivingSystemDiagram` never need to check `enabled`
 * themselves. */
export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(readStoredPreference)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(enabled))
    } catch {
      // Private browsing / storage disabled — the preference just won't
      // survive a reload, which is a reasonable degrade, not an error.
    }
  }, [enabled])

  const toggle = useCallback(() => setEnabled((prev) => !prev), [])

  const playRelayClick = useCallback(() => {
    if (enabled) synthRelayClick()
  }, [enabled])

  const playSwitchToggle = useCallback(() => {
    if (enabled) synthSwitchToggle()
  }, [enabled])

  const playVoiceConfirm = useCallback(() => {
    if (enabled) synthVoiceConfirm()
  }, [enabled])

  const value = useMemo(
    () => ({ enabled, toggle, playRelayClick, playSwitchToggle, playVoiceConfirm }),
    [enabled, toggle, playRelayClick, playSwitchToggle, playVoiceConfirm],
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}
