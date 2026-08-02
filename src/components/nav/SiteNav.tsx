import { useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { navItems, site } from '../../data/site'
import { Meta } from '../typography'
import { Container } from '../layout/Container'
import { MenuIcon } from '../ui/icons'
import { MobileNavOverlay } from './MobileNavOverlay'
import { QuickViewOverlay } from '../quick-view/QuickViewOverlay'
import { cn } from '../../lib/cn'

export function SiteNav() {
  const [open, setOpen] = useState(false)
  const [quickViewOpen, setQuickViewOpen] = useState(false)
  const location = useLocation()
  const isHome = location.pathname === '/'
  const triggerRef = useRef<HTMLButtonElement>(null)
  const quickViewTriggerRef = useRef<HTMLButtonElement>(null)

  function closeAndRestoreFocus() {
    setOpen(false)
    triggerRef.current?.focus()
  }

  function closeQuickViewAndRestoreFocus() {
    setQuickViewOpen(false)
    quickViewTriggerRef.current?.focus()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4 md:h-20">
        <Meta as={Link} to="/" className="text-fg">
          {site.name}
        </Meta>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.homeHash && isHome ? (
                  <a href={item.homeHash}>
                    <Meta as="span">{item.label}</Meta>
                  </a>
                ) : (
                  <NavLink to={item.homeHash ? `/${item.homeHash}` : item.to}>
                    {({ isActive }) => (
                      <Meta
                        as="span"
                        className={cn(
                          isActive &&
                            'text-fg underline decoration-accent underline-offset-4',
                        )}
                      >
                        {item.label}
                      </Meta>
                    )}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <button
            ref={quickViewTriggerRef}
            type="button"
            onClick={() => setQuickViewOpen(true)}
            className="border border-border px-3 py-1.5 text-fg transition-colors hover:border-fg"
          >
            <Meta as="span">Quick view</Meta>
          </button>

          <button
            ref={triggerRef}
            type="button"
            className="md:hidden"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <MenuIcon className="size-6 text-fg" />
          </button>
        </div>
      </Container>

      <MobileNavOverlay open={open} onClose={closeAndRestoreFocus} isHome={isHome} />
      <QuickViewOverlay open={quickViewOpen} onClose={closeQuickViewAndRestoreFocus} />
    </header>
  )
}
