import { SectionShell } from '../components/layout/SectionShell'
import { Display } from '../components/typography'
import { LabExperimentCard } from '../components/lab/LabExperimentCard'
import { labExperiments } from '../data/lab'
import { Reveal } from '../components/motion/Reveal'

export function LabIndexPage() {
  return (
    <SectionShell index="03" title="LAB" eyebrowAs="p">
      <Reveal>
        <Display as="h1">LAB</Display>

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
