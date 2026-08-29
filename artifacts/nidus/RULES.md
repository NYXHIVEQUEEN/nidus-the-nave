# NIDUS — rules and common sense

Director: Nytheria Nyx. Game is for her. Credit *Rules of Engagement* on every boot screen.

## What the prior builds were (recalled)

App Builder session, not this chat:

- Stack: TanStack Start + React 19 + Zustand + React Three Fiber + drei
- Save: `nidus.save.v1` + `.bak`. Slots `nidus.slot.0..2`. Prefs separate.
- Loop: lone hive-brain, factory prints five castes (miner / fab / builder / lab / striker), rooms add one visible node each, spark fills until a 3-card Sentient Command draft, raids orbit wrecks, SURGE ×5, slag tap, offline gift on return, HIVE autopilot
- Look: bone, dried-blood crimson, tarnished gilt, toxic green, void. Industrial femme deathcore. User photos = body/style only, never the face
- 3D: cathedral-factory hull, pulsar cone, LOD that drops micro detail when zoomed out, Grow scale-in on new nodes, instanced drones/fighters, user sky plates as titans
- Audio: full anthem plus hum / breakdown / coda slices
- Failures already paid for: empty-file overwrite of NidusApp, structuredClone of functions in Zustand, setState during render, instancedMesh identity flash (giant triangles), 4-segment prow cone, blocking boot on every texture, wiping localStorage in tests

This folder is the combined playable pass after that tree was not mounted here. Canvas nave stands in for R3F. Systems and save keys match.

## Save law (non-negotiable)

1. Live key is `nidus.save.v1`. Backup is `.bak`. Temp is `.tmp`.
2. Write order: copy live → bak, write tmp, parse-check, write live, delete tmp.
3. Load order: live, then tmp, then bak. Merge new fields. Never throw the player to a blank hive because a key was added.
4. Flush on every verb (print, raid, mark, claim, seat, rite) and on hide / pagehide / beforeunload.
5. Autosave every 4s while the nave is awake.
6. `NEW HIVE` is the only wipe. Confirm. Export first.
7. Tests never call `localStorage.clear()`.
8. Slots are copies. Loading a pew writes live. Other pews stay.
9. Request `navigator.storage.persist()` after a good write.
10. Save data, not functions, not meshes, not AudioBuffers.

## Boot law

- First paint is CSS + wordmark. WAKE / CONTINUE must work before skies or music decode.
- Returning hive: CONTINUE. New hive: WAKE. NEW NAVE confirms.
- Unlock audio on that gesture. Hum after ~3s. SURGE hits the breakdown cut.

## UI law

- One pointer owner. Stage and meters are pass-through. Buttons opt in.
- 44px minimum targets.
- HINTS can hide the why-line. REDUCE kills motion.
- Short on hulls = `NEED 2 DART`. Missing room/molt = `LOCKED`.

## Sim law

- Tick order: resources → rooms → rites → spark/wake → auto-print → auto-build/rite → battle / auto-raid → clamp.
- View never writes rates. Advisor only reads.
- Leave a raid: the well keeps fighting.
- Do not invent ECS. One serializable `GameState`.

## Art law

- No generic chrome sci-fi. No plastic gold.
- No explicit content. Hot gothic military femme is the brief; keep it in clothes and steel.
- Do not regenerate portraits from the player's face.

## Export law

- Source of truth for *this* pass: this folder + `NYXHIVEQUEEN/nidus`.
- After every real change: zip the folder and push text to GitHub.
- Binaries (mp3, jpg) go up through GitHub’s web upload or `git add`.
- A save JSON is not the engine. Export both.

## Common sense

- If a change does not make the nave clearer or the loop more honest, do not ship it.
- Do not gold-plate a new caste while boot is still blocked.
- Do not bump `version` just to add a boolean — migrate by merge.
- If you are unsure whether you wiped a save, you did something wrong. Stop and check `.bak`.
