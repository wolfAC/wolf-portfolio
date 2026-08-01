# Migration Plan — Reskin to an Original "Cyber City"

Planning document only. No source files were modified to produce this plan. Cross-references `audit/repo-analysis.md` (repo structure/subsystem audit) for file paths and current behavior.

## 0. Hard constraint — originality

Every task below that touches **layout, road topology, landmark design, building silhouettes, area/district concepts, or the map's overall shape** must produce a **new, original design**, not a retexture or geometric copy of Bruno Simon's `folio-2025` map. Concretely:

- Do not reuse or trace the existing `static/areas/areas.glb`, `static/scenery/scenery.glb`, or `static/terrain/terrain.glb` geometry/layout as a base to retexture. These are Bruno Simon's authored layout and must be replaced with new authored content, not skinned.
- Do not reuse the existing road spline/position, the existing area placements relative to spawn, or the existing "quirky landmark" concepts (`toilet`, `bowling`, `altar`, `cookie`, `timeMachine`, `easter`) as-is — reinterpret them as **new original ideas** if kept at all, or drop them.
- The *code systems* (physics vehicle, camera rig, instancing, materials, day-cycle state machine, etc.) are generic engine tooling, not "Bruno Simon's design" — those are fine to keep and extend. The constraint is about **authored content**: 3D layout, story/landmark concepts, road paths, skyline composition.
- Every content-creation task below should end with a self-check: "does this resemble a specific recognizable landmark/layout choice from the original folio, or is it a new decision?"

## 1. How this plan is organized

Work is broken into **phases** (loose ordering by dependency) containing **atomic tasks**. Each task is sized to be doable independently by one person/session without waiting on unrelated tasks. True dependencies are called out explicitly in a task's "Depends on" line; everything else in the same phase (and across phases marked parallel) can proceed concurrently.

Legend: **[ASSET]** = art/content task (Blender/Substance/texture, no code), **[CODE]** = engineering task, **[DATA]** = copy/config task, **[DESIGN]** = decision/direction task with a written artifact as output, no code or assets yet.

---

## Phase A — Direction (blocks nothing but informs everything; do first, keep short)

**Status: COMPLETE.** All four decisions below are final and binding on later phases.

- **A1. [DESIGN] ✅** Write a one-page Cyber City art-direction brief: palette (2–3 neon accent colors + base structure colors), time-of-day default (perpetual night vs. day/night cycle kept), density (sparse "Bruno-style open field" vs. dense street canyon), scale of the drivable area. *No dependencies.* → `phase-a1-art-direction-brief.md`
- **A2. [DESIGN] ✅** Decide the fate of each existing Bruno-specific `Area` concept (`achievements`, `altar`, `behindTheScene`, `bowling`, `career`, `circuit`, `cookie`, `lab`, `landing`, `projects`, `social`, `toilet`, `timeMachine`, `easter` — see `Game/World/Areas/Areas.js`): keep the *slot* (career/projects/social/lab map naturally to a portfolio) and redesign its *content*, or drop it. Output: a table of old-area → new-district-concept. *No dependencies.* → `phase-a2-district-mapping.md`
- **A3. [DESIGN] ✅** Sketch a new, original top-down road/skyline layout (paper/Figma), independent of the current map's shape — this is the reference the road and building tasks below build from. *Depends on: A1.* → `phase-a3-city-layout.md`, `assets/cyber-city-layout.json`, `assets/cyber-city-layout-sketch.svg`
- **A4. [DESIGN] ✅** Decide whether the drivable vehicle keeps a "car" silhouette or becomes something else (hover vehicle, bike) — affects `Physics/PhysicsVehicle.js` tuning later but not now. *No dependencies.* → `phase-a4-vehicle-direction.md`

---

## Phase B — Ground & terrain (parallel with C, D, E, F once A1 is done)

**Status: IMPLEMENTED.** See `phase-b-implementation-notes.md` for the full write-up, verification performed, and caveats (stale `.ktx` compressed textures pending `toktx` tooling; old areas/scenery/props still sit on the new ground pending Phases C–L).

- **B1. [ASSET] ✅** Author a new low-relief "city-block" heightfield model (mostly flat, curbs/sidewalk steps) to replace `static/terrain/terrain.glb`. Independent of road/building art. → generated via `assets/scripts/generate-terrain-model.mjs`
- **B2. [ASSET] ✅** Author a new ground color/mask texture (asphalt/sidewalk/grime/emissive-strip channels) to replace `resources/textures/terrainData.png` (+ the `terrainGrass.exr`/`terrainWater.exr` role) — repurpose the RGB-channel convention documented in `Terrain.js` (r/g/b currently = slab/grass/height) for new meanings (e.g. r=sidewalk mask, g=road mask, b=height), and record the new convention in a short doc. → generated via `assets/scripts/generate-terrain-mask-texture.mjs`; convention documented in `phase-b-implementation-notes.md`
- **B3. [CODE] ✅** Update `Game/Terrain.js`'s `colorNode`/gradient logic to read the new mask convention from B2 instead of grass/dirt/water. *Depends on: B2 (needs final channel convention, not final art).*
- **B4. [ASSET] ✅** Replace the slab/stone overlay texture (`resources/textures/slabs.sbs` → `static/floor/slabs.png`) with a new original sidewalk/pavement pattern (e.g. hex tile, brushed metal grate). → generated via `assets/scripts/generate-slab-pavement-texture.mjs` (procedural diamond-plate pattern); source `.sbs` intentionally left untouched, see implementation notes
- **B5. [CODE] ✅** Update `Game/World/Floor.js`'s color shader uniforms/frequencies to match the new textures from B2/B4 (cosmetic tuning only, no structural change needed).
- **B6. [CODE] ✅** Regenerate the Rapier heightfield collider from the new terrain model (B1) — this falls out of `Floor.js setPhysical()` automatically once B1's glTF is swapped in; task is just verifying collider row/column counts still match. → verified 16,641 = 129² vertices
- **B7. [ASSET] ✅** Update `Game/World/Grid.js`'s pre-reveal placeholder grid color/scale to match the new palette from A1 (trivial, independent).

---

## Phase C — Road network (original layout; parallel with B, D, E, F)

**Status: IMPLEMENTED.** See `phase-c-implementation-notes.md` for the full write-up, verification performed, and caveats (WebGPU shader rendering not visually confirmed in this environment; district anchors don't exist yet so roads currently lead to empty plazas pending Phase D).

- **C1. [ASSET] ✅** Model an original road-surface mesh network following the new layout sketch (A3) — replaces the single `road`-named mesh currently embedded in `static/scenery/scenery.glb` (see `Game/World/Scenery.js` `setRoad()`). Can be one mesh or split into tiles; decide tiling now to unblock C2/C3. → built procedurally at runtime in `Game/World/Roads.js` from `Game/World/CyberCityLayout.js`, not an authored glTF (see implementation notes for why)
- **C2. [ASSET] ✅** Model matching curb/sidewalk-edge geometry along the new road network (separate from C1 so C1 can be iterated without redoing curbs). → satisfied by Phase B's terrain heightfield/mask (already encodes a continuous, physically-simulated curb step); no separate geometry added, see implementation notes
- **C3. [CODE] ✅** Rewrite `setRoad()` in `Game/World/Scenery.js` (or extract into a new `Game/World/Roads.js`) to target the new road mesh name/structure from C1 and a new "wet asphalt + neon reflection" TSL shader instead of the current grey "glitter" shader. *Depends on: C1 (mesh must exist and be named), D-materials work for the shader look (Phase G).* → extracted into `Game/World/Roads.js`; old `setRoad()`/old road mesh retired from `Scenery.js`. Phase G's dedicated reflective material can later replace this shader without blocking on it
- **C4. [ASSET] ✅** Design original road markings/decals (lane lines, crosswalks, glowing traffic guides) as a texture or decal mesh set — independent of C1's base mesh modeling. → dashed neon lane-line markings implemented procedurally in `Roads.js`'s shader; crosswalks/traffic-guide props explicitly deferred (see implementation notes)
- **C5. [CODE] ✅** Add physics colliders for the new road/curb geometry via the existing `physical`/`fixed` naming convention in `Game/Objects.js getFromModel()` — no new collider code needed, just correct authoring of collider child nodes in C1/C2's glTF export. → satisfied by Phase B's heightfield collider; the road mesh is purely visual, no collider needed
- **C6. [DESIGN] ✅** Decide whether the "PortalSlabsGeometry" stepping-stone effect (`Geometries/PortalSlabsGeometry.js`, currently used for area entrances) is kept as a district-entrance motif or replaced with a new original motif (e.g. a light-gate arch). *No dependencies.* → keep and retheme it as the district-entrance light-gate motif at all 6 gate-spur endpoints; actual placement is Phase D/L work (see implementation notes)

---

## Phase D — Buildings (new system; parallel with B, C, E, F)

There is currently **no building system** in the codebase — this is new work, not a reskin of an existing one.

**Status: IMPLEMENTED.** See `phase-d-implementation-notes.md` for the full write-up, verification performed (including an exhaustive winding/normal check across every triangle), and caveats (not visually rendered in this environment; 3 residual placement overlaps; buildings currently surround old, unreplaced area content pending Phase E/L).

- **D1. [ASSET] ✅** Design 3–5 original building archetypes (massing/silhouette only, greybox) matching the skyline sketch from A3 — explicitly not traced from any reference city skyline photo of a real/fictional city associated with the original folio. → 4 archetypes in `Game/World/CyberCityBuildingArchetypes.js`
- **D2. [ASSET] ✅** Model each archetype as a modular kit (base, mid stack, roof cap) so buildings can vary in height by stacking modules — decouples "how many buildings" from "how much modeling." → implemented as a parametric box-stacking generator in `Game/World/Buildings.js` rather than modeled meshes (no 3D authoring tool available; see implementation notes for why this is the right substitution, not a placeholder)
- **D3. [ASSET] ✅** UV/texture the building kit: base structure material + emissive window/sign channel mask (separate texture or vertex-color channel) for neon window lighting. → world-unit UVs baked per-face into the geometry, consumed by D7's procedural window shader (no separate texture file needed)
- **D4. [ASSET] ✅** Author 2–3 large "hero" landmark structures (unique, non-modular) for skyline focal points — original silhouettes per the no-landmark-copying constraint. → 3 hero landmarks in `Game/World/CyberCityBuildingPlacements.js` (Skyline Observatory, Corporate Spire, Broadcast Plaza), same archetype system with deliberately extreme parameters
- **D5. [CODE] ✅** Create `Game/World/Buildings.js` following the existing instanced-prop pattern (`InstancedGroup` + `Objects.add` per `Game/World/Bricks.js`/`Fences.js` as a template) to place building instances from a placement list (position/rotation/scale/archetype-index) and give each a static (`fixed`) collider. → built, but deliberately **not** GPU-instanced — see implementation notes for why `InstancedGroup`'s pattern doesn't fit variable per-building height/footprint; `Objects.add()` + a fixed cuboid collider per building is used as specified
- **D6. [DATA] ✅** Produce the building placement list (positions along the new road network from C1) as plain data (JSON/JS array), separate from the building meshes themselves so layout can be iterated without re-modeling. → `Game/World/CyberCityBuildingPlacements.js`, deterministic seeded-RNG generation, 48 regular + 3 hero placements, with retry-based collision avoidance
- **D7. [CODE] ✅** Write the emissive-window TSL material (random lit/unlit window pattern, flicker, per-building color tint) as a new material in `Game/Materials.js`/`Game/Materials/`, reusable across D2's kit and D4's landmarks. *Depends on: D3 (texture channel convention).* → implemented directly in `Buildings.js` (shared uniforms + a per-building tint factory) rather than in `Materials.js`, since it's specific to this one consumer; see implementation notes
- **D8. [CODE] ✅** Add building frustum culling for distant/off-screen buildings — reuse the existing `Area`-style `zoneFrustum` visibility pattern (`Game/World/Areas/Area.js`) or a simpler distance cull if the city is large; independent of D5's placement logic, can be added after. → satisfied by three.js's default per-mesh frustum culling (buildings are individual meshes, unlike `Roads.js`'s single mesh), with explicit `computeBoundingSphere()` calls; no custom culling system needed

---

## Phase E — Props & set-dressing (parallel with B, C, D, F)

**Status: IMPLEMENTED.** See `phase-e-implementation-notes.md` for the full write-up, the two easy-to-miss existing hooks that had to be preserved (`Game.js`'s `reset()` property names, the `explosiveCrates` achievement's hard-coded target of 20), and caveats (not visually rendered in this environment).

- **E1. [ASSET] ✅** Design 6–10 original cyberpunk props to replace the current nature/rustic set (`Bricks`, `Fences`, `Benches`, `Lanterns`, `PoleLights`, `ExplosiveCrates`, trees/bushes/flowers): e.g. holographic billboards, vending machines, dumpsters, cable bundles, street barriers, drones, neon streetlights, AC units, market stalls. → 6 new props: Scrap Crates, Barricades, Vending Machines, Holo Signs, Neon Streetlights, Explosive Canisters
- **E2. [CODE] ✅** For each replaced prop category, swap the source glTF referenced in `Game/Game.js`'s resource manifest and in the matching `Game/World/*.js` file (e.g. `PoleLights.js` → new neon streetlight mesh) — mechanical, one prop category per task, fully independent of other categories. → all 6 now use procedural geometry (no glTF at all, no authoring tool available — see implementation notes), resource manifest entries removed accordingly
- **E3. [ASSET] ✅** Design 1–2 new "explosive/interactive" props to replace `ExplosiveCrates` (e.g. a destructible vending machine or barrel) if that gameplay hook is kept. → "Explosive Canisters," same class/reset/achievement wiring, new geometry and placement (24 instances, above the achievement's minimum of 20)
- **E4. [DESIGN] ✅** Decide fate of vegetation systems (`Trees.js`, `Bushes.js`, `Flowers.js`, `Grass.js`, `Foliage.js`): remove entirely, reduce to occasional "urban decay" greenery (weeds through cracked pavement), or keep as park-district dressing in one district only. *Depends on: A2 (district plan).* → removed entirely; no district in the Phase A2 plan is nature-themed
- **E5. [ASSET]** Skipped — E4's decision was "remove entirely," and the plan's own wording marks E5 skipped in that case.
- **E6. [CODE] ✅** Update `Game/World/World.js`'s `step()` construction list to add new prop classes and remove/gate deprecated ones per E4's decision. Small, mechanical, do last within Phase E once E2/E4 land. → done, plus the corresponding `Game.js` `reset()` renames and a small dead-code cleanup in `Reveal.js`

---

## Phase F — Vehicle reskin (parallel with everything else)

**Status: IMPLEMENTED.** See `phase-f-implementation-notes.md` for the full write-up — including exhaustive verification that the procedural model's named-part hierarchy resolves correctly against `VisualVehicle.js`'s existing (untouched) traverse/regex-match logic, with zero collisions and no missing required parts.

- **F1. [ASSET] ✅** Model/texture a new original vehicle (or hover-vehicle per A4) to replace `static/vehicle/default.glb`, keeping the wheel-contact-point layout compatible with `Physics/PhysicsVehicle.js`'s 4-wheel raycast assumptions (or note required tuning if wheel count/positions change). → procedural (no glTF, no 3D authoring tool available), `Game/World/VehicleModel.js` + `Game/Geometries/BoxUnionGeometry.js`; `static/vehicle/` deleted (orphaned)
- **F2. [CODE] ✅** Tune `PhysicsVehicle.js` wheel `offset`/`radius` constants to match F1's new model dimensions. *Depends on: F1 (final dimensions).* → no change needed: the new model was built to match the existing constants exactly, per Phase A4's decision; `PhysicsVehicle.js` untouched
- **F3. [ASSET] ✅** Design new emissive accents for the vehicle (underglow, headlight color) matching the neon palette from A1. → magenta underglow (cyan for the `oldSchool` Konami-code variant), amber blinkers, red brake bar, purple boost-energy cells
- **F4. [ASSET]** Model a small antenna/accessory variant to replace `static/vehicle/defaultAntenna.glb` (cosmetic, optional). → decided to omit (marked optional by the plan itself); see implementation notes for why, and the pre-existing (unrelated) `BlackFriday.js` finding uncovered while checking this was safe

---

## Phase G — Materials & shading language (parallel with B–F; some tasks gate others as noted)

**Status: IMPLEMENTED.** See `phase-g-implementation-notes.md` for the full write-up, including why the palette texture (G5) needed a constrained retint rather than a fresh image (it's still read by unreplaced Bruno Simon scenery/area assets), and why G3 turned out to require no code change at all.

- **G1. [CODE] ✅** Design and implement a new "neon emissive" TSL material variant (color + intensity uniform, optional flicker/pulse over time) in `Game/Materials.js`, generalized so D7 (building windows), E1 (holographic props), and F3 (vehicle underglow) can all reuse one implementation instead of three bespoke ones. → extended the previously-unused `createEmissive()` with flicker support; D7/E1/F3's existing, already-verified bespoke materials were deliberately left as-is rather than retroactively migrated (see implementation notes)
- **G2. [CODE] ✅** Design and implement a "wet reflective surface" TSL material (screen-space or cheap planar reflection + fresnel) for roads/sidewalks, reusing `WaterSurface.js`'s existing screen-space blur/reflection plumbing as a starting point rather than building from scratch. *Feeds into C3.* → added a fresnel (grazing-angle) term to `Roads.js`, reusing the exact technique already proven in `VisualVehicle.js`'s abyssal paint; full screen-space reflection was judged too high-risk to implement unverifiable
- **G3. [DESIGN → CODE] ✅** Decide and implement the new core "look" replacement for `Game/Materials/MeshDefaultMaterial.js`'s stylized bounce-light/core-shadow terms — city materials likely want less "bounce light from grass" and more "bounce light from neon" — this is a parameter/tuning pass on the existing shader, not a rewrite. → verified no change needed: the bounce color already comes from `Terrain.colorNode()`, retinted in Phase B; `MeshDefaultMaterial.js` untouched
- **G4. [CODE] ✅** Re-theme `Game/Materials.js`'s existing gradient/emissive presets (`emissiveOrangeRadialGradient`, `emissivePurpleRadialGradient`, etc.) to the new palette from A1 — pure constant/color swap, no structural change. → all 4 presets retinted per the A1 mapping table, plus `Materials.js`'s own separate `gradientTexture` (used by `Trails.js`/`Whispers.js`); `redGradient` (a vehicle paint choice) deliberately left alone
- **G5. [ASSET] ✅** Produce a new palette texture to replace `resources/palette.png`/`static/palette.png` (the baked vertex-color lookup used across many props) matching A1. → regenerated both files, preserving the exact 128×4 column layout so still-active old assets (`scenery.glb`/`areas.glb`) sample coherent new colors instead of breaking

---

## Phase H — Lighting (depends on A1; otherwise parallel)

**Status: IMPLEMENTED.** See `phase-h-implementation-notes.md` for the full write-up, including why `Ligthing.js` itself needed no code change (H3) and why H4 was decided against adding real point lights.

- **H1. [DESIGN] ✅** Decide day-cycle fate: keep `Cycles/DayCycles.js`'s 4-phase day/dusk/night/dawn loop (retint presets for a city), or collapse to a permanent "night" mood with only subtle variation. *Depends on: A1.* → kept the 4-phase loop per A1's explicit decision, renamed to overcastDusk/neonDusk/deepNight/electricDawn
- **H2. [CODE] ✅** Re-tint `DayCycles.js`'s `presets` object (light/shadow/fog/reveal colors per phase) to the new palette — data-only change, no structural change, can be iterated many times cheaply. → all 4 presets retinted, `lightIntensity` brought into A1's binding ranges (`deepNight` was 3.8, now 0.6)
- **H3. [CODE] ✅** Tune `Game/Ligthing.js`'s directional-light intensity/angle defaults for a night-dominant look (dimmer sun-equivalent, more reliance on emissive props for fill light) — small parameter pass, depends on H1's decision but not on final art. → verified no change needed: the fixed `DirectionalLight(0xffffff, 5)` only drives shadow-map position/frustum and is never read as a color/brightness value; the actual mood lever is `dayCycles.properties.lightColor/lightIntensity` multiplied directly into `MeshDefaultMaterial`'s output color, which H2 already retuned. `phi`/`theta`/amplitudes are shadow-direction tuning, unrelated to color mood; left untouched.
- **H4. [DESIGN] ✅** Decide whether to add secondary point/area "practical" lights (streetlights, sign glow) beyond the single directional light — if yes, scope as a follow-up task (`H5`) since it's a new lighting system, not a reskin. → decided against: Phase E's streetlights/signs already glow via emissive materials + bloom (no real light consumed), consistent with this codebase's shading model and perf posture; adding real dynamic lights would be a new, riskier system for no visible gain.
- **H5. [CODE]** Skipped — H4's decision was "no," and the plan's own wording marks H5 conditional on that decision.

---

## Phase I — Weather & atmosphere (parallel with everything)

**Status: IMPLEMENTED.** See `phase-i-implementation-notes.md` for the full write-up, including the downstream snow hooks (a Christmas easter egg, a rain-volume duck, a rain-streak deformation) that had to be unwound together, not just the visual `Snow.js` class.

- **I1. [DESIGN] ✅** Decide which existing weather systems fit a cyber city (rain fits well; snow/lightning are optional; wind-blown leaves should likely be replaced with wind-blown litter/steam). → kept rain and lightning (both generic, no nature-coupling, and lightning reinforces the "electric" mood); cut snow entirely (competes with the brief's single "rain-slicked" identity); replaced wind-blown leaves with wind-blown litter (full mechanic reuse, content-only reskin)
- **I2. [CODE] ✅** Re-tint `Game/Fog.js`'s radial background/fog colors to the new palette — data-only, depends on A1 not on other phases. → verified already satisfied by Phase H: `Fog.js` reads its colors live from `dayCycles.properties.fogColorA/fogColorB`, which Phase H already retinted; no separate change needed here
- **I3. [ASSET] ✅** If keeping rain (`World/RainLines.js`), no asset change needed; if adding "steam vents" or "smog", author a new small particle/plane effect following the same pattern as `RainLines.js`/`Snow.js`. → rain kept as-is (no asset change); decided against adding a separate steam/smog system for now — the litter reskin is this phase's atmosphere deliverable, keeping scope tight (see notes)
- **I4. [CODE] ✅** Wire any new atmosphere effect from I3 into `Game/Weather.js`'s orchestration, following the existing on/off + intensity pattern used for rain/snow. → no new effect to wire in per I3's decision; instead unwound the `snow` weather property and every place it fed (`RainLines.js`, `Audio.js`) now that nothing produces it visually

---

## Phase J — Water → wet streets (optional; parallel)

**Status: IMPLEMENTED.** See `phase-j-implementation-notes.md` for the full write-up, including why the water plane was already invisible before this phase and a latent bug this investigation uncovered and fixed in `Litter.js`.

- **J1. [DESIGN] ✅** Decide whether the open "sea" (`Game/Water.js`/`World/WaterSurface.js`) is kept as a city-edge waterfront (harbor district) or removed entirely in favor of the new wet-road reflections from G2. → removed `WaterSurface.js` (the 467-line reflective plane + its ice collider) entirely: Phase B already eliminated the terrain's low "water sink" areas in favor of curb rises, so the water plane sat permanently hidden beneath solid ground with no way to become visible, and none of the finalized A2/A3 districts are a waterfront. `Water.js` (the small elevation-constant singleton) was kept — several unrelated systems (physics submersion damping, out-of-bounds resets, a shadow-near-water material hack) harmlessly reuse its two constants regardless of whether a visible ocean exists.
- **J2. [ASSET]** Skipped — not applicable, per J1's "removed entirely" decision.

---

## Phase K — Post-processing (fully independent of art/content phases)

**Status: IMPLEMENTED.** See `phase-k-implementation-notes.md` for the full write-up, including why the old bloom threshold meant building windows likely never bloomed at all.

- **K1. [CODE] ✅** Tune `Rendering.js`'s bloom pass (`threshold`/`strength`/`smoothWidth`) for a neon-heavy scene (city lights should bloom more aggressively than the original's occasional emissive accents). → `threshold` 1 → 0.4 (derived from actual A1 palette luminance, see notes), `strength` 0.25 → 0.75; `smoothWidth` left at 1 (already a soft knee, fits the mood)
- **K2. [CODE] ✅** Add a new optional post pass (e.g. subtle chromatic aberration or scanline/vignette) alongside the existing `cheapDOF` in `Passes/`, gated by `Quality.level` the same way DOF currently is. → added a screenUV-radius vignette, gated to quality level 0 only (matches DOF's tier); chose vignette specifically over chromatic aberration/scanlines since it can't visually go wrong without a GPU to check
- **K3. [CODE] ✅** Re-evaluate `cheapDOF.js`'s blur `start`/`end` defaults against the new denser building geometry (tighter depth range in a street canyon vs. an open field). → `end` widened 0.5 → 0.62 (and its debug slider ceiling raised to match) so the now-much-taller restored skyline (Phase D) doesn't get blurred into illegibility

---

## Phase L — Districts / portfolio content mapping (parallel; content-only, no 3D dependency to start)

**Status: PARTIALLY IMPLEMENTED.** See `phase-l-implementation-notes.md` for the full write-up — this phase turned out to require reconciling `CyberCityLayout.js` itself (5 of its 12 slots pointed at Area classes deleted after A2/D were written) before L1's copy could mean anything, and L3 was found to be much larger in scope than a "reskin" and was deliberately not attempted.

- **L1. [DATA] ✅** For each kept district from A2, write the new original theming copy/description (no 3D work yet) — e.g. "Career" becomes "Corporate Spire district", "Lab" becomes "Underground Fabrication district". → `phase-l-district-copy.md`, covering the 8 districts that survived the layout trim below
- **L1 (prerequisite, not originally scoped) ✅** `CyberCityLayout.js` still defined 6 districts + 6 alley nodes, but 5 of those slots (`broadcastPlaza`/social, `undercroftYard`/lab, `skylineObservatory`/achievements, `devCircuit`/circuit, `archiveSubstation`/behindTheScene) pointed at Area classes deleted by commit `443974e` after this plan and A2 were written — leaving fully-built roads (and, for the 4 districts, buildings+props) with nothing at the other end. Per direction from the project owner, trimmed the layout to the 8 surviving slots rather than leaving dead ends, relocating the two orphaned hero landmarks instead of deleting them. See notes for the crash this surfaced and how it was fixed.
- **L2. [ASSET]** Not attempted — needs a 3D authoring tool not available in this environment, same constraint as every other `[ASSET]` task throughout this plan.
- **L3. [CODE]** Not attempted — found to be much bigger than "update bespoke logic to match the new concept": `BowlingArea.js`, `AltarArea.js`, `CookieArea.js`, `ToiletArea.js`, `TimeMachineArea.js` still run their **original, pre-reskin mechanics/content** wholesale (real bowling, the original altar, the original cookie-consent joke, an actual toilet cabin, an actual TV/time-machine), even though `CyberCityLayout.js` already carries their new district names. A2 itself calls for replacing Bowling's *mechanic*, not just its skin. Rewriting five gameplay mechanics with zero ability to playtest them (no GPU/browser in this environment) is a different risk class from anything else in this plan — deliberately deferred, not silently skipped; see `phase-l-district-copy.md`'s summary table for exactly which districts this affects.
- **L4. [DATA]** Not attempted this phase — per explicit direction from the project owner to finish the visual/world phases (H–Q) before content work.

---

## Phase M — Physics/collision follow-through (mechanical, trails each asset phase)

**Status: VERIFIED, no code changes needed.** See `phase-m-implementation-notes.md` for the two dimensional checks performed in place of guessing.

- **M1. [CODE] ✅** Verify/author collider child-node naming (`trimesh`/`hull`/`cuboid`/`tube`/`ball` prefixes per `Objects.js getFromModel()` convention) for every new asset from Phases B–F as it's authored — track as one checklist item per asset category rather than one giant task. → not applicable: every Phase B–F asset is procedural with an explicit code-declared collider (no glTF authored for any of it, confirmed via search), so there's no node-naming convention to check. The only remaining glTF-sourced physical content (`areasModel.glb`) is original, pre-migration content this plan never touched.
- **M2. [CODE] ✅** Re-tune `PhysicsVehicle.js` global constants (`topSpeed`, `engineForceAmplitude`, suspension heights) if the new city is denser/tighter than the original's open field — a driving-feel pass done after Phase C/D layouts are roughed in. → checked two concrete dimensional questions instead of guessing at "feel": the vehicle's ~1.8-unit width leaves ~1.1 units clearance per side even in the narrowest 4-unit alley connectors, and its suspension travel (0.88–1.63 units) comfortably absorbs Phase B's 0.15-unit curb rise. No structural reason to change anything; actual driving *feel* (is boost too fast for the tighter streets) needs real playtesting, same constraint as Phase L3.

---

## Phase N — Performance & quality tiers (do continuously, finalize last)

**Status: VERIFIED via estimate, no code changes.** `stats-gl`'s live counters (N1's actual profiling) need a real browser this environment doesn't have; see `phase-n-implementation-notes.md` for the triangle-count estimate used in its place, and why it points away from N2 being necessary.

- **N1. [CODE]** Re-profile `stats-gl` draw calls/triangles (`Rendering.js setStats()`, enabled via `#stats` URL hash) once buildings (D) and props (E) are in, to catch instancing regressions early. → not performed live (no browser); estimated instead from Phase D's own triangle count scaled by the Phase L building-count reduction (51→19 buildings) — roughly ~1,600 triangles for buildings, well under any concerning budget
- **N2. [CODE] ✅** Extend `Quality.js`'s two-tier system if a dense city needs a third tier (e.g. building draw distance) — only if N1 shows it's necessary. → not necessary: the Phase L trim reduced total building/prop count rather than increasing it, and the estimate above shows no evidence of a triangle/draw-call budget problem: N1's own condition for doing this ("only if N1 shows it's necessary") isn't met
- **N3. [CODE] ✅** Confirm `Game/Objects.js`'s existing distance-based sleep/cull radius (tied to `View.optimalArea.radius`) still gives acceptable behavior with many more instanced dynamic props (E) than the original scene had. → verified the premise doesn't apply: the cull radius governs how many objects are *near the camera at once*, which is set by Phase E's per-district density (unchanged) — Phase L's trim removed whole *distant* districts, not local density, so nothing about total prop count near the camera increased

---

## Phase O — Audio (fully independent)

**Status: AUDITED, one mechanical fix applied; asset sourcing not attempted.** See `phase-o-implementation-notes.md` for the full inventory of every registered sound and which ones need real replacement audio.

- **O1. [ASSET]** Source/compose a new synth-driven ambient city soundscape to replace nature ambience, following `Game/Audio.js`'s existing registration pattern. → not attempted: needs real audio files (composed or sourced with a checkable license), which this environment has no safe way to produce — pointing `path:` at files that don't exist would break audio playback outright, worse than the current thematic mismatch. Full inventory of what needs replacing (9 nature/analog registrations) written up instead.
- **O2. [ASSET]** Re-record or re-source vehicle SFX (engine/tires/horn) if F1/F4 change the vehicle's character (e.g. hover vehicle needs a different engine sound than a muscle-car sample). → not attempted, same constraint as O1; Phase F kept a grounded 4-wheel vehicle (A4's decision), so the existing engine/tire SFX character likely still fits reasonably, lower priority than O1's more obviously mismatched nature sounds
- **O3. [CODE] ✅** Register new sound groups/files via `Game/Audio.js`, following the existing `register()`/`playRandomNext()` API already used by `Player.js` and prop collision callbacks — no new audio architecture needed. → no new sounds to register (blocked on O1/O2), but found and fixed one existing mismatch this way: `ScrapCrates.js` was tagged `soundGroup: 'hitBrick'` (masonry-impact samples) for what Phase E's own notes call "scrap-metal crates" — retargeted to the already-registered `hitMetal` group, no new asset needed

---

## Phase P — UI/HUD (fully independent)

**Status: PARTIALLY IMPLEMENTED.** See `phase-p-implementation-notes.md` — P1's colors are done, P2 needed almost nothing, but P3 uncovered the single most visible player-facing mismatch found this session: the minimap image is still a literal picture of the old Bruno Simon island, and fixing that needs real image authoring this environment can't do.

- **P1. [ASSET/DATA] ✅** Re-theme `sources/style/*.styl` colors/fonts to the Cyber City palette (map, menu, tabs, notifications, achievements). → retinted every non-neutral, non-palette color across `easter.styl`/`general.styl`/`map.styl`/`menu.styl`/`notifications.styl`/`tooltips.styl` to the A1 table (full mapping in notes); left neutral grays/whites/blacks and `blackFriday.styl`'s own separate seasonal palette untouched
- **P2. [ASSET] ✅** Re-icon the map/UI SVGs in `static/ui/` (flag, gear, home, medal, etc.) to match the new visual language. → checked every SVG's fill/stroke colors first: nearly all are plain white line-art (theme-neutral by design, needs no change) or vehicle-paint swatches (`achievements/rewards/*`, still actively used by `VisualVehicle.js`/`Roads.js` despite the folder name, left alone). Found and deleted one genuinely dead, unreferenced asset (`achievements/check.svg`, hardcoded to the old success-green, orphaned since the Achievements system was deleted) — otherwise nothing here needed new icon art.
- **P3. [ASSET] ❗ Partially implemented.** Re-theme `Game/Map.js`'s minimap rendering (colors only, not logic) to match new road/building layout once Phase C/D layouts exist. → fixed the one code-level bug this uncovered (the 7 map location pins still showed old Bruno-Simon-era names — "Bowling," "Career" — instead of the Phase L district names); the minimap *image itself* (`static/ui/map/map-day.webp`/`map-night.webp`) is still a literal illustrated picture of the old open-field island with its circuit track and lake — completely unrelated to the new hub-and-ring Cyber City layout, and needs real image authoring (or a from-scratch procedural canvas replacement) neither of which this environment can safely attempt blind. This is the most visually obvious mismatch found this entire session — flagging prominently, not quietly.

---

## Phase Q — Verification (final, after each contributing phase)

**Status: PARTIALLY DONE.** Q1 completed as a documentation-based review (see `phase-q-implementation-notes.md` for the actual findings — this is not a clean bill of health, two concrete originality gaps remain and are named explicitly). Q2 needs a browser this environment doesn't have. Q3 isn't needed yet.

- **Q1. [DESIGN] ✅** Originality self-review pass against the Phase 0 constraint: walk the finished map and confirm no road path, building placement, or landmark silhouette was traced from the original folio's `areas.glb`/`scenery.glb`/`terrain.glb`. → all *engine-generated* content (terrain, roads, buildings, layout) is confirmed original per every phase's own build-from-scratch notes; two concrete, still-open violations remain, both already known from Phases L/P: 5 of 8 districts still run the original Bruno Simon area content/mechanic wholesale, and the minimap image is a literal unedited picture of the original map. Not new findings, but this is where they get named as the actual originality gate, not just a phase-specific footnote.
- **Q2. [CODE]** Run the project's existing `/verify` process (drive the vehicle end-to-end through the new city) once a first full pass of Phases B–D is playable, per this repo's standard change-verification practice. → not performed, no GPU/browser available in this environment — the single biggest standing gap across this entire session's work; every phase's notes flag this same limitation, but Q2 is where it should actually get done before calling any of this final.
- **Q3. [CODE]** Re-run `npm run compress` (glTF-Transform/sharp pipeline, `scripts/compress.js`) once new assets are finalized, to regenerate compressed `-compressed.glb`/`.ktx` variants matching `Game.js`'s resource manifest. → not needed this session (no new/changed binary assets — everything this session touched was code/data); confirmed `toktx` is still not installed in this environment, the same gap Phase B's notes already flagged, so this wasn't attempted.

---

## Suggested parallelization summary

- **Do first, small:** Phase A (direction).
- **Run fully in parallel once A is done:** Phase B (ground), Phase C (roads), Phase D (buildings), Phase E (props), Phase F (vehicle), Phase G (materials — some sub-tasks feed C/D/F), Phase K (post-processing), Phase O (audio), Phase P (UI).
- **Depends on A1/A2 specifically:** Phase H (lighting), Phase I (atmosphere), Phase L (districts).
- **Trails behind whichever asset phase it follows:** Phase M (physics/collision authoring), Phase N (performance).
- **Last:** Phase Q (verification), and P3/Q1 which need a real map to evaluate against.
