import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { site, socialLinks } from '../../data/site'
import { projects } from '../../data/projects'
import { Display, Body, Meta } from '../typography'
import { Container } from '../layout/Container'

interface QuickViewOverlayProps {
  open: boolean
  onClose: () => void
}

export function QuickViewOverlay({ open, onClose }: QuickViewOverlayProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const showcasedProjects = projects.filter((project) => project.showcase)

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
      aria-label="Quick view"
      data-lenis-prevent
      className="fixed inset-0 z-50 overflow-y-auto bg-bg"
    >
      <Container className="flex min-h-full flex-col py-12">
        <div className="flex items-center justify-between">
          <Meta as="span">QUICK VIEW</Meta>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="border border-border px-4 py-2 text-fg transition-colors hover:border-fg"
          >
            <Meta as="span">EXPLORE</Meta>
          </button>
        </div>

        <div className="mt-16 flex-1">
          <Display as="p">{site.name}</Display>
          <Meta as="p" className="mt-2 text-fg-muted">
            {site.role}
          </Meta>

          <Body className="mt-8 max-w-xl">{site.experienceSummary}</Body>

          <Meta as="p" className="mb-4 mt-12">
            Selected products
          </Meta>
          <ul className="flex flex-wrap gap-x-10 gap-y-4">
            {showcasedProjects.map((project) => (
              <li key={project.slug}>
                <Link
                  to={`/products/${project.slug}`}
                  onClick={onClose}
                  className="text-fg transition-colors hover:text-accent"
                >
                  <Meta as="span">{project.name}</Meta>
                </Link>
              </li>
            ))}
          </ul>

          <Meta as="p" className="mb-4 mt-12">
            Core stack
          </Meta>
          <ul className="flex flex-wrap gap-2">
            {site.coreStack.map((tech) => (
              <li key={tech}>
                <Meta as="span" className="border border-border px-3 py-1">
                  {tech}
                </Meta>
              </li>
            ))}
          </ul>

          <ul className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-8">
            <li>
              <Link
                to="/contact"
                onClick={onClose}
                className="text-fg transition-colors hover:text-accent"
              >
                <Meta as="span">Contact</Meta>
              </Link>
            </li>
            <li>
              <Meta
                as="a"
                href="/resume.pdf"
                target="_blank"
                rel="noreferrer"
                className="text-fg transition-colors hover:text-accent"
              >
                Resume
              </Meta>
            </li>
            {socialLinks.map((link) => (
              <li key={link.label}>
                <Meta
                  as="a"
                  href={link.href}
                  className="text-fg transition-colors hover:text-accent"
                >
                  {link.label}
                </Meta>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </div>,
    document.body,
  )
}
