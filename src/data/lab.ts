export type LabStatus = 'experiment' | 'archived'

export interface LabExperiment {
  slug: string
  number: string
  title: string
  type: string
  date: string
  technologies: string[]
  status: LabStatus
  description: string
  link?: { label: string; href: string }
}

export const labExperiments: LabExperiment[] = [
  {
    slug: '3d-vehicle',
    number: '001',
    title: '3D VEHICLE',
    type: '3D / WebGL',
    date: 'Jul – Aug 2026',
    technologies: ['Three.js', 'Rapier3D', 'GSAP', 'GLTF', 'Vite'],
    status: 'archived',
    description:
      'A physics-driven 3D driving experience — vehicle model, terrain, and a full scene graph, built as the previous iteration of this site before it became a product-focused portfolio.',
    link: {
      label: 'View source',
      href: 'https://github.com/wolfAC/wolf-portfolio/tree/b3479bf',
    },
  },
  {
    slug: 'electronify',
    number: '002',
    title: 'DESKTOP APP',
    type: 'CLI / Desktop',
    date: 'Jun 2026',
    technologies: ['Electron', 'TypeScript', 'electron-builder', 'Commander.js'],
    status: 'experiment',
    description:
      'A CLI that scaffolds a production-ready Electron wrapper around any web app — deep links, OAuth popups, auto-updates, and platform-specific packaging from one config file.',
    link: {
      label: 'View source',
      href: 'https://github.com/wolfAC/electron-app-generator',
    },
  },
  {
    slug: 'twa-generator',
    number: '003',
    title: 'ANDROID APP',
    type: 'CLI / Android',
    date: 'Jun 2026',
    technologies: ['Node.js', 'Kotlin', 'Gradle'],
    status: 'experiment',
    description:
      'A CLI that generates a native Android TWA project from a single config file — JS bridge, plugin architecture, and a self-hosted build dashboard.',
    link: {
      label: 'View source',
      href: 'https://github.com/wolfAC/android-app-generator',
    },
  },
]

export function getLabExperimentBySlug(slug: string) {
  return labExperiments.find((experiment) => experiment.slug === slug)
}
