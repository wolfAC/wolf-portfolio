# Phase D — Buildings: Implementation Notes

Status: **IMPLEMENTED**. Covers `cyber-city-migration-plan.md`'s D1–D8. There was no building system in the original game — this is entirely new content.

**Incident, then restored:** commit `443974e` ("Refactor portfolio: Remove achievements, circuit, and behind-the-scenes sections...") deleted `Buildings.js`, `CyberCityBuildingArchetypes.js`, and `CyberCityBuildingPlacements.js` along with their two-line wiring in `World.js` — despite the commit message never mentioning buildings/skyline, strongly suggesting this was accidental fallout from that cleanup rather than a deliberate scope cut. Restored verbatim from the parent commit (`9756833`) during Phase K's work, once the gap was noticed (an empty skyline undercuts the exact "vertical density = dense city" premise Phase K's bloom tuning and A1's brief both depend on) and confirmed with the project owner. `World.js`'s import + `this.buildings = new Buildings()` were re-added by hand (the surrounding file had changed since — `Snow` removed, `Leaves`→`Litter`, `WaterSurface` removed — so this was a manual re-insertion at the same call site, not a blind revert). Everything below this point describes the original Phase D work; nothing in it needed to change post-restoration.

## What changed (all new files, nothing pre-existing was modified except wiring)

| Task | File(s) | What |
|---|---|---|
| D1/D2 | `sources/Game/World/CyberCityBuildingArchetypes.js` (new) | 4 original greybox archetypes (`slabTower`, `wideBlock`, `steppedZiggurat`, `twinSpire`), each a stack of base/mid/roof box modules — see "Why code, not a modeled kit" below |
| D3/D7 | `sources/Game/World/Buildings.js` (new) | Per-face world-unit UVs baked into the geometry (D3) + a procedural emissive-window TSL material: grid mask, per-window random lit/unlit, flicker, per-building/district tint (D7) |
| D4 | `sources/Game/World/CyberCityBuildingPlacements.js` (new) | 3 hero landmarks (Skyline Observatory, Corporate Spire, Broadcast Plaza), same archetype system with deliberately extreme parameters — see "D4: hero landmarks" below |
| D5 | `sources/Game/World/Buildings.js` (new) | Builds and places every building; deliberately **not** using `InstancedGroup` — see "Why not instanced" below |
| D6 | `sources/Game/World/CyberCityBuildingPlacements.js` (new) | Deterministic (seeded RNG), plain-data placement list — 48 regular buildings (8 per district) + 3 hero landmarks, kept separate from geometry-building code |
| D8 | — | Satisfied by three.js's default per-mesh frustum culling — see "D8: satisfied by default" below |
| — | `sources/Game/World/World.js` | Wired `Buildings` into the world composition (`step(1)`, after `Scenery`) |

## Why code, not a modeled kit (D1/D2/D3)

Same reasoning as `Roads.js` (Phase C): no Blender/asset-authoring tool is available here. Unlike Phase B's terrain, nothing forces a loaded glTF resource, so the "modular kit" idea (D2's explicit goal — decouple building count from modeling effort) is implemented as a **parametric generator**: `Buildings.js`'s `pushBox`/`buildStack` stack base/mid/roof box modules per archetype, with the mid module repeated `placement.midCount` times. This gives the height variety D2 asks for without more modeling — there's no modeling at all, only archetype parameters (`CyberCityBuildingArchetypes.js`) and per-building placement data (`CyberCityBuildingPlacements.js`).

Each face gets **world-unit UVs** (distance along the face's own width, absolute height) rather than normalized 0–1 UVs, so the window grid in the D7 material tiles at a constant physical size regardless of a building's footprint or height — this is the "texture" D3 asks for, expressed as geometry UVs + shader math instead of an image file.

## D4: hero landmarks

Three unique landmarks, one per notable district, using the same archetype system but with deliberately extreme, hand-picked parameters rather than the regular per-district random ranges — this is the procedural equivalent of "unique, non-modular" 3D art (real bespoke modeling isn't available here, so distinctiveness comes from extreme parameterization instead of a new geometry system):

- **Skyline Observatory** (`steppedZiggurat`, 14 mid levels, aggressive taper) — the tallest structure in the city, using the palette's reserved acid-green beacon color (`#8dff4f`, never used on regular buildings — see `phase-a1-art-direction-brief.md`).
- **Corporate Spire** (`twinSpire`, 11 mid levels) — the tallest "regular-family" silhouette, magenta.
- **Broadcast Plaza** (`slabTower`, 12 mid levels, very narrow footprint) — reads as a thin mast/tower rather than a boxy building, cyan.

## Why not instanced (D5)

The plan suggested following `InstancedGroup`'s pattern (`Bricks.js`/`Fences.js`). That pattern assumes one repeated multi-part object with an **identical transform relationship** between its part-meshes across every instance (e.g. every fence post's wheel/body/trim move together). Buildings don't fit this: each one needs its **own** height (different mid-module count) and footprint for skyline variety — Phase A1's explicit "vertical density is the primary dense-city signal" direction — which is exactly what GPU instancing (shared geometry, only the transform varies) can't give without either forcing every building in an archetype to the same dimensions, or faking variety with non-uniform scale (which would visibly stretch/squash the window grid). At ~51 buildings and ~4,300 triangles total (verified below), unique per-building `THREE.Mesh` objects cost nothing worth trading that variety away for.

## D7: material lives in Buildings.js, not Materials.js

`Game/Materials.js` is a factory/cache keyed by **glTF material name** (`getFromName()`/`updateObject()`), for converting artist-authored materials coming out of loaded models. The building window material has no glTF counterpart to key off of — it's shared logic plus one per-building uniform (tint), entirely internal to `Buildings.js`. Adding it to `Materials.js` would mean exporting building-specific concepts (window cell size, lit ratio, flicker speed) into a file otherwise dedicated to generic named-material conversion, for a single consumer. Keeping `createMaterial()`/`setSharedUniforms()` inside `Buildings.js` (same pattern `Roads.js` already uses for its own material) keeps the two systems decoupled without losing anything — a future phase is free to promote it into `Materials.js` if a second consumer shows up.

## D8: satisfied by default

Because buildings are individual meshes (not one large mesh like `Roads.js`'s road network), three.js's own per-`Mesh` frustum culling — left at its default (`frustumCulled = true`) — already culls off-screen buildings with no extra code. `Buildings.js` explicitly calls `geometry.computeBoundingSphere()` on each building's geometry so that culling test has correct bounds immediately rather than relying on lazy computation.

## Collision avoidance in placement (D6)

The first version of the placement generator (simple ring/slot scatter) produced 21 within-district bounding-circle overlap pairs out of 48 buildings — too rough even for greybox. `CyberCityBuildingPlacements.js` now retries each candidate slot (shrinking jitter) up to 6 times against already-placed buildings in the same district, and as a last resort shrinks the footprint (down to 60% of its rolled size) rather than dropping the building. This reduced overlaps to 3 pairs — a known, minor, residual imperfection of a procedural greybox pass, not something to be treated as fully solved. A future real level-design pass should hand-adjust these (or any placements) once real building art exists.

## Physics

Each building gets one `fixed` cuboid collider sized to its full bounding box (via `Game/Objects.js`'s existing generic `getPhysical()` path — no new physics code), positioned/rotated to match the building's placement. This follows the exact same `Objects.add()` pattern already used for the terrain floor and Bruno Simon's original static scenery props (both fixed-type, both visual+physical) — including going through the same per-tick distance-based sleep/wake logic in `Objects.js`, which is therefore already a proven code path, not new risk.

## Verification performed

- `npm run build`: 760 modules (up from 757 in Phase C) transform without error; same pre-existing, unrelated `vite-plugin-top-level-await` failure documented in Phases B/C's notes.
- `npm run dev`: confirmed all three new files and `World.js` transform and serve cleanly over HTTP.
- **Placement data** (`CyberCityBuildingPlacements.js`), bundled with esbuild (matching Vite's own bundling) and run standalone in Node: 51 total placements (48 regular + 3 hero), no non-finite values, 3 residual within-district overlap pairs (see above), max reach from world origin 127.4 units — inside the 130-unit world half-extent with a 2.5-unit margin.
- **Geometry construction math** (`pushBox`/`buildStack`/`buildGeometry`), re-run standalone against the real archetype/placement data: 4,342 triangles / 8,684 vertices total across all 51 buildings, no `NaN`/`Infinity`, no out-of-range indices, height range 10.0–45.9 units (real skyline variety).
- **Winding/normal correctness** — the one thing that would silently break shading in a way I can't see without a GPU: every one of the 4,342 triangles across all 51 buildings had its geometric normal (computed from actual vertex winding via the right-hand rule) checked against the explicitly-assigned vertex normal. **Zero mismatches.** Combined with the material's `THREE.DoubleSide` + explicit-normal setup (which self-corrects lighting even if winding were backwards, via `MeshDefaultMaterial`'s `frontFacing`-based normal flip), this is about as much confidence as is achievable without actually rendering it.

**Not performed (no GPU/browser available in this environment):** actual WebGPU rendering of the buildings — visual appearance, window-grid legibility at typical camera distance, and whether the collision-avoidance residual overlaps (3 pairs) are visually noticeable. Spot-check in a browser before considering Phase D visually final.

## Expected transitional state (not a bug)

- Buildings are scattered within each district's footprint (radius from the district's own center), independent of `static/areas/areas.glb`'s old Bruno Simon area content, which is still the original — driving into a district currently shows new Cyber City buildings surrounding old, unrelated area geometry until Phase E/L replaces it.
- The reserved acid-green beacon color now appears in the world (the Skyline Observatory hero landmark) — first real use of that Phase A1 palette reservation.
