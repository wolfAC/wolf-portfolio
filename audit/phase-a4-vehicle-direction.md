# Phase A4 — Vehicle Direction

Status: **DECIDED**.

## Decision

Keep a **grounded 4-wheel vehicle** (not a hover vehicle, not a bike/two-wheeler). Redesign its body as a new, original "night-runner" silhouette — a low, sleek two-door coupe shape with an elongated hood, a small greenhouse (cabin glass area), a rear spoiler light bar, and an exposed underglow strip along the rocker panels.

## Why grounded-4-wheel, not hover/bike

- `Physics/PhysicsVehicle.js` implements a raycast **vehicle controller** built directly on Rapier's `createVehicleController` with a hard-coded 4-wheel setup (steering on wheels 0/1, suspension/friction/engine-force per wheel, ground-contact-based state detection for stopped/stuck/upside-down/flip). A hover vehicle or a 2-wheel bike would require replacing this controller's core assumptions (contact model, suspension model, flip/upside-down semantics), which is a physics-engineering task far outside a *visual* reskin's scope.
- Keeping the silhouette family "grounded car" means Phase F (vehicle reskin) and Phase M (physics/collider follow-through) stay **tuning passes** (wheel offsets, suspension heights, engine force constants) rather than rewrites — directly supporting this migration's stated goal of a reskin, not an engine rewrite.
- A grounded vehicle also keeps every existing gameplay hook intact as-is with no redesign needed: the suspension "hydraulics" jump/lean trick (`Player.js` suspensions state), wheel-contact sound design (`sounds/vehicle/floor/*`), and tire-track rendering (`Game/Tracks.js`) all assume wheel-ground contact.

## Concrete dimension targets for Phase F1 modeling

Derived from `Physics/PhysicsVehicle.js`'s current wheel constants (`wheels.settings`), which are **not** to be changed by the reskin unless Phase F2 explicitly executes a retune:

| Physics constant | Current value | Derived target |
|---|---|---|
| `offset.x` (half wheelbase) | 0.90 | Wheelbase = **1.80 m** |
| `offset.z` (half track width) | 0.75 | Track width = **1.50 m** |
| `radius` (wheel radius) | 0.4 | Wheel diameter = **0.80 m** |

Suggested overall body envelope for the new model (stylized/arcade-scaled, matching the existing chunky proportions rather than real-world car dimensions):

- Overall length: **2.6–3.0 m** (front/rear overhang of ~0.4–0.6 m each beyond the 1.80 m wheelbase)
- Overall width: **1.8–2.0 m** (slightly wider than the 1.50 m track so the body visually covers the wheels)
- Overall height: **1.0–1.2 m** (low coupe profile, per the silhouette decision above)

## Visual accents (ties back to `phase-a1-art-direction-brief.md` palette)

- Underglow strip: neon primary magenta `#ff2e8a` or secondary cyan `#28e0ff` (pick one per vehicle variant, not both, to avoid visual noise against the city's own neon).
- Headlights: cool white/cyan, not warm amber (amber is reserved for the palette's accent/warning role).
- Rear light bar: amber `#ffb020`, doubling as a brake-light accent.
- No use of the reserved landmark-only acid-green (`#8dff4f`) on the vehicle.

## Explicitly rejected alternative

A hover-bike/hover-vehicle concept was considered and rejected for this migration specifically because of the physics-controller rewrite cost noted above — it remains a valid idea for a future, larger-scope engine change, but is out of scope for "reskin the environment into a Cyber City."
