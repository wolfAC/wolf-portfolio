# Phase J — Water → Wet Streets: Implementation Notes

Status: **IMPLEMENTED**. Covers `cyber-city-migration-plan.md`'s J1–J2.

## What changed

| Task | File(s) | What |
|---|---|---|
| J1 | `sources/Game/World/WaterSurface.js` (deleted), `sources/Game/World/World.js` | Removed the visible reflective water plane + its ice physics collider entirely |
| J1 (discovered) | `sources/Game/World/Litter.js` | Fixed two formulas left reading a terrain data channel whose meaning changed in Phase B, inherited unchanged from `Leaves.js` in Phase I |
| J1 (cleanup) | `sources/Game/World/Roads.js` | Comment referencing the now-deleted file updated |

## J1: the water plane was already dead before this phase — here's the proof

Before deciding, traced exactly what `WaterSurface.js` renders and where: it's a single large flat plane (`setMesh()`) recentered under the camera every frame, positioned at a fixed world height `y = game.water.surfaceElevation` (`-0.3`), scaled to cover the whole visible radius. It is **not** tied to any specific low-lying terrain area — it's a permanent "sea level" plane under the entire world.

Cross-referencing `phase-b-implementation-notes.md`: Phase B's `Floor.js` change is logged as "vertical displacement flipped from a `-1.5`-magnitude **water-sink** to a `+0.15`-magnitude **curb-rise**" — i.e., Phase B already deliberately removed the terrain's only low area (where the ground used to dip down to meet the sea) and replaced it with a curb that rises *above* ground level instead. With no terrain area left that dips anywhere near `y = -0.3`, and the floor's own opaque geometry sitting well above that height everywhere, the water plane has had no line of sight to the camera since Phase B landed — every frame since then has been running a 467-line screen-space-reflection shader (`viewportSharedTexture`, `hashBlur`, `boxBlur`, live depth reprojection) for a plane nothing could ever see. None of the six finalized districts in `phase-a2-district-mapping.md` are a waterfront either, so there's no near-term plan need to keep it reachable.

Given that, and that G2 already gave the actually-visible road surface its own wet-reflection look, removing it outright (rather than the "keep as a harbor district" alternative, which would mean *authoring new low terrain* — real [ASSET] work the finalized A3 layout doesn't call for) was the clear, lower-risk choice.

**What was removed:** `sources/Game/World/WaterSurface.js` (the plane mesh, its shader, and a physical kinematic "ice" collider body used for a slippery-driving mechanic), its import/instantiation in `World.js`. **What was kept:** `sources/Game/Water.js` — a tiny singleton holding just two constants (`surfaceElevation`, `depthElevation`). Confirmed via search these two constants are read independently by four unrelated systems that have nothing to do with the visible plane:
- `Physics.js` — global "in water" linear/angular damping applied to any physics object below `surfaceElevation` (a generic fallen-object behavior).
- `Objects.js` — resets any object that falls below `depthElevation` (out-of-bounds safety net).
- `Floor.js` — positions an opaque backing plane ("bedrock") using `depthElevation` as a depth reference, unrelated to whether water renders.
- `MeshDefaultMaterial.js`'s `hasWater` flag — a shadow-artifact-avoidance hack (forces a thin band near `surfaceElevation` to pure white) that most materials already opt out of (`hasWater: false`).

All four keep working exactly as before; none of them reference the deleted `WaterSurface` class, only these two harmless constants.

**Confirmed safe via the existing guard clause:** `Physics/PhysicsVehicle.js`'s ice-friction driving mechanic reads `this.game.world.waterSurface.ice...`, but it's already wrapped in `if(groundObject && this.game.world.waterSurface)` — with `waterSurface` now simply absent, this evaluates to `false` and the block is skipped every tick, falling back to normal tire friction. No crash, no dead reference, and — per the point above — this mechanic could never have actually triggered in the current city anyway (its ice collider only ever appeared under the now-unreachable water plane).

## Discovered while investigating: Litter.js had two stale terrain-channel reads

Chasing what `WaterSurface.js` and its neighbors read from `Terrain.js` surfaced something outside J1's direct scope but caused by the same Phase B change: `Terrain.js`'s `terrainNode()` data channel `.b` was repurposed in Phase B from "wetness/grass/height" to **`heightMask` (0 = road level, 1 = curb/sidewalk level)** — documented right in `Terrain.js`'s own comment (`sources/Game/Terrain.js:87`). `Litter.js` (this codebase's `Leaves.js`→`Litter.js` rename from Phase I) still had two formulas written against the *old* meaning, carried over unchanged from `Leaves.js`:

- A ground-damping blend that read `.b` as "low = water, high = dry ground" — post-Phase-B this silently applied "water" drag physics to **road surfaces** (`.b≈0`) and "dry ground" drag to curbs, backwards from any coherent intent now that there's no water.
- A floor-clamp that interpolated the litter's minimum resting height toward `water.surfaceElevationUniform` (`-0.3`) as `.b` approached 0 — meaning litter resting on **roads** would clamp toward sinking below the visible ground plane, a real visible bug (debris appearing sunk into the road).

Since there's no more wet/water ground state for either formula to represent, both are simplified to flat constants: ground damping is now always `this.defaultDamping` (dropping the now-pointless `groundDamping`/`inTheAirDamping` split, which — once the terrain-based variation is removed — evaluate to the same constant in both branches anyway), and the floor clamp is a flat `0.02` (the original "dry ground" value). The now-unused `waterDamping` uniform, its debug binding, and the `terrainData` local (with its `step` import) were removed along with it.

This wasn't introduced by this phase — it was a latent bug from Phase B's channel remap that Phase I's Leaves→Litter rename carried forward unnoticed (Phase I's own verification only checked for dangling *references* to the renamed class, not the semantics of what the code was reading) — but it was found and fixed here since it's the same terrain-channel question this phase's investigation was already chasing.

## J2: not applicable

J1 decided full removal, so there's no shoreline to re-tint.

## Verification performed

- `npm run build`: 743 modules transform without error (down from 744 — `WaterSurface.js` removed, nothing added); same pre-existing, unrelated `vite-plugin-top-level-await` failure documented in every prior phase's notes.
- Confirmed via search that `Game.js` never references `WaterSurface`/`waterSurface` (only the kept `Water` singleton) and has no resource-manifest entries to clean up (the class was already fully procedural, no glTF/texture assets).
- Confirmed via search every remaining reference to `water`/`WaterSurface` after this change: `PhysicsVehicle.js`'s guarded (now-dormant) ice branch, `MeshDefaultMaterial.js`'s unrelated `hasWater` hack (reads only the kept `Water.js` constants), and one now-corrected comment in `Roads.js` — no dangling references left.
- Confirmed via search `terrainNode(...).b` had exactly four readers codebase-wide (`MeshDefaultMaterial.js`, the now-deleted `WaterSurface.js`, `Litter.js`, `Floor.js`) before fixing `Litter.js`; `MeshDefaultMaterial.js` and `Floor.js` both already read `.b`/`.r` correctly for their purpose (bounce-light color, sidewalk mask) and needed no change.

**Not performed (no GPU/browser available in this environment):** confirming the water plane was in fact invisible before this phase (the file-level/terrain-geometry evidence above is strong but isn't a substitute for actually looking), or seeing that litter no longer sinks into roads after the fix. Both are good first things to check when a browser is available.
