import { SectionShell } from '../components/layout/SectionShell'
import { Display } from '../components/typography'
import { ProductPreviewCard } from '../components/products/ProductPreviewCard'
import { projects } from '../data/projects'

export function ProductsIndexPage() {
  return (
    <SectionShell index="02" title="PRODUCTS" eyebrowAs="p">
      <Display as="h1">PRODUCTS</Display>

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
    </SectionShell>
  )
}
