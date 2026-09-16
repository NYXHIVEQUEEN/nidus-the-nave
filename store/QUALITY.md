# GDL handoff — flight scene (pass 2)

Directive: `.grok/skills/space-hull-3d/references/gdl-acceptance.md` (full text, not shortened).
Rollback: git `d25e11d` (this pass) or `3cc6b33` (pre-GDL). No hive wipe. No engine change. Save key stays `nidus.save.v3`.

## Three largest remaining failures (this pass)

1. **Lighting test failed.** Still frames were crushed brown/black (ship-band mean ~rgb(18,14,12), ~8% lit). Volume, nose, and engines did not read.
2. **Camera hid propulsion.** Default view was nose-on (`CAM_DIR` +Z). Engines sat on the far side. Exhaust glow was also on the wrong end of the bell.
3. **Idle work and scale were missing.** Drones / harvest gnats were forced `visible={false}`. Distant planets used dark Standard materials and spun with the sky wallpaper.

## Implemented

- Chase camera (aft-starboard). Nose +Z into the well; engines toward the player. HOLD is the new default; SPIN remains opt-in.
- Hull: wasp-waist lathe, larger nacelles, bridge, gilt keel, stern bells with hot cores firing −Z.
- Materials: bone iron (metalness ~0.16, roughness ~0.62), gilt keel, darker engine housings, capsule window slits (no glowing boxes on the hero).
- Light shaped around the new camera: ember key, gilt rim, hemi fill, camera-side point, ACES ~1.22, RoomEnvironment IBL ~0.55. Hull keeps a dim bounce emissive so plates do not fall to featureless black.
- Space layers: planetary limb (unlit, so it reads), transit ring, distant wreck, black-well disc. Landmarks do not spin with the sky cylinder.
- Drones orbit again (harvest activity). Engine heat still tracks SPARK/SURGE. Bank/breath stay. GoalDock still answers next verb / rates / build %.
- Window slits are capsules. FORGE / LAB / MINDS stay painted interiors. HULL + RAID stay the live 3D scene.

## Verified in this environment

- Typecheck clean. Persist tests 30/30 (economy/save untouched).
- Preview Chromium 390×844, **software GL, not a phone.**
- Comparable ship-band pixels, same 390×844 gameplay crop:
  - Before this pass: mean ~rgb(18,14,12), lit 0.08, center ~rgb(7,6,5).
  - After still (HUD hidden): mean ~rgb(40,32,31), lit 0.29.
  - Close inspect: mean ~rgb(55,46,43), lit 0.39.
- DOM: `<canvas>` visible, no interior `<img>` on HULL.
- Draw ~41–45 calls, ~24k triangles (planet + drones + gate). `frameMs` 15–100 here is the **sandbox GPU**, not a device claim.
- Short WebM of ordinary play was recorded in this same Chromium. It is not a physical-device capture.

## Still unverified

- Physical-device 30/60 FPS and memory.
- 5s / 15s / 1 min onboarding with a real player.
- Owner approval of silhouette, material identity, and “remarkable spacecraft” bar.
- Software-GL stills still crush dark metal relative to a real GPU. Inspect on a phone.

## Asset provenance

- Procedural three.js geometry (original).
- Existing `public/nidus/tex-*.jpg` and sky plates.
- No purchased kits. Music remains Nytheria Nyx.

## Defects remaining

- Annex dress can still clutter a high-room hive.
- No HDR IBL (budget). Metals use lights + PMREM RoomEnvironment.
- FORGE / LAB / MINDS are still 2D plates.
- HUD sheet still occupies the lower third on compact phones (WATCH hides it).
- Drones read as gnats at NAVE distance; activity is clearer on CLOSE.
- A failed GDL category cannot be averaged away. Do **not** call this AAA, optimized, or finished.

## Rollback

```
git checkout d25e11d -- src/components/nidus/StationScene.tsx src/lib/nidus/view.ts
```

Hive in `localStorage` is not in git. Do not `localStorage.clear()`.
