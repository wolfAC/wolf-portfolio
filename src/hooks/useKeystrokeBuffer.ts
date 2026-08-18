import { useEffect, useRef, useState } from 'react'

const MAX_LENGTH = 24

function isTypingIntoField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}

/** A rolling, lowercased buffer of recent single-character keystrokes,
 * reset after `resetDelayMs` of inactivity — the shared mechanic behind
 * the Living Diagram's typing easter egg (Feature 6) and, per the redesign
 * spec, later reused as-is for the "BANKAI" trigger (Feature 11), which is
 * why this is its own generic hook rather than inlined into the diagram.
 * Ignores keydowns while focus is inside a real input/textarea/
 * contenteditable, so it never fights an actual form field. */
export function useKeystrokeBuffer(resetDelayMs = 1500): string {
  const [buffer, setBuffer] = useState('')
  const timeoutRef = useRef<number>(0)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingIntoField(event.target)) return
      // Single printable characters only — ignore Shift/Escape/Arrow/etc.
      if (event.key.length !== 1) return

      setBuffer((prev) => (prev + event.key).toLowerCase().slice(-MAX_LENGTH))
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = window.setTimeout(() => setBuffer(''), resetDelayMs)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(timeoutRef.current)
    }
  }, [resetDelayMs])

  return buffer
}
