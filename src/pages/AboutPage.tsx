import { SectionShell } from '../components/layout/SectionShell'
import { AnimatedHeading } from '../components/motion/AnimatedHeading'
import { Body, Meta } from '../components/typography'
import { Reveal } from '../components/motion/Reveal'
import { site } from '../data/site'

const FOCUS_AREAS = [
  {
    label: 'Product engineering',
    detail: 'Owning a build end to end — from an idea to shipped, production software.',
  },
  {
    label: 'Full-stack development',
    detail: `${site.coreStack.join(', ')} — across web, mobile, and desktop.`,
  },
  {
    label: 'System architecture',
    detail: 'Splitting one product into the right systems — Carcaran runs four: user, admin, DRM, and dealer.',
  },
  {
    label: 'UI/UX implementation',
    detail: 'Turning a design, or a rough idea, into an interface people can actually use.',
  },
  {
    label: 'Experimentation',
    detail: 'The Lab — 3D scenes, code generators, and interfaces built to learn, not to ship.',
  },
  {
    label: 'Shipping real products',
    detail: 'Ninto, GCC, and Apollo Clinic are live in production with real users today.',
  },
]

export function AboutPage() {
  return (
    <SectionShell index="06" title="ABOUT" eyebrowAs="p">
      <Reveal>
        <AnimatedHeading lines={['I LIKE BUILDING', 'THINGS THAT', 'ACTUALLY WORK.']} />

        <Body className="mt-8 text-fg">
          Products.
          <br />
          Systems.
          <br />
          Interfaces.
          <br />
          Experiments.
        </Body>

        <Body className="mt-6 max-w-xl">
          I care about what happens behind the screen as much as what happens on it.
        </Body>
      </Reveal>

      <Reveal>
        <Meta as="h2" className="mb-4 mt-16">
          What I do
        </Meta>
        <dl className="grid gap-8 sm:grid-cols-2">
          {FOCUS_AREAS.map((area) => (
            <div key={area.label} className="border-t border-border pt-6">
              <Body as="dt" className="font-semibold text-fg">
                {area.label}
              </Body>
              <Body as="dd" className="mt-2">
                {area.detail}
              </Body>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal>
        <Meta as="h2" className="mb-4 mt-16">
          Experience
        </Meta>
        <Body className="max-w-2xl">{site.experienceSummary}</Body>
      </Reveal>
    </SectionShell>
  )
}
