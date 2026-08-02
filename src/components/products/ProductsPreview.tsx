import { SectionShell } from '../layout/SectionShell'
import { Reveal } from '../motion/Reveal'
import { ProductPreviewCard } from './ProductPreviewCard'
import { projects } from '../../data/projects'

export function ProductsPreview() {
  const showcased = projects.filter((project) => project.showcase)

  return (
    <SectionShell id="products" index="02" title="PRODUCTS">
      <Reveal>
        <ul>
          {showcased.map((project, index) => (
            <ProductPreviewCard key={project.slug} project={project} index={index} />
          ))}
        </ul>
      </Reveal>
    </SectionShell>
  )
}
