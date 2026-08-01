# Phase M — Physics/Collision Follow-Through: Implementation Notes

Status: **VERIFIED**, no code changes. Covers `cyber-city-migration-plan.md`'s M1–M2.

## M1: not applicable — nothing left to check

`Objects.js`'s `getFromModel()` node-naming convention (`trimesh`/`hull`/`cuboid`/`tube`/`ball` prefixes) only matters for physics authored inside a glTF file. Checked every Phase B–F asset for how it actually gets its collider:

| Asset | Collider source |
|---|---|
| `Buildings.js` | `objects.add()` with an explicit `cuboid` descriptor in code |
| `ScrapCrates.js`, `VendingMachines.js`, `HoloSigns.js`, `Barricades.js` | shared `ProceduralPropGroup.js` pattern — `colliderHalfExtents`/`colliderOffset` passed in code |
| `ExplosiveCrates.js` | explicit `cuboid` descriptor, `type: 'dynamic'`, in code |
| `Roads.js` | no collider at all — purely visual, sits on the terrain heightfield (confirmed already in Phase C's notes) |
| `Floor.js` / terrain | heightfield collider generated from the terrain data directly, not node-name-parsed |
| `VehicleModel.js` | procedural geometry; its collider is `PhysicsVehicle.js`'s own hardcoded chassis/bumper cuboids, unrelated to node naming |

None of these load a glTF, so there is no node-naming convention to verify — every single one of Phase B–F's new assets exists specifically *because* no 3D authoring tool was available in this environment (documented repeatedly in Phases B, D, E, F's own notes), and procedural content declares its physics shape directly rather than through Blender-authored node names. The only glTF-sourced physical content left anywhere in the game is `areasModel.glb`, feeding the 8 surviving `Area` subclasses via the base `Area` class's `setObjects()` → `objects.addFromModel()` — that's original, pre-migration Bruno Simon content this plan has never touched, so there's nothing new to verify there either.

## M2: two dimensional checks instead of a blind tuning pass

A1's own brief already decided the world footprint change (192→260 world units, a 35% increase) needs "only a pass... not a rewrite" on `PhysicsVehicle.js`. Rather than adjust `topSpeed`/`engineForceAmplitude`/suspension constants on a guess (which risks making the actual driving *feel* worse with no way to check), verified two concrete, math-checkable questions:

- **Does the vehicle physically fit through the narrowest roads?** The vehicle's collider cuboids (`PhysicsVehicle.js` chassis descriptors) give a full width of ~1.8 units (the "Bumper" cuboid's `z` half-extent of 0.9, the widest of the three). `CyberCityLayout.js`'s narrowest road is the alley connector at 4 units wide (avenues/spurs/ring are 6–8). That leaves ~1.1 units of clearance on *each* side in the tightest case — comfortable for straight-line driving, tight enough for cornering to matter (which reads as an intentional skill element in a Bruno-Simon-style game, not a bug to fix).
- **Does suspension travel handle the new curb height?** Phase B's terrain notes record a curb rise of `+0.15` magnitude. `PhysicsVehicle.js`'s suspension rest lengths range `0.88`–`1.63` units — roughly 6–11x the curb height. No risk of bottoming out or launching off a curb.

Both came back "comfortably fine" — no evidence of a structural problem, so no constants were changed. Whether the *boost* top speed (`40`, an 8x jump over the base `5`) feels appropriately thrilling-vs-dangerous in the narrower alley connectors is a genuine open question, but it's a feel/playtesting judgment, not a dimensional one — same category of risk as Phase L3's deferred mechanic rewrites, and left for a session where it can actually be driven.

## Verification performed

- Confirmed via search that no Phase B–F file calls `getFromModel()` or references node-name-based collider prefixes.
- Computed vehicle-vs-road clearance and suspension-vs-curb-height numerically from the actual constants in `PhysicsVehicle.js`/`CyberCityLayout.js`/`phase-b-implementation-notes.md`, rather than asserting them from memory.

**Not performed (no GPU/browser available in this environment):** actually driving through the alley connectors to judge whether boost speed feels right, or confirming collider placement visually.
