# Phase P — UI/HUD: Implementation Notes

Status: **PARTIALLY IMPLEMENTED**. Covers `cyber-city-migration-plan.md`'s P1–P3. P1 done, P2 needed almost no changes, P3 found real bugs (one fixed) plus the biggest asset gap in this whole session.

## What changed

| Task | File(s) | What |
|---|---|---|
| P1 | `sources/style/{easter,general,map,menu,notifications,tooltips}.styl` | Retinted every non-neutral, off-palette color |
| P2 | `static/ui/achievements/check.svg` (deleted) | Removed one confirmed-dead asset |
| P3 | `sources/Game/Map.js` | Fixed stale location names on the minimap pins |

## P1: color mapping

Checked every hex color across every `.styl` file (not sampled) before touching anything, to separate "genuinely off-palette" from "already neutral/fine." Neutral grays/whites/blacks (`#ffffff`, `#000000`, `#555555`, `#767676`, `#cccccc`, `#141414`) and the already-close panel-background pair (`#251f2b`/`#1d1721`, essentially identical to A1's own "Structure — slate `#23212f`" / "deep indigo `#151420`" rows) were left untouched — they were already either neutral-by-design or already matching. `fireButton.styl`'s red (`rgba(255, 45, 45, ...)`) was also left alone: a fire/weapon button reading as red is a strong, near-universal UI convention independent of ambient theme, the same reasoning Phase G4 used to leave the vehicle's `redGradient` paint choice untouched. `blackFriday.styl` wasn't touched either — a self-contained seasonal easter egg with its own palette, out of scope (matching the precedent of leaving `BlackFriday.js` alone in Phase F).

Everything else mapped to the A1 table:

| Old color | New color | Semantic | Files |
|---|---|---|---|
| `#C21515` / `#46123B` | `#ff2e8a` / `#b3106b` | Panel header gradient — reused verbatim from Phase G4's already-retinted `emissivePurpleRadialGradient` pair | `map.styl`, `menu.styl` |
| `#ffceca` | `#ff2e8a` | Default/generic accent (borders, subtitles, progress-bar fills) — the most common leftover color, used across many unrelated elements with no specific semantic beyond "highlight" | `easter.styl`, `general.styl`, `tooltips.styl`, `menu.styl` |
| `#d5ff95` | `#28e0ff` | "Success"/"connected"/"used" state | `easter.styl`, `general.styl`, `notifications.styl` |
| `#ff6a7c`, `#ff87a2` | `#ff2e8a` | "Danger"/"error"/"disconnected" state | `general.styl`, `notifications.styl` |
| `#ffc67b` | `#ffb020` | "Now playing" / highlight state | `notifications.styl` |

**Why `#d5ff95` specifically had to move, not just get a nicer green:** A1 is explicit — the acid-green `#8dff4f` is "reserved exclusively for the Skyline Observatory hero landmark... must not appear elsewhere." A generic UI "success" color living in a similar green hue would dilute that single-landmark identity the first time a player sees a green checkmark and a green beacon in the same sitting. Moved it to cyan (the palette's other cool accent) instead of just retinting it to a different, still-reserved-adjacent green.

**Why `#ff6a7c`/`#ff87a2` (two different reds, same semantic) both became the identical `#ff2e8a`:** A1's palette has no dedicated "danger red" — magenta is the closest available hue to conventional error-red, and collapsing two near-duplicate legacy reds into one canonical value is exactly the kind of palette discipline A1 asks for ("no color outside this table without adding a row").

## P2: almost nothing needed changing

Checked every SVG under `static/ui/` for hardcoded fill/stroke colors before assuming icon work was needed. Nearly all of them (`close.svg`, `audioOn.svg`/`audioOff.svg`, etc.) are `stroke="white"`/`fill="none"` line-art — theme-neutral by construction, reading fine against any dark background regardless of ambient palette. `static/ui/achievements/rewards/*` (paint-swatch images named `abyssal`/`black`/`flames`/`orange`/`red`/`white`) looked like they might be orphaned leftovers from the deleted Achievements system given the folder name, but a search showed `VisualVehicle.js` and `Roads.js` still actively reference them — they've been repurposed as vehicle paint-choice swatches, unrelated to the achievement-unlock mechanic they were originally named for. Left alone.

One asset actually was dead: `static/ui/achievements/check.svg`, hardcoded to `fill="#D5FF95"` (the same old success-green just retinted out of the stylesheets) — a search turned up zero references anywhere in `sources/`. Confirmed genuinely orphaned (not just unused-looking) before deleting it, consistent with "if you're certain something is unused, delete it" rather than leaving dead files around.

## P3: a real bug fixed, and the biggest gap in this session found

**Fixed:** `Map.js`'s `setLocations()` hardcoded the minimap pin labels as the *original* Bruno Simon-era names — "Altar," "Bowling," "Career," "Cookie," "Landing," "Projects," "Time Machine" — never updated to the Phase L district names even though `CyberCityLayout.js` and `phase-l-district-copy.md` already established them. Relabeled all seven to their Cyber City names (Server Shrine, Overclock Arcade, Corporate Spire District, Glitch Vendor Alley, Transit Nexus, Holo-Bazaar, Chrono Terminal). Left `respawnName` values untouched — those are `Respawns.js` lookup keys, not player-facing text.

**Noted, not changed:** this location list has never included `toilet` (Malfunction Stall) — every other small "alley" area (altar, bowling, cookie) has a pin, but toilet doesn't. Genuinely unclear whether that's an oversight or an intentional hidden secret (toilets-as-secret-content is a common enough game-design joke that I didn't want to assume and "fix" something that was deliberate); left as-is rather than guessing.

**Found, not fixed — the biggest gap this session surfaced:** viewed the actual minimap image (`static/ui/map/map-night.png`) directly. It is a fully-rendered, illustrated top-down picture of the *original* Bruno Simon map — an open island, trees, a lake, and the circuit racetrack loop that `CircuitArea`/`devCircuit` used to be (now deleted, per `phase-l-implementation-notes.md`). It has no relationship whatsoever to the new hub-and-ring layout with 2 districts and 5 alley nodes. Every player who opens the map (a bound, discoverable key: `M`) will see a completely different city than the one they're driving through — of everything audited this session, this is the single most immediately obvious, unmissable mismatch, more so than the empty-plaza issue Phase L fixed (that required already knowing to drive there; this is one keypress away from any player).

This wasn't attempted for the same reason as every other `[ASSET]` task in this plan: producing a new illustrated map image needs a real art tool this environment doesn't have. Considered, but decided against, building a *procedural* replacement (a `<canvas>`-drawn schematic map generated live from `CYBER_CITY_LAYOUT`'s hub/ring/district/alley data, replacing the static `<img class="js-texture">` entirely) — this data-driven approach is genuinely feasible with code alone (unlike the illustrated art style), matching this whole plan's established pattern of substituting procedural generation for missing art tools (Phases B, D, E, F). But it's a materially bigger, riskier change than anything else in this phase — a new rendering system, not a color swap — and it can't be visually checked for scaling/coordinate bugs against the existing percentage-based `.location` pin overlay (`worldToMap()`'s normalization) without a browser. Flagged clearly as a real option for a future session rather than attempted blind in the same pass as a bunch of low-risk color changes.

## Verification performed

- `npm run build`: 746 modules transform without error (no new modules; edited/deleted existing files only); same pre-existing, unrelated `vite-plugin-top-level-await` failure documented in every prior phase's notes.
- Read every hex color in every `.styl` file (not sampled) before deciding what to retint, and re-grepped afterward to confirm zero remaining instances of any of the five replaced colors.
- Confirmed via search that `achievements/check.svg` had zero references before deleting it, and that `achievements/rewards/*` do have live references before leaving them alone — didn't delete based on folder name alone.
- Actually viewed `static/ui/map/map-night.png` (this environment's image-reading capability, not just grepping code) rather than assuming from the filename that it might already be updated.

**Not performed (no GPU/browser available in this environment):** seeing any of the retinted UI render, or the map location pins in their new labels. The map *image* mismatch doesn't need a browser to confirm — it was confirmed directly by viewing the image file.
