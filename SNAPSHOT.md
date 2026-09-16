# NIDUS snapshot — hull cleanup (no swarm)

GitHub: `NYXHIVEQUEEN/nidus-the-nave` `main`.
**No hive wipe.** Rollback: `f4b9ada`.

## This pass

- Removed the floating white swarm (it was crashing phones and cluttering the ship).
- Cut the light stack (print flash 28, spots, extra points) that was killing mobile WebGL.
- Dropped unused instancing, 18-map load, flight-dust artifacts.
- Hull is slate-grey steel. Viewports are painted dark glass, not lamps.
- SPIN + zoom still yaw-only. Economy / save files unchanged.

Saves: `nidus.save.v3` in the browser. Git is the package.
