# Repository Analysis — Bruno Simon–style Portfolio ("Folio 2025")

Read-only analysis. No files were modified. Prepared as groundwork for a "Cyber City" reskin.

## 1. Project structure

```
sources/
  index.html, index.js            Entry point / DOM bootstrap
  threejs-override.js             Three.js monkey-patches
  style/*.styl                     UI styles (Stylus)
  data/*.js                        Static content (projects, career, achievements, social, countries, console easter egg log)
  Game/                            All engine + gameplay code (see below)
static/                            Public assets served as-is (glb models, ktx2/png textures, fonts, sounds, draco/basis decoders)
resources/                         Source-of-truth authoring files (Blender .blend, .psd, .sbs) — not consumed at runtime
scripts/compress.js                Asset compression pipeline (glTF-Transform + sharp, invoked via `npm run compress`)
vite.config.js                     Build config: root=sources/, publicDir=static/, wasm + top-level-await + polyfill plugins
package.json                       three@0.183 (WebGPU/TSL), @dimforge/rapier3d, camera-controls, gsap, howler, tweakpane, stats-gl
```

`sources/Game/` is organized by subsystem:

```
Game.js                 Singleton orchestrator, boot sequence, resource manifest, reset logic
Rendering.js            WebGPU renderer + post-processing pipeline
View.js                 Camera rig (follow-cam, free-cam, cinematic)
Viewport.js             Canvas size/pixel-ratio/resize events
Ticker.js               Global tick/delta clock driving every subsystem (ordered listener priorities)
Physics/                Rapier world, vehicle controller, physics debug wireframe
Player.js               Input→gameplay-state mapping, vehicle SFX, achievements hooks
Objects.js               Generic visual+physical "entity" registry (spawn/reset/sleep/cull)
InstancedGroup.js       GPU-instancing helper for repeated props
ResourcesLoader.js      GLTF/DRACO/KTX2/texture loader + cache
Terrain.js / World/Floor.js   Procedural infinite ground (see §Ground)
Ligthing.js             Sun-like directional light + day-cycle driven shader uniforms
Materials.js / Materials/     Shared TSL/node material library
Cycles/                 Day/night and year (season) cycles state machines
Inputs/                 Keyboard, gamepad, pointer, wheel, touch-nipple, on-screen buttons
World/                  Scene content: props, vegetation, weather, water, areas (see below)
Passes/cheapDOF.js      Custom post-processing node (depth-of-field-ish blur)
Geometries/             Custom BufferGeometry generators (line, wind line, portal slabs)
Zones.js / InteractivePoints.js / Areas/  Proximity triggers & the portfolio's themed zones
Achievements.js, Menu.js, Modals.js, Notifications.js, Map.js, Tabs.js, Options.js, Overlay.js, Title.js  UI/meta layers
Audio.js                Howler-based positional/ambient sound registry
BlackFriday/, Easter.js, KonamiCode.js, Tornado.js, Water.js  Seasonal/easter-egg features
utilities/               maths.js, time.js, ObservableMap/Set.js helpers
```

## 2. Rendering pipeline

- **`Game/Rendering.js`** — creates `THREE.WebGPURenderer` (three/webgpu, falls back to WebGL only if forced), sets pixel ratio, shadow maps, custom opaque/transparent sort by `renderOrder`. Builds the post-processing graph with `THREE.RenderPipeline`: scene pass → **bloom** (`three/addons/tsl/display/BloomNode.js`) → **cheap depth-of-field** (`Passes/cheapDOF.js`). The pipeline swaps output nodes based on `Quality` level (DOF only enabled at quality level 0/desktop). Owns the renderer's `setAnimationLoop`, which drives `Ticker.update()` — i.e. the browser's rAF loop is the master clock for the entire game.
- **`Game/Passes/cheapDOF.js`** — custom `TempNode` (TSL) implementing a radial blur keyed off screen-space Y distance from center, using three's `hashBlur` addon. Debug-tunable `start`/`end`/`repeats`/`amount`.
- **`Game/Ticker.js`** — central clock (elapsed/delta/deltaScaled, capped max delta, rolling average), exposes GPU-uniform mirrors of time values (`elapsedUniform`, etc.) for shaders, and a priority-ordered `tick` event bus that every subsystem hooks into (documented loop order in `readme.md`).
- **`Game/Viewport.js`** — DOM size + devicePixelRatio (capped at 2), throttled resize events consumed by renderer/camera/lighting/floor.
- **`sources/threejs-override.js`** — low-level three.js patches (worth checking before any renderer-level reskin work).

## 3. Physics engine

- **Engine:** [Rapier3D](https://rapier.rs/) via `@dimforge/rapier3d`, lazy-loaded with dynamic `import()` in `Game.js` in parallel with asset loading.
- **`Game/Physics/Physics.js`** — owns the Rapier `World` (gravity −9.81 y), the `EventQueue`, collision-group bitmasks (`floor` / `object` / `bumper`), and a generic `getPhysical(description)` factory that turns a declarative JSON-ish description into a rigid body + colliders (cuboid/ball/cylinder/trimesh/hull/heightfield), with friction/restitution/mass/collision-event wiring. Runs each tick: adjusts damping when submerged (water), steps the world, drains contact-force events to fire per-body `onCollision` callbacks (used for hit sounds).
- **`Game/Physics/PhysicsVehicle.js`** — a raycast-vehicle controller (Rapier's `createVehicleController`) on a 3-collider chassis (main body, roof, bumper). Owns steering/engine-force/brake/boost tuning, 4 wheels with per-wheel suspension height/stiffness states (`low`/`mid`/`high`, i.e. the game's signature "hydraulics" jump/lean trick), ice-friction integration with `WaterSurface`, and gameplay-state detectors: stopped, upside-down, stuck, mid-air flip (front/back-flip achievement detection).
- **`Game/Physics/PhysicsWireframe.js`** — debug visualization of collider shapes.
- **`Game/Objects.js`** — the bridge between "physical" (Rapier body) and "visual" (Three.js Object3D): spawns/registers both, mirrors physics transforms onto meshes each tick, sleeps/culls objects far from the camera, and resets fallen/out-of-bounds objects to their initial transform.

## 4. Scene management

- **`Game/Game.js`** — the sole entry point/singleton (`Game.getInstance()`), owns every other subsystem instance and the async boot sequence (loads a first small batch of resources for the intro screen, then the full asset manifest in parallel with the Rapier WASM module). `World.step(n)` is called at 3 points in boot to stagger world construction. Also owns `reset()` (full-world reset triggered after player death/respawn button).
- **`Game/World/World.js`** — top-level composition root for all scene content: grid/intro placeholder, terrain/floor/water, weather (rain/snow/leaves/lightning/wind lines), vegetation (trees/bushes/flowers), instanced props (bricks/fences/benches/lanterns/pole-lights/explosive crates), scenery (static baked-in models incl. the road), and `Areas` (the themed zones).
- **`Game/World/Areas/Areas.js` + `Area.js`** — each thematic portfolio section (career, projects, social, lab, bowling, altar, circuit, cookie, toilet, behindTheScene, achievements, timeMachine, landing, easter) is a node in `areasModel.glb`, matched by name prefix to a JS class extending `Area`. `Area` auto-spawns child meshes as objects, and sets up two zone types read from named "reference" nodes baked in Blender: `zoneBounding` (cylinder trigger → `isIn` for interaction availability) and `zoneFrustum` (visibility culling circle tested against the camera's on-ground view quad, toggling `.visible` on hideable meshes — a bespoke, area-based occlusion/LOD system).
- **`Game/Zones.js`** — generic sphere/cylinder proximity trigger primitives (distance test vs. player each tick) used for area bounding and various interactions.
- **`Game/References.js`** — a naming convention parser: any glTF node named `reference<Name><N?>` gets collected into a `Map` by category, letting Blender-authored scenes expose named anchor points/meshes to code (used for area zones, the scenery road mesh, etc.). This is the main "designer → code" handoff mechanism in the project.

## 5. Asset loading

- **`Game/ResourcesLoader.js`** — wraps `GLTFLoader` (+ `DRACOLoader` for mesh compression, `KTX2Loader`/basis for texture compression) and `TextureLoader`, with a `Map` cache keyed by URL and a `load([[key, path, type, postProcessFn], ...])` batch API returning a keyed resource object; supports progress callbacks (used to drive the intro loading bar).
- **`Game/Game.js`** — defines the actual asset manifest in two waves: a tiny first batch (intro textures/model) so the loading screen can render immediately, then the bulk of models/textures loaded in parallel with the Rapier WASM `import()`. Toggles compressed vs. uncompressed asset variants (`-compressed.glb`, `.ktx` vs `.png`) via `VITE_COMPRESSED` env var.
- **`static/`** — the actual served assets, one folder per feature (e.g. `static/vehicle/`, `static/terrain/`, `static/areas/`, `static/bricks/`) each typically containing both a raw and a `-compressed` glb, matching the loader manifest.
- **`scripts/compress.js`** — offline pipeline (glTF-Transform + sharp) that generates the `-compressed` glb variants and `.ktx` textures from source assets; run manually via `npm run compress`.
- **`Game/Objects.js` `getFromModel()`** — convention-based glTF → physics translation: node names containing `physical`/`dynamic`/`fixed`/`kinematicPositionBased` become rigid bodies, and child node name prefixes (`trimesh`, `hull`, `cuboid`, `tube`, `ball`) become collider shapes, so 3D artists can author physics directly in Blender without writing code.

## 6. Camera controls

- **`Game/View.js`** — the entire camera rig. Two modes: `MODE_DEFAULT` (game follow-cam) and `MODE_FREE` (debug-only free camera using the `camera-controls` npm package, orbit-style). Follow-cam mechanics:
  - `focusPoint`: smoothed/eased 2D target that tracks the vehicle (`trackedPosition`), with a "magnet" pull-back and manual drag override (mouse-drag / gamepad right-stick / touch pinch pan the focus point off the vehicle).
  - `spherical`: fixed phi/theta angles (isometric-ish 3rd-person angle) with a zoom-driven `radius` (mouse wheel, gamepad `R3` toggle, or automatically pulled in at speed on quality level 0).
  - `roll`: subtle camera-shake/tilt spring physics kicked on impacts.
  - `cinematic`: a start/end tween used for scripted camera cuts (e.g. entering an Area).
  - `optimalArea`: raycasts the camera frustum's four corners onto the ground plane every resize to compute a world-space "visible quad" and radius — this quad drives Area frustum-culling, terrain/floor sizing, fog distances, and shadow-camera framing, so it is a key cross-cutting concept in the codebase.
  - `speedLines`: procedural radial speed-line mesh (TSL vertex shader) that intensifies during boost.
- **`camera-controls`** (npm dependency) is only used for the debug free-camera, not the main gameplay camera.

## 7. Vehicle / player controller

- **`Game/Player.js`** — translates `Inputs` actions into gameplay floats (`accelerating`, `steering`, `boosting`, `braking`, per-wheel `suspensions` state), handles touch-nipple analog input, vehicle sound design (engine/tire/suspension/boost/horn via `Game/Audio.js` + Howler), achievement triggers (flips, suspensions/"hydraulics", honk, distance driven, time played, going to sea/high altitude), respawn/die/unstuck flows, and feeds the vehicle's world position back into `View`, `Tracks` (tire-mark render target) and the touch-joystick visual.
- **`Game/Physics/PhysicsVehicle.js`** — the actual raycast-vehicle simulation consuming `Player`'s intent values each tick (see §3).
- **`Game/World/VisualVehicle.js`** — (not opened in depth, but is the visual mesh counterpart driven by the physics vehicle's transform) the car model shown in the scene, distinct from the physics chassis.
- **`Game/Respawns.js`** — respawn-point registry (`getDefault`, `getByName`, `getClosest`), used on death, manual respawn key, and area-specific spawn points.
- **`Game/Inputs/*`** — device abstraction: `Keyboard.js`, `Gamepad.js` (with joystick dead-zone/typeChange handling), `Pointer.js` (mouse/touch unification, pinch), `Wheel.js` (mouse wheel), `Nipple.js` (virtual touch joystick), `InteractiveButtons.js` (contextual on-screen action buttons e.g. "unstuck"). All funnel into `Inputs.js`'s action-map (`addActions`, category filters, start/change/end events), which both `View` and `Player` subscribe to.

## 8. Environment generation

- **`Game/Terrain.js`** — not a mesh itself, but the *data* layer: defines a world→UV mapping and a TSL function (`terrainNode`) that samples `terrainTexture` (an authored heightmap/mask baked from `resources/textures/terrainData.png` + `terrainGrass.exr`/`terrainWater.exr`) to get per-pixel height(b)/grass(g)/slab(r) masks, blended with a runtime canvas gradient for the height→color ramp, and combined with the live tire-track render target (`Game/Tracks.js`) so driving over grass leaves visible marks.
- **`Game/World/Floor.js`** — the actual ground mesh: a camera-follow, resolution-limited `PlaneGeometry` (recentered each tick to `optimalArea.position`, snapped to a cell grid to avoid shimmer) whose vertex shader displaces height and whose color shader composites `Terrain`'s data with a stone-slab texture/noise overlay. Physically, it's a Rapier `heightfield` collider baked once from the authored terrain glTF's vertex heights, plus a secondary invisible kinematic "bed rock" cuboid that follows the player near the world edge (prevents falling through if you drive past the terrain bounds).
- **`Game/World/Grid.js`** — the neutral pre-reveal placeholder ground (a plain grid-shader plane) shown before the "reveal" wipe-in effect (`Game/Reveal.js`) uncovers real terrain around the spawn point.
- **`Game/World/Scenery.js`** — imports the hand-placed static "set-dressing" glTF (`static/scenery/scenery.glb`) wholesale: every child becomes a sleeping physics+visual object via `Objects.addFromModel`, and named "reference" nodes are specially treated — notably `road` (see §Roads below). This is effectively the main "world building" content file for anything not otherwise systematized (rocks, terrain props, road surface, etc. depending on what's modeled in Blender).
- **Vegetation/instances:** `World/Trees.js`, `Bushes.js`, `Flowers.js`, `Foliage.js`, `Grass.js`, `Leaves.js` — instanced vegetation systems (birch/oak/cherry trees passed in from `World.js` with distinct colors).
- **Weather/atmosphere:** `World/RainLines.js`, `Snow.js`, `Lightnings.js`, `WindLines.js`, `Fireballs.js` (procedural particle-like effects), `Game/Weather.js` (orchestrator), `Game/Wind.js`, `Game/Noises.js` (shared noise textures: hash/perlin), `Game/Fog.js` (radial background + distance fog tied to day-cycle colors and the camera's `optimalArea` near/far).
- **Water:** `Game/Water.js` (state: surface elevation etc.) + `World/WaterSurface.js` (mesh/shader: ripples, ice, splashes, shore blending, screen-space blur reads).
- **Props (instanced, physical):** `World/Bricks.js`, `Fences.js`, `Benches.js` (implied sibling), `PoleLights.js`, `Lanterns.js`, `ExplosiveCrates.js` — all follow the same pattern: split a glTF's repeated instances into a shared base mesh + per-instance reference transforms (`InstancedGroup`), and give each instance its own dynamic Rapier body so props are physically knockable while still GPU-instanced for rendering.
- **`Game/Cycles/Cycles.js`, `DayCycles.js`, `YearCycles.js`** — generic keyframe/interval state-machine (`Cycles`) driving a day/night preset blend (`presets.day/dusk/night/dawn`: light color/intensity, fog colors, reveal color, "electricField" easter-egg parameter) and a slower season cycle; `Lighting`, `Fog`, `Reveal`, etc. all read `game.dayCycles.properties.*`.

## 9. Lighting setup

- **`Game/Ligthing.js`** *(sic — filename typo preserved in repo)* — a single `THREE.DirectionalLight` standing in for the sun/moon, orbited on a `THREE.Spherical` whose phi/theta oscillate over the day-cycle progress (so the light sweeps across the sky and back), with shadow-camera bounds/bias/normalBias/radius/map-size all derived from `View.optimalArea.radius` (so shadow frustum tracks the visible playfield instead of being fixed). Exposes `directionUniform`/`colorUniform`/`intensityUniform` plus stylized "light bounce" and "core shadow" tuning uniforms consumed by `MeshDefaultMaterial`.
- **`Game/Materials/MeshDefaultMaterial.js`** — the shared TSL shader material (extends `MeshLambertNodeMaterial`) implementing the game's whole stylized lighting look in one place: fake bounce-light from the terrain color underneath objects, a manual "core shadow" (NdotL threshold, not real diffuse falloff) blended with real shadow-map dropshadows, a near-water full-white rim tweak, scene fog, and the circular "reveal" wipe mask (radius around the player that reveals/hides terrain, using a discard + color mix). Virtually every visual mesh in the world instantiates this class via `Game/Materials.js`.
- **`Game/Materials.js`** — factory/cache for named materials: palette (baked vertex-color texture), several radial-gradient "emissive" materials (orange/purple/blue/green/white glow — likely used for neon/sign-like props), a red gradient, and `createFromMaterial`/`updateObject` which auto-converts any glTF-authored Lambert/Standard material into a `MeshDefaultMaterial` (preserving texture/color/alpha, with special-cased premultiplied-alpha text labels).
- Day/night driven ambiance also touches **`Game/Fog.js`** (radial background gradient + distance fog) and `Game/Cycles/DayCycles.js`'s presets (color grading per time-of-day).

## Ground / Roads / Buildings / Props / Materials / Post-processing — quick index

| Concept | Primary file(s) | Notes |
|---|---|---|
| **Ground** | `Game/Terrain.js` (data/shader logic), `Game/World/Floor.js` (mesh + Rapier heightfield), `Game/World/Grid.js` (pre-reveal placeholder plane) | Camera-following, re-centered plane; height/grass/slab masks from `terrainData` texture; slab/stone texture overlay from `resources/textures/slabs.sbs` → `static/floor/slabs.png` |
| **Roads** | `Game/World/Scenery.js` `setRoad()` (asphalt-like TSL shader with procedural "glitter" specks on a `road`-named mesh from `static/scenery/scenery.glb`) | There is no separate procedural road-network system — "road" is a single hand-modeled mesh in the Scenery glTF, named `referenceRoad` and picked up via `Game/References.js`. `Geometries/PortalSlabsGeometry.js` generates a grid-of-slabs floor geometry, used for area entrance "portals" (stepping-stone look), which is visually adjacent to path/road generation. |
| **Buildings** | `Game/World/Areas/*` (`Area.js` base + one subclass per theme e.g. `CareerArea.js`, `ProjectsArea.js`, `CircuitArea.js`, `LabArea.js`) + `static/areas/areas.glb` | No literal "buildings" system exists — the closest analog is these themed "Areas" (structures/rooms/monuments per portfolio section), each a hand-authored glTF node group with code-driven visibility/trigger logic. `Game/World/Scenery.js` also contributes any other static structures baked into `scenery.glb`. |
| **Props** | `Game/World/Bricks.js`, `Fences.js`, `Benches.js`, `Lanterns.js`, `PoleLights.js`, `ExplosiveCrates.js`, plus vegetation (`Trees.js`, `Bushes.js`, `Flowers.js`) | Shared pattern via `Game/InstancedGroup.js` (GPU instancing) + `Game/Objects.js` (per-instance physics body) |
| **Materials** | `Game/Materials.js` (factory/cache), `Game/Materials/MeshDefaultMaterial.js` (core shader), `Game/Materials/MeshGridMaterial.js` (grid-line shader used by `Grid.js`/`Terrain` debug) | All non-special meshes get funneled into `MeshDefaultMaterial` via `Materials.updateObject()` |
| **Post-processing** | `Game/Rendering.js` `setPostprocessing()` (bloom + DOF pipeline wiring), `Game/Passes/cheapDOF.js` (custom blur node) | Uses three's built-in TSL `bloom()` addon; DOF is a bespoke radial hash-blur, not a physically-based lens effect |

## Additional systems worth knowing about for a reskin

- **`Game/Reveal.js`** — the circular "fog of war" wipe-in effect around the player, referenced by nearly every material (`MeshDefaultMaterial.revealDiscardNodeBuilder`) and the day-cycle presets (`revealColor`/`revealIntensity`); any new ground/prop material should account for it.
- **`Game/Tracks.js`** — render-target-based tire track system read by `Terrain.js`'s shader (grass mask erosion) — relevant if a "Cyber City" reskin changes the ground from grass/dirt to asphalt/neon.
- **`Game/Quality.js`** — two-tier quality system (desktop=0 vs. mobile=1) gating shadow map size, DOF, bloom mip count, and zoom-on-speed behavior; any new post-processing (e.g. a cyberpunk scanline/chromatic-aberration pass) should hook in here.
- **`Game/InteractivePoints.js`**, **`Game/Zones.js`**, **`Game/Respawns.js`** — the interaction/point-of-interest plumbing that any new city layout would need to re-populate with new positions.
- **`resources/*.blend`, `resources/*.sbs`, `resources/textures/*.psd`** — authoring sources (Blender scenes, Substance Designer graphs, Photoshop docs) that generate the `static/*.glb`/textures actually loaded at runtime; a re-theme most likely starts here, not in `sources/Game/`.
