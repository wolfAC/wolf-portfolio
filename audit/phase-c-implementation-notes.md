# Phase C — Road Network: Implementation Notes

Status: **IMPLEMENTED**. Covers `cyber-city-migration-plan.md`'s C1–C6.

## What changed

| Task | File(s) | What |
|---|---|---|
| C1 | `sources/Game/World/CyberCityLayout.js` (new), `sources/Game/World/Roads.js` (new) | An original road-surface mesh network (hub roundabout, ring road, 6 radial avenues, 6 gate spurs, 6 alley connectors) built procedurally at runtime from the Phase A3 layout — see "Why procedural, not an authored glTF" below |
| C2 | — | No separate curb geometry needed — see "C2: satisfied by Phase B" below |
| C3 | `sources/Game/World/Roads.js`, `sources/Game/World/Scenery.js` | New "wet asphalt + neon glitter + lane markings" TSL material replacing the old grey glitter shader; the old road-handling (`setRoad()`) is removed from `Scenery.js`, and the old scenery-embedded `road` mesh is now explicitly skipped so it doesn't render a second, unrelated road on top of the new one |
| C4 | `sources/Game/World/Roads.js` | Dashed neon lane-line markings, procedural (no separate texture/decal asset) — see "C4: what's included vs. deferred" below |
| C5 | — | No new collider code needed — see "C5: satisfied by Phase B" below |
| C6 | (design only) | Decision recorded below; no code changed this phase |
| — | `sources/Game/World/World.js` | Wired `Roads` into the world composition (`step(1)`, alongside `Floor`/`Scenery`) |

## Why procedural, not an authored glTF (C1)

Phase B's terrain model (`static/terrain/terrain.glb`) had to be a loaded glTF because `Floor.js` specifically reads height data out of a `THREE.BufferGeometry` resource. The road network has no such constraint — it's pure geometric shapes (discs, annuli, rectangles) fully described by `audit/assets/cyber-city-layout.json`, and, like `Floor.js`'s own ground plane and `Grid.js`'s placeholder grid, it's built directly as a `THREE.BufferGeometry` in JavaScript at runtime. This is simpler, lower-risk (no hand-rolled binary format), and matches the existing codebase's own pattern for procedural ground meshes.

`sources/Game/World/CyberCityLayout.js` is the in-app runtime copy of the Phase A3 layout (`audit/assets/cyber-city-layout.json` can't be imported directly from `sources/` at build time — Vite's configured root is `sources/`, and reaching outside it for a JSON import is unreliable). Keep both in sync if the layout ever changes; both files say so at the top.

## C2: satisfied by Phase B, no additional geometry

The plan's C2 envisioned separate curb/sidewalk-edge geometry. Phase B's terrain heightfield (`static/terrain/terrain.glb`) and ground mask (`static/terrain/terrain.png`) already encode a curb step (flat at road level, +0.15 units everywhere else) computed from this exact same road network — continuous, gap-free at every junction, and physically simulated (the Rapier heightfield collider). Building a second, separately-authored curb mesh on top would duplicate that system and risk visually conflicting with it (double bumps, z-fighting) for no benefit. The road-surface mesh from C1 sits at `y = 0.01`, just above the physical floor's road level, specifically so it reads as a thin visual overlay on top of the (already-curbed) physical ground rather than a second ground system.

## C4: what's included vs. deferred

**Included:** a dashed centerline lane marking, tinted with the cyan neon accent, computed procedurally in the road shader from each mesh piece's UV coordinates (`uv().x` = distance along the road in world units, so dash spacing is consistent regardless of segment length; `uv().y` = position across the road width). Tunable via the debug panel (`🛣️ Roads` folder): `laneLineWidth`, `laneDashLength`, `laneGapLength`, `laneLineIntensity`.

**Deferred:** crosswalk markings (they belong at specific junction points — hub/ring/district gates — and reading well requires knowing exactly where district entrances sit, which is Phase D's job) and glowing traffic-guide props (freestanding light props are more naturally a Phase E prop-set task than a road-shader task). Calling these out explicitly rather than shipping a half-built version of either.

## C5: satisfied by Phase B, no new collider code

The road-surface mesh is purely visual (see above) — driving physics is already fully handled by Phase B's Rapier heightfield collider, which covers the entire 260×260 city (road and sidewalk alike). No `Objects.add()`/collider authoring was needed for this phase.

## C6 design decision: PortalSlabsGeometry motif

**Decision: keep it, retheme it, and generalize its use as the district-entrance light-gate motif.**

`Geometries/PortalSlabsGeometry.js` is currently used once, in `Game/World/Areas/BehindTheSceneArea.js`, as a grid of stepping-stone slabs that light up (screen-space bloom tinted `#6053ff`) as the vehicle approaches — a generic, reusable, already-working technique, not a landmark-specific design. For Cyber City this reads naturally as a "reactive light-tile floor" — exactly the kind of thing a district entrance should have. Rather than replace it with a new geometry system, the plan is to reuse this exact mesh/shader technique at each of the 6 district gate-spur endpoints (`CyberCityLayout.js`'s `districts[].radius - districts[].footprintRadius`, the same point where `Roads.js`'s gate-spur quads currently end), retinted to the Phase A1 neon palette (magenta/cyan rather than the current purple).

This is recorded as a decision only — actually placing six instances of it requires the district/building anchor system that Phase D builds (there's nothing at a gate-spur's end yet to mark the entrance *to*), so no code changed this phase. `BehindTheSceneArea.js` itself is untouched; its own re-theming (to "Archive Substation", per `phase-a2-district-mapping.md`) is Phase D/L work.

## Verification performed

- `npm run build`: 757 modules (up from 755 in Phase B; the two new files) transform without error; the build's final failure is the same pre-existing, unrelated `vite-plugin-top-level-await`/esbuild issue documented in Phase B's notes.
- `npm run dev`: confirmed `Roads.js`, `CyberCityLayout.js`, `Scenery.js`, and `World.js` all transform and serve cleanly over HTTP.
- The geometry-construction math (disc/annulus/quad builders) was extracted and run standalone in Node against the real layout data: 268 vertices, 228 triangles, no `NaN`/`Infinity` values, every index within bounds, no degenerate (zero-length) segments, and the mesh's bounding box (`x: -97..97`, `z: -94..94`) falls well inside the 260×260 world footprint.

**Not performed (no GPU/browser available in this environment):** actual WebGPU shader compilation/rendering of `Roads.js`'s `MeshDefaultMaterial` node graph. Every TSL node method used (`.smoothstep()`, `.oneMinus()`, `.mod()`, `.mul()`, `.sub()`, `.abs()`, `.pow()`, `.toVar()`, `.assign()`, `.addAssign()`, `.mulAssign()`, `mix()`) was deliberately chosen because it's already proven working elsewhere in this exact codebase (either identical to the original `Scenery.js` glitter shader, or the same method chains already shipped in `MeshDefaultMaterial.js`/`Terrain.js`) — but this is risk-reduction, not a substitute for actually seeing it render. Spot-check in a browser before considering Phase C visually final.

## Expected transitional state (not a bug)

- The new road network currently leads to district anchor points where **no district/building content exists yet** (Phase D). Driving to the end of a gate spur will visibly reach "nothing" — an empty plaza — until Phase D lands.
- `static/scenery/scenery.glb`'s *other* props (rocks, terrain dressing, etc.) are still Bruno Simon's originals and still positioned per the old map; only the `road` child specifically was retired this phase. `static/areas/areas.glb` and the vehicle's spawn point are likewise untouched (Phase D/E/L/F).
