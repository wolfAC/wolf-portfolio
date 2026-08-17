/** Groups `items` by every key `getKeys` returns for them — e.g. project →
 * technologies[] becomes technology → projects[]. Extracted from
 * `TechnologyMap`'s original inline `buildTechMap()` so the Living System
 * Diagram's `skill → project` and `project → module-rail` edges (see
 * `src/data/livingSystemGraph.ts`) reuse the exact same reverse-index logic
 * instead of a second hand-rolled Map loop. */
export function buildReverseIndex<T>(items: T[], getKeys: (item: T) => string[]): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    for (const key of getKeys(item)) {
      const existing = map.get(key)
      if (existing) {
        existing.push(item)
      } else {
        map.set(key, [item])
      }
    }
  }
  return map
}
