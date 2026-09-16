# NIDUS snapshot — GDL flight scene, pass 2

GitHub: `NYXHIVEQUEEN/nidus-the-nave` `main`.
**No hive wipe.** Rollback: `d25e11d` (pass 1) or `3cc6b33` (pre-GDL).

## Three largest visible failures (this pass)

1. Still frames crushed the hull to black — lighting test failed.
2. Nose-on camera hid engines; exhaust sat on the wrong end of the bell.
3. Drones were forced off; space had no readable scale landmark.

## Fixes

- Aft-quarter chase camera. HOLD default. Engines fire −Z with hot cores.
- Bone-iron hull (lower metalness), nacelles, bridge, capsule windows.
- Keyed light around that camera. Planet limb, gate, wreck, black well as layers.
- Drones orbit again. SPARK still drives engine heat. Economy files unchanged.

Saves: `nidus.save.v3` in the browser. Git is the package.
