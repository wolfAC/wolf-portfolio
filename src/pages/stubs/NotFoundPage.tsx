import { Link } from 'react-router'
import { SectionShell } from '../../components/layout/SectionShell'
import { Body, Meta } from '../../components/typography'
import { AnimatedHeading } from '../../components/motion/AnimatedHeading'

export function NotFoundPage() {
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
