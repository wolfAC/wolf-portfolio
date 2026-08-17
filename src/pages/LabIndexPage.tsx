import { SectionShell } from '../components/layout/SectionShell'
import { AnimatedHeading } from '../components/motion/AnimatedHeading'
import { LabExperimentCard } from '../components/lab/LabExperimentCard'
import { labExperiments } from '../data/lab'
import { Reveal } from '../components/motion/Reveal'

export function LabIndexPage() {
  return (
    <SectionShell index="03" title="LAB" eyebrowAs="p" rev="C">
      <Reveal>
        <AnimatedHeading lines={['LAB']} />

        <ul className="mt-12">
          {labExperiments.map((experiment) => (
            <LabExperimentCard
              key={experiment.slug}
              experiment={experiment}
              headingLevel="h2"
            />
          ))}
        </ul>
      </Reveal>
    </SectionShell>
  )
}
