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
  /** Named technical differentiators, e.g. ["OFFLINE-FIRST", "MULTI-DEVICE SYNC"]. */
  technicalHighlights?: string[]
  featured?: boolean
  /** True for the flagship products highlighted on the homepage and in
   * cross-project "more products" links. False/undefined for everything
   * else, which still appears on the full /products index. */
  showcase?: boolean
}

export const projects: Project[] = [
  {
    slug: 'aelay',
    name: 'AELAY',
    positioningLines: ['PUBLISHING', 'PLATFORM'],
    tagline: 'PUBLISHING PLATFORM',
    summary:
      'A hybrid mobile app where authors upload books and track real-time publishing status, while readers order physical copies. Authors earn royalties based on popularity, managed through an admin dashboard for books, users, and royalty payouts.',
    category: 'Independent Product',
    role: 'Product Engineer',
    status: 'completed',
    modules: ['APP', 'ADMIN', 'CONTENT', 'WORKFLOW'],
    technologies: [],
    flow: [
      { label: 'AUTHOR' },
      { label: 'CONTENT' },
      { label: 'REVIEW' },
      { label: 'ADMIN' },
      { label: 'PUBLISH' },
      { label: 'USER' },
    ],
    links: [],
    showcase: true,
  },
  {
    slug: 'carcaran',
    name: 'CARCARAN',
    positioningLines: ['ONE PRODUCT.', 'FOUR SYSTEMS.'],
    tagline: 'ONE PRODUCT. FOUR SYSTEMS.',
    summary:
      'A multi-system automotive platform with dedicated user, dealer, admin and DRM workflows.',
    category: 'Independent Product',
    role: 'Product Engineer',
    status: 'completed',
    modules: ['USER', 'ADMIN', 'DRM', 'DEALER'],
    technologies: [],
    systems: [
      {
        id: 'user',
        label: 'USER',
        role: "Buy and sell cars, whether through dealerships or individual sellers.",
      },
      {
        id: 'admin',
        label: 'ADMIN',
        role: 'Add, delete, and update user profiles, vehicle listings, and dealer information.',
      },
      { id: 'drm', label: 'DRM', role: 'Manage dealerships.' },
      {
        id: 'dealer',
        label: 'DEALER',
        role: "Add, delete, and update inventory within a dealership.",
      },
    ],
    links: [],
    showcase: true,
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
    flow: [
      { label: 'UI' },
      { label: 'APPLICATION' },
      { label: 'LOCAL DATABASE' },
      { label: 'INDEXEDDB' },
      { label: 'SYNC' },
      { label: 'CLOUD SERVICES' },
    ],
    technicalHighlights: [
      'OFFLINE-FIRST',
      'LOCAL-FIRST DATA',
      'MULTI-DEVICE SYNC',
      'IMPORT / EXPORT',
      'ANALYTICS',
      'NOTIFICATIONS',
    ],
    progress: 80,
    featured: true,
    links: [],
    showcase: true,
  },
  {
    slug: 'ninto',
    name: 'NINTO',
    positioningLines: ['DIGITAL HEALTH', 'DOCUMENTS'],
    tagline: 'DIGITAL HEALTH DOCUMENT PLATFORM',
    summary:
      'A digital health document management platform integrating India’s ABHA health-ID standard, with dedicated apps for doctors, clinics, and patients, plus a Next.js marketing site built for SEO.',
    category: 'Client Product',
    role: 'Product Engineer',
    status: 'live',
    modules: ['DOCTOR', 'CLINIC', 'PATIENT'],
    technologies: ['Next.js'],
    links: [],
  },
  {
    slug: 'ninto-corporate',
    name: 'NINTO CORPORATE',
    positioningLines: ['EMPLOYEE', 'ONBOARDING'],
    tagline: 'CORPORATE HEALTH ONBOARDING',
    summary:
      'Employee onboarding software pairing new hires with medical fitness assessments through partner hospitals, for corporate clinics, employers, and employees.',
    category: 'Client Product',
    role: 'Product Engineer',
    status: 'live',
    modules: ['CORPORATE CLINIC', 'EMPLOYER', 'EMPLOYEE'],
    technologies: [],
    links: [],
  },
  {
    slug: 'gcc',
    name: 'GCC',
    positioningLines: ['PUBLIC RESTROOM', 'MONITORING'],
    tagline: 'CIVIC INFRASTRUCTURE MONITORING',
    summary:
      'Software for the Greater Chennai Corporation to monitor public restroom conditions across the city, with real-time map and table views for administrators, the public, and field employees.',
    category: 'Client Product',
    role: 'Product Engineer',
    status: 'live',
    modules: ['ADMIN', 'PUBLIC', 'EMPLOYEE'],
    technologies: [],
    links: [],
  },
  {
    slug: 'apollo-clinic',
    name: 'APOLLO CLINIC',
    positioningLines: ['MEDICAL CAMPAIGN', 'BOOKING'],
    tagline: 'CAMPAIGN & APPOINTMENT PLATFORM',
    summary:
      'A medical campaign management and appointment booking platform for Apollo Clinic (Madipakkam), with integrated online payments. Live in production with active users.',
    category: 'Client Product',
    role: 'Product Engineer',
    status: 'live',
    modules: ['APPOINTMENTS', 'PAYMENTS'],
    technologies: [],
    links: [],
  },
  {
    slug: 'job-fair-2024',
    name: 'JOB FAIR 2024',
    positioningLines: ['JOB SEEKER', 'PORTAL'],
    tagline: 'RESUME & JOB FAIR PORTAL',
    summary:
      'A job-fair website where job seekers create accounts, securely upload resumes, and keep them updated for recruiters — built for a job fair in Perambalur.',
    category: 'Client Product',
    role: 'Product Engineer',
    status: 'completed',
    modules: ['JOB SEEKERS'],
    technologies: [],
    links: [],
  },
  {
    slug: 'petition-management',
    name: 'PETITION MANAGEMENT',
    positioningLines: ['CITIZEN', 'PETITIONS'],
    tagline: 'MP OFFICE PETITION PLATFORM',
    summary:
      'A citizen petition platform for an MP’s office — Aadhaar-based citizen registration, petition submission and tracking, volunteer applications, and an admin dashboard integrated with a CRM API for announcements.',
    category: 'Client Product',
    role: 'Product Engineer',
    status: 'completed',
    modules: ['CITIZEN PORTAL', 'ADMIN DASHBOARD'],
    technologies: [],
    links: [],
  },
]

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug)
}

export function getFeaturedProject() {
  return projects.find((project) => project.featured)
}
