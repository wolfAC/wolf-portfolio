import { useRef, useState } from 'react'

interface UseRageClickResult {
  handleClick: () => void
  rageDetected: boolean
  resetRage: () => void
}

/** Detects rapid repeat clicks on whatever element calls `handleClick`
 * alongside its real `onClick` — `threshold` clicks within `windowMs`
 * trips `rageDetected`. Fires at most once per mount (per spec: "only
 * fires once per session per element") — once tripped, further clicks are
 * simply ignored until the component remounts. */
export function useRageClick(threshold = 4, windowMs = 1000): UseRageClickResult {
  const clicksRef = useRef<number[]>([])
  const hasFiredRef = useRef(false)
  const [rageDetected, setRageDetected] = useState(false)

  function handleClick() {
    if (hasFiredRef.current) return

    const now = Date.now()
    clicksRef.current = [...clicksRef.current, now].filter((t) => now - t < windowMs)

    if (clicksRef.current.length >= threshold) {
      hasFiredRef.current = true
      setRageDetected(true)
      clicksRef.current = []
    }
  }

  function resetRage() {
    setRageDetected(false)
  }

  return { handleClick, rageDetected, resetRage }
}
