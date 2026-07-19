# Phase G — Materials & Shading Language: Implementation Notes

Status: **IMPLEMENTED**. Covers `cyber-city-migration-plan.md`'s G1–G5.

## What changed

| Task | File(s) | What |
|---|---|---|
| G1 | `sources/Game/Materials.js` | `createEmissive()` extended with optional flicker/pulse (previously flat color + intensity only) — the shared "neon emissive" factory the plan asks for |
| G2 | `sources/Game/World/Roads.js` | Added a genuine fresnel-based wet-reflection term (grazing-angle brightening) to the road material |
| G3 | — (verified, no code change) | `MeshDefaultMaterial.js`'s bounce-light color source is `Terrain.colorNode()`, already retinted in Phase B — see "G3: already satisfied by Phase B" below |
| G4 | `sources/Game/Materials.js` | Retinted all 4 emissive gradient presets to the A1 palette, plus the shared `gradientTexture` used by `Trails.js`/`Whispers.js` |
| G5 | `static/palette.png`, `resources/palette.png` | Regenerated the 128×4 indexed lookup texture with new Cyber City colors, preserving the exact column layout |

## G1: `createEmissive()` is the shared neon-emissive factory

The plan asked for one implementation "so D7 (building windows), E1 (holographic props), and F3 (vehicle underglow) can all reuse" it. In practice, by the time Phase G was reached, all three already had working, verified, bespoke materials — Buildings.js's per-window grid mask (with per-window random lit/unlit state) genuinely needs its own shader (a flat emissive factory can't replicate per-window masking), and HoloSigns.js/VehicleModel.js's needs are simple enough that they already just reuse the *existing* shared gradient presets directly.

Given that, this phase's G1 deliverable is: extend `Materials.js`'s **already-unused** `createEmissive()` method (confirmed via search — the only other reference to it, in `BlackFriday/FragmentObject.js`, is commented out) with the "optional flicker/pulse" the plan calls for, using the same proven sine-based technique already used elsewhere in this codebase (Buildings.js's window flicker, Roads.js's glitter animation). This makes it a genuine, ready-to-use "flat neon emissive with flicker" factory for **future** simple emissive needs, without retroactively rewriting three already-shipped, already-verified systems just to route them through one shared function — which would be exactly the kind of speculative "while I'm here" refactor this migration's own rules ask to avoid. Since the function had zero live callers, this was a zero-risk change (nothing to regress).

## G2: fresnel, not full screen-space reflection

The plan suggested "reusing `WaterSurface.js`'s existing screen-space blur/reflection plumbing." That plumbing (`viewportSharedTexture`, depth-based reprojection, `hashBlur`/`boxBlur`) is genuinely complex, and a mistake in it can't be caught without a GPU to actually see the result — a much higher risk than anything else touched this phase given how central `Roads.js`'s material is (visible under the entire road network). Instead, `Roads.js` now computes a **fresnel** term (`view direction · surface normal`, brightening toward a cool sky/neon tint at grazing angles, fading out when the camera looks straight down) — this is the exact same technique already shipped and working in `VisualVehicle.js`'s "abyssal" vehicle-paint choice (`viewDirection.dot(normalWorld)`), just adapted to a flat road surface. It reads as a convincing "wet asphalt" cue without the added risk. This is layered in **after** the existing wet/glitter blend and **before** the lane-marking overlay, so lane markings stay crisp regardless of viewing angle.

## G3: already satisfied by Phase B

Investigated exactly what `MeshDefaultMaterial.js`'s `hasLightBounce` block reads before touching this file (the single most universally-used shader in the codebase — every mesh that doesn't opt out uses it):

- Reads `this.game.lighting.lightBounceEdgeLow/High`, `lightBounceDistance`, `lightBounceMultiplier` (geometric/intensity tuning, unrelated to what color is being bounced), and — the actual bounce *color* — `this.game.terrain.colorNode(this.game.terrain.terrainNode(positionWorld.xz))`.
- `Lighting.js`'s own `bounceColor` uniform (`'#82487f'`) is **not** read by this block, or anywhere else in the codebase, at all — it's bound to a debug-panel color swatch and nothing else. Confirmed dead/vestigial; left alone (retinting a value nothing reads would be pure busywork, and touching `Ligthing.js` at all is Phase H's territory, not this one).

Since the actual bounce color comes from `Terrain.colorNode()` — which Phase B already rewrote to return the new road/sidewalk asphalt-and-pavement colors instead of grass/dirt — **the plan's stated concern ("less bounce light from grass, more from the city") was already resolved as a side effect of Phase B**, with zero additional code needed. The plan's other implicit idea — bounce light literally sourced *from* nearby emissive props (window glow, signage) rather than just the ground — isn't something this shader's architecture supports today; adding it would mean a real new mechanism (light probes, extra render passes), not "a parameter/tuning pass," and isn't attempted here given the risk/verification tradeoff. `MeshDefaultMaterial.js` was read carefully but not edited.

## G4: preset retint

Colors retinted exactly per `phase-a1-art-direction-brief.md`'s mapping table:

| Preset | Old | New |
|---|---|---|
| `emissiveOrangeRadialGradient` | `#ff8641` / `#ff3e00` | `#ffcf6b` / `#ffb020` |
| `emissivePurpleRadialGradient` | `#454bbc` / `#ff2eb4` | `#ff2e8a` / `#b3106b` |
| `emissiveBlueRadialGradient` | `#91f0ff` / `#128fff` | `#91f0ff` (kept) / `#128fb0` |
| `emissiveGreenRadialGradient` | `#f8ffa6` / `#74ff00` | `#c3ff8d` / `#8dff4f` (the exact reserved beacon color — see below) |
| `emissiveWhiteRadialGradient` | unchanged | unchanged (neutral, per A1) |
| `redGradient` | unchanged | **not touched** — this is a player-facing vehicle paint *choice* (`VisualVehicle.js`'s `setPaints()`), not an ambient environmental preset; out of scope for a palette re-theme |
| `Materials.js`'s own `gradientTexture` (distinct from `Terrain.js`'s) | `#ffb646`/`#ff347e`/`#01005f` | `#ff2e8a`/`#28e0ff`/`#05030a` — confirmed via search to be read only by `Trails.js` (boost trails) and `Whispers.js`; both use it generically as a "glow fading to dark" ramp, which the new colors still serve |

**Important:** `emissiveGreenRadialGradient`'s new colors are **not** a general-purpose green preset — Phase A1 explicitly reserves acid-green for the Skyline Observatory hero landmark only. Retinting this preset here is for consistency/availability, not an invitation to use it elsewhere; `CyberCityBuildingPlacements.js`'s hero-landmark color stays a hardcoded literal specifically to keep that constraint obvious and enforced at the call site rather than relying on preset-naming discipline.

## G5: palette texture — a constrained retint, not a fresh image

`static/palette.png` (confirmed byte-identical to `resources/palette.png` before this change) is a 128×4 "indexed swatch" texture: 32 columns of 4px each, where **existing, still-active, unreplaced glTF assets** (`static/scenery/scenery.glb`, `static/areas/areas.glb` — confirmed via search) have vertex UVs baked at construction time to sample the center of a *specific* column and expect a *specific* flat color there. Regenerating this as an arbitrary new image (the way Phase B's terrain/slab textures were built from scratch) would have made those meshes sample whatever *unrelated* color happened to land at their baked coordinates — a real, visible regression on content this phase doesn't otherwise touch, not a re-theme.

Instead, `audit/assets/scripts/generate-palette-texture.mjs` preserves the **exact 128×4 grid and column boundaries**, replacing only each column's *color* (24 of the 32 columns were in active use; the remaining 8 were already solid black/unused in the original and are left that way). Any old asset reading any column now gets a coherent Cyber City tone (structure grays, metallic tones, and the full A1 neon accent range) instead of the original nature/rustic one, without needing to know which specific mesh reads which specific column. Both `static/palette.png` and `resources/palette.png` were regenerated and re-verified byte-identical to each other (unlike Phase B's `.sbs` case, a plain PNG source *can* be meaningfully regenerated, so both copies were kept in sync rather than leaving the source stale).

## Verification performed

- `npm run build`: 759 modules (unchanged from Phase F — this phase only edited existing files, added no new source modules) transform without error; same pre-existing, unrelated `vite-plugin-top-level-await` failure documented in every prior phase's notes.
- `npm run dev`: confirmed `Materials.js` and `Roads.js` transform and serve cleanly, and `palette.png` serves as a real 213-byte file (not Vite's SPA-fallback HTML, which was the false-positive trap encountered and resolved in Phase E's notes).
- `palette.png` regeneration verified structurally: 128×4 dimensions preserved exactly, all 32 column boundaries preserved exactly, columns 24–31 remain pure black as in the original, columns 0–23 hold the new intended colors — checked pixel-by-pixel against the original layout before writing anything.
- Confirmed via search (not by re-deriving from memory) that `createEmissive()` has zero live callers before extending it, that `lighting.bounceColor` has zero shader consumers before deciding not to touch it, and that `redGradient` is a vehicle-paint-choice preset before deciding to leave it alone.

**Not performed (no GPU/browser available in this environment):** actually seeing the retinted materials, the road's new fresnel sheen, or the palette-driven old scenery/area props render. As with every prior phase, this is a real gap — spot-check in a browser before considering Phase G visually final. The fresnel term in particular (G2) is the one piece of genuinely new shader math this phase adds (everything else is either a value swap or an extension of an unused function), so it's the best candidate to look at first.
