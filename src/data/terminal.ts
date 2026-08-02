import { projects } from './projects'
import { labExperiments } from './lab'

export interface VfsEntry {
  name: string
  /** Real route `open` navigates to, if any. */
  route?: string
  /** Sub-entries, for ls/cd. */
  children?: VfsEntry[]
}

export const vfsRoot: VfsEntry = {
  name: '~',
  children: [
    {
      name: 'products',
      route: '/products',
      children: projects.map((project) => ({
        name: project.slug,
        route: `/products/${project.slug}`,
      })),
    },
    {
      name: 'lab',
      route: '/lab',
      children: labExperiments.map((experiment) => ({
        name: experiment.slug,
        route: `/lab/${experiment.slug}`,
      })),
    },
    { name: 'system', route: '/system' },
    { name: 'build-log', route: '/build-log' },
    { name: 'about', route: '/about' },
    { name: 'contact', route: '/contact' },
  ],
}
