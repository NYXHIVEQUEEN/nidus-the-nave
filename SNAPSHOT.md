# NIDUS snapshot — 2026-09-01 watchable 10

GitHub: `7e1263e` on `NYXHIVEQUEEN/nidus` `main`.
Pre-pass SAVE stamp: `c0dd518` (SAVE.md) / local `4d1cec6`.
**No hive wipe.** `sim.ts` / `save.ts` / `store.ts` / `content.ts` / `progress.ts` / `types.ts` untouched.
`migrate()` still merges rooms/techs/casteXp/hiveRank.

## Ten improvements

1. **RETURN** — a live hive never dumps to WAKE. Title says RETURN; boot auto-seats; `start()` writes `started` so the next load remembers.
2. **Look-at camera** — hull tap lerps Orbit target to that annex for 3.4s. Gift looks at the prow furnace. Drag cancels. Foundry maps to prow.
3. **Hull strip with purpose** — built + open + one locked tease + `+N NESTS`. Purpose `bonus` on every chip. `NEXT GROWS · room · purpose` under the row.
4. **Come-back CLAIM** — idle gift overlay names the cut in one line. CLAIM chip in the resource bar. Furnace still blooms.
5. **First-pointer audio unlock** — auto-seat still sings on iOS; no silent RETURN.
6. **Canvas pause** — `frameloop="never"` while the tab is hidden. Battery + heat stay down so watching stays cheap.
7. **Surge trauma** — presentation-only camera kick (trauma²) on SURGE, lighter on PRINT. Sim unchanged.
8. **Annex LOD group** — docks live in `annexRef` so far LOD actually hides them. Unused `struts` ref dropped (tendons already bind hull → annex).
9. **Sap crawl** — gilt beads travel hull → annex along tendons. Hive looks fed, not bolted on.
10. **Rank collars** — each Dock gets its room rank. Ranking a room grows a gilt ring on that annex, so unlocks have a body.

## Playtest (no `localStorage.clear()`, no NEW HIVE)

- Boot auto-seated existing hive (ore held, `.bak` present, canvas up)
- HULL: FOUNDRY / SOLAR SPINE / ORE BAY tease / `+14 NESTS` / `NEXT GROWS · SOLAR SPINE · +charge /s`
- Look-at: `lookId === "solar"` after tapping the spine
- FORGE PRINT path + SURGE (SURGING gilt/venom)
- Solar finished in-session → ORE BAY / BARRACKS / LAB opened (nested unlocks)
- `__nidusPerf.calls` = 30 (target <100)
- persist tests 4/4 including `started`
- typecheck clean
- production build green, smoke matches baseline, no pageerrors

Player keys stay in the browser. No wipe. Nested unlocks stay gated.
