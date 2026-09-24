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
