# Phase L1 — District Theming Copy

Design/copy artifact only — no code in this file. Covers the 8 districts that survived the Phase L trim (`CyberCityLayout.js`); see `phase-l-implementation-notes.md` for why the other 5 were removed instead of reskinned.

For each district: its name (already live in `CyberCityLayout.js`), a short flavor description for future signage/UI copy (Phase P/L2), and — importantly — whether the `Area` subclass's actual *mechanic* already matches this identity or still runs its original content. Several districts have a new **name** in the layout but the **class listed in parentheses still runs its pre-reskin mechanic** — that gap is real and called out per-entry, not glossed over.

## Transit Nexus (`LandingArea`)
The city's hub — a central roundabout every ring road and radial avenue radiates from, and the spawn point. First impression of the whole city; no interactive content of its own beyond being the origin players return to. *Mechanic already matches*: `LandingArea` is a generic spawn/reveal zone, not tied to any Bruno Simon–specific content.

## Corporate Spire District (`CareerArea`)
A cluster of corporate towers where career history rises out of the ground as illuminated stone slabs along a timeline, climbing in elevation as the years advance — career progress read literally as altitude. Home to `hero-corporateSpire`, a twin-spire landmark. *Mechanic already matches*: the stone-slab/year-timeline mechanic (`CareerArea.js`) is generic content-driven infrastructure, not tied to any original-portfolio joke.

## Holo-Bazaar (`ProjectsArea`)
A dense night market where each project is a holographic market stall/signage board instead of a gallery wall — project cards reimagined as glowing vendor displays in a crowded bazaar street. Home to the relocated `hero-broadcastPlaza` landmark (see implementation notes for why). *Mechanic already matches*: `ProjectsArea.js`'s card-showcase mechanic is generic, content-driven.

## Overclock Arcade (`BowlingArea`)
**Name/content mismatch — not yet reskinned.** Per `phase-a2-district-mapping.md`, this was meant to become an original reflex/overclock mini-game, replacing bowling's specific mechanic and content entirely (not just a re-skin). The class is still literally `BowlingArea.js` and still runs an actual bowling mechanic (pins, ball, `InstancedGroup`) — only the *district's name* in `CyberCityLayout.js` has changed. Rewriting a mini-game's mechanic needs real iterative playtesting this environment can't provide (no GPU/browser) — flagged as open work, not attempted here.

## Server Shrine (`AltarArea`)
A shrine to a server/AI core standing in for the original personal "altar" gag — same devotional-space feel, reinterpreted subject. **Name/content mismatch — not yet reskinned**: `AltarArea.js` still runs its original altar content/visuals; only the district name changed. Same reasoning as Overclock Arcade for why this wasn't attempted blind.

## Glitch Vendor Alley (`CookieArea`)
A malfunctioning vending machine endlessly spitting out glitching EULA/consent-banner text, standing in for the original cookie-consent-banner joke — same "annoying legal popup" gag, new justification. **Name/content mismatch — not yet reskinned**: `CookieArea.js` still runs the original cookie-consent joke content; only the district name changed.

## Malfunction Stall (`ToiletArea`)
An out-of-order maintenance/utility stall (flickering "closed" sign, service-panel clutter) standing in for the original toilet gag. **Name/content mismatch — not yet reskinned**: `ToiletArea.js` still literally builds a cabin with candle flames (`setCabin`/`setCandleFlames`); only the district name changed.

## Chrono Terminal (`TimeMachineArea`)
A terminal referencing past versions of the portfolio itself — generalized from the original specific "nostalgia time machine" prop into "a console browsing your own history." **Name/content mismatch — not yet reskinned**: `TimeMachineArea.js` still runs its original TV/time-machine content (`setTV`); only the district name changed.

## Summary: what's actually done vs. name-only

| District | Layout name updated | Mechanic/content reskinned |
|---|---|---|
| Transit Nexus | ✅ | ✅ (generic, needed no change) |
| Corporate Spire District | ✅ | ✅ (generic, needed no change) |
| Holo-Bazaar | ✅ | ✅ (generic, needed no change) |
| Overclock Arcade | ✅ | ❌ still bowling |
| Server Shrine | ✅ | ❌ still the original altar |
| Glitch Vendor Alley | ✅ | ❌ still the original cookie joke |
| Malfunction Stall | ✅ | ❌ still the original toilet cabin |
| Chrono Terminal | ✅ | ❌ still the original TV/time machine |

Five of eight districts are a road sign pointing at content that hasn't caught up to it yet. This is real, open work (`phase-a2-district-mapping.md`'s L3 task) — a deliberate scope boundary for this phase, not an oversight; see `phase-l-implementation-notes.md`.
