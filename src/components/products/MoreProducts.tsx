import { Link } from 'react-router'
import { projects } from '../../data/projects'
import { Meta } from '../typography'

interface MoreProductsProps {
  currentSlug: string
}

export function MoreProducts({ currentSlug }: MoreProductsProps) {
  const others = projects.filter((project) => project.slug !== currentSlug)

  if (others.length === 0) return null

  return (
    <nav aria-label="More products" className="mt-16 border-t border-border pt-8">
      <Meta as="p" className="mb-4">
        More products
      </Meta>
      <ul className="flex flex-wrap gap-x-10 gap-y-4">
        {others.map((project) => (
          <li key={project.slug}>
            <Link
              to={`/products/${project.slug}`}
              className="text-fg transition-colors hover:text-accent"
            >
              <Meta as="span">{project.name}</Meta>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
