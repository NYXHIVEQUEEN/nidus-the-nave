---
name: space-hull-3d
description: >
  Rounded, smooth procedural spaceship / station hulls in three.js + R3F,
  plus AAA PBR shaders, cinematic lighting, idle/raid animation, and
  tileable texture design. Use when building or fixing ship models, hull
  silhouettes, plating, UVs, decals, engine glow, searchlights, fresnel,
  tone mapping, or tex-*.jpg maps. Triggers on "spaceship", "hull", "ship
  model", "rounded", "smooth 3d", "decal", "texture wrap", "plating",
  "capsule", "lathe", "shader", "PBR", "lighting", "searchlight", "engine
  glow", "tileable", "normal map", "NIDUS ship", "snack cake", "submarine",
  "see-through hull". Not for 2D sprites (game-asset-core). Imagine never
  produces a mesh.
metadata:
  short-description: "AAA procedural hulls: lathe/PBR, shaders, light, motion, tileable maps"
user-invocable: false
---

# Space hulls (AAA, still procedural)

This sandbox has **no Blender, no Substance, no glTF baker**. Ships are
**three.js meshes** + **tileable PBR maps** + a **keyed light rig**. Imagine
is 2D only. A generated photo of a ship is not a hull.

Load **`building-games`** for loop/camera/orientation. Load **`threejs`**
only for a rare API. Load **`game-feel-juice`** for trauma shake. This skill
owns silhouette, materials, light, motion, and maps.

**References (on demand — open the one you are actually doing):**
- `references/gdl-acceptance.md` — **hard review bar** (full Game Design Lead directive). Visual quality is acceptance, not polish. A failed category cannot be averaged away.
- `references/hull-profiles.md` — lathe / capsule / merge
- `references/pbr-decals.md` — UV scale, DecalGeometry
- `references/texture-design.md` — tileable PBR authoring, height→normal, Imagine
- `references/shaders.md` — Standard/Physical, fresnel, `onBeforeCompile`, bloom fake
- `references/lighting.md` — key/fill/rim, IBL, shadows, cheap shafts
- `references/animation.md` — idle breath, engines, RAID tracers, reduced motion

---

## Tools in this stack

| Job | Tool | Not this |
| --- | --- | --- |
| Hull body | `LatheGeometry` or `CapsuleGeometry` | `BoxGeometry` as the body |
| Add-ons | Capsules / cylinders, `mergeGeometries` | Glued cubes |
| Smooth | radial ≥ 24, capSegments ≥ 8, `computeVertexNormals()` | 5-sided cones |
| Plating | `MeshStandardMaterial` + `tex-*` maps | Flat hex, Lambert, a ship photo |
| Markings | `DecalGeometry` or inflated alpha shell | One photo wrapped 360° |
| Shaders | Standard/Physical + optional `onBeforeCompile` | Raw `ShaderMaterial` as the hull |
| Light | 1 key + hemi fill + 1 rim + capped practicals | Ambient 1.0, 12 Points, yellow sun-orb |
| Motion | `useFrame` + exp lerp, instanced tracers | Rebuild geo every tick, particle swarm raids |
| Maps | Tileable JPG/PNG, 2×2 QC | Unique “hero” picture as wrap |
| 2D plates | Imagine → `public/nidus/tex-*.jpg` | Using that JPG as a mesh |

Forward is **+Z**. Lathe/capsule are **+Y**. `geo.rotateX(Math.PI / 2)`.

---

## Ban list (snack cake / Lego / submarine / piss-orb)

1. **BoxGeometry as the main hull.**
2. **radialSegments < 16** on a hero ship.
3. **One mesh, one UV scale** for spine + nose + wings.
4. **MeshBasic / Lambert** on the hero.
5. **BackSide / transmission** hull. See-through is a bug.
6. **Generated photo of a ship as a plane.**
7. **ConeGeometry(…, 5)** as a nose.
8. **Albedo with baked lighting, windows, or engine glow.**
9. **White-only lights** or ambient 1.0.
10. **Particle swarm** as the raid. Two ships, tracers.
11. **Unique ShaderMaterial per drone.**
12. **Rebuilding geometry in `useFrame`.**

---

## Smooth hull (four steps)

1. Side profile as `Vector2[]` (x = radius, y = length). Duplicate a point to
   crease. `hull-profiles.md`.
2. `LatheGeometry(pts, 24)` or `CapsuleGeometry(r, len, 8, 24, 8)`.
3. Rotate to +Z, merge add-ons, `computeVertexNormals()`.
4. **Section materials.** Spine 6×2, nose 2×2, wing 3×1. Do not one-wrap.

Mobile hero: 24 radial × 8–12 along length. 64×64 is waste.

---

## AAA look without a DCC

**Maps** (`texture-design.md`): tileable plate + height + rough + metal.
Value 50–180. Grooves in height, wear in roughness, unique marks as **decals**.
2×2 tile test or it does not ship.

**Shader** (`shaders.md`): Standard first. Physical clearcoat only on small
gilt/blood. Rim via `onBeforeCompile`, not a second renderer. `dithering: true`.
Emissive meshes for windows/engines. Fake bloom with additive sprites; full
composer bloom is a last resort.

**Light** (`lighting.md`): colored key (ember or dead-star, never cyan), hemi
fill, gilt rim, PMREM env at 0.35–0.7. One shadow caster. FogExp2 = clear color.
Black-hole key = dark core + halo light, not a yellow sphere.

**Motion** (`animation.md`): slow bank/breath, fast engine flicker, 1–2
searchlights. RAID = pooled tracers, not gnats. `prefers-reduced-motion`
kills bob/spin/shake.

NIDUS palette: bone `#e8dcc8`, dried blood `#7a1f2b`, gilt `#c4a574`,
venom `#1faf5b`, void `#0c0a09`.

---

## Decals (short)

`DecalGeometry` after `updateWorldMatrix`. 4–8 marks. `polygonOffsetFactor: -4`,
`depthWrite: false`. PNG with a **transparent gutter**. Details in
`pbr-decals.md`.

---

## NIDUS-specific

- Cathedral-factory, wasp-waist, **filled** body.
- Drones = `InstancedMesh`, not lights.
- Raid rams = smaller capsule/lathe of the same language.
- Scene selectors = **primitives** or the Canvas remounts.
- Tone: `ACESFilmicToneMapping`. Keep it.

---

## Finish check

- Silhouette reads at ~64px (no box, snack, sub).
- Nose **+Z**. Caps round.
- Close-up: tiling plates, rivets, specular in the grooves — not a smeared photo.
- Lit side readable, dark side silhouettes, metals have IBL spec.
- No see-through. No yellow sun-orb as the aesthetic.
- Decals sit on skin.
- WATCH is pleasant for 30s. RAID is two ships + tracers.
- Mobile: one shadow, instanced gnats, anisotropy capped, no composer unless asked.
