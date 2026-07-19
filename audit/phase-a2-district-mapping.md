# Phase A2 — District Mapping (old Area → new original district)

Status: **DECIDED**. Covers every entry in `Game/World/Areas/Areas.js`'s area list. For each one: whether the *code slot* (the `Area` subclass, its trigger zone, its achievement hooks) is kept, and what *new, original content/name* replaces the existing one. Only the generic engine mechanism (proximity zone, frustum visibility, achievement progress) is reused — that is engine tooling, not Bruno Simon's authored design, and is explicitly allowed by the migration plan's constraint. No new 3D layout, story text, or joke content from the original is reused anywhere in this table.

## Portfolio-content districts (real content lives here)

| Area file | Original personal concept | New district | Slot decision | Why |
|---|---|---|---|---|
| `LandingArea.js` | Spawn point | **Transit Nexus** (central hub / roundabout) | Keep slot, reinvent content | A hub-and-spoke road topology (Phase A3) needs a literal hub; this is also the natural spawn point |
| `CareerArea.js` | Career history showcase | **Corporate Spire District** | Keep slot, reinvent content | Career info is the portfolio owner's own content; corporate-tower dressing is a generic, original cyberpunk fit |
| `ProjectsArea.js` | Projects showcase board | **Holo-Bazaar** (neon market) | Keep slot, reinvent content | Project cards reimagined as holographic market signage |
| `SocialArea.js` | Social links / statue | **Broadcast Tower Plaza** | Keep slot, reinvent content | Social links reinterpreted as a broadcast/comms tower |
| `LabArea.js` | Side-experiments showcase | **Undercroft Fabrication Yard** | Keep slot, reinvent content | Experimental work fits an industrial fabrication district |
| `AchievementsArea.js` | Achievements board | **Skyline Observatory** | Keep slot, reinvent content | Tallest landmark in the city; pairs thematically with the existing "go high" achievement; sole holder of the reserved acid-green beacon color (A1) |
| `CircuitArea.js` | Three.js/WebGL tech celebration | **Dev Circuit** (closed raceway spur) | Keep slot, reinvent content | A test-track loop is a generic city feature, not tied to any specific original landmark design |

## Small "alley" easter-egg districts (flourish, not core content)

| Area file | Original personal gag | New district | Slot decision | Why |
|---|---|---|---|---|
| `BehindTheSceneArea.js` | Dev-diary / stars easter egg | **Archive Substation** | Keep slot, reinvent content | Small hidden data-vault vignette |
| `TimeMachineArea.js` | Nostalgia time-machine gag | **Chrono Terminal** | Keep slot, reinvent content | Generalized to "a terminal referencing past portfolio versions" — new visual/prop design, not the original machine's design |
| `BowlingArea.js` | Bowling mini-game | **Overclock Arcade** (new reflex/overclock mini-game) | Keep slot, **replace mechanic and content** | Bowling is a specific personal gag; replaced with an original arcade mini-game reusing the same trigger/scoring plumbing |
| `AltarArea.js` | Personal "altar" gag | **Server Shrine** | Keep slot, **replace content** | Reinterpreted as a shrine to a server/AI core — original visual concept on the same code hook |
| `CookieArea.js` | Cookie-consent-banner joke | **Glitch Vendor Alley** | Keep slot, **replace content** | New joke: a malfunctioning vending machine spamming EULA/glitch text, same trigger mechanic |
| `ToiletArea.js` | Toilet gag | **Malfunction Stall** | Keep slot, **replace content** | New joke: an out-of-order maintenance/utility stall, same mechanic |

## Global (non-map) mechanic

| System | Original concept | Decision |
|---|---|---|
| `KonamiCode.js` / `Easter.js` | Konami-code secret unlock | **Keep the mechanic as-is** (it is a global input sequence, not a map location or landmark) — only the unlocked reward's *content/visual* is re-themed to the Cyber City palette, no layout implication |

## Explicit non-reuse note

Every "reinvent"/"replace" row above starts from a blank page for its 3D content and copy — none of it traces the original folio's specific prop shapes, joke punchlines, or spatial arrangement. The only things carried over are: (1) the `Area` base class's zone/frustum/achievement code (`Game/World/Areas/Area.js`), and (2) the *category* of portfolio content (career/projects/social/lab), which is the portfolio owner's own real-world information, not a design choice belonging to the original author.
