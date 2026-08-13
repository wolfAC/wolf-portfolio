import { useState } from 'react'

/** Cheap, one-time feature probe for WebGL support. Some sandboxed browsers
 * or software-rendering fallbacks can't create a WebGL context at all —
 * distinct from useLowPowerDevice, which gates *weak* hardware. A device can
 * lack WebGL entirely regardless of how strong its CPU/memory are. */
export function useWebglSupported() {
  const [supported] = useState(() => {
    if (typeof document === 'undefined') return false

    try {
      const canvas = document.createElement('canvas')
      return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
    } catch {
      return false
    }
  })

  return supported
}
