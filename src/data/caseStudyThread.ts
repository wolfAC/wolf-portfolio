import type { Project } from './projects'

export interface ThreadMessage {
  id: string
  heading: string
  body: string
  /** Only the final "status" message ever gets this — a real ship
   * confirmation, not decoration, gated on the project's actual status. */
  reaction?: string
}

/** Builds a Living-Diagram case-study "thread" (Slack/PR-review-style
 * messages) entirely from fields `projects.ts` already has — no per-project
 * authoring, no new content file. Every project automatically gets a
 * thread the moment it's added to `projects[]`; richer projects (real
 * `technicalHighlights`/`systems`) get richer threads, sparser ones get a
 * shorter, still entirely honest one. Nothing here is invented narrative —
 * there's no "blockers hit" beat because that data doesn't exist anywhere
 * in this project, so it isn't fabricated to fill the Slack-thread shape. */
export function buildThreadMessages(project: Project): ThreadMessage[] {
  const messages: ThreadMessage[] = [
    { id: 'problem', heading: 'The problem', body: project.summary },
  ]

  const approachLines = [
    project.modules.length > 0 ? `Modules: ${project.modules.join(', ')}` : null,
    project.technicalHighlights?.length
      ? `Technical highlights: ${project.technicalHighlights.join(', ')}`
      : null,
  ].filter((line): line is string => line !== null)

  if (approachLines.length > 0) {
    messages.push({ id: 'approach', heading: 'What I built', body: approachLines.join('\n') })
  }

  if (project.systems?.length) {
    messages.push({
      id: 'systems',
      heading: 'Systems',
      body: project.systems.map((system) => `${system.label}${system.role ? ` — ${system.role}` : ''}`).join('\n'),
    })
  }

  const status = describeStatus(project)
  messages.push({
    id: 'status',
    heading: 'Status',
    body: status.body,
    reaction: status.shipped ? 'shipped 🚀' : undefined,
  })

  return messages
}

function describeStatus(project: Project): { body: string; shipped: boolean } {
  switch (project.status) {
    case 'building':
      return {
        body: project.progress
          ? `Still in progress — ${project.progress}% done.`
          : 'Still in progress.',
        shipped: false,
      }
    case 'live':
      return { body: 'Shipped and live in production.', shipped: true }
    case 'completed':
      return { body: 'Completed.', shipped: true }
    case 'experiment':
      return { body: 'An experiment — lab project, not a production build.', shipped: false }
    case 'archived':
      return { body: 'Archived.', shipped: false }
  }
}
