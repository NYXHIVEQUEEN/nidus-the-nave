# NIDUS snapshot — standalone web build, Sovereign court, audit

Branch `claude/lucid-archimedes-b4sfpo` (PR to `main`). **No hive wipe.** Rollback: `330af0a`.

- Plain Vite + TanStack Router static build (`npm run build` → `dist/`). Grok plugins, auth, DB, preview bridge no longer wired.
- Save: `nidus.save.v3` (+ `.bak`, `.preimport`), pews `nidus.slot.v3.*`, rolling `nidus.auto.v3.*`, prefs `nidus.prefs.v1`, owned heroes cache `nidus.owned.v1`.
- New state fields (migrate defaults): `sovereigns`, `trial`, `trialsUsed`. `sim.ts` untouched; edicts hook `rates` / `offlineCapSec` / `printCost` / `raidCutPayout`.
- Tests 35/35, typecheck clean, lint 0 errors, 390×844 Chromium passes (no page errors, erase leaves no keys).

---

# NIDUS snapshot — support, save safety, Hive Queen rules

Branch `claude/lucid-archimedes-b4sfpo` (PR to `main`). **No hive wipe.** Rollback: `330af0a`.

## This pass

- SETTINGS → FAQ: six answers, COPY REPORT (no hive name, nothing sent), FILE A FAULT / MAIL, `/support` page.
- `save.ts`: imports must look like a hive (≤2 MB); live hive kept at `nidus.save.v3.preimport` before import;
  missing main save loads from `.bak`. NEW HIVE also burns `.preimport`.
- RITE tabs: VIEW / TUNE / CODEX / SAVE / HELP (SETTINGS tab renamed TUNE to fit five).
- Rules: `AGENTS.project.md`, `CLAUDE.md`. Gap audit: `store/MARKET.md`. Docs now name the real `v3` keys.
- Persist tests 32/32. Typecheck clean. Chromium 390×844 pass, no page errors, bad import refused.
- `sim.ts` / `content.ts` untouched.

---

# NIDUS snapshot — custom hull, rooms keep underfunction

GitHub: `NYXHIVEQUEEN/nidus-the-nave` `main` @ `5929935`.
**No hive wipe.** Rollback: `95db376`.

## This pass

- Pending construction stages no longer glue leftover capsules onto the hull.
  Solar / hangar / gundeck / molt blobs are gone. Rooms still pay their sim bonus.
  Only RAILGUN and AUTOCANNON add designed angular hardpoints. Molt tints the keel.
- Hero hull is a faceted custom capital: oval lathe with panel breaks, chisel prow,
  armor cheeks, wings, bridge, engine block. Not a round sausage.
- Economy / save files unchanged (`sim.ts` / `save.ts` / `store.ts` / `content.ts` untouched).

Saves: `nidus.save.v3` in the browser. Git is the package.
