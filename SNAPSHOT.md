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
