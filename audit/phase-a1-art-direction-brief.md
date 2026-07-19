# Phase A1 — Cyber City Art Direction Brief

Status: **DECIDED**. This is the source of truth for every later phase in `cyber-city-migration-plan.md`. Where a later phase needs a color, mood, scale, or time-of-day value and doesn't restate it, this document is the default.

## Mood

A dense, rain-slicked night city seen from a low, arcade-scale driver's-eye view — closer in spirit to a stylized neon toy diorama than a photoreal open-world game. Legibility first: every material choice below is chosen so the drivable road, sidewalks, and building bases stay readable against a busy neon skyline, since the existing camera (`Game/View.js`) sits at a fixed isometric-ish angle rather than a free first-person view.

## Palette

Structural base (concrete/asphalt/metal — must dominate screen area so neon reads as accent, not noise):

| Role | Hex |
|---|---|
| Structure — deep indigo | `#151420` |
| Structure — slate | `#23212f` |
| Road — asphalt base | `#1c1b22` |
| Road — wet highlight streak | `#3a3550` |
| Sidewalk/curb base | `#2a2733` |

Neon accents (emissive only — never used as a large flat base color):

| Role | Hex | Reused engine hook |
|---|---|---|
| Neon primary | `#ff2e8a` (magenta) | `Game/Materials.js` → retint `emissivePurpleRadialGradient` (colorA `#ff2e8a`, colorB `#b3106b`) |
| Neon secondary | `#28e0ff` (cyan) | `Game/Materials.js` → retint `emissiveBlueRadialGradient` (colorA `#91f0ff`→keep, colorB `#128fff`→`#128fb0`) |
| Neon accent/warning | `#ffb020` (amber) | `Game/Materials.js` → retint `emissiveOrangeRadialGradient` (colorA `#ffcf6b`, colorB `#ffb020`) |
| Landmark-only beacon | `#8dff4f` (acid green) | `Game/Materials.js` → retint `emissiveGreenRadialGradient`; reserved exclusively for the Skyline Observatory landmark (Phase A2/A3) so it reads as a single unmistakable beacon and is never reused on ordinary buildings/props |
| Functional/neutral signage | kept white | `emissiveWhiteRadialGradient` — unchanged, used for plain readable signage (e.g. area names) |

Sky/fog (reuses the existing two-color radial convention in `Game/Fog.js`):

| Role | Hex |
|---|---|
| Fog/sky near (colorA) | `#170f2b` |
| Fog/sky far (colorB) | `#05030a` |

Rule for every later asset/material task: no color outside this table without adding a row here first and stating the reason (keeps the palette from drifting district by district).

## Time of day

**Decision: keep `Cycles/DayCycles.js`'s existing 4-phase state machine (day/dusk/night/dawn), but re-author its presets so no phase reaches literal daylight brightness.** This preserves every piece of code that depends on the day-cycle duration or progress (the `fullDay` achievement in `Player.js`, `Ligthing.js`'s spherical sweep, `Fog.js`'s color drift) with zero structural changes — only the preset *values* change, in Phase H.

Renamed phases and concrete numeric direction for Phase H (final numbers tuned in that phase, these are the binding targets):

| Phase | Concept | Light intensity target | Light color lean |
|---|---|---|---|
| "overcast dusk" (was `day`) | Brightest phase, still overcast/neon | 1.0–1.6 | cool violet-white |
| "neon dusk" (was `dusk`) | Neon accents start to dominate | 0.8–1.2 | magenta-leaning |
| "deep night" (was `night`) | Darkest, most contrast | 0.4–0.8 | cold blue |
| "electric dawn" (was `dawn`) | Brief warm-cool crossover | 0.8–1.2 | amber/cyan crossover |

Current engine range for reference is 1.2–3.8 (`DayCycles.js` `presets`) — the new range is deliberately dimmer across the board because illumination should come from neon emissives (buildings, signage, road glow) via bloom, not from the directional sun-light term.

## Density & scale

**Decision: total drivable footprint grows from the current 192×192 world units to 260×260 world units** (half-extent 130), organized as one central hub, a ring road, 6 outer districts, and 6 small "alley" pockets — full numeric layout in `phase-a3-city-layout.md` / `assets/cyber-city-layout.json`. Rationale for the specific new number: large enough to fit 6 distinct named districts without cramming, small enough that `PhysicsVehicle.js`'s existing top-speed/engine-force tuning and `View.js`'s existing zoom/radius tuning need only a pass (Phase F/M), not a rewrite. The "dense city" feeling is carried primarily by **vertical** density (building height, Phase D) rather than horizontal sprawl, keeping performance posture close to the original.

## Vehicle silhouette

**Decision: keep a grounded 4-wheel vehicle.** Full rationale and dimension targets in `phase-a4-vehicle-direction.md`.

## Non-negotiables carried into every later phase

- No phase of the day cycle renders as literal bright daylight.
- No color used outside the palette table above without first adding a documented row here.
- The acid-green beacon color is reserved for exactly one landmark (Skyline Observatory) and must not appear elsewhere.
- Vertical density (building height/silhouette variety) is the primary "dense city" signal — do not compensate for a sparse-feeling city by shrinking the 260×260 footprint decided above; add buildings instead.
