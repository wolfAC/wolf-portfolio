# Phase K — Post-Processing: Implementation Notes

Status: **IMPLEMENTED**. Covers `cyber-city-migration-plan.md`'s K1–K3.

## What changed

| Task | File(s) | What |
|---|---|---|
| K1 | `sources/Game/Rendering.js` | Bloom `threshold` 1 → 0.4, `strength` 0.25 → 0.75 |
| K2 | `sources/Game/Rendering.js` | Added a subtle vignette pass, gated to quality level 0 |
| K3 | `sources/Game/Passes/cheapDOF.js`, `sources/Game/Rendering.js` | Widened the DOF's sharp-zone `end` default (and its debug slider ceiling) |

This phase directly followed the discovery and restoration of Phase D's building system (accidentally deleted by a later commit, restored during this phase once noticed — see `phase-d-implementation-notes.md`'s incident note), so all three tasks below are tuned against a city that actually has a skyline.

## K1: the old bloom threshold likely meant building windows never bloomed at all

Before picking a number, checked what luminance the things meant to glow actually reach. `Buildings.js`'s window emissive (`createMaterial()`) is `windowColor.mul(windowMask).mul(lit).mul(flicker)` — a **raw palette hex color**, multiplied only by factors that stay ≤1 (mask/lit/flicker). Unlike `Materials.js`'s `createEmissive()`/`createEmissiveGradient()` (which multiply their base color by an explicit 1.5–2.7 intensity uniform, see Phase G's notes), there is no intensity boost here — the window's peak brightness is whatever the tint hex's raw luminance is.

Computed Rec.709 luminance for A1's cataloged neon hues:

| Hue | Hex | Luminance |
|---|---|---|
| Neon primary (magenta) | `#ff2e8a` | ~0.38 |
| Neon secondary (cyan) | `#28e0ff` | ~0.73 |
| Neon accent (amber) | `#ffb020` | ~0.72 |
| Landmark beacon (acid green) | `#8dff4f` | ~0.86 |
| Structure base (deep indigo / slate) | `#151420` / `#23212f` | ~0.05–0.08 |

The old `threshold = 1` is higher than **every one of these**, including the brightest (acid green at 0.86) — meaning no building window, at any tint, could ever have crossed it. Buildings could only ever have bloomed via `Materials.js`'s already-boosted presets (props, signage), never their own windows. Given A1 explicitly wants illumination reading through bloom on window/sign/road glow, this was a real gap, not a subtle one.

New value: `threshold = 0.4` — just below the dimmest common neon hue (magenta, ~0.38) so every cataloged tint clears it, while staying ~5-8x above the near-black structural base colors (~0.05–0.09), so plain walls/road/sidewalk don't bloom. `strength` raised 0.25 → 0.75 (3x) so the now-crossing-threshold windows/signage read as a genuine glow rather than a barely-there fringe. `smoothWidth` left at 1 — already a soft, gradual knee rather than a hard cutoff, which suits a moody neon look and needed no change.

## K2: vignette chosen over chromatic aberration/scanlines specifically for its risk profile

All three options from the plan are viable; vignette was picked because it's the only one that's structurally hard to get visually wrong without seeing it render. A radial screenUV-distance falloff (`screenUV.length()`, using the existing convention from `Overlay.js`/`Tracks.js`) multiplying the final color can only ever look like "the edges are a bit darker" — there's no failure mode where the math produces something broken-looking, unlike chromatic aberration (wrong channel-offset direction/magnitude reads as a glitch) or scanlines (wrong frequency/blend reads as strobing or moiré). Given no GPU/browser is available in this environment to catch a bad result, this was the responsible choice, matching the same risk calculus Phase G2 used to pick fresnel over full screen-space reflection.

Implementation: `vignette(inputNode) = inputNode * (1 - smoothstep(radius, radius+softness, screenUV.length()) * strength)`, with `radius=0.6`, `softness=0.7`, `strength=0.35` (corners multiply to `~0.65`, a gentle darken, not a hard frame). Gated into the quality-0 branch only (`vignette(cheapDOFPass.add(bloomPass))`), matching K2's explicit instruction to gate it "the same way DOF currently is" — even though a plain multiply is cheap enough it could run on quality 1 too, following the plan's stated tier convention exactly was preferred over introducing an inconsistency.

## K3: widened the DOF's sharp zone for the now-much-taller skyline

`cheapDOF.js` isn't real depth-buffer DOF — it blurs based on `|uv().y - 0.5|`, i.e., distance from the screen's vertical center line (a tilt-shift-style effect suited to this game's fixed low driver's-eye camera angle, not scene depth). The sharp (unblurred) band was `start=0.2` to `end=0.5` — beyond `0.5` (already the old default, and the debug slider's ceiling) the frame is fully blurred.

With Phase D's restored buildings now filling much more of the frame's upper region than the original open field's sky ever did, the old `end=0.5` risked blurring building facades and their per-window lit/flicker detail (Phase D) — exactly the content K1's bloom retune was just tuned to make legible. Widened `end` to `0.62`, and correspondingly raised both `start`/`end` debug slider ceilings from `0.5` to `0.8` (the old default was already sitting at the old ceiling, so there was no headroom to tune within the existing slider range at all).

This number is a reasoned estimate, not something measured against an actual rendered frame (no GPU/browser available) — the debug panel binding is deliberately kept live and editable so it can be adjusted by eye once a browser is available, per the "Not performed" note below.

## Verification performed

- `npm run build`: 746 modules transform without error (unchanged count — this phase only edited existing files); same pre-existing, unrelated `vite-plugin-top-level-await` failure documented in every prior phase's notes.
- Computed each A1-cataloged neon hue's Rec.709 luminance by hand before choosing `threshold`, rather than guessing a round number.
- Confirmed via search that `Buildings.js`'s `windowColor` has no separate intensity multiplier (unlike `Materials.js`'s emissive presets), which is what made the old threshold's gap concrete rather than speculative.
- Confirmed `screenUV` is an established, already-used TSL primitive in this codebase (`Overlay.js`, `Tracks.js`), not a new/unverified API surface, before building the vignette on it.

**Not performed (no GPU/browser available in this environment):** seeing the bloom actually catch building windows/signage, the vignette's visual weight, or whether `end = 0.62` strikes the right balance between "buildings stay legible" and "the tilt-shift character survives." All three are exposed via the existing debug panel (`bloomPanel`, the new `vignettePanel`, `blurPanel`) specifically so they can be eyeballed and adjusted live once a browser is available — this should be the first thing checked before considering Phase K visually final.
