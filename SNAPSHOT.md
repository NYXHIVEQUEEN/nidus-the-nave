# NIDUS snapshot — GDL flight-scene pass

GitHub: `NYXHIVEQUEEN/nidus-the-nave` `main`.
**No hive wipe.** Rollback SHA before this pass: `3cc6b33`.

## Three largest visible failures (found, then fixed)

1. Hero hull was a **box stack**. Replaced with lathe + capsules (nose +Z, engines −Z).
2. Ordinary play **hid the 3D ship** behind a painting. HULL and RAID now show the live flight scene. FORGE / LAB / MINDS stay interiors.
3. Lighting was **white wash + extra points**. Now ember key, gilt rim, hemi fill, void fog, ACES exposure ~0.96.

## Also in this pass

- Drones / raid foe / pirate wreck use capsules, not cubes.
- Slow bank + breath on the capital. Flight streaks are cylinders.
- Guns/solar/hangar/molt dress are capsules.
- Full Game Design Lead directive lives in `.grok/skills/space-hull-3d/references/gdl-acceptance.md` as the review bar.

Saves: `nidus.save.v3` in the browser. Git does not hold a hive.
