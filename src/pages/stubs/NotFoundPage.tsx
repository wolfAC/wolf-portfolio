import { Link } from 'react-router'
import { SectionShell } from '../../components/layout/SectionShell'
import { Display, Body, Meta } from '../../components/typography'

export function NotFoundPage() {
  return (
    <SectionShell index="404" title="NOT FOUND" eyebrowAs="p">
      <Display as="h1">PAGE NOT FOUND</Display>
      <Body className="mt-6">The page you&apos;re looking for doesn&apos;t exist.</Body>
      <Meta as={Link} to="/" className="mt-8 inline-block text-accent">
        BACK HOME
      </Meta>
    </SectionShell>
  )
}
