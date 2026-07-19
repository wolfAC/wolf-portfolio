# Phase E — Props & Set-Dressing: Implementation Notes

Status: **IMPLEMENTED**. Covers `cyber-city-migration-plan.md`'s E1–E6.

## What changed

| Task | File(s) | What |
|---|---|---|
| E1/E2 | `sources/Game/World/ScrapCrates.js`, `Barricades.js`, `VendingMachines.js`, `HoloSigns.js` (new) | 4 original cyberpunk props replacing `Bricks`/`Fences`/`Benches`/`Lanterns` — procedural geometry + procedural placement instead of loaded glTFs, same reasoning as Roads.js/Buildings.js |
| E1/E2 | `sources/Game/World/PoleLights.js` (rewritten in place) | "Neon Streetlights" — same class/property name (role unchanged), new procedural geometry, placed along the road network instead of Bruno Simon's positions |
| E1/E3 | `sources/Game/World/ExplosiveCrates.js` (rewritten in place) | "Explosive Canisters" — same class/property name and full explode/reset/achievement behavior, new procedural geometry and placement |
| E4 | — (design decision, executed via E6) | **Remove vegetation entirely** — see "E4: vegetation decision" below |
| E5 | — | Explicitly skipped, per the plan's own conditional ("if E4 keeps some vegetation... otherwise skipped") |
| E6 | `sources/Game/World/World.js`, `sources/Game/Game.js` | Removed vegetation instantiation/resources; renamed/rewired the 4 replaced prop systems; kept `poleLights`/`explosiveCrates` property names unchanged |
| — | `sources/Game/World/CyberCityPropPlacements.js` (new) | Shared placement generators: scatter-near-district (for the 4 simple props + canisters) and scatter-along-road (for streetlights) |
| — | `sources/Game/World/ProceduralPropGroup.js` (new) | Shared `InstancedGroup` wiring for the 4 simple dynamic/knockable props (extracted once instead of repeated 4 times) |
| — | `sources/Game/Reveal.js` | Removed two now-dead `if(this.game.world.cherryTrees)` blocks (guarded, so not a crash risk, but pointless code once trees are gone) |
| — | 9 files deleted, 12 static asset folders deleted | See "Deletions" below |

## E4: vegetation decision

**Decision: remove `Grass`, `Trees` (birch/oak/cherry), `Bushes`, `Flowers`, and `Foliage` (the shared leaf-billboard system both `Trees`/`Bushes` depended on) entirely** rather than reducing them to "urban decay" greenery or dedicating a district to a park. None of the six districts from `phase-a2-district-mapping.md` (Corporate Spire, Holo-Bazaar, Broadcast Tower Plaza, Undercroft Fabrication Yard, Skyline Observatory, Dev Circuit) is nature-themed, and Phase A1's direction (dense street canyon, vertical density as the primary "city" signal) doesn't call for greenery. Building new "urban decay" foliage assets for a decorative detail nothing in the district plan asks for would be scope creep; removing it cleanly is the more decisive, correct call. `Foliage.js` was confirmed dead code the moment `Trees`/`Bushes` are gone (it was only ever instantiated *by* those two files, never by `World.js` directly) and is deleted alongside them.

`Leaves.js` (a falling-leaf weather particle effect) was deliberately **not** touched — it's atmosphere/weather (Phase I's territory per the migration plan), not one of the vegetation systems E4 names, and doesn't depend on the tree/bush files being present.

## Why procedural geometry again (not glTFs)

Same reasoning as Phases C/D: no Blender/asset-authoring tool is available here. All six prop types use plain `THREE.BoxGeometry`/`THREE.CylinderGeometry` (not custom-built geometry like `Roads.js`/`Buildings.js`) — these props are small and roughly fixed-size (unlike buildings, which vary hugely), so there's no need for the custom world-unit-UV trick; standard geometry with standard UVs is simpler and lower-risk. Each prop is a small multi-mesh group: one "structure" mesh (a flat A1-palette dark color) plus one "accent" mesh reusing an **existing, already-proven** emissive material from `Game/Materials.js` (`emissiveOrangeRadialGradient`/`emissiveBlueRadialGradient`/`emissivePurpleRadialGradient`) — no new shader code was written for these simple props at all, just new geometry wired to materials that already exist and are already battle-tested.

## Why `InstancedGroup` fits here (unlike Buildings)

Phase D deliberately avoided `InstancedGroup` for buildings because each one needs a unique height/footprint. These props are the opposite case: genuinely repeated, near-identical objects (the textbook use case `InstancedGroup` was built for). `ProceduralPropGroup.js` builds the same `references` (array of positioned `THREE.Object3D`) + `group` (a few procedural meshes) shape that `InstancedGroup.getBaseAndReferencesFromInstances()` normally derives from a loaded glTF's pre-placed instances — just sourced from placement data instead of Blender. One important detail replicated exactly from the existing `getReferencesFromChildren()` helper: each reference needs `.needsUpdate = true` set explicitly, or `InstancedGroup`'s very first update pass won't place it (all instances would silently sit at the origin) — this is called out in `ProceduralPropGroup.js`'s comments since it's easy to miss.

## Preserving existing hooks — the one non-obvious risk in this phase

Two things in the existing codebase depend on these systems by exact name/behavior, found before making any changes (not by accident):

- **`Game.js`'s `reset()`** references `this.world.bricks`/`fences`/`benches`/`lanterns`/`explosiveCrates` by property name to force their `instancedGroup.needsUpdate = true` after a respawn. Since `ScrapCrates`/`Barricades`/`VendingMachines`/`HoloSigns` are genuinely renamed concepts, `reset()`'s 4 corresponding lines were updated to the new property names (`scrapCrates`/`barricades`/`vendingMachines`/`holoSigns`) — otherwise resetting the game would silently stop re-syncing their knocked-over instances after a respawn. `PoleLights`/`ExplosiveCrates` kept their exact names specifically to avoid needing this at all for them.
- **The `explosiveCrates` achievement** (`sources/data/achievements.js`) has a **hard-coded target of 20**, tracked as a `Set` of crate IDs reaching size 20 — `ExplosiveCrates.js`'s `explode()`/achievement-progress code is completely unchanged, but this meant the new placement **must** generate at least 20 canisters or the achievement becomes permanently unattainable. The new placement (4 per district × 6 districts) generates **24**, a small safety margin above the minimum.

## Deletions

**Files:** `Bricks.js`, `Fences.js`, `Benches.js`, `Lanterns.js` (replaced by the 4 new files above), `Grass.js`, `Trees.js`, `Bushes.js`, `Flowers.js`, `Foliage.js` (vegetation, per E4). Confirmed via search that none of these are imported anywhere outside `World.js` (and `Bushes.js`/`Trees.js` importing the now-also-deleted `Foliage.js`) before deleting.

**Static assets:** the glTF/texture folders that only these now-removed systems ever loaded — `static/{bricks,fences,benches,lanterns,poleLights,explosiveCrates,bushes,birchTrees,oakTrees,cherryTrees,flowers,foliage}/` (~524 KB total) — are also removed from the working tree, since `Game.js`'s resource manifest no longer references any of them under either the compressed or uncompressed asset path. All of this is recoverable from git history if needed.

## Verification performed

- `npm run build`: 757 modules transform without error (down from 760 in Phase D: −9 deleted files, +6 new files); same pre-existing, unrelated `vite-plugin-top-level-await` failure documented in Phases B/C/D's notes.
- `npm run dev`: confirmed every new/changed file transforms and serves cleanly over HTTP.
- Grepped the entire `sources/` tree for any remaining reference to the deleted class names, the old `game.world.<prop>` property names, and the deleted static asset paths — none found outside this phase's own new files' explanatory comments.
- `game.materials.getFromName(...)` calls verified against `Materials.js`'s actual registered preset names (`emissiveOrangeRadialGradient`/`emissivePurpleRadialGradient`/`emissiveBlueRadialGradient`) — exact match.
- Placement data (bundled with esbuild, run standalone in Node, matching Vite's own bundling): scrap crates 18, barricades 18, vending machines 12, holo signs 18, **explosive canisters 24** (≥ the achievement's hard-coded requirement of 20), streetlights 98; no non-finite values in any set; all within the 130-unit world half-extent.
- Box/cylinder geometry `translate()` calls verified directly against the real `three/webgpu` classes in Node: each prop's geometry bounding box spans exactly `y = 0` (ground) to `y = height` (top), confirming props sit on the ground rather than being half-buried or floating.

**Not performed (no GPU/browser available in this environment):** actual WebGPU rendering — visual appearance, whether the ~98 streetlights read as appropriately dense or excessive, and whether the (self-resolving, per physics) initial overlap between nearby dynamic props looks acceptable in the first moment after load. Spot-check in a browser before considering Phase E visually final.

## Expected transitional state (not a bug)

- Props are scattered near each district's own footprint and along the new road network — independent of `static/areas/areas.glb`'s still-original Bruno Simon area content (Phase D/L territory).
- `CircuitArea.js` calls `this.game.world.explosiveCrates.reset()` directly (unguarded) — unaffected, since the class/property name and `.reset()` signature are unchanged.
