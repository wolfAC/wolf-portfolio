# Phase B — Ground & Terrain: Implementation Notes

Status: **IMPLEMENTED**. Covers `cyber-city-migration-plan.md`'s B1–B7. No Blender/Substance/Photoshop tooling is available in this environment, so B1/B2/B4's assets were generated procedurally by small, reviewable Node scripts under `audit/assets/scripts/` instead of being hand-authored — real, valid, loadable assets (verified below), not placeholders. They read the Phase A3 layout (`audit/assets/cyber-city-layout.json`) as their single source of truth, so they stay consistent with the road network decided in Phase A and with each other.

## What changed

| Task | File(s) | What |
|---|---|---|
| B1 | `static/terrain/terrain.glb` (+ `static/terrain/terrain-compressed.glb`) | Regenerated: a 129×129 vertex grid spanning the new 260×260 world footprint (`audit/assets/scripts/generate-terrain-model.mjs`), flat (y=0) on any road/hub/ring/spur/connector from the Phase A3 layout, stepped up 0.15 units elsewhere (curb/sidewalk/plaza) |
| B2 | `static/terrain/terrain.png` | Regenerated: 512×512 ground mask (`audit/assets/scripts/generate-terrain-mask-texture.mjs`) using the new channel convention (below), rasterized from the same road-network math as B1 so the physical heightfield and the visual mask agree |
| B3 | `sources/Game/Terrain.js` | `size` 192→260; UV mapping simplified to `position.div(this.size).add(0.5)` (previously `position.div(subdivision).div(1.5).add(0.5)`, which only happened to equal `/192` and would have silently misaligned the texture at the new size); gradient recolored to an asphalt→pavement ramp; `grassColorUniform` replaced by `roadTintColorUniform`; tire-track erosion retargeted from the (now nonexistent) grass channel to the sidewalk channel |
| B4 | `static/floor/slabs.png` | Regenerated: 256×256 seamless procedural diamond-plate/paver pattern (`audit/assets/scripts/generate-slab-pavement-texture.mjs`), replacing the stone-slab pattern (source `resources/textures/slabs.sbs`, a Substance Designer graph, is untouched — see caveats) |
| B5 | `sources/Game/World/Floor.js` | `slabLowColor`/`slabHighColor` retinted to the Phase A1 palette; vertical displacement flipped from a `-1.5`-magnitude water-sink to a `+0.15`-magnitude curb-rise (matches B1's curb height exactly) |
| B6 | — | Verified, no code change needed: the regenerated model has 16,641 vertices (129², a perfect square), so `Floor.js`'s `rowsCount = Math.sqrt(totalCount)` heightfield reconstruction stays valid |
| B7 | `sources/Game/World/Grid.js` | Base fill and both grid line colors retinted to the Phase A1 palette (cyan primary line, deep-indigo base) |

## New `terrainTexture` channel convention (binding — code in Terrain.js/Floor.js depends on this)

- **R = sidewalkMask** — 1.0 on pavement/plaza, 0.0 on road. Drives the paver-pattern blend in `Floor.js` and is what the tire-track system erodes when you drive off-road.
- **G = roadMask** — 1.0 on drivable road surface, 0.0 elsewhere. Drives the road-tint blend in `Terrain.js`'s `colorNode` and the extra shadow term in `Floor.js`'s material.
- **B = heightMask** — 0.0 at road level, 1.0 at curb/sidewalk level. Drives both the color gradient lookup and the vertical curb displacement.

R and G are exact complements and B currently mirrors R (see `generate-terrain-mask-texture.mjs`) — kept as three distinct channels rather than collapsed to one so a future hand-painted replacement texture can diverge them (e.g. graduated plaza heights, partial sidewalks) without another shader change.

## How to regenerate the procedural assets

```
node audit/assets/scripts/generate-terrain-model.mjs
node audit/assets/scripts/generate-terrain-mask-texture.mjs
node audit/assets/scripts/generate-slab-pavement-texture.mjs
```

Each is self-contained and reads `audit/assets/cyber-city-layout.json`; re-run them after any change to that layout file. The compressed model variant was refreshed with:

```
./node_modules/.bin/gltf-transform draco static/terrain/terrain.glb static/terrain/terrain-compressed.glb \
  --method edgebreaker --quantize-position 14 --quantize-normal 8 --quantize-texcoord 12 --quantize-color 8 --quantize-generic 12
```

(Deliberately higher position-quantization precision than `scripts/compress.js`'s default 12 bits — this file's only job is supplying height data to the physics heightfield, where `scripts/compress.js`'s texture-oriented quantization would visibly flatten the 0.15-unit curb step. Verified after compression: near-hub vertices still read `y=0`, far-corner vertices still read `y≈0.143` (vs. the uncompressed `0.15`) — the curb step survives.)

## Caveats — what's intentionally left alone, and why

- **`static/terrain/terrain.ktx` and `static/floor/slabs.ktx` are now stale** (they still contain the old Bruno Simon terrain/slab imagery). Regenerating them requires the `toktx` CLI (KTX-Software), which is not installed in this environment (checked: `which toktx` → not found), and there is no pure-JS/WASM fallback available offline. These files are **only loaded when `VITE_COMPRESSED=1`**, which is unset by default (`.env.example`) — the default `npm run dev`/`npm run build` path uses the regenerated `terrain.png`/`slabs.png` directly and is unaffected. They were deliberately **not deleted** (a loud 404 felt riskier to force on a partially-migrated repo than a documented caveat) and **not left silently assumed-fine** — anyone enabling `VITE_COMPRESSED=1` before Phase Q's asset-compression pass should regenerate them first via `npm run compress` on a machine with `toktx` installed, or they will see the old, stale texture. This mirrors the Figma-unavailable caveat from Phase A3.
- `resources/textures/terrainData.png` and `resources/textures/slabs.sbs` (the pre-existing *authoring sources*, not consumed at runtime) were left untouched — a `.sbs` Substance Designer graph can't be meaningfully hand-edited without the tool, and overwriting it with something fake would violate the no-placeholder rule. When a real artist picks this up, they should treat the two procedural PNGs above as the reference to rebuild from in proper authoring tools, and can then regenerate these source files too.
- Everything else placed on top of the ground — `static/areas/areas.glb`, `static/scenery/scenery.glb` (including the existing `road` mesh, Phase C's job), vegetation, props, and the vehicle's spawn point — is **still the original Bruno Simon content**, now sitting on the new flat Cyber City ground instead of the old hills. This is an expected, transitional visual mismatch: those assets belong to later, independent phases (C/D/E/F/L) and this phase's scope was strictly the ground/terrain system, per the migration plan's task breakdown. Nothing about it is broken — old props remain within the new (larger) heightfield bounds since 260×260 is a strict superset of the old 192×192, so nothing falls through the world; they will simply look inconsistent with the new ground until those phases land.
- `sources/Game/Audio.js` and `sources/Game/Map.js` both already read `this.game.terrain.size` symbolically (for edge-of-world audio ambience and minimap normalization respectively) and needed no code change — they scale automatically with the new 260 value.
- `sources/Game/Player.js`'s "sea" achievement (`distanceToCenter > 120`) and the `Game/World/Areas/*`/`Respawns.js` spawn positions are untouched — those are gameplay-content concerns belonging to later phases (L/Q), not the ground/terrain system, and touching them here would be an unrelated change outside this phase's scope.

## Verification performed

- `node audit/assets/scripts/generate-terrain-model.mjs` output loaded successfully through three.js's actual `GLTFLoader` (not just `file`/binary inspection): confirmed `scene.children[0]` is a `Mesh` with a `position` attribute of 16,641 vertices, corners at the expected `(±130, 0.15, ±130)`.
- The regenerated `terrain-compressed.glb` was decoded via `@gltf-transform/core`'s `NodeIO` (draco-aware) and confirmed to preserve the same vertex count and the road/curb height distinction.
- `terrain.png`/`slabs.png` verified as valid 512×512 / 256×256 RGBA PNGs; sampled specific world coordinates from `terrain.png` against the Phase A3 layout (hub, ring, district centers, alley node, far corner) and confirmed each reads the expected R/G/B mask values.
- `npm run build`: all 755 modules (including the three edited files) transform without error; the build's final failure (`vite-plugin-top-level-await` esbuild target-transform error) is **pre-existing and unrelated** — reproduced identically on a clean `git stash` of these changes, so it is not something this phase introduced or is responsible for fixing.
- `npm run dev`: started the real dev server and confirmed (via HTTP) that `Terrain.js` transforms and serves cleanly, and that `terrain.glb`, `terrain.png`, and `floor/slabs.png` are all served with correct content and byte-for-byte matching file sizes.
- Not performed (no GPU/browser available in this environment): an actual visual/WebGPU render of the new ground, or driving the vehicle over it. This should be spot-checked in a browser before considering Phase B visually final, per this repo's standard verification practice.
