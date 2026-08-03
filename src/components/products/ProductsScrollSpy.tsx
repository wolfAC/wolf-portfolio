import { useEffect, useState } from 'react'
import { useLenis } from 'lenis/react'
import type { Project } from '../../data/projects'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { cn } from '../../lib/cn'

interface ProductsScrollSpyProps {
  projects: Project[]
}

/** Slim vertical marker rail next to the scrollbar — one dot per project,
 * highlighting whichever card is currently in view; click jumps to it. */
export function ProductsScrollSpy({ projects }: ProductsScrollSpyProps) {
  const reducedMotion = usePrefersReducedMotion()
  const lenis = useLenis()
  const [activeSlug, setActiveSlug] = useState(projects[0]?.slug)

  useEffect(() => {
    const elements = projects
      .map((project) => document.getElementById(`project-${project.slug}`))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

        if (mostVisible) {
          setActiveSlug(mostVisible.target.id.replace('project-', ''))
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [projects])

  function handleJump(slug: string) {
    const element = document.getElementById(`project-${slug}`)
    if (!element) return

    if (lenis) {
      lenis.scrollTo(element)
    } else {
      element.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
    }
  }

  return (
    <nav
      aria-label="Jump to product"
      className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 md:flex"
    >
      {projects.map((project) => {
        const active = project.slug === activeSlug
        return (
          <button
            key={project.slug}
            type="button"
            aria-label={`Jump to ${project.name}`}
            aria-current={active ? 'true' : undefined}
            onClick={() => handleJump(project.slug)}
            className={cn(
              'size-2 rounded-full border border-fg-muted transition-transform',
              active ? 'scale-150 border-accent bg-accent' : 'bg-transparent hover:border-fg',
            )}
          />
        )
      })}
    </nav>
  )
}
