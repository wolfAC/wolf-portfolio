import { useEffect } from 'react'
import { Link } from 'react-router'
import { SectionShell } from '../../components/layout/SectionShell'
import { Body, Meta } from '../../components/typography'
import { AnimatedHeading } from '../../components/motion/AnimatedHeading'
import { useQuoteToast } from '../../context/QuoteToastContext'

export function NotFoundPage() {
  const { showQuote } = useQuoteToast()

  useEffect(() => {
    showQuote('404')
  }, [showQuote])

  return (
    <SectionShell index="404" title="NOT FOUND" eyebrowAs="p">
      <AnimatedHeading lines={['PAGE NOT FOUND']} />
      <Body className="mt-6">The page you&apos;re looking for doesn&apos;t exist.</Body>
      <Meta as={Link} to="/" className="mt-8 inline-block text-accent">
        BACK HOME
      </Meta>
    </SectionShell>
  )
}
