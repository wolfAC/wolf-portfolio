# Phase F — Vehicle Reskin: Implementation Notes

Status: **IMPLEMENTED**. Covers `cyber-city-migration-plan.md`'s F1–F4.

## What changed

| Task | File(s) | What |
|---|---|---|
| F1 | `sources/Game/World/VehicleModel.js` (new), `sources/Game/Geometries/BoxUnionGeometry.js` (new) | An original "night-runner" coupe, procedural (no glTF, no 3D authoring tool available — same reasoning as Roads.js/Buildings.js), matching every named-part convention `VisualVehicle.js` already expects |
| F2 | — (verified, no change) | Body/wheel dimensions were built *to* the existing `Physics/PhysicsVehicle.js` wheel constants, not the other way around — see "F2: no physics change" below |
| F3 | `sources/Game/World/VehicleModel.js` | Magenta underglow strip (cyan for the `oldSchool` variant), amber blinkers, red brake bar, purple boost-energy cells — all from the Phase A1 palette |
| F4 | — (decision: omitted) | The antenna sub-rig is not rebuilt — see "F4: antenna omitted" below |
| — | `sources/Game/World/World.js` | `VisualVehicle` now built from `buildVehicleModel('default')` instead of a loaded glTF scene |
| — | `sources/Game/KonamiCode.js` | The Konami-code vehicle-swap easter egg now toggles between the `default` and `oldSchool` procedural variants instead of reloading two glTF files |
| — | `sources/Game/Game.js` | Removed the `vehicle` resource-manifest entry (no glTF loaded anymore) |
| — | `static/vehicle/` (deleted, 6 files) | Orphaned once nothing loads a vehicle glTF — see "Deletions" below |

## Why `VisualVehicle.js` itself is untouched

`VisualVehicle.js` is a large, intricate rig: it finds its parts by traversing `this.model` and regex-matching child names (`bodyPainted`, `chassis`, `wheelContainer` with `wheelCylinder`/`wheelSuspension`/`wheelPainted` inside it, `stopLights`, `backLights`, `blinkerLeft`/`Right`, `energy`/`cell1-3`, plus an optional `antenna` sub-rig), then clones `wheelContainer` four times and drives everything from `PhysicsVehicle.js`'s per-frame state. Rewriting *that* logic would be by far the highest-risk part of this migration — instead, `VehicleModel.js` builds a plain `THREE.Group` with exactly the child names/hierarchy this existing, working code already expects, and hands it to the completely unmodified `VisualVehicle` constructor. `this.model` is a **temporary wrapper**, not itself ever added to the scene — only `chassis` (extracted from inside it) gets added directly to `game.scene`; `wheelContainer` is kept as `chassis`'s *sibling* inside that wrapper specifically so the original, un-cloned template doesn't end up rendered as a phantom 5th wheel (mirroring how the original glTF scene graph must have been structured, since the same code already relied on this).

## F2: no physics change

Phase A4 (`phase-a4-vehicle-direction.md`) explicitly decided to keep `PhysicsVehicle.js`'s wheel constants (`offset.x = 0.90`, `offset.z = 0.75`, `radius = 0.4` → wheelbase 1.8 m, track 1.5 m, wheel diameter 0.8 m) rather than retune them. `VehicleModel.js` builds its wheel geometry directly from those same constants (`WHEEL_RADIUS = 0.4`) and leaves wheel *positioning* entirely to `VisualVehicle.js`'s existing per-frame logic (which reads `physicalVehicle.wheels.items[i].basePosition` — unchanged). The body itself (2.82 m × 1.9 m × 1.0 m) lands inside Phase A4's suggested ranges. `Physics/PhysicsVehicle.js` was not opened for editing.

## F4: antenna omitted

The antenna is a whimsical bobble-head detail (looks toward a fixed point, spins its head based on distance) — distinctive personality specific to the *original* folio's character, and fully optional/guarded in `VisualVehicle.js` (`setAntenna()` returns immediately if `this.parts.antenna` doesn't exist). Rather than reinvent a replacement gadget under phase-F time constraints, it's left out entirely; nothing else depends on it. One pre-existing, unrelated finding from checking this: `sources/Game/BlackFriday/BlackFriday.js` references `this.game.vehicle.antenna.target` — but `this.game.vehicle` is never assigned anywhere in the codebase (confirmed by search), so that code path was **already broken independent of this phase's changes**; omitting the antenna doesn't introduce any new regression there, and `BlackFriday.js` was left untouched as out of scope.

One small, deliberately-accepted loose end: `VisualVehicle.js`'s `setAntenna()` still contains the line `this.antenna.head = this.game.resources.vehicle.scene.getObjectByName(...)`, which references the now-removed `game.resources.vehicle`. This is **provably unreachable** — the same method's first line (`if(!this.parts.antenna) return`) always returns before that point now, since no antenna part is ever built. Left as-is rather than editing `VisualVehicle.js` at all, per the "don't touch the risky, working rig" reasoning above.

## Preserving the Konami-code easter egg

`KonamiCode.js`'s vehicle-swap easter egg previously reloaded one of two glTF files. It now calls `buildVehicleModel('oldSchool' | 'default')` — same toggle behavior (alternates on each activation, same confetti/achievement side effects), but synchronous (no network fetch needed anymore, so `activate()` is no longer `async`). The `oldSchool` variant reuses the exact same builder with a different parameter set (boxier cabin, cyan accent instead of magenta) rather than a second geometry system.

## A materials subtlety worth flagging

`VisualVehicle.js`'s `setParts()` unconditionally calls `Materials.updateObject()` on the chassis and wheel-container trees, which converts each child mesh's material via a **name-keyed cache** (`getFromName(child.material.name, ...)`). Materials with an unset `.name` default to an empty string — meaning two different unnamed materials could collide under that same cache key and one could silently overwrite/replace the other's converted result for both. Every material `VehicleModel.js` creates is passed through a small `markMaterial()` helper that sets both a real `.name` and `material.userData.prevent = true` (an existing, already-implemented but previously never-exercised escape hatch in `Materials.js` that skips this conversion entirely for materials that opt out). This includes shared presets reused from elsewhere (`emissiveOrangeRadialGradient` for blinkers, `emissivePurpleRadialGradient` for boost cells) — mutating their `userData.prevent` flag doesn't affect other consumers (Barricades/ScrapCrates/HoloSigns), since that flag is only ever consulted inside `Materials.updateObject()`'s traversal, which none of those other systems call on their own meshes.

## Deletions

`static/vehicle/{default,default-compressed,oldSchool,oldSchool-compressed,defaultAntenna,defaultAntenna-compressed}.glb` (6 files) — confirmed via search that nothing loads any of them anymore. Note: `defaultAntenna.glb` was **already unreferenced by any code before this phase** (not part of the resource manifest, not loaded anywhere) — it was orphaned in the original repo already, not something this phase newly stranded.

## Verification performed

- `npm run build`: 759 modules (up from 757 in Phase E: +2 new files) transform without error; same pre-existing, unrelated `vite-plugin-top-level-await` failure documented in Phases B–E's notes.
- `npm run dev`: confirmed every new/changed file transforms and serves cleanly over HTTP.
- **Box-union geometry** (`BoxUnionGeometry.js`), re-run standalone in Node with the vehicle's actual body-box parameters (lower shell + cabin + spoiler): 72 vertices/36 triangles, no `NaN`, every triangle's geometric normal (computed from winding via the right-hand rule) matched its assigned vertex normal — **zero mismatches** — and the resulting bounding box is exactly 2.82 m (length) × 1.9 m (width) × 1.0 m (height), landing inside every one of Phase A4's target ranges.
- **Named-part resolution** — the specific thing most likely to silently break `VisualVehicle.js` without a GPU to see it fail: re-implemented `setParts()`'s exact traverse-and-regex-match logic (and `setWheels()`'s wheel-container sub-match) standalone in Node against `VehicleModel.js`'s real hierarchy. Result: all three *required* parts (`chassis`, `bodyPainted`, `wheelContainer` with `wheelCylinder` inside it) resolve with zero name collisions; all eight optional parts I chose to build (`blinkerLeft`/`Right`, `stopLights`, `backLights`, `energy`, `cell1`-`3`) resolve correctly; only `antenna` is absent, exactly as intended, and it's guarded.
- `grep`'d for remaining references to `game.resources.vehicle`, the old vehicle glTF paths, and the deleted static files — none outside the one confirmed-unreachable line inside `VisualVehicle.js` noted above.

**Not performed (no GPU/browser available in this environment):** actually seeing the vehicle render, driving it, or watching the wheel/suspension/light animations play out. The structural/logical verification above is real evidence the rig will wire up correctly, but it is not a substitute for seeing it drive. Spot-check in a browser before considering Phase F visually final — this is the single most player-visible object in the whole migration.
