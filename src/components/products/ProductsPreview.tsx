import { SectionShell } from '../layout/SectionShell'
import { Reveal } from '../motion/Reveal'
import { ProductPreviewCard } from './ProductPreviewCard'
import { projects } from '../../data/projects'

export function ProductsPreview() {
  return (
    <SectionShell id="products" index="02" title="PRODUCTS">
      <Reveal>
        <ul>
          {projects.map((project, index) => (
            <ProductPreviewCard key={project.slug} project={project} index={index} />
          ))}
        </ul>
      </Reveal>
    </SectionShell>
  )
}
