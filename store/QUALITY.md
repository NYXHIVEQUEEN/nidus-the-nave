# GDL handoff — flight scene

Directive: `.grok/skills/space-hull-3d/references/gdl-acceptance.md` (full text).
Rollback: git `3cc6b33`. No save migration. No engine change.

## Implemented

- Designed hero hull (lathe primary, nacelle/bridge/keel secondary, lights/decal tertiary).
- HULL tab is the live 3D flight scene (RAID too). Interiors remain FORGE/LAB/MINDS.
- Keyed lighting (ember / gilt / hemi). Black-well remains the dark core.
- Capsule drones, foe ram, wreck.
- Idle bank/breath; engine heat still tracks SPARK/SURGE.
- GoalDock still answers: next verb, rates, build %.

## Verified in this environment

- Typecheck clean. Persist tests 30/30 (economy/save unchanged).
- Preview Chromium 390×844 (software GL, **not a phone**).
- After IBL + camera-side fill, center pixel rose from ~rgb(4,2,0) to ~rgb(44,37,34). Draw ~53 calls, ~8k triangles.
- Playwright `frameMs` 45–80 ms here is the **sandbox GPU**, not a device claim. Physical 30/60 FPS is **unverified**.

## Still unverified (label the gap)

- Physical-device 30/60 FPS.
- Player onboarding timings (5s / 15s / 1 min) — not a user test.
- Owner approval of silhouette. Software-GL screenshots crush dark metal; inspect on a real GPU.

## Asset provenance

- Procedural three.js geometry (original).
- `public/nidus/tex-*.jpg` existing hive maps.
- No purchased kits. Music remains Nytheria Nyx.

## Defects remaining

- Annex rooms still dock as extra lathes on sockets — can clutter the silhouette at high room count.
- Window slits are still small boxes (tertiary, not silhouette).
- No IBL HDR (budget). Metals rely on lights + envMapIntensity.
- FORGE/LAB/MINDS are still paintings, not 3D interiors.
