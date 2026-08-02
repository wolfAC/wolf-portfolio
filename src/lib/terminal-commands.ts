import { vfsRoot, type VfsEntry } from '../data/terminal'
import { site } from '../data/site'

interface ResolvedPath {
  path: string[]
  entry: VfsEntry
}

function getEntryAt(path: string[]): VfsEntry | undefined {
  let entry: VfsEntry = vfsRoot
  for (const segment of path) {
    const next = entry.children?.find((child) => child.name === segment)
    if (!next) return undefined
    entry = next
  }
  return entry
}

/** Resolves `target` (relative or absolute, supports `.`, `..`, `~`/`/`)
 * against `currentPath`. `target` undefined or '.' means "here". */
export function resolvePath(
  currentPath: string[],
  target: string | undefined,
): ResolvedPath | undefined {
  if (!target || target === '.') {
    const entry = getEntryAt(currentPath)
    return entry && { path: currentPath, entry }
  }

  const isAbsolute = target.startsWith('/') || target === '~'
  const segments = target === '~' ? [] : target.replace(/^\/|\/$/g, '').split('/').filter(Boolean)

  let path = isAbsolute ? [] : [...currentPath]

  for (const segment of segments) {
    if (segment === '.') continue
    if (segment === '..') {
      path = path.slice(0, -1)
      continue
    }
    if (segment === '~') {
      path = []
      continue
    }
    path = [...path, segment]
  }

  const entry = getEntryAt(path)
  return entry && { path, entry }
}

export interface CommandResult {
  output: string[]
  newPath?: string[]
  navigateTo?: string
  clear?: boolean
}

const HELP_LINES = [
  'help              show this list',
  'ls [path]         list a directory',
  'cd [path]         change directory',
  'open [path]       open a real page',
  'projects          open the products page',
  'stack             show the core stack',
  'about             open the about page',
  'contact           open the contact page',
  'clear             clear the terminal',
]

export function runCommand(input: string, currentPath: string[]): CommandResult {
  const trimmed = input.trim()
  if (!trimmed) return { output: [] }

  const [cmd, arg] = trimmed.split(/\s+/)

  switch (cmd) {
    case 'help':
      return { output: HELP_LINES }

    case 'ls': {
      const resolved = resolvePath(currentPath, arg)
      if (!resolved) return { output: [`ls: ${arg}: no such directory`] }
      const children = resolved.entry.children ?? []
      return { output: children.map((child) => `${child.name}/`) }
    }

    case 'cd': {
      // bare `cd` goes home, unlike `ls`/`open` which default to "here".
      const resolved = resolvePath(currentPath, arg ?? '~')
      if (!resolved) return { output: [`cd: ${arg}: no such directory`] }
      return { output: [], newPath: resolved.path }
    }

    case 'open': {
      const resolved = resolvePath(currentPath, arg)
      if (!resolved) return { output: [`open: ${arg}: no such directory`] }
      if (!resolved.entry.route) return { output: ['nothing to open here.'] }
      return { output: [], navigateTo: resolved.entry.route }
    }

    case 'projects':
      return runCommand('open products', currentPath)

    case 'about':
      return runCommand('open about', currentPath)

    case 'contact':
      return runCommand('open contact', currentPath)

    case 'stack':
      return { output: [site.coreStack.join(', ')] }

    case 'clear':
      return { output: [], clear: true }

    default:
      return { output: [`command not found: ${cmd} — try 'help'`] }
  }
}
