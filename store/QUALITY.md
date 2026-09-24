# Pre-merge self-audit (24 Sep 2026)

Full read of this PR's diff before merging. Fixed:
- Saves: an own `"__proto__"` key in an imported file survived cleaning (the key filter used `in`);
  now dropped. Room/research pointers must name a real entry; duplicate commander ids are split;
  duplicate hero entries collapse. New regression test (43 tests).
- Offline worker: on slow networks it gave up after 2.8 s with an error even when nothing was cached;
  now it waits for the network unless a cached copy exists. `/api/` and media range requests bypass it.
- Updates: if a release lands while the game is open, missing old code files trigger one saved reload
  (at most once a minute) instead of a broken screen.
- Website button accepts only an `https://` address (`WEBSITE` in `support.ts`).

Verified: typecheck, 43/43 tests, lint 0 errors, production build; delayed-server test (uncached file
served after 4.5 s, 404 stays 404), stale-code reload fires once only, saves intact; production smoke
at 390×844, 844×390, 1280×800 with no page, console, or CSP errors.

---

# Handoff — pass 5: security, trust, platform sweep (24 Sep 2026, overnight)

Rollback: `3906156` (branch before this sweep). No save wipe; save keys unchanged. New local keys:
`nidus.acked.v1` (only when the purchase check is on) and session flag `nidus.twa`; ERASE removes both.

## Security
- Production Content-Security-Policy (same-origin only) + host headers (`public/_headers`, `vercel.json`).
- Imported / tampered saves are cleaned: numbers clamped, unknown keys dropped, portraits must be local game art.
- `npm audit --omit=dev`: 0 vulnerabilities. No secrets in tracked files.
- Grok preview files (`public/__grok`, Grok logo) no longer ship on the live site.

## Trust
- **Purchase check** (Google refunds purchases not acknowledged in 3 days): built, tested, **off**
  until the owner approves and adds her Play key (`store/PRODUCTS.md`). Privacy page discloses it only when on.
- Privacy, terms, content rating, data safety, PLAY.md now match what the game does (offline file copy,
  EXPORT, website link, M/17+ target, live shop, erase path).
- Inside the Play app without Chrome, the court says NEEDS CHROME instead of a store link.

## Platform
- No-WebGL / 3D crash: painted room art + "3D OFF" / "TAP TO RETRY" chip; game fully playable.
- INSTALL HOME: real install prompt (Chrome/Edge/Android), Safari steps on iOS, menu steps elsewhere.
- Sound pauses when the app is hidden, resumes on return or next tap (iOS "interrupted" too).
- Safari without StereoPanner: space ambience falls back cleanly.
- Offline cache renamed per build, so updates drop old files from phones. Service worker registers.
- EXPORT download works on Safari/Firefox (link no longer revoked instantly).
- Landscape phones: side sheet sits under the resource bar.
- Rooms darker (bone pillars and walls no longer washed out). Unused texture + 2 unused boot images dropped.
- Hosting: root of a domain only (`store/GITHUB.md`); browser floor Chrome 111 / Safari 16.4 / Firefox 128.

## Verified here (Chromium, SwiftShader — not a real phone)
- Typecheck clean, 42/42 tests, lint 0 errors, production build.
- Production static smoke at 390×844, 844×390, 1280×800 (+ 820×1180 and no-WebGL earlier): every tab,
  court, settings; no page, console, or CSP errors; no sideways scroll; service worker active.

## Still unverified
- Real Android phone (TWA), iPhone Safari, and a real Play purchase (needs Play Console + license tester).
- The purchase check against real Google (needs her service account).

---

# GDL handoff — pass 4: lean warship, 3D rooms, live interiors (24 Sep 2026)

Rollback: `1d4775b` (main before this pass). No save wipe; new field `boost2x` defaults false via migrate().

## Owner feedback addressed
- "Ship looks dorky; off textures and animations": longer, narrower nave with a needle ram; tall lead-slate
  pointed roof with ridge pinnacles; thin gilt bands; long swept wings + canards; smaller engine bells with
  additive plumes; baked belly/spine grime; blinking nav lights and spire beacon; patrol weave with bank.
- "Replaced my 3D animated rooms with static art": 22 room modules grow onto the hull (grow-in, rank collars,
  build scaffold, animated sails/wheel/dish/bell), and FORGE / LAB / MINDS are live 3D scenes in the ship's Canvas.

## Verified (Chromium 390×844, SwiftShader, not a phone)
- Draw calls: HULL 35 (≈48 with every room built, 65k tris), RAID 35, FORGE 17, LAB 34, MINDS 11.
- No page or console errors on any tab, dev and static production build.
- Typecheck clean, 36/36 tests, lint 0 errors.

## Still unverified
- Physical-device FPS / heat. Owner approval of the new look.

## Defects remaining
- Throne hall is dim on some screens; throne models are simple.
- Remaining `tex-*` originals keep the blurred cross seam; `-s` copies and `tex-hull.jpg` are mirrored clean crops.

---

# GDL handoff — cathedral hull rebuild (pass 3)

Directive: `.grok/skills/space-hull-3d/references/gdl-acceptance.md`. Rollback: git `49dfe77`
(`git checkout 49dfe77 -- src/components/nidus/StationScene.tsx` and delete `hullKit.ts`). No hive wipe; saves untouched.

## Three largest failures found (before)

1. **Hero ship was a box stack.** A 10-sided lathe wrapped in ~25 glued `BoxGeometry` slabs; faceted, and too long for a
   portrait phone, so the nose and stern were cropped and facing/propulsion could not be read.
2. **Composition was cluttered.** A large sphere with a stretched photo sat directly behind the ship; the backdrop
   cylinder edge cut a hard horizon through the frame; no scale layering.
3. **Flat, grey light and no visible work.** White-grey key + grey hemi, one material everywhere, engines unseen,
   and no drones — the idle activity was invisible.

## Implemented

- **Ship** (`src/components/nidus/hullKit.ts`): 24-radial lathe nave with creased panel breaks and a wasp waist;
  pointed-arch cathedral roof (extruded, bevelled) with a main spire and two flanking spires; three pairs of
  flying buttresses (tubes); swept bevelled blade wings; keel blade; armor cheek pods; five gilt filigree bands and a
  roof ridge; three lathe engine bells on struts. **No BoxGeometry anywhere on the hero.**
- **Materials with identity:** bone-iron plated hull, pale bone roof, darker wings, dark machinery, gilt bands
  (high metal, low rough), blood keel (molt tint kept), emissive stained-glass lancets (10) and a rose window using
  `tex-rose.jpg`. New seamless `tex-hull.jpg` built from `tex-plate.jpg` (the original plate/rivet maps carry a
  blurred seam cross; see Defects).
- **Engines:** hot core disc + additive core and halo sprites per bell, flicker, SPARK/SURGE heat, a short practical
  light at the stern.
- **Light:** ember key `#ffcdb0` 2.3, gilt rim `#d8b884` 1.3, dim violet camera-side fill, violet hemi 0.55,
  RoomEnvironment IBL 0.5, ACES exposure 1.15 (PULSAR 1.3, ECLIPSE 1.0).
- **Space layers:** near dust drifting past (motion reads as flight), mid asteroid field with harvest drones, far
  banded gas giant with its own crescent light and atmosphere rim, black hole with accretion rings, taller backdrop
  (horizon line gone).
- **Idle made visible:** harvest drones (count follows miners, 2–22) fly hangar → asteroid → hangar on eased curves.
- **Motion:** slow bank/breath on the ship, slow field rotation; all of it and the dust stop under reduced motion.
- **Framing:** ship scale fits the viewport aspect so the whole hull reads in portrait.
- **Raid:** duel restacked vertically for portrait (enemy above-behind, camera pulls back 1.5× in portrait); enemy is
  a lathe hull with fins, crimson engine glow and a running light, and faces the ship; fighters fly to it.
- **Bug fixed:** HIDE/SHOW saved a preference from inside a React state updater (“cannot update a component while
  rendering” console error).

## Verified in this environment

- Chromium 390×844, **software GL (SwiftShader), not a phone.** Same viewpoints before/after, HUD sheet hidden.
- Draw calls / triangles: before 8 / 1.9k (hull only, no activity) → after 29 / 27.7k (NAVE), 26 / 27.6k (CLOSE),
  41 / 24.5k (RAID). Well under the ~100-draw budget. Frame times here are the software GPU and prove nothing.
- No page errors or console errors on NAVE, CLOSE, RAID, reduced motion, and the static production build.
- Typecheck clean, 35/35 tests, lint 0 errors.

## Still unverified

- Physical-device FPS, heat, and memory. Mobile dpr stays capped at 1.
- Owner approval of the silhouette and palette.
- 5 s / 15 s / 1 min onboarding with a real player.

## Defects remaining

- `tex-plate.jpg`, `tex-rivet.jpg` (and likely the other `tex-*` maps) have a blurred cross seam from offset-healing.
  `tex-hull.jpg` is a mirrored clean crop; the mirror symmetry is visible up close. Regenerate proper tileables
  (brief rules in `Grok.Art.md`).
- Room growth still changes the economy but not the hull beyond hardpoints and molt keel.
- FORGE / LAB / MINDS remain 2D interiors.
- Fighters are small at RAID distance.
- A failed GDL category cannot be averaged away. Do **not** call this AAA or finished.

## Asset provenance

Procedural three.js geometry (original). Existing repo textures; `tex-hull.jpg` derived from `tex-plate.jpg`.
No purchased assets. No new dependencies.
