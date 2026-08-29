# NIDUS snapshot — 2026-08-28 grown annex watch pass

GitHub: `3752494` on `NYXHIVEQUEEN/nidus` `main`.
Pre-pass SAVE stamp: `f51957b`.
**No hive wipe.** `sim.ts` / `save.ts` / `store.ts` / `content.ts` / `progress.ts` / `types.ts` untouched.
`migrate()` still merges rooms/techs/casteXp/hiveRank.

## Ten improvements

1. Annexes dock on socket radials (grown out of the nave, not world-axis bricks).
2. Purpose silhouettes: crown / hopper / spindle / blister / maw / lance / dome / hearth / lantern / arcade / bell / coffer / ossuary / bowl / needle / apse. No box/octa/tetra room bodies.
3. Instanced iron tendons hull → annex so modules do not float.
4. Instanced gilt sap beads along those tendons (hive looks fed).
5. Ghost next-unlock is a gilt silhouette of that annex, not a wire octa.
6. HIDE watch orbit: slower auto-rotate, heavier damping, furnace/motes stay lit.
7. Molt patina: gilt waist ring + nave emissive scales with molt layer.
8. CLAIM bloom: pending gift stokes the furnace; overlay names the three held stats.
9. HULL chips keep room `bonus`; **NEXT GROWS · room · purpose** under the row.
10. Far LOD + `document.hidden` skip tendon/sap/drone instance work. `__nidusPerf` still `{ calls, triangles, frameMs }`.

## Playtest (no `localStorage.clear()`, no NEW HIVE)

- WAKE → seated existing hive (ore 2.3K, 17 rooms, `.bak` present)
- HULL: chips show purpose; `NEXT GROWS · NERVE · +thrones +pop`
- FORGE PRINT dart
- HIDE watchNave true
- `__nidusPerf.calls` ≈ 50 (target <100)
- persist tests 3/3
- typecheck clean
- production build green

Player keys stay in the browser. No wipe. Nested unlocks stay gated.
