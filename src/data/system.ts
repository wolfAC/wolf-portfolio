export interface SystemFlowStage {
  id: string
  label: string
  description: string
}

export const systemFlow: SystemFlowStage[] = [
  {
    id: 'idea',
    label: 'IDEA',
    description: 'Start from a real problem worth solving.',
  },
  {
    id: 'product',
    label: 'PRODUCT',
    description: 'Define what it needs to do before deciding how.',
  },
  {
    id: 'architecture',
    label: 'ARCHITECTURE',
    description: 'Design the systems and data model up front.',
  },
  {
    id: 'interface',
    label: 'INTERFACE',
    description: 'Build the UI around the real data, not the other way around.',
  },
  {
    id: 'database',
    label: 'DATABASE',
    description: 'Choose storage that fits the product — local-first where it counts.',
  },
  {
    id: 'deployment',
    label: 'DEPLOYMENT',
    description: 'Ship early, ship often, automate the release.',
  },
  {
    id: 'iteration',
    label: 'ITERATION',
    description: 'Watch how it is used, then improve it.',
  },
]

export interface ProductDnaItem {
  id: string
  label: string
  description: string
  /** Only populated when a real technology list backs this principle. */
  technologies?: string[]
  /** Only populated when a real showcased project backs this principle. */
  projectSlug?: string
}

export const productDna: ProductDnaItem[] = [
  {
    id: 'performance',
    label: 'PERFORMANCE',
    description: 'Fast by default — minimal dependencies, lazy-loaded routes.',
  },
  {
    id: 'offline-first',
    label: 'OFFLINE-FIRST',
    description: 'Works without a connection, syncs when one is available.',
    technologies: [
      'Dexie',
      'IndexedDB',
      'Local-first architecture',
      'Sync',
      'Import / Export',
    ],
    projectSlug: 'pulse',
  },
  {
    id: 'simple-ux',
    label: 'SIMPLE UX',
    description: 'Clear over clever — every interaction should be obvious.',
  },
  {
    id: 'scalable-systems',
    label: 'SCALABLE SYSTEMS',
    description: 'Four independent systems behind one product.',
    projectSlug: 'carcaran',
  },
  {
    id: 'automation',
    label: 'AUTOMATION',
    description: 'Automate the repetitive — tests, builds, deployments.',
  },
  {
    id: 'data',
    label: 'DATA',
    description: 'Structure the data model first; the UI follows its shape.',
  },
  {
    id: 'polished-interaction',
    label: 'POLISHED INTERACTION',
    description: 'Motion and feedback that clarify state, not decorate it.',
  },
]
