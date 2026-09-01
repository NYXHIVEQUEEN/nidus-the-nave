# NIDUS snapshot — 2026-09-01 quality 50 + loop 10

GitHub: `NYXHIVEQUEEN/nidus` `main` (SHA stamped after push).
Pre-pass watchable 10: `887a030` / local `7631989`.
**No hive wipe.** `migrate()` still merges rooms/techs/casteXp/hiveRank/started plus mercy/streak.

Playtest (no `localStorage.clear()`, no NEW HIVE):
- Live hive RETURN-seated (printed 19, ore held, foundry lit)
- HULL: FOUNDRY / SOLAR SPINE / NEXT GROWS · SOLAR SPINE · +charge /s
- FORGE: PRINT + AUTO + EXPAND
- RAID: ICE RING · FIRST CUT + ICE BELT tease + `+11 WRECKS NESTED`
- Ice launched, WATCH sheet opaque, SURGING gilt/venom
- `__nidusPerf.calls` = 27 hull / 7 watch (target <100)
- persist tests 10/10
- typecheck clean
- no pageerrors

Player keys stay in the browser. Nested unlocks stay gated.

---

## Ten gameplay-loop improvements (researched, not regressions)

Idle / AFK / incremental loops that keep people: Cookie Clicker generous offline, Melvor catch-up, AFK Arena first-mission tutorial, Clash overflow conversion, Vampire Survivors attention tax that pays. Human-adjusted against this hive — first hours stay fast, late game is not a dead button.

1. **Mercy SURGE** — long away sets `mercySurge`. Next SURGE lasts 1.35× then clears. Comeback has a scream.
2. **Return streak** — 30min+ away within 24h of last return stacks +8%/step (cap 5) on the idle gift.
3. **Generous early gift** — hiveAge < 8h keeps 70% of the away cut; later 62%. Not stingy.
4. **Locked-aware auto-queue** — room finish queues `nextBuild()`, which respects nested unlocks. Never queues a dark node.
5. **Overflow PRINT** — packed berths still spend 40% cost for SPARK + caste XP, no body. PRINT is never dead.
6. **First Ice is a tutorial wreck** — 0.78× duration, 1.12× atk, 0.018 vs 0.034 def. Teaches WATCH/BOOST without a wipe.
7. **CLAIM fuels SURGE** — claimGift grants 18% charge cap + mercy. The overlay is an action, not a number dump.
8. **SLAG cooks overflow** — ore > 90% cap converts a lick to parts. Caps are a craft, not a wall.
9. **WATCH pays** — 1.18× cut. Attention tax that actually shortens the well.
10. **Seated minds feed SPARK** — +8% spark/s per seated mind. WAKE/SEAT has a reason in hour one.

---

## Fifty QoL / perf / graphics / UI / lighting / effects

### Lighting, effects, cathedral
1. Event fog color/near/far (PULSAR, ECLIPSE, ROSE, TIDE, FURNACE).
2. Event ACES exposure (PULSAR 1.42, ECLIPSE 0.92, gift 1.36).
3. Gift/surge blood-furnace fog bloom via Mood.
4. Reduced-motion skips trauma² camera kick.
5. Reduced-motion skips nave breath.
6. Reduced-motion skips window-ray opacity pulse.
7. Reduced-motion skips pulsar pulse.
8. Reduced-motion Stars speed 0.
9. Construction sparks at the queued annex (8 instanced, far LOD hides them).
10. Texture anisotropy 8 desktop / 2 mobile (was 4 always).
11. Double-tap empty glass recenters the NAVE shot.
12. Mobile skips the giant pulsar shaft cone.
13. Mobile skips the cool rim directional (one less light).
14. Gift still blooms the prow furnace (kept).
15. Rank collars on docks (kept).
16. Sap crawl hull → annex (kept).
17. Print dart flash on stamp (kept).
18. Three LOD-gated window leaks, not a forest (kept).
19. One wasp-waist lathe nave (kept).
20. Canvas `frameloop="never"` while hidden (kept).

### Performance
21. Mobile `dpr` cap 1.15 (was 1.3).
22. Desktop `dpr` cap 1.5 (was 1.65).
23. Stars 70 mobile / 140 desktop (was 90/180).
24. Construction sparks hidden when far or idle.
25. `.nidus-sheet` `will-change: transform, opacity`.
26. Sheet transitions only transform/opacity (not `all`).
27. `.nidus-cap` skipped under reduced-motion.
28. `__nidusPerf` still reports calls/triangles/frameMs.
29. Drones/embers/sap already LOD-gated (kept).
30. Annex group hides on far LOD (kept).

### UI / QoL
31. GoalDock shows the advisor verb (BUILD/RAID/CLAIM…).
32. GoalDock `aria-label` includes the verb.
33. Tab badges for PRINT / RAID / WAKE / BUILD / gift.
34. Tab `aria-current="page"`.
35. Keyboard 1–4 switches tabs.
36. Keyboard H hides/shows chrome.
37. Keyboard S surge, P print, C claim, W watch.
38. Resource chips pulse `.nidus-cap` at 92% fill.
39. Packed chip title names the resource.
40. Autosave pip title `held`.
41. RAID list = open wrecks + two locked teases.
42. `+N WRECKS NESTED` instead of a 13-card dump.
43. First Ice stamps **FIRST CUT** and shows the short wait.
44. WATCH tooltip: 18% faster.
45. BOOST tooltip: 8 charge, 20s command.
46. Packed FORGE button reads **PRINT SPARK**.
47. Mercy-ready HULL button reads **MERCY**.
48. Gift overlay names return streak.
49. Gift overlay says CLAIM banks a mercy SURGE.
50. EXPAND copy: packed stamp still feeds SPARK.
51. Focus-visible gilt outline on cut buttons.
52. Opaque RAID/FORGE sheet, 42dvh (kept).
53. RETURN path for a live hive (kept).
54. Guide copy: packed PRINT, WATCH 18%, mercy SURGE.
55. Codex idle/surge/slag lines match the loop.
56. Advisor chip **MERCY SURGE**.
57. `nextGoal` **MERCY SURGE**.
58. SLAG tooltip: packed ore cooks to parts.
59. Hull tab pulses on SURGE/CLAIM/BUILD.
60. Persist tests cover migrate mercy, away gift, overflow print, first ice, claim charge.

---

Packaging = `src/lib/nidus/*` + `src/components/nidus/*` + `public/nidus` + `AGENTS.nidus.md` + `SNAPSHOT.md`.
Player keys are not in git.
