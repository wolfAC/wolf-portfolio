import { useEffect } from 'react'
import { useLocation } from 'react-router'

/** Scrolls to the element matching the current URL hash, including on first load. */
export function useHashScroll() {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const target = document.querySelector(hash)
    target?.scrollIntoView()
  }, [hash])
}
