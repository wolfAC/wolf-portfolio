import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useLenis } from 'lenis/react'

/** Scrolls to the element matching the current URL hash, including on first load. */
export function useHashScroll() {
  const { hash } = useLocation()
  const lenis = useLenis()

  useEffect(() => {
    if (!hash) return

    if (lenis) {
      lenis.scrollTo(hash)
    } else {
      document.querySelector(hash)?.scrollIntoView()
    }
  }, [hash, lenis])
}
