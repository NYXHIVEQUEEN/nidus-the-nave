# Lighting (cinematic void, mobile-safe)

PBR maps are invisible without a **keyed** light rig. AAA space stills use
few lights with intent, not a dozen white Points.

NIDUS: one **eerie key** (black-hole ember / corner sun), a cool-weak fill,
a gilt rim, tiny practicals on the hull. Not a plastic orb of piss. Not
“ambient 1.0 so we can see.”

## Rig (capital / raid duel)

| Light | Role | Start values |
| --- | --- | --- |
| Key | Shape the hull. Color, not white. | `Directional` or tight `Spot`. Color `#ffb089`–`#c45a4a` (ember) **or** `#6a7a88` (dead star). Intensity 1.2–2.4. |
| Fill | Lift the shadow side just enough to read plates | `HemisphereLight` sky `#1a1420` ground `#0c0a09`, intensity 0.25–0.45 |
| Rim | Separate from void | Dim `Directional` from camera-opposite, gilt `#c4a574`, intensity 0.35–0.7 |
| Practicals | Windows, searchlights, engine | `Point` / `Spot` **parented to the ship**, distance-capped, decay 2 |
| Ambient | Almost none | `ambientIntensity` 0.02–0.06. If you need more, the key is wrong. |

**Three lights + hemi beat eight points.** Extra Points are fill-rate and
banding.

## Color of light is the art direction

- Ember key + violet fill = deathcore cathedral.
- White key + white fill = toy render.
- Cyan key = generic sci-fi. Banned in NIDUS.
- Saturation in the **light**, not only the albedo. A bone plate under blood
  light reads alive; the same plate under white reads clay.

Black-hole key: small dark core mesh (almost unlit), **surrounding** disc or
spot with color `#c45a4a` / `#4a1020`, plus a long faint `Spot` that grazes
the hull. The light is the halo, not a yellow sphere.

## IBL / environment

`MeshStandard` wants an env map for metal.

- drei `<Environment>` **or** `RoomEnvironment` + `PMREMGenerator` once at
  boot. A 256–512 PMREM is enough.
- `envMapIntensity` 0.35–0.7 on iron, 0.8–1.1 on gilt. Match the key color
  (multiply env by a dim bone/void tint if the HDR is outdoor-blue).
- Do not load a 4k HDRI. Do not skip env and crank metalness — you get black
  metal with a single specular comma.

## Shadows (be mean)

- **One** shadow-casting light (the key). `mapSize` 1024, `radius` 2–4.
- Capital only. Drones / gnats `castShadow={false}`.
- `shadow.bias = -0.0002`, `normalBias = 0.02` to kill acne on lathes.
- Ortho camera on a Directional, tight `left/right/top/bottom` around the
  hull. A huge frustum = blocky shadows.
- Mobile / `prefers-reduced-motion`: shadows off or 512 map.

Contact shadows (`<ContactShadows>`) under a grounded prop: OK. On a ship in
void: skip (no ground).

## Searchlights & god-rays (the cheap lie)

Real volumetric lighting is a composer pass. Fake it:

1. `SpotLight` with `angle` 0.18–0.35, `penumbra` 0.5–0.8, `distance` short.
2. A translucent cone mesh (`ConeGeometry`, `AdditiveBlending`,
   `depthWrite: false`, alpha falloff along UV.y). **One or two**, not twelve.
3. Animate target, not the whole Canvas camera, unless RAID.

Do not add `EffectComposer` volumetric light for idle. Fill-rate death.

## Exposure & tone

Already: `ACESFilmicToneMapping`. Set `renderer.toneMappingExposure` ~0.9
so gilt highlights roll off instead of clipping to plastic yellow.

Fog: `FogExp2('#0c0a09', 0.012–0.02)` so the tail falls into void. Color
**must** match the clear color or you get a grey halo.

## Raid duel

Two ships, one key. Place the key **off to the side** so both hulls get a
lit face and a dark face (axis of the fight readable). Muzzle flashes are
additive points that die in <120ms — they are not a second sun.

## Ban list

- Ambient 1.0 + no key.
- Uncolored white-only rig.
- Yellow sphere “sun” as the aesthetic (light yes, mesh no — or a tiny disc).
- Every room node a PointLight (the old gnat-light bug).
- Shadows on instanced drones.
- Bloom strong enough to wash the UI.

## Finish
- Screenshot: lit side shows **plates**, dark side still **silhouettes**.
- Metals have environment spec, not a single white dot.
- Key has a **hue**. Void stays `#0c0a09`.
