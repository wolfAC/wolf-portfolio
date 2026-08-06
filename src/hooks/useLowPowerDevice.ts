import { useState } from 'react'

/** Device Memory API — Chromium-only, not in the standard DOM lib types. */
interface NavigatorWithDeviceMemory extends Navigator {
  deviceMemory?: number
}

const CORE_THRESHOLD = 4
const MEMORY_THRESHOLD_GB = 4

/** Cheap, one-time hardware heuristic (CPU core count + device memory, where
 * available) for gating expensive continuous animation work — distinct from
 * prefers-reduced-motion, which this site intentionally ignores. A device
 * can be fully motion-tolerant by preference and still be too weak to drive
 * several chained per-frame transforms without dropping frames. */
export function useLowPowerDevice() {
  const [lowPower] = useState(() => {
    if (typeof navigator === 'undefined') return false

    const cores = navigator.hardwareConcurrency ?? Infinity
    const memory = (navigator as NavigatorWithDeviceMemory).deviceMemory ?? Infinity

    return cores <= CORE_THRESHOLD || memory <= MEMORY_THRESHOLD_GB
  })

  return lowPower
}
