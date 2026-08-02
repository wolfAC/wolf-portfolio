export type ProjectStatus = 'building' | 'live' | 'completed' | 'experiment' | 'archived'

export interface ProjectFlowStep {
  label: string
}

export interface ProjectSystemNode {
  id: string
  label: string
  role?: string
}

export interface ProjectLink {
  label: string
  href: string
}

export interface Project {
  slug: string
  name: string
  /** Big stacked display words, e.g. ["PERSONAL","OPERATING","SYSTEM"]. */
  positioningLines: string[]
  /** Short one-line descriptor, e.g. "PUBLISHING PLATFORM". */
  tagline: string
  summary: string
  category: string
  role: string
  status: ProjectStatus
  modules: string[]
  technologies: string[]
  flow?: ProjectFlowStep[]
  systems?: ProjectSystemNode[]
  links?: ProjectLink[]
  /** 0-100, populated only for projects currently in progress. */
  progress?: number
  /** Distinct, ordered subset of `modules` used in compact previews. */
  highlightModules?: string[]
  featured?: boolean
}

export const projects: Project[] = [
  {
    slug: 'aleay',
    name: 'ALEAY',
    positioningLines: ['PUBLISHING', 'PLATFORM'],
    tagline: 'PUBLISHING PLATFORM',
    summary:
      'A publishing platform with a public-facing app, an admin panel, and an editorial workflow connecting authors, content, and publication.',
    category: 'Client Product',
    role: 'Product Engineer',
    status: 'completed',
    modules: ['APP', 'ADMIN', 'CONTENT', 'WORKFLOW'],
    technologies: [],
    flow: [
      { label: 'AUTHOR' },
      { label: 'CONTENT' },
      { label: 'ADMIN' },
      { label: 'PUBLISH' },
      { label: 'USER' },
    ],
    links: [],
  },
  {
    slug: 'carcaran',
    name: 'CARCARAN',
    positioningLines: ['ONE PRODUCT.', 'FOUR SYSTEMS.'],
    tagline: 'ONE PRODUCT. FOUR SYSTEMS.',
    summary:
      'A multi-system automotive platform with dedicated user, dealer, admin and DRM workflows.',
    category: 'Client Product',
    role: 'Product Engineer',
    status: 'completed',
    modules: ['USER', 'ADMIN', 'DRM', 'DEALER'],
    technologies: [],
    systems: [
      { id: 'user', label: 'USER' },
      { id: 'admin', label: 'ADMIN' },
      { id: 'drm', label: 'DRM' },
      { id: 'dealer', label: 'DEALER' },
    ],
    links: [],
  },
  {
    slug: 'pulse',
    name: 'PULSE',
    positioningLines: ['PERSONAL', 'OPERATING', 'SYSTEM'],
    tagline: 'PERSONAL OPERATING SYSTEM',
    summary:
      'Building an offline-first personal operating system spanning productivity, goals, health, finance and analytics.',
    category: 'Independent Product',
    role: 'Product Engineer',
    status: 'building',
    modules: [
      'PRODUCTIVITY',
      'GOALS',
      'HEALTH',
      'FINANCE',
      'BUDGET',
      'ANALYTICS',
      'EVENTS',
      'NOTIFICATIONS',
      'SYNC',
    ],
    highlightModules: [
      'PRODUCTIVITY',
      'HEALTH',
      'FINANCE',
      'GOALS',
      'ANALYTICS',
      'SYNC',
    ],
    technologies: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind',
      'shadcn/ui',
      'Dexie',
      'IndexedDB',
      'Redux Toolkit',
      'Cypress',
      'Vercel',
      'Google Drive',
    ],
    progress: 80,
    featured: true,
    links: [],
  },
]

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug)
}

export function getFeaturedProject() {
  return projects.find((project) => project.featured)
}
