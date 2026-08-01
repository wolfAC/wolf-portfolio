# Phase O — Audio: Implementation Notes

Status: **AUDITED**, one mechanical fix applied. Covers `cyber-city-migration-plan.md`'s O1–O3.

## What changed

| Task | File(s) | What |
|---|---|---|
| O3 | `sources/Game/World/ScrapCrates.js` | Retargeted its collision sound from `hitBrick` to `hitMetal` — an existing-asset fix, not a new one |
| O1/O2 | — (not attempted) | Full sound inventory below, for whoever does the actual asset sourcing |

## Why O1/O2 weren't attempted

Both need real audio files — composed, or sourced with a checkable license. This environment has no safe way to produce either: there's no audio-generation tool, and pointing a `path:` at a file that doesn't exist in `static/sounds/` breaks that sound's playback entirely (silence or a load error) rather than just sounding thematically off, which is a strictly worse outcome than leaving the current, working-but-mismatched nature sounds in place. This is the same class of constraint every `[ASSET]` task in this plan has hit (no 3D tool for Phases B/D/E/F, no image tool implied for icon work in Phase P) — audio just has no procedural substitute the way geometry did.

## Full sound inventory

Every `this.register(...)` call in `Audio.js`, grouped by whether it needs real replacement audio (O1/O2) or is already fine.

### Needs replacement — nature/analog ambience with no cyberpunk-city equivalent

| Group | File(s) | Trigger | Note |
|---|---|---|---|
| `birdTweet` | 6 bird-call samples | random, daytime only | |
| `owl` | owl hoot | random, night only | |
| `rooster` | rooster crow | on leaving night | |
| `wolf` | wolf howl | on entering deep night | coincidentally shares the portfolio owner's name (`AUTHOR_NAME = 'Wolf'`) — worth deciding explicitly whether to keep as a signature nod or cut with the rest; not assumed either way here |
| `crickets` | cricket chirping | night, looped | |
| `wind` | `13582-wind-in-forest-loop.mp3` | continuous, wind-strength-driven | filename says "forest" specifically |
| `waves` | `lake-waves.mp3` | louder near the world edge | this "get near the boundary, hear an ocean" effect is now stale in a different way than the others — Phase B's terrain no longer has an edge where a sea would plausibly be (a bounded city block, not an island), so this isn't just the wrong *sound*, it's cueing a *place* that doesn't exist anymore. Didn't remove it solo (Phase J's water removal was presented as a decision, not assumed, and this is the same category of call) — flagging for the same explicit decision |
| `ovenFire` | wood-stove fire crackling | continuous, positioned at Cookie/Projects areas' `oven`/`spawner` reference points | still triggers correctly (both areas survive), just thematically a campfire in a neon market/glitch alley |
| `rain` | `soundjay_rain-on-leaves_main-01.mp3` | rain-intensity-driven | the *behavior* was already fixed in Phase I (no more snow-attenuation ducking); the filename itself ("rain-on-leaves") is the one piece Phase I's own notes flagged as a forward-reference to this phase |

None of these reference anything deleted in Phases H–L (`dayCycles`'s `night`/`deepNight`/interval names are all intact, confirmed in Phase H's notes) — they still play exactly as designed, just with the wrong content, not a broken reference.

### Already fine, or neutral enough not to prioritize

| Group | Why it's not flagged |
|---|---|
| `hitDefault`, `hitMetal` | Generic/metal impact sounds — plausible in a city as-is |
| `hitBrick` | Still registered (still a valid asset), just no longer used by `ScrapCrates.js` after this phase's fix — nothing else currently targets it, but left registered rather than removed in case a future stone/masonry prop wants it |
| `slide`, `click`, `assemble`, `discChange` | Mechanism/UI sounds (menu, jukebox-style interactions) — generic enough to read fine in a tech/cyberpunk context without changes |
| Music tracks (`Sudo.mp3`, `Boy.mp3`, `Baguira.mp3`) | Background music choice is a subjective/branding call, not a "does this fit nature vs. city" question — left alone, out of scope for this pass |

## O3: the one fix made without new assets

`ScrapCrates.js` (Phase E's reskin of the original `Bricks.js`) still had `soundGroup: 'hitBrick'`, wired to masonry-impact samples ("brick light hitting," "stone brick fall hit," "brick set down") — a straightforward material-name mismatch for something Phase E's own notes describe as "scrap-metal crates." `HoloSigns.js` already correctly uses `hitMetal` for its own metal-framed signage, so retargeting `ScrapCrates.js` to the same, already-registered group was a one-line, zero-new-asset fix. `VendingMachines.js`/`Barricades.js` don't set an explicit `soundGroup` at all (falling back to the generic `hitDefault`) — left alone, since that's a legitimate "no specific sound needed" choice, not a clear mismatch the way `hitBrick` vs. scrap-metal was.

## Verification performed

- `npm run build`: 746 modules transform without error (no new modules, one existing file edited); same pre-existing, unrelated `vite-plugin-top-level-await` failure documented in every prior phase's notes.
- Read every `this.register(...)` call in `Audio.js` (not sampled) to build the inventory table above, rather than guessing which sounds might be nature-themed from the group names alone.
- Confirmed via search that none of the nature-ambience triggers (`birdTweet`/`owl`/`rooster`/`wolf`/`crickets`) reference anything removed in Phases H–L — they're thematically stale, not broken.

**Not performed (no GPU/browser available in this environment, and no audio-sourcing capability):** hearing any of this, or sourcing/composing the actual replacement synth-city soundscape O1 calls for.
