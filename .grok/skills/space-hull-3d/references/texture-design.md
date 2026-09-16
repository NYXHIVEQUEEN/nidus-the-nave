# Texture design (tileable PBR, this sandbox)

No Substance. Maps are **tileable photos / Imagine plates / canvas filters**
in `public/nidus/tex-*.jpg`. A pretty unique picture is a bad hull map.

## Sets, not heroes

A hull map must survive `repeat (6, 2)` without a landmark (a door, a face,
one giant rivet, readable text). Design **fields of material**, then decal
the unique marks.

Minimum set for a capital:

| File | Role | Looks like |
| --- | --- | --- |
| `tex-plate` | albedo | Bone-iron panels, gilt seams, no text |
| `tex-rivet` | albedo or normal source | Even rivet grid, 8–16 across |
| `tex-grate` | albedo / AO | Vents, not a single fan |
| `tex-height` | height (linear) | Soft panel gaps, 8-bit grey |
| `tex-rough` | roughness (linear) | Iron ~140, gilt seams darker (shinier) |
| `tex-filigree` | decal / emissive | Alpha-ish dark field, gilt ornament |
| `tex-hazard` | decal | Diagonal stripes, transparent field |
| `tex-blood` | decal | Sparse spatter, not a full red square |

1024² max for hero plates, 512² for decals. JPG is fine (no alpha). PNG only
when you need a real alpha (hazard, filigree).

## Color space (wrong space = plastic or mud)

| Slot | `texture.colorSpace` |
| --- | --- |
| albedo / emissive / decal color | `SRGBColorSpace` |
| roughness, metalness, AO, height, normal | `NoColorSpace` |

Never `SRGBColorSpace` on a roughness map (it goes glossy-wrong).

## How to *design* a plate (AAA habits)

1. **Value first.** Albedo of painted metal lives in 50–180 sRGB, not 255.
   Bone `#e8dcc8` is the *light* end, void the grout, blood as stain not fill.
2. **Panel language.** Large rectangles, lancet repeats, wasp-waist seams.
   Grooves in **height**, not black paint (paint flattens under PBR).
3. **Wear in roughness.** Edges slightly darker in rough map (shinier worn
   iron). Dirt in crevices = higher roughness, lower albedo.
4. **Metalness is a mask.** Iron 0.6–0.85, bone paint 0.05–0.2, gilt trim 1.
   Do not metalness-1 the whole hull.
5. **Normal from height.** A Sobel on `tex-height` beats a generated “normal
   photo.” Invert Y if lighting looks inside-out (`normalScale.y *= -1`).
6. **No baked lighting.** No shadows, no rim, no engine glow in the albedo.
   Lighting is the rig. Baked light double-lights and looks stuck.

## Tile test (mandatory)

Before shipping a map:

1. Draw it in a 2×2 (or 3×3) CSS/canvas grid at 1:1.
2. Fail if you see a seam, a centered motif, or a gradient that only works
   once (Imagine loves vignetting — crop or flatten).
3. Fail if text or a unique rune appears — that belongs on a **decal**.

`game-tilesets` 2×2 discipline applies.

## Imagine prompts (2D maps only)

Front-load: “seamless tileable industrial iron hull plate, orthographic,
even lighting, no shadows, no ship, no sky, gothic rivets and lancet panel
gaps, bone and dried-blood grit, tarnished gilt micro-seams, 4k, flat.”

Then **I2I** the best tile to knock out vignette and landmarks. Do not
prompt “spaceship” — you will get a picture of a ship.

QC: `read_file` the map, then a 2×2 composite. If the model baked a hull
silhouette into the plate, discard.

## Channel packing (ORM)

Optional GPU save: one PNG, R = AO, G = roughness, B = metalness.
Sample in `onBeforeCompile` or skip and keep separate JPGs (simpler, fine
for one capital). Do not pack albedo with data (sRGB vs linear fight).

## Height → normal (canvas, no baker)

```
n.x = h(x-1,y) - h(x+1,y)
n.y = h(x,y-1) - h(x,y+1)
n.z = scale (4–8)
normalize, write (n*0.5+0.5)
```

Strength too high = crocodile skin. Start scale 4. NIDUS plates want **soft**
panel gaps, not terrain.

## Anisotropy & mips

`generateMipmaps = true` (default). `anisotropy` 4–8. Without anisotropy,
long hull repeats shimmer when the camera grazes.

## Decal textures vs wrap

Wrap = repeating field. Decal = unique mark with **transparent gutter**.
If the gutter is opaque black, you stamp a black rectangle on the hull.
JPG cannot do this — use PNG for hazard/filigree/nameplate.

## Ban list

- One 512 photo of the whole ship as `map` (smear, baked lights, no tiling).
- Readable letters in a repeating plate.
- Normal maps that are just a filtered albedo (wrong).
- Emissive baked into albedo.
- Cyan / plastic-gold palettes.
- 4k maps on drones.

## Finish
- 2×2 tile is invisible as a grid.
- Close-up of the nave shows **panel gaps in the specular**, not marker lines.
- Unique marks are decals. Fields tile.
