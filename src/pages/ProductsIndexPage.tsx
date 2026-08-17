import { SectionShell } from '../components/layout/SectionShell'
import { AnimatedHeading } from '../components/motion/AnimatedHeading'
import { ProductPreviewCard } from '../components/products/ProductPreviewCard'
import { ProductsScrollSpy } from '../components/products/ProductsScrollSpy'
import { projects } from '../data/projects'

export function ProductsIndexPage() {
  return (
    <SectionShell index="02" title="PRODUCTS" eyebrowAs="p" rev="B">
      <AnimatedHeading lines={['PRODUCTS']} />

      <ul className="mt-12">
        {projects.map((project, index) => (
          <ProductPreviewCard
            key={project.slug}
            project={project}
            index={index}
            headingLevel="h2"
          />
        ))}
      </ul>

      <ProductsScrollSpy projects={projects} />
    </SectionShell>
  )
}
