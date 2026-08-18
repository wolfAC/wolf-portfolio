import { SectionShell } from '../components/layout/SectionShell'
import { AnimatedHeading } from '../components/motion/AnimatedHeading'
import { Body, Meta, SectionTitle } from '../components/typography'
import { Reveal } from '../components/motion/Reveal'
import { ArrowIcon } from '../components/ui/icons'
import { ContactForm } from '../components/contact/ContactForm'
import { site, socialLinks } from '../data/site'
import { useQuoteToast } from '../context/QuoteToastContext'

const emailLink = socialLinks.find((link) => link.label === 'EMAIL')
const otherLinks = socialLinks.filter((link) => link.label !== 'EMAIL')

export function ContactPage() {
  const { showQuote } = useQuoteToast()

  return (
    <SectionShell index="07" title="CONTACT" eyebrowAs="p" rev="G">
      <Reveal>
        <AnimatedHeading lines={["LET'S TALK", 'ABOUT YOUR', 'NEXT BUILD.']} />

        <Meta as="p" className="mt-8 text-fg">
          {site.statusLabel}
        </Meta>

        <Body className="mt-4 max-w-xl">{site.experienceSummary}</Body>
      </Reveal>

      <Reveal>
        {emailLink && (
          <a
            href={emailLink.href}
            className="group mt-16 inline-flex items-center gap-3 text-fg transition-colors hover:text-accent"
          >
            <SectionTitle as="span" className="break-all">
              {emailLink.href.replace('mailto:', '')}
            </SectionTitle>
            <ArrowIcon className="size-6 flex-none transition-transform group-hover:translate-x-1" />
          </a>
        )}

        <Meta as="p" className="mb-4 mt-16">
          Or send a message directly
        </Meta>
        <ContactForm />

        <ul className="mt-16 flex flex-wrap gap-x-10 gap-y-4 border-t border-border pt-8">
          {otherLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                className="group inline-flex items-center gap-2 text-fg transition-colors hover:text-accent"
              >
                <Meta as="span">{link.label}</Meta>
                <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
              </a>
            </li>
          ))}
          <li>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              onClick={() => showQuote('resume-download')}
              className="group inline-flex items-center gap-2 text-fg transition-colors hover:text-accent"
            >
              <Meta as="span">Resume</Meta>
              <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </li>
        </ul>
      </Reveal>
    </SectionShell>
  )
}
