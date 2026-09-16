# Hull animation (alive, not busy)

Simulation stays in `sim.ts`. Presentation moves meshes in `useFrame`.
Juice **never** writes ore / HP / rooms.

Respect `prefers-reduced-motion`: skip bob, spin, and searchlight sweep;
keep engine emissive at a static idle.

## Clock

```ts
useFrame((_, dt) => {
  const d = Math.min(dt, 0.05);
  // exp follow: x += (target - x) * (1 - Math.exp(-k * d))
});
```

Cap dt. Never `Clock.getDelta()` twice. Never `setInterval` for motion.

## Capital idle (the watchable loop)

Layer **slow** motions so a player will sit on WATCH:

| Layer | Amp / rate | Notes |
| --- | --- | --- |
| Fly | Constant +Z through the group, or a parent that drifts | Wake particles / stretched stars sell this more than hull speed |
| Bank | `rot.z = sin(t * 0.15) * 0.03` | Tiny. Big bank looks drunk |
| Breath | `pos.y += sin(t * 0.22) * 0.04` | Station mass — slower than a fighter |
| Engine | `emissiveIntensity = 0.45 + 0.2 * sin(t * 4.0)` | Fast flicker, small amp |
| Searchlight | Target a point on a slow figure-8 | 1–2 spots. See lighting.md |
| Heat shimmer | Additive plane at bells, UV scroll | Optional, reduced-motion off |

Do **not** spin the capital like a HUD icon. Idle orbit is the **camera**
(`spinSpeed` in view prefs), or a parent `Group`, not `hull.rotation.y += dt`.

## Secondary motion (Disney, cheap)

- **Anticipation:** guns dip 1–2 frames before a volley.
- **Follow-through:** engine scale 1.0 → 1.06 on SURGE, easeOutBack, settle.
- **Overlap:** lights lag hull bank by ~0.15s (`exp` follow on the spot target).
- **No squash** on a 200-meter cathedral. Stretch is for tracers and gnats.

## Raid (ship vs ship)

User-facing rule: two readable hulls, **tracers not particle swarm**.

- Each gun: a thin `Cylinder` or `Line` from muzzle to a point on the foe,
  additive, life 40–90ms, then pool.
- Impact: one flash sprite + optional decal scorch. Not 400 points.
- Hitstop: freeze **presentation** 40–80ms (do not pause `applyTick`).
- Camera: RAID only. `OrbitControls enabled={live}`. Kick with trauma²
  (`game-feel-juice.md`) capped low.

Pool tracers (`InstancedMesh` count N, scale instance to 0 when dead).

## Drones / gnats

Instanced. Per-instance matrix in `useFrame` from a cached `Object3D`.
Bob + slight heading noise. They orbit sockets, they do not become the
lighting rig.

## Interpolation

Room growth, gun deploy, molt: **animate scale/pos toward a target** with
exp lerp. Do not swap geometry every tick (remounts, hitch). Swap **stage**
meshes only when `hiveStage` changes — fade 200–400ms if you must.

## Reduced motion

```ts
const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
```

If REDUCE: no bank/breath/spin. Engines stay lit. RAID tracers still fire
(gameplay readable) but no camera shake.

## Ban list

- Rebuilding `LatheGeometry` every frame.
- Subscribing the Canvas to object selectors (remount = hitch).
- Particle swarms as the raid.
- Linear `rotation += 0.01` with no dt.
- Animating UI chrome with the hull parent (chrome is DOM).

## Finish
- WATCH is pleasant for 30s without a click.
- SURGE is felt (engine + light), not a new mesh.
- RAID reads as two ships firing, not a snow globe.
