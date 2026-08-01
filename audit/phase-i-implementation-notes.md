# Phase I — Weather & Atmosphere: Implementation Notes

Status: **IMPLEMENTED**. Covers `cyber-city-migration-plan.md`'s I1–I4.

## What changed

| Task | File(s) | What |
|---|---|---|
| I1 | `sources/Game/World/Litter.js` (new), `sources/Game/World/Leaves.js` (deleted) | Wind-blown autumn leaves reskinned to wind-blown litter — same GPU-compute particle mechanic, new colors |
| I1 | `sources/Game/World/Snow.js` (deleted), `sources/Game/Weather.js`, `sources/Game/World/RainLines.js`, `sources/Game/Audio.js` | Snow cut entirely, including every downstream hook that read `weather.snow` |
| I1 | `sources/Game/World/World.js`, `sources/Game/Explosions.js`, `sources/Game/Cycles/YearCycles.js` | Wiring updates for the Leaves→Litter rename |
| I2 | — (verified, no code change) | `Fog.js` already retinted as a side effect of Phase H — see below |
| I3/I4 | — (design decision, no code) | Decided against adding a separate steam/smog system |

## I1: rain and lightning kept, snow cut, leaves → litter

**Rain (`RainLines.js`) and lightning (`Lightnings.js`) kept as-is** (aside from the snow-decoupling below) — both read only generic `weather.*` properties, neither has any nature/vegetation coupling (confirmed via search), and both fit A1's mood brief directly: "a dense, rain-slicked night city" names rain explicitly, and the deep-night preset's `electricField: 1` (Phase H) already leans into an electrical-storm mood that lightning reinforces.

**Snow cut.** A1's mood brief locks in one specific, singular weather identity — "rain-slicked" — and running rain and snow as competing precipitation systems dilutes that. Cutting it turned out to be more than deleting `Snow.js`; three other systems read `weather.snow.value` and needed unwinding so nothing was left pointing at a phenomenon that no longer exists:

- **`Weather.js`** — removed the `snow` property definition itself (was: `rainRatio * freezeRatio + meltRatio` from rain/temperature). Nothing reads it anymore, so keeping the computation around would just be dead code.
- **`RainLines.js`** — two debug-bound values (`length`, `speed`) blended toward snow-like short/slow streak values as `weather.snow` rose (the game faked "falling snow" by deforming the rain-streak mesh rather than a separate snow-streak visual — a detail easy to miss since it's not in `Snow.js` at all). Both bindings now use the plain rain-only formula unconditionally, so rain no longer tapers into a "snow" look that has nothing to land on.
- **`Audio.js`** — found two things tied to `weather.snow`: (1) a **"Jingle Bells" Christmas easter egg** (`sounds/jingleBells/...`) that faded in proportional to snow — a charming detail for the original nature portfolio, but it would become an unexplained holiday jingle playing during cold-and-rainy conditions with zero visual snow to justify it, so it's removed outright, not left dangling; (2) a `snowAttenuation` term that ducked the rain sound's volume during snowy conditions — removed, rain volume now follows `weather.rain.value` directly. (`BlackFriday.js`'s unrelated separate seasonal easter egg was not touched — out of scope, and already flagged as a pre-existing unrelated finding in Phase F's notes.)

**Leaves → Litter.** `Leaves.js` (autumn wind-blown foliage, GPU-compute instanced particles with vehicle-push/wind/explosion/terrain-damping/looping behavior) is exactly the kind of generic, reusable engine mechanic A1 says is fine to keep — only the *content* needed to change, per the plan's own suggestion ("wind-blown leaves should likely be replaced with wind-blown litter"). `Litter.js` is a straight copy with:
- Class/file renamed `Leaves` → `Litter`, debug panel retitled.
- Colors changed from autumn brown/orange (`#95513a`/`#f56a3a`) to muted grime/paper tones — `#2a2733` (reused verbatim from A1's cataloged "sidewalk/curb base") and `#7a7264` (a new muted, non-neon faded-paper tan; A1's "no color outside the table" rule targets emissive/neon accents specifically, not desaturated structural/prop base colors like this one).
- Geometry, physics (vehicle push, wind drift, explosion scatter, terrain/water damping, world-space looping) all untouched — a crumpled-paper/debris silhouette reads fine on the same notched-quad geometry the leaf shape used.
- The density curve (`yearCycles.properties.leaves` → `.litter`, values unchanged: winter 0.25 / spring 0 / summer 0.25 / fall 1) was kept rather than redesigned — decoupling litter density from the season entirely would be a reasonable future call, but wasn't a strong-enough signal either way to justify touching `YearCycles.js`'s actual values, only the key name needed for the rename.
- `World.js` (import + `this.litter = new Litter()`), `Explosions.js` (`world.leaves?.explode` → `world.litter?.explode`) updated accordingly. Confirmed via search these were the only two external consumers.

## I2: already satisfied by Phase H

Re-checked `Fog.js` before touching it: its `colorA`/`colorB` uniforms are overwritten every tick from `this.game.dayCycles.properties.fogColorA/fogColorB.value` (`Fog.js update()`), which Phase H's retint already changed to the A1 sky near/far pair. `Fog.js` itself has no separate static color to re-tint — its only own state is the placeholder constructor values (`#ff0000`/`#0000ff`), which are cosmetic-only until the first tick overwrites them and were already true before this phase. No code change made.

## I3/I4: no new atmosphere system added

The plan's "steam vents/smog" idea was evaluated and deliberately not built: the litter reskin already delivers this phase's "new atmosphere content" requirement at much lower risk (a proven mechanic, re-themed), whereas a steam/smog particle system would be genuinely new GPU-compute + shader work that can't be visually verified in this environment (no GPU/browser available — see every prior phase's notes). Consistent with Phase F's decision to skip the optional antenna accessory (F4), this is a deliberate scope-tightening, not an oversight.

## Verification performed

- `npm run build`: 744 modules transform without error (down from 745 — `Snow.js` removed, `Leaves.js`→`Litter.js` is a net-zero file swap); same pre-existing, unrelated `vite-plugin-top-level-await` failure documented in every prior phase's notes.
- Confirmed via search that `weather.snow` had exactly four readers before removing its source property: `Snow.js`, `RainLines.js` (×2), `Audio.js` (×2) — all four addressed, then re-searched afterward and confirmed zero remaining references to `Leaves`, `Snow`, `snowRatio`, `snowAttenuation`, or `jingleBells` anywhere in `sources/`.
- Confirmed via search that `yearCycles.properties.leaves` and `world.leaves` each had exactly one external reader (`Leaves.js` itself and `Explosions.js` respectively) before renaming.
- Removed `lerp`/`remap` imports from `RainLines.js` after the snow-blend removal left them unused (confirmed via search no other usage remained in the file).

**Not performed (no GPU/browser available in this environment):** seeing the litter particles, the retinted rain-streak behavior, or confirming the Jingle Bells removal doesn't leave a silent gap in the audio registration flow. As with every prior phase, spot-check in a browser before considering Phase I visually/aurally final.
