import { useLenis } from 'lenis/react'

/** Returns a callback that smooth-scrolls to the top of the page. Wire it to
 * header nav items so route changes always land at the top instead of
 * wherever the previous page happened to be scrolled. */
export function useScrollToTop() {
  const lenis = useLenis()

  return () => {
    if (lenis) {
      lenis.scrollTo(0)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}
