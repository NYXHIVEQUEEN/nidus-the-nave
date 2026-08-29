# Camera + HUD clarity — 2026-08-26

Backup: `app.js.bak-cam`, `index.html.bak-cam`, `style.css.bak-cam`

## Defects
- Pinch ignored: HUD column and missing view hit-layer ate two-finger gestures.
- Station too close: canvas `cam.d = 1.85` still filled the nave; R3F Rig still used start `[3.55, 1.55, 4.55]`, `want = 4.15`, `minDistance = 3.4`.
- Verbs opaque: `textContent = "SPIN"` wiped the why-span after first render. Rooms showed percent only.

## Research applied (not copied)
- EVE HUD work: telegraph the verb, keep identity, do not dump a manual. Title = VERB — cost — effect.
- Cookie Clicker / idle UX talks: one primary verb, rate next to stock, cost on the action, clean scan path.
- AAA viewer grammar (skill catalog F01–F15): drag = orbit after slop, pinch/wheel = expo zoom, frame = recenter. No drag-to-zoom. `touch-action: none` on the viewport only.

## Canvas hive (this folder) — shipped
- Dedicated `#viewHit` under HUD. Chrome is `pointer-events: none` except widgets.
- Start `CAM_START = 7.1` (was 2.85). Same scale law `0.78 / d` so the hull is ~40% of the last pose (~60% zoomed out).
- `CAM_MIN = 3.2`, `CAM_MAX = 12.5`. FRAME resets to 7.1, not the old hole.
- Pulsar pulled to the corner and shrunk so it stops eating the nave.
- Pointer map on `#viewHit`. Two fingers cancel orbit, expo pinch, ctrl-wheel + Safari `gesturechange`.
- Slop 8 px before orbit. Hold boost after 180 ms.
- `setVerb` keeps the why-line. Rooms, castes, jobs, raids carry verb + why + title.

## R3F StationScene (apply — repo still had old Rig)
```
import { TOUCH } from "three"
camera position [11.6, 5.1, 15.2], fov 46
want = 16.4 + extent * 1.55
minDistance = 10.4 + extent * 0.45
maxDistance = 42 + extent * 14
touches TWO = TOUCH.DOLLY_PAN
NidusApp overlay root: pointer-events-none
FRAME / bumpCam pose: [11.6, 5.1, 15.2]
```

## Catalog
Enabled: F01 orbit, F03 slop tap vs drag, F04 hold-boost, F08 expo zoom, F09 ctrl-wheel pinch, F10 touch pinch, F11 clamp+rubber, F12 viewport touch-action, F14 pointer capture, F19 frame/recenter.
Skipped: gyro, lock-on, edge-scroll (not this genre).

## Tests
1. One finger drag on glass → orbit, buttons still tap.
2. Two finger pinch on glass → distance changes. Page does not zoom.
3. Wheel / ctrl-wheel over glass → expo zoom, clamps at min/max.
4. FRAME → wide pose. Station readable, not clipped.
5. SPIN/HOLD, SURGE, rooms keep why-lines after a tick.
6. Title on ORE/PARTS/CHARGE still explains spend.

## Revert
Copy `*.bak-cam` over the live files. Save keys unchanged: `nidus.save.v1` + `.bak`.
