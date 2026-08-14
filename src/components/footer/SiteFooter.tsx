import { useRef, useState } from 'react'
import { site, socialLinks } from '../../data/site'
import { Display, Meta } from '../typography'
import { Container } from '../layout/Container'
import { TerminalOverlay } from '../terminal/TerminalOverlay'

export function SiteFooter() {
  const year = new Date().getFullYear()
  const [terminalOpen, setTerminalOpen] = useState(false)
  const terminalTriggerRef = useRef<HTMLButtonElement>(null)

  function closeTerminalAndRestoreFocus() {
    setTerminalOpen(false)
    terminalTriggerRef.current?.focus()
  }

  return (
    <footer className="border-t border-border py-section-y">
      <Container>
        <Display as="h2" className="max-w-4xl">
          LET&apos;S BUILD
          <br />
          SOMETHING
          <br />
          USEFUL.
        </Display>

        <div className="mt-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Meta as="p" className="text-fg">
              {site.name}
            </Meta>
            <Meta as="p" className="mt-2">
              {site.role}
            </Meta>
            <Meta as="p">BUILDING DIGITAL PRODUCTS</Meta>
          </div>

          <ul className="flex gap-6">
            {socialLinks.map((link) => (
              <li key={link.label}>
                <Meta as="a" href={link.href} className="transition-colors hover:text-accent">
                  {link.label}
                </Meta>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 flex items-center justify-between">
          <Meta as="p">&copy; {year}</Meta>

          <button
            ref={terminalTriggerRef}
            type="button"
            onClick={() => setTerminalOpen(true)}
            className="font-mono text-meta text-fg-muted transition-colors hover:text-accent"
          >
            &gt; anbu.dev
          </button>
        </div>
      </Container>

      <TerminalOverlay open={terminalOpen} onClose={closeTerminalAndRestoreFocus} />
    </footer>
  )
}
