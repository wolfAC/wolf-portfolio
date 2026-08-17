import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { NavLink } from 'react-router'
import { navItems } from '../../data/site'
import { CloseIcon } from '../ui/icons'
import { useScrollToTop } from '../../hooks/useScrollToTop'

interface MobileNavOverlayProps {
  open: boolean
  onClose: () => void
  isHome: boolean
}

export function MobileNavOverlay({ open, onClose, isHome }: MobileNavOverlayProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const scrollToTop = useScrollToTop()

  useEffect(() => {
    if (!open) return

    closeButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      className="fixed inset-0 z-50 flex flex-col bg-bg md:hidden"
    >
      <div className="flex h-16 items-center justify-end px-gutter">
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close menu"
          onClick={onClose}
        >
          <CloseIcon className="size-6 text-fg" />
        </button>
      </div>

      <nav aria-label="Primary" className="flex flex-1 flex-col justify-center px-gutter">
        <ul className="flex flex-col gap-6">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.homeHash && isHome ? (
                <a
                  href={item.homeHash}
                  onClick={onClose}
                  className="font-display text-section text-fg"
                >
                  {item.label}
                </a>
              ) : (
                <NavLink
                  to={item.homeHash ? `/${item.homeHash}` : item.to}
                  onClick={() => {
                    onClose()
                    if (!item.homeHash) scrollToTop()
                  }}
                  className="font-display text-section text-fg"
                >
                  {item.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>,
    document.body,
  )
}
