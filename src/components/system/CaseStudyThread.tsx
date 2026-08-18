import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import type { Project } from '../../data/projects'
import { buildThreadMessages } from '../../data/caseStudyThread'
import { site } from '../../data/site'
import { Meta, Body } from '../typography'
import { Container } from '../layout/Container'
import { CloseIcon } from '../ui/icons'
import { useQuoteToast } from '../../context/QuoteToastContext'

interface CaseStudyThreadProps {
  project: Project | null
  onClose: () => void
}

/** A Slack/PR-review-style thread for one project — the "logs" for that
 * Living Diagram node, per the spec. Mirrors `QuickViewOverlay.tsx`'s
 * established modal pattern exactly (portal, `role="dialog"`, focus moved
 * to the close button, Escape-to-close) rather than a new one. Content
 * comes entirely from `buildThreadMessages()` — real project fields, not
 * authored narrative. Doesn't replace the existing `/products/:slug` page;
 * ends with a real link to it, so nothing already built is lost. */
export function CaseStudyThread({ project, onClose }: CaseStudyThreadProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const { showQuote } = useQuoteToast()
  const open = project !== null

  useEffect(() => {
    if (!open) return
    closeButtonRef.current?.focus()
    showQuote('case-study-open')

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose, showQuote])

  if (!project) return null

  const messages = buildThreadMessages(project)
  const initial = site.name.charAt(0)

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Case study: ${project.name}`}
      data-lenis-prevent
      className="fixed inset-0 z-50 overflow-y-auto bg-bg"
    >
      <Container className="flex min-h-full flex-col py-12">
        <div className="flex items-center justify-between">
          <Meta as="span">CASE STUDY / {project.name}</Meta>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close case study"
          >
            <CloseIcon className="size-6 text-fg" />
          </button>
        </div>

        <div className="mt-12 max-w-2xl flex-1">
          <ul className="flex flex-col gap-8">
            {messages.map((message) => (
              <li key={message.id} className="flex gap-4">
                <div
                  aria-hidden="true"
                  className="flex size-10 flex-none items-center justify-center border border-border bg-bg-elevated"
                >
                  <Meta as="span">{initial}</Meta>
                </div>
                <div className="flex-1 border-b border-border pb-8">
                  <div className="flex items-baseline gap-3">
                    <Meta as="span" className="text-fg">
                      {site.name}
                    </Meta>
                    <Meta as="span">{message.heading}</Meta>
                  </div>
                  <Body className="mt-2 whitespace-pre-line">{message.body}</Body>
                  {message.reaction ? (
                    <Meta
                      as="span"
                      className="mt-3 inline-block border border-accent px-2 py-1 text-accent"
                    >
                      {message.reaction}
                    </Meta>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <Meta
            as={Link}
            to={`/products/${project.slug}`}
            onClick={onClose}
            className="mt-12 inline-block text-accent transition-colors hover:text-fg"
          >
            View full case study →
          </Meta>
        </div>
      </Container>
    </div>,
    document.body,
  )
}
