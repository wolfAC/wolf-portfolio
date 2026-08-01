# Phase N — Performance & Quality Tiers: Implementation Notes

Status: **VERIFIED via estimate**, no code changes. Covers `cyber-city-migration-plan.md`'s N1–N3.

## N1: no live profiling possible here, so an estimate instead of a guess

`stats-gl`'s draw-call/triangle counters (`Rendering.js`'s `setStats()`, gated behind the `#stats` URL hash) only report real numbers inside a running WebGPU context — this environment has no GPU/browser, the same standing limitation every prior phase's notes have flagged. Rather than skip N1 entirely or guess at N2/N3 without any basis, used `phase-d-implementation-notes.md`'s own already-verified figure (4,342 triangles across the original 51 buildings) scaled by Phase L's building-count reduction: the trimmed layout generates 19 buildings (confirmed by re-running `CyberCityBuildingPlacements.js`'s generator in Phase L's work), ~37% of the original count. Proportionally, that's roughly **~1,600 triangles** for the entire building system — buildings were never the heavy part of this scene to begin with, and there are now noticeably fewer of them than Phase D originally verified.

This is a scaled estimate, not a re-derivation from scratch (Phase D's own per-triangle winding/normal check isn't worth repeating here since nothing about the geometry-construction *code* changed in Phase L, only the *placement count* feeding it) — but it's grounded in a real prior measurement rather than a guess, and the direction of the number (much lower than Phase D's already-unremarkable original figure) is what actually answers N2/N3 below.

## N2: not necessary

The plan's own condition for adding a third `Quality.js` tier is "only if N1 shows it's necessary." N1's estimate shows the opposite of a growing problem: Phase L *reduced* total building count (and, via `CyberCityPropPlacements.js`'s per-district scattering, total prop count too — fewer districts to scatter props near). There's no evidence of a triangle or draw-call budget concern to address with a new tier, so none was added. If a real browser profiling session later shows otherwise, `N1` should be re-run for real numbers before revisiting this.

## N3: the premise doesn't apply post-Phase-L

`Objects.js`'s distance-based sleep/cull (`distanceToView > this.game.view.optimalArea.radius` → sleep the physics body) is a *local* mechanism — it governs how many dynamic objects are active within camera-view distance at any one moment, not the world's total object count. That local density is set by Phase E's per-district scatter counts (e.g. `scatterNearDistricts('holoSigns', 3, 5, 12)` — 3 per district, regardless of how many districts exist), which Phase L didn't change. What Phase L changed is how many *districts* exist at all (6→2 main, plus fewer alleys) — meaning fewer total objects in the *world*, but the same density *near the camera* while driving through any one surviving district. The concern N3 was written to catch (more simultaneous nearby objects than the cull radius was designed for) doesn't apply here; if anything there are now fewer total objects for the sleep/wake system to manage.

## Verification performed

- Cross-referenced Phase D's own verified triangle count against Phase L's verified building-count reduction (19 vs. 51, both numbers independently confirmed by actually running the placement generator, not assumed) to produce a grounded — if scaled, not fresh — estimate.
- Confirmed via reading `Objects.js`'s cull logic and `CyberCityPropPlacements.js`'s per-district (not global) scatter functions that "total object count" and "objects near the camera" are different quantities, and that only the former changed in Phase L.

**Not performed (no GPU/browser available in this environment):** any real `stats-gl` reading. This is the one phase in this whole session where the actual verification method the plan asks for (live profiling) simply isn't available at all, not even partially — flagging clearly rather than presenting the triangle estimate as equivalent to a real profile.
