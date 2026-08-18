import { useSound } from '../../context/SoundContext'
import { cn } from '../../lib/cn'

/** The visible, easy-to-find mute/unmute control the spec requires — fixed
 * opposite corner from `DebugModeToggle`, same treatment. Muted by default;
 * `SoundProvider` persists the preference in `localStorage`. */
export function SoundToggle() {
  const { enabled, toggle } = useSound()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      className={cn(
        'fixed bottom-6 left-6 z-50 border bg-bg px-3 py-1.5 font-mono text-meta uppercase tracking-wide transition-colors',
        enabled ? 'border-accent text-accent' : 'border-border text-fg-muted hover:border-fg',
      )}
    >
      [ Sound {enabled ? 'On' : 'Off'} ]
    </button>
  )
}
