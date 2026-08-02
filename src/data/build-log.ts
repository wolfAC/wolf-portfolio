export interface BuildLogEntry {
  /** ISO 'YYYY-MM-DD' — sortable/unambiguous, formatted for display at render time. */
  date: string
  project: string
  description: string
}

export const buildLog: BuildLogEntry[] = [
  {
    date: '2026-08-02',
    project: 'PULSE',
    description: 'Automatic Google Drive backup and restore.',
  },
  {
    date: '2026-08-02',
    project: 'WOLF.DEV',
    description:
      'Rebuilt this portfolio as a product-focused site — foundation through Lab.',
  },
  {
    date: '2026-08-01',
    project: 'LAB',
    description: 'Refined the 3D vehicle model and scene visuals.',
  },
  {
    date: '2026-07-06',
    project: 'PULSE',
    description: 'Shipped global search and premium plan management.',
  },
  {
    date: '2026-06-26',
    project: 'PULSE',
    description: 'Implemented a secure PKCE OAuth flow for Google Drive sync.',
  },
  {
    date: '2026-06-23',
    project: 'PULSE',
    description: 'Added Google sign-in with PKCE and popup-based auth.',
  },
]
