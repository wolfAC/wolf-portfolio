# Phase A3 — Original City Layout Sketch

Status: **DECIDED**. This is the binding reference for Phase B (terrain size), Phase C (road network), and Phase D (building/prop placement). A top-down vector sketch and a machine-readable spec are provided instead of a Figma file (Figma access is unavailable in this environment) — both are real, finished artifacts, not placeholders, and are precise enough to model from directly.

- Human-viewable sketch: `assets/cyber-city-layout-sketch.svg`
- Machine-readable spec (canonical numbers): `assets/cyber-city-layout.json`

## Topology

An original **hub-and-ring** layout — a central roundabout, one ring road, six radial avenues to six named districts, and six smaller alley pockets tucked inside the ring. This is a distinct topology from a simple point-to-point road or a copied map shape, and is fully specified below in world units so Phase B/C/D can build against exact numbers rather than tracing an image.

Coordinate convention: ground-plane `(x, z)` in world units, matching `Terrain.js`'s `positionWorld.xz`. Origin `(0,0)` is the spawn hub. All angles are standard math convention (0° = +x axis, increasing counter-clockwise viewed from above); a point at angle `θ` and radius `r` is `(r·cos θ, r·sin θ)`.

## World footprint

- Half-extent: **130** world units (total drivable square: **260×260**), per the density/scale decision in `phase-a1-art-direction-brief.md`. Supersedes `Terrain.js`'s current `size = 192` (Phase B task).

## Hub — Transit Nexus

- Position `(0, 0)`, radius **18** (roundabout).
- Maps to the `landing` area / spawn point (see `phase-a2-district-mapping.md`).

## Ring road

- Radius **90**, width **8**.

## Radial avenues

- **6** avenues, width **8**, evenly spaced at 60° increments (0°, 60°, 120°, 180°, 240°, 300°), each connecting the hub's edge (r=18) straight out to the ring road (r=90).

## Gate spurs (ring → district)

- Width **6**, continuing each radial avenue's angle from the ring (r=90) out to the inner edge of its district anchor.

## Districts (6, on the outside of the ring)

Radius **112** from center, footprint radius **15** (i.e. each district's own building/prop placement zone extends from r=97 to r=127, staying inside the 130 world boundary with a 3-unit margin).

| District | Area | Angle | Position (x, z) |
|---|---|---|---|
| Corporate Spire District | career | 0° | (112.0, 0.0) |
| Holo-Bazaar | projects | 60° | (56.0, 96.99) |
| Broadcast Tower Plaza | social | 120° | (-56.0, 96.99) |
| Undercroft Fabrication Yard | lab | 180° | (-112.0, 0.0) |
| Skyline Observatory | achievements | 240° | (-56.0, -96.99) |
| Dev Circuit | circuit | 300° | (56.0, -96.99) |

## Alley nodes (6, tucked inside the ring)

Radius **80** from center, footprint radius **8**, at the 6 intermediate 60°-offset angles (30°, 90°, 150°, 210°, 270°, 330°), connected to the ring by a width-**4** alley connector.

| Alley | Area | Angle | Position (x, z) |
|---|---|---|---|
| Archive Substation | behindTheScene | 30° | (69.28, 40.0) |
| Overclock Arcade | bowling | 90° | (0.0, 80.0) |
| Server Shrine | altar | 150° | (-69.28, 40.0) |
| Glitch Vendor Alley | cookie | 210° | (-69.28, -40.0) |
| Malfunction Stall | toilet | 270° | (0.0, -80.0) |
| Chrono Terminal | timeMachine | 330° | (69.28, -40.0) |

## Sidewalks

- Width **2**, flanking every road/avenue/spur/connector on both sides.

## What this does *not* specify (intentionally deferred to later phases)

- Exact building footprints/counts within each district's footprint radius — that is Phase D6's placement-list task, which should treat this document's district anchors as its input.
- Road surface curvature/visual detail (curbs, lane markings) — Phase C1/C2/C4.
- Vertical layering (which alleys/districts sit above or below the base terrain plane) — not decided here; default is a flat plane (matches the current engine's single-heightfield floor) unless a later phase explicitly proposes a multi-level district and updates this file.

## Originality note

This topology, its node count, spacing, and naming are an original composition produced for this migration and do not trace or derive from `static/areas/areas.glb`, `static/scenery/scenery.glb`, or `static/terrain/terrain.glb`'s existing (retained-as-reference-only) layout.
