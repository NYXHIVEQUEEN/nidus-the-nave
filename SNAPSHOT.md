# NIDUS snapshot — 2026-09-01 density 50 + loop 10

GitHub: `NYXHIVEQUEEN/nidus` `main` @ `0b8312f`.
Pre-pass chrome save: `10bd41a`.
**No hive wipe.** `migrate()` still merges rooms/techs/casteXp/hiveRank/started/mercy/streak plus `printFocus`. Existing seated commanders stay seated.

Playtest (no `localStorage.clear()`, no NEW HIVE):
- Live hive RETURN-seated (printed 17, ore held and ticked 69→79)
- `data-density=compact` on 390×844 AUTO
- HULL: 3 nodes + `+14 NESTS`, order pips, AUTO HOLDS 2, gold chip inset off the rail
- FORGE: caste XP bars, FOCUS, PRINT (not a packed dump)
- RAID: ICE RING FIRST CUT + two teases + nested wrecks
- MINDS: SPARK BANKS 2/32 until spine — commanders are not instant
- HELP sheet verbs
- `__nidusPerf.calls` = 26 hull, triangles 2808 (target <100 draws)
- persist tests 17/17
- typecheck clean
- no pageerrors

Player keys stay in the browser. Nested unlocks stay gated.

---

## Ten gameplay-loop improvements (researched, not regressions)

Idle / AFK / incremental loops: Cookie Clicker generous early, Melvor catch-up, AFK Arena delayed first gacha, Vampire Survivors attention tax, Clash overflow, Hades boons after you know the verb. Human-adjusted — first hours stay alive, commanders are a beat, packed is a choice.

1. **Spine-gated first WAKE** — SPARK banks until Solar lights. No three-card dump on boot. Existing minds still wake.
2. **First commander PACING** — pick does not auto-SEAT. SEAT is the verb. Existing seated stay seated.
3. **Live post percent** — SEATED · +N% MINE (or MAKE/BUILD/LAB/RAID). Pacing shows half. The job is a number.
4. **AUTO holds two berths** — until Barracks or EXPAND. Packed is a tap, not an ambush. Manual PRINT still fills.
5. **Print FOCUS streak** — same caste stacks. ×3 and ×8 grant extra caste XP. Swap caste to reset.
6. **First-wake SPARK floor 32** — later wakes use `sparkNeed`. Spark progress is never wiped.
7. **Softer pre-spine starve** — charge floor 0.44 before Solar, 0.28 after. Early hive does not die in the dark.
8. **RANK burst** — finishing a room rank licks ore + parts. Ranking is a grind with juice.
9. **FARM wrecks** — cleared nodes stamp FARM ×N. Nested stay locked. Patrol still nested.
10. **SEAT stage / advisor** — unseated live mind is the gold chip. Not a mystery portrait.

---

## Fifty QoL / perf / graphics / UI / lighting / effects

### Chrome density (the cramped fix)
1. SIZE AUTO reads height + rotation.
2. TIGHT sheet 32dvh.
3. ROOMY sheet 38dvh.
4. WATCH hides the sheet for nave candy.
5. UI SCALE 0.82–1.12 in VIEW.
6. Keyboard U cycles SIZE.
7. Landscape docks the sheet as a side rail.
8. Goal chip inset (`ml-12`) so it no longer eats HIDE.
9. HELP label, not a bare ?.
10. SIZE on the left rail (AUTO/TIGHT/ROOMY/WATCH).
11. Advisor why-line under the sheet (one sentence, not a guidebook).
12. Compact hull: queue + next + one tease, not the whole strip.
13. Compact orders: 0/1 pips instead of three fat cards.
14. Compact caste tiles `min-h-12`.
15. Compact raid cards `min-h-3.6rem`.
16. Compact commander portrait `h-20`.
17. Compact wake portraits `h-20`.
18. AUTO compact when height < 720.
19. AUTO compact in short landscape (< 520).
20. `--nidus-ui-scale` on `.nidus-root`.
21. Compact rail buttons 2.35rem.
22. Compact tab bar padding.

### Lighting / cathedral / watchability
23. Softer top/bottom void veil so the nave reads.
24. Idle ACES exposure 1.34 (was 1.28).
25. Hemisphere 0.78, bone sky.
26. Ambient 0.54.
27. Gilt key 2.05.
28. Blood furnace point 9.2.
29. Distant gilt 13.
30. Cool rim still skipped on mobile.
31. Three short window leaks kept (not a ray forest).
32. One wasp-waist lathe nave kept.
33. Construction sparks kept, far LOD hides them.
34. Event fog / exposure Mood kept (PULSAR / ECLIPSE / ROSE / TIDE / gift).
35. Reduced-motion still skips breath, rays, pulsar, trauma.

### Performance
36. Stars 56 mobile / 120 desktop (was 70/140).
37. Playtest 26 draws / 2808 triangles (was 27 / 4512).
38. Mobile `dpr` 1.15, desktop 1.5 kept.
39. Canvas `frameloop="never"` while hidden kept.
40. `__nidusPerf` still reports calls/triangles/frameMs.
41. `.nidus-sheet` still transform/opacity only.
42. Annex/drones/embers LOD-gated kept.

### Loop-facing UI (not text clutter)
43. SPARK BANK on the resource chip while the spine is dark.
44. MINDS empty state: SPARK BANKS / raise Solar.
45. FOCUS ×N on FORGE.
46. Caste XP pips on each stamp.
47. SEAT +N% primary on MINDS.
48. Live post line on the portrait.
49. FARM ×N on cleared wrecks.
50. Cook buttons pulse when a salvage recipe is ready.
51. AUTO HOLDS 2 on the hull census.
52. MINDS tab pulses on SEAT.
53. Goal tooltip is the advisor why.
54. Wake copy: she starts PACING. You SEAT her.
55. Codex SIZE + commander pacing match the loop.
56. Persist tests cover spine-gate, pacing seat, AUTO hold, focus, migrate seated.

---

## Thirty-five grind-value elements (not a student guidebook)

Numbers and pips that make a stamp, a rank, a wreck, a seat *feel* like they paid. No lore walls.

1. Caste XP bar per stamp. 2. FOCUS ×N. 3. PRINT cost on the button. 4. Packed PRINT SPARK only when jammed. 5. AUTO hold census. 6. EXPAND +N. 7. MARK cost. 8. Room RANK chip. 9. Rank work on QUEUE. 10. NEXT GROWS line. 11. +N NESTS. 12. Order pips 0/1. 13. RANK burst on finish. 14. Ore/m and parts/m. 15. Charge starve pulse. 16. SPARK fill vs wake need. 17. SPARK BANK. 18. Mercy SURGE label. 19. SLAG ready gilt. 20. HIVE on/off. 21. FARM ×N. 22. FIRST CUT wait. 23. WATCH 18%. 24. BOOST 8/20s. 25. Salvage counts. 26. Cook pulse. 27. Nested wrecks. 28. SEAT +%. 29. PACING half. 30. Wound chip. 31. Talent line. 32. Pew slots. 33. Return streak. 34. CLAIM ore. 35. Construction sparks at the queued annex.

---

Packaging = `src/lib/nidus/*` + `src/components/nidus/*` + `public/nidus` + `AGENTS.nidus.md` + `SNAPSHOT.md`.
Player keys are not in git.
