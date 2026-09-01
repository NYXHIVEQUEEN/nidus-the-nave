# NIDUS — agent guardrails

Read this **before** touching the hive. This file exists because earlier passes
lost saves, remounted the 3D hull every tick, wiped `sim.ts` with a bad edit,
got portraits blocked, and shipped a box that looked like a box.

The game is **NIDUS**: lone hive-brain, gothic cathedral station, idle drones,
Sentient Command minds, industrial femme deathcore. Owner is Nytheria Nyx, 31,
self-consenting. Art is **hot, armored, not explicit**. Do not clone her face.

---

## Locked art

- Palette: bone `#e8dcc8`, dried-blood `#7a1f2b` / `#c45a4a`, tarnished gilt
  `#c4a574`, venom `#1faf5b`, void `#0c0a09`. Not sci-fi cyan. Not plastic gold.
- Look: **industrial femme deathcore** — rivets, lancets, wasp-waist hull,
  stained glass, hazard gilt, blood furnace, filigree on iron. Cathedral-factory
  in orbit, not a generic space station.
- Portraits: original faces, military-femme gothic, street-occult lighting,
  bandanas/gloves/tattoos OK as *style*. **Leave the player’s face out.**
- Audio: `public/nidus/rules.mp3` + `loop-hum/break/coda.mp3` are **Rules of
  Engagement** by Nytheria Nyx. Keep credit in SAVE. Do not replace with stock.
- UI: four tabs, short chrome, no lore walls. Dictionary lives in RITE → CODEX.

## Locked product

- Single player. No auth. No cloud. Save is `localStorage` key `nidus.save.v1`
  (+ `.bak`). Prefs `nidus.prefs.v1`.
- **Never wipe the save** unless the player confirms NEW HIVE. Never
  `localStorage.clear()` in playtests. Persist immediately on print / raid /
  wake / surge / molt / claim. `migrate()` merges new fields; do not bump
  version just to add a number.
- Tick is timestamp-based (`lastTick` + `dt`). Offline is honest and capped.
- Selectors into the 3D scene **must be primitives**
  (`s.rooms.solar.built`, `Math.round(s.charge)`). A new object every tick
  remounts the Canvas and kills mobile.
- 3D is lazy (`StationMount` + Suspense). Title/WAKE must SSR. Do not import
  `three` from a route module.

## Ship snapshot (mandatory)

“Save the build” means a **source snapshot**, not a dump of the player’s hive.

After a pass is green — typecheck clean, preview serving, playtest with **no**
`localStorage.clear()` — snapshot **before you stop**. Do this even if nobody
typed “save”. A green overhaul that never left the sandbox is a lost build.

1. Update `SNAPSHOT.md`: core file bytes/lines, what changed, and the git SHA
   once you have it.
2. Push **only changed sources + docs** to `NYXHIVEQUEEN/nidus` `main`. Additive
   commits. Never delete the canvas fallback, `public/nidus` art/audio, or
   untouched blobs.
3. Diff against HEAD first. `sim.ts` / `save.ts` / `store.ts` / `content.ts`
   stay byte-identical unless this pass meant to edit them.
4. Player keys stay in the browser: `nidus.save.v1` + `.bak` + `nidus.slot.*` +
   `nidus.prefs.v1`. Git is the package. Their hive is not.
5. Packaging = `src/lib/nidus/*` + `src/components/nidus/*` + `public/nidus` +
   `AGENTS.nidus.md` + `SNAPSHOT.md`. Not `node_modules`. Not a zip of
   localStorage.

---

## Failures (do not repeat)

1. **`search_replace` with empty `old_string` on an existing file** replaced
   the whole file. `sim.ts` and `save.ts` were gutted. Always match a unique
   snippet. Creating a file = empty old_string **only** when the path is new.
2. **`structuredClone` / cloning the full Zustand store** exploded on function
   values. Clone **game data only** (`JSON.parse(JSON.stringify)` stripping
   functions, or `pickGame`).
3. **Subscribing the hull to `s.rooms`** remounted R3F every 250ms. Primitive
   selectors. Instanced drones keyed on `count` only.
4. **SSR + `three` + a `ready` gate** rendered a black body. Title screen
   always paints. Canvas after WAKE.
5. **Dark material × dark map** = a silhouette. Plate color stays light
   (`#d8cbb8` range) so rivets read. Fog must not eat the nebula.
6. **Image gen of the player’s face** got blocked. Style/body/lighting refs
   only. Varied original faces.
7. **Wiping storage in Playwright** to “make tests clean” destroyed the
   hive. Tests hydrate; they do not `localStorage.clear()`.
8. **BriefOverlay `setState` during render** crashed. Dismiss in `useEffect`.
9. **Store action named `raid`** collided with state `raid`. Action is
   `launchRaid`.
10. **Codex keys** `lab` (room) vs `lab` (caste) warned forever. Prefix keys.
11. **AudioContext before a gesture** = silence on iOS. Unlock on WAKE.
    Resume on visibility. Buses: master / music / sfx. Ramp gain, don’t slam it.
12. **Assuming ffmpeg `geq` likes nested parens** — it doesn’t. Prefer a
    tiny PPM writer for textures.
13. **Moderation is not a license to beige.** Armored gothic women are the
    brief. Don’t self-censor into generic sci-fi. Don’t ship porn either.
14. **Overlapping octa/tetra piles + giant additive cones** read as junk, not
    a cathedral. One lathe nave. Three short window leaks, LOD-gated. RAID
    chrome is an opaque sheet, never transparent text over the hull.

## Successes (keep doing)

- Four-tab HUD + one gold **goal chip**. Always a next verb.
- Wake draft is three cards, one pick. No gacha. Fractures are the cost.
- Idle gift on return (`pendingGift` + CLAIM) plus SLAG plus SURGE. First
  hours are fast on purpose.
- Room finish = **one visible node** on the hull. If you add a room, add a
  socket and a node.
- OrbitControls: drag to rotate, SPIN/HOLD, speed in LOCAL. Hull itself
  does not yaw.
- Save/EXPORT/IMPORT in RITE → SAVE. Confirm before burn.
- Boot bar preloads portraits + hull textures, then enables WAKE. A live hive
  **RETURN**s — never dump a started save to a new-session title.
- Hull tap looks the camera at that annex (`lookAtRoom`). Gift looks at prow.
- Canvas `frameloop` pauses while the tab is hidden.
- Playtests: WAKE/RETURN → PRINT → SURGE → RAID → RITE tabs, screenshot hull,
  assert no `pageerror`. Keep the save.
- Green pass → GitHub snapshot the same turn. Do not leave a build only in
  the sandbox.
- Persist unit tests in `src/lib/nidus/persist.test.ts` prove migrate does
  not wipe ore/rooms/minds/`started`. Run them after any `save.ts` / `progress.ts` edit.

## Graphics contract (cathedral pass)

The hull is a **cathedral-factory**, not a crate and not a poly pile.

- **Body:** one wasp-waist `LatheGeometry` nave + keel + ridge. Rooms attach
  as modules. Do not stack octahedrons/tetrahedrons as the hull.
- **Light:** ACES exposure ~1.28, gilt key, blood furnace, cool rim. Window
  leaks are **three** short additive cones on the mid LOD, not a forest of
  giant shafts. No `EffectComposer` on mobile.
- **Sheet:** `.nidus-sheet` is opaque void + blur. RAID/FORGE/MINDS never
  bleed through the 3D. Collapse still slides the sheet off for idle candy.
- **Perf:** mobile `dpr` capped, stars/embers cut, no shadows, instance
  drones + embers. `window.__nidusPerf` reports `{ calls, triangles, frameMs }`.
  Aim under ~100 draws on a mid hive. Pause work when tab hidden.
- **Sky:** cylinder backdrop + titan spheres. Do not map 16:9 plates onto a
  full UV sphere.
- **Growth:** each new room `Grow`s in along its socket radial. Annexes are
  lathe/capsule/cylinder/lancet grown from a dock ring — not world-axis boxes
  or octa piles. Iron tendons + gilt sap show the room feeding the nave.
  Ghost next-unlock is a gilt silhouette of that annex. Queued room gets a
  gilt beam + rib scaffold. Halo and molt waist scale with molt/rooms.

## Architecture (do not flatten)

Sim is `src/lib/nidus/{types,content,sim,advisor,fleet,save,store,progress}.ts`.
View is `NidusApp` / `StationScene` / `SettingsPanel`. **Never** put rates
inside the Canvas. **Never** subscribe the hull to object slices.

Tick order in `applyTick`: resources → rooms → rites → spark/wake → auto-print
→ auto-build/rite → battle tick / auto-raid → clamp. Advisor (`advise`) is
read-only UI. Scripts (`scripts` / HIVE) write through that same pipeline.

Save: `nidus.save.v1` + `.bak`. Slots `nidus.slot.0..2` are copies — loading a
slot writes the live key, it does **not** wipe the other pews. `migrate()`
merges new fields; do not bump version to add a boolean.

Combat: `RaidRun` holds wreck HP + fleet hull. `tickBattle` is the well.
WATCH only changes presentation + a small attention bonus. BOOST is charge.
Leave the tab — the sim keeps orbiting.

Do not introduce ECS. Entity count is tiny. Keep one serializable `GameState`.

## Tooling notes

- Audio unlock and 3D lazy-load are load-bearing. Don’t “simplify” them.
- Howler is optional; current mixer is raw Web Audio. Either is fine if
  buses + gesture unlock stay.
- New textures go in `public/nidus/tex-*.jpg` and `BOOT_ASSETS`.
- `npm run typecheck` then a Playwright pass **without** wiping storage
  before you call it done. Persist tests must stay green.
