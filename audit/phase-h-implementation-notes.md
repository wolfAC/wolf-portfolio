# Phase H — Lighting: Implementation Notes

Status: **IMPLEMENTED**. Covers `cyber-city-migration-plan.md`'s H1–H5.

## What changed

| Task | File(s) | What |
|---|---|---|
| H1 | `sources/Game/Cycles/DayCycles.js` | Kept the 4-phase day-cycle loop (A1's decision), renamed `day`/`dusk`/`night`/`dawn` → `overcastDusk`/`neonDusk`/`deepNight`/`electricDawn` |
| H2 | `sources/Game/Cycles/DayCycles.js` | Retinted `lightColor`/`fogColorA`/`fogColorB` per phase and brought `lightIntensity` into A1's binding ranges |
| H3 | — (verified, no code change) | `Ligthing.js`'s fixed `DirectionalLight` isn't a mood lever in this codebase — see below |
| H4 | — (design decision, no code) | Decided against adding real point lights for streetlights/signage |
| H5 | — (skipped) | Conditional on H4, which was "no" |

## H1/H2: renamed and retinted presets

`DayCycles.js`'s `presets` object keys were only ever read from within that same file (confirmed via search — no other module does `dayCycles.presets.<name>`; the only external consumers reach through `intervalEvents`/`events`, which use separate, unrelated string names `'night'`/`'deepNight'` from `getIntervalDescriptions()` and were **not** touched), so renaming the object keys to match A1's phase concepts was a zero-risk, purely internal change.

Values changed, one row per phase:

| Phase (old → new) | `lightIntensity` (old → new, A1 target range) | `lightColor` (old → new) | `fogColorA`/`fogColorB` (old → new) |
|---|---|---|---|
| `day` → `overcastDusk` | 1.2 → 1.4 (target 1.0–1.6) | `#ffd2c2` (warm) → `#c9d2ff` (cool violet-white, per A1's lean) | `#00ffff`/`#9b89ff` → `#2b2440`/`#0d0a1a` |
| `dusk` → `neonDusk` | 1.2 → 1.0 (target 0.8–1.2) | `#ff8181` → `#ff8fd6` (shifted toward the neon-primary magenta family) | `#3e53ff`/`#ff4ce4` → `#3a1f3f`/`#0d0a1a` |
| `night` → `deepNight` | **3.8 → 0.6** (target 0.4–0.8) | `#3240ff` (kept — already "cold blue" per A1's lean) | `#10266f`/`#490a42` → `#170f2b`/`#05030a` (A1's exact sky near/far pair) |
| `dawn` → `electricDawn` | 1.2 → 1.0 (target 0.8–1.2) | `#ffa882` → `#ffb27a` (amber, nudged toward the neon-accent amber) | `#f885ff`/`#ff7d24` → `#3a2a1f`/`#0d0a1a` |

`revealColor`, `revealIntensity`, and `shadowColor` were **not** changed: all three were already in the established violet/magenta/blue neon family the rest of the Cyber City work uses (e.g. `#5f7dff`, `#b678ff`, `#4e009c`, `#2f00db` read as coherent neon-city tones already, not leftover nature-theme colors), so retinting them would be arbitrary churn with no A1 basis. `electricField` and `temperature` were also left untouched — those drive weather behavior (rain/snow/freeze thresholds in `Weather.js`/`Snow.js`/`WaterSurface.js`), which is explicitly Phase I's decision, not H's.

`electricDawn`'s `shadowColor` reuses `#128fb0` verbatim from A1's own palette table (`emissiveBlueRadialGradient`'s colorB) rather than inventing a new hex, satisfying the brief's "no color outside this table without adding a row" rule while giving dawn's "amber/cyan crossover" lean a literal cyan-leaning shadow to contrast its amber light.

The single most consequential fix here is `deepNight.lightIntensity`: 3.8 was nearly 5x A1's target ceiling of 0.8, and directly multiplies into every mesh's output color (see H3) — at the old value, the "darkest, most contrast" phase of a neon-lit night city would instead have been the *brightest*-lit phase, working directly against the entire reskin's premise that illumination should come from emissive props via bloom, not the directional term.

## H3: `Ligthing.js` needed no change — here's why

Traced exactly what the real `THREE.DirectionalLight` (`Ligthing.js` `setLight()`) actually affects before touching anything:

- It's constructed once with a **hardcoded** `new THREE.DirectionalLight(0xffffff, 5)` and its `.color`/`.intensity` are never reassigned anywhere afterward — `update()` only moves its `.position`/`.target.position` (for the day-cycle sun sweep) and never touches color/intensity.
- Its real job is shadow-map infrastructure: shadow camera frustum (`updateShadow()`), and casting the shadow map three.js needs a light object for.
- The actual per-frame, day-cycle-driven "how bright/what color is the world" term is `this.intensityUniform`/`this.colorUniform`, set every tick from `dayCycles.properties.lightIntensity/lightColor` (`Ligthing.js:212-213`), and consumed in `MeshDefaultMaterial.js:100`: `outputColor.mulAssign(lighting.colorUniform.mul(lighting.intensityUniform))` — a direct multiply into every default-material mesh's final color, bypassing the built-in three.js light-irradiance model entirely.

So the "dimmer sun-equivalent" the plan asks for is already fully achieved by H2's `lightIntensity` retune — changing the hardcoded `DirectionalLight(..., 5)` constant would have zero visible effect on the game's actual look (it doesn't feed the shading path at all), and would only pointlessly alter shadow-map depth precision. `phi`/`theta`/`phiAmplitude`/`thetaAmplitude` (the sun's angular sweep) affect shadow *direction* and the stylized core-shadow term, not color/brightness mood, and A1 gives no signal to change the sweep for this reskin — left untouched as generic engine tooling.

## H4/H5: no new point-light system

Phase E's props (Neon Streetlights, Holo Signs, Vending Machines, etc.) already glow via emissive materials + the bloom pass, consuming zero real scene lights — consistent with this project's shading model (which, per H3, doesn't route real light irradiance into `MeshDefaultMaterial` anyway) and its existing perf posture (avoiding real-time shadow-casting light count blowing up on `Quality` level 1 / mobile, exactly the risk H5's own wording flags). Adding a real point/area light system now would be new architecture for a look the emissive-material approach already delivers — not attempted.

## Verification performed

- `npm run build`: 745 modules transform without error (same count as the current `main` baseline before this phase — only edited an existing file, added no new source modules); same pre-existing, unrelated `vite-plugin-top-level-await` failure documented in every prior phase's notes.
- Confirmed via search that `presets`' object keys (`day`/`dusk`/`night`/`dawn`) have zero external readers before renaming them, and that the separate interval-event names `'night'`/`'deepNight'` (read by `Map.js`, `Audio.js`, `PoleLights.js`, `ToiletArea.js`) come from a different method (`getIntervalDescriptions()`) that this phase did not touch.
- Confirmed via search that `Ligthing.js`'s `DirectionalLight` color/intensity are write-once and never read back into shading, before deciding H3 needed no change.

**Not performed (no GPU/browser available in this environment):** actually seeing the retinted day-cycle in motion. The full 4-minute cycle (`duration = 4 * 60`) touches every phase; the highest-value spot check is `deepNight` (via `VITE_DAY_CYCLE_PROGRESS` forced to `~0.45`, inside the `0.35–0.6` deep-night keyframe stops) to confirm the scene no longer blows out at the old `3.8` intensity.
