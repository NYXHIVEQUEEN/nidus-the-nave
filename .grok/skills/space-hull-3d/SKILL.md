---
name: space-hull-3d
description: >
  Rounded, smooth procedural spaceship / station hulls in three.js + R3F.
  Use when building or fixing ship models, hull silhouettes, PBR plating,
  UV sectioning, or hull decals. Triggers on "spaceship", "hull", "ship
  model", "rounded", "smooth 3d", "decal", "texture wrap", "plating",
  "capsule", "lathe", "NIDUS ship", "snack cake", "submarine", "see-through
  hull". Not for 2D sprites (use game-asset-core) and not for replacing a
  mesh with a generated photo (Imagine is 2D only).
metadata:
  short-description: "Smooth procedural hulls, PBR plating, and ship decals in three/R3F"
user-invocable: false
---

# Space hulls (smooth 3D + plating + decals)

This sandbox has **no Blender, no Substance, no glTF baker**. Ships are
**procedural three.js meshes** plus **tileable PBR maps**. Imagine is for
2D interiors/portraits only — a generated photo of a ship is not a hull.

Load **`building-games`** for loop/camera/orientation. Load **`threejs`**
only if you need a rare API. This file owns silhouette, smoothness, UVs,
materials, and markings.

**References (on demand):**
- `references/hull-profiles.md` — lathe / capsule / merge recipes
- `references/pbr-decals.md` — maps, UV scale, DecalGeometry, QC

---

## Tools actually in this stack (answer: “what do you model with?”)

| Job | Tool | Not this |
| --- | --- | --- |
| Hull body | `LatheGeometry` (silhouette) or `CapsuleGeometry` (tube + rounded caps) | `BoxGeometry` as the body |
| Add-ons (nacelles, guns, engines) | Extra capsules / cylinders, `mergeGeometries` | Glued cubes |
| Smooth look | radial ≥ 24, capSegments ≥ 8, `computeVertexNormals()` | 5-sided cones, faceted boxes |
| Plating | `MeshStandardMaterial` + repeating `tex-plate` / rivet / grate | Flat hex, `MeshBasicMaterial` |
| Markings | `DecalGeometry` **or** a slightly inflated shell with alpha | One photo wrapped 360° |
| 2D plates / interiors | Imagine → `public/nidus/*.jpg` | Using that JPG as a mesh |
| Import path (later) | glTF via drei `useGLTF` if a real `.glb` exists | Fake “3D” from a PNG plane |

Forward is **+Z**. Lathe/capsule are **+Y**. Rotate `geo.rotateX(Math.PI / 2)`
so the nose points +Z. Never ship a hull flying backwards.

---

## Ban list (these are the “snack cake / Lego / submarine” bugs)

1. **BoxGeometry as the main hull.** Instant toy.
2. **radialSegments < 16** on a hero ship. Facets read as low-poly cake.
3. **One mesh, one UV scale** for spine + nose + wings. Plating smears.
4. **MeshBasic / MeshLambert** on the hero. No metal, no light response.
5. **BackSide / transparent body** with no inner solid. See-through hull.
6. **Generated photo of a ship as a plane or sprite.** Flat, no lighting.
7. **ConeGeometry(…, 5)** as a nose. Pentagon snack.
8. **Sharing one 512 albedo at repeat (1,1)** across 20 meters of hull.

---

## Smooth hull in four steps

1. **Draw the side profile** as `Vector2[]` (x = radius, y = length). Keep
   the outline C1-ish: no 90° steps unless you **duplicate** that point to
   force a crease (panel line). See `hull-profiles.md`.
2. **Lathe** it: `new LatheGeometry(pts, 24)` or more. Or skip the profile
   and use `CapsuleGeometry(r, length, 8, 24, 8)` for a sausage that already
   has round caps.
3. **Rotate to +Z**, merge add-ons, `computeVertexNormals()`.
4. **Section materials.** Spine, nose, wings, engines each get their own
   `repeat` and, if needed, their own mesh. Do not one-wrap.

Hero ship on mobile: **24 radial × 8–12 along length** is enough. Going to
64×64 buys almost nothing and tanks Mali GPUs.

---

## Plating (what makes it look like a ship, not a balloon)

`MeshStandardMaterial` with **separate maps**, not a painted photo:

| Slot | Map | Color space | Typical |
| --- | --- | --- | --- |
| `map` | plate / bone albedo | sRGB | repeat 4–8 |
| `roughnessMap` | grit / height | linear | roughness 0.42–0.72 |
| `metalnessMap` | iron vs gilt | linear | metalness 0.55–0.85 |
| `normalMap` | rivets / panels | linear | scale 0.35–0.8 |
| `emissiveMap` | windows only | sRGB | keep dim |

Wrap: `RepeatWrapping`. `anisotropy = min(8, renderer.capabilities.getMaxAnisotropy())`.
Different **UV repeat per section** (spine 6×2, nose 2×2, wing 3×1).

NIDUS palette on the maps: bone `#e8dcc8`, dried blood `#7a1f2b`, gilt
`#c4a574`, void `#0c0a09`. Not sci-fi cyan. Not plastic gold.

---

## Decals (markings that sit on the hull)

Use **`three/addons/geometries/DecalGeometry.js`**. Project **after** the
hull mesh has world matrix updated (`mesh.updateWorldMatrix(true, false)`).

```ts
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";
import { Euler, Vector3, Mesh, MeshStandardMaterial } from "three";

const geo = new DecalGeometry(
  hullMesh,
  new Vector3(0, 0.12, 1.4),   // world point on the skin
  new Euler(0, 0, 0),
  new Vector3(0.55, 0.22, 0.35),
);
const mark = new Mesh(
  geo,
  new MeshStandardMaterial({
    map: hazardTex,
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    metalness: 0.3,
    roughness: 0.55,
  }),
);
```

Rules:
- **4–8 decals** on a hero. More is clutter and overdraw.
- Hazard stripes, gilt filigree, registry codes, blood splash, nameplate.
- Never 360-wrap a decal. Project from the surface normal.
- Corners distort — keep decals on gently curved plates.
- Cheap fallback: a second mesh scaled 1.008 with an alpha map (shell).

---

## Lighting that sells the maps

Standard material is black without light. Hero hulls need:

- Key (sun / black-hole rim) with a **color**, not only white
- Soft fill / hemisphere
- Tiny emissive windows as **separate meshes**, not baked into albedo
- Tone mapping already on in NIDUS (`ACESFilmicToneMapping`) — keep it

Do not raise `metalness` to 1 and hope. Brushed iron is ~0.7 metal, 0.45–0.6
rough. Gilt trim is a **different mesh** with higher metal, lower rough.

---

## NIDUS-specific

- Cathedral-factory in orbit, wasp-waist, filled body (space must not punch
  through).
- Drones stay instanced gnats (`InstancedMesh`), not unique hulls.
- Raid rams use the same capsule/lathe language as the capital, smaller.
- Selectors into the 3D scene stay **primitives** or the Canvas remounts.

---

## Finish check

- Silhouette reads at ~64px (no box, no snack, no sub).
- Nose points **+Z**. Caps are round, not chopped.
- Close-up shows **tiling plates + rivets**, not a smeared photo.
- No see-through. Inner volume is solid or double-walled.
- Decals sit on the skin (no z-fight, no floating).
- Mobile: draw calls still sane; drones instanced; anisotropy capped.
