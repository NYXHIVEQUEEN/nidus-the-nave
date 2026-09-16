# Shaders (AAA look, WebGL budget)

Default path is **MeshStandardMaterial** (metallic-roughness). Custom GLSL is a
patch on that, not a rewrite. Raw `ShaderMaterial` drops IBL, shadows, fog,
and tone mapping unless you reimplement them — do not start there.

NIDUS runs **WebGL + R3F**, not WebGPU/TSL, unless a pass explicitly opts in.
Stay on the standard/physical chunk graph so ACES and lights keep working.

## Material ladder (pick the cheapest that sells)

| Need | Material | Notes |
| --- | --- | --- |
| Hull iron, gilt, bone | `MeshStandardMaterial` | Default. Metal/rough/normal. |
| Wet blood, lacquer, stained glass *trim* | `MeshPhysicalMaterial` | `clearcoat` 0.2–0.6, `clearcoatRoughness` 0.15–0.4. **Never** `transmission` on the hull (see-through). |
| Engine bell / window / tracer | Standard + `emissive` / `emissiveMap` | Unlit look without leaving the light graph. `emissiveIntensity` pulsed in `useFrame`. |
| Additive glow sprite | `MeshBasicMaterial` + `AdditiveBlending` | Halos, muzzle, thruster core. `depthWrite: false`, `transparent`. |
| Last resort | `onBeforeCompile` on Standard | Inject fresnel, panel wear, heat. Keep `USE_MAP` / lights. |

`MeshLambert` / `MeshPhong` / `MeshToon` on a hero hull is a quality regression.

## Physical knobs that read as AAA (and the ones that wreck us)

**Use**
- `clearcoat` on gilt filigree and wet blood decals only (small meshes).
- `sheen` + `sheenColor` `#3a1020` for velvet / dried-blood cloth, not metal.
- `iridescence` 0.05–0.15 on stained-glass panes. Tiny meshes.
- `dithering: true` on every standard/physical mat (kills 8-bit banding in the void).
- `flatShading: false`. Always.

**Do not**
- `transmission` / `thickness` / `ior` on the capital. Glass hull = snack wrapper.
- `wireframe` in shipping builds.
- `envMapIntensity > 1.4` — blows gilt into chrome toys.
- Unique `ShaderMaterial` per drone. Instanced + one Standard.

## `onBeforeCompile` (safe custom, keep PBR)

Patch **output** or a late fragment chunk. Do not replace `main`.

```ts
mat.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = { value: 0 };
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      `#include <common>\nuniform float uTime;`,
    )
    .replace(
      "#include <output_fragment>",
      `
      // rim: cheap Fresnel, bone-gilt, not cyan
      float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 3.0);
      outgoingLight += vec3(0.77, 0.65, 0.45) * rim * 0.18;
      #include <output_fragment>
      `,
    );
  mat.userData.shader = shader;
};
```

Drive `uTime` from `useFrame` on `mat.userData.shader.uniforms.uTime`. One
shared material → one uniform for every mesh that uses it (engines can share
a pulse).

**Legal patches:** rim/fresnel, heat-near-engines (`smoothstep` on UV.y),
micro-wear (`albedo *= 0.85 + 0.15 * noise`), scan-line on glass.
**Illegal patches:** discarding hull fragments (holes), replacing lighting,
per-fragment procedural rivets on the whole capital (aliasing + cost).

## Fresnel / rim (the “studio still” trick)

AAA ships read because grazing angles go bright (specular) and a **colored
rim** separates hull from void. Prefer the compile patch above over a second
additive mesh. Rim color = gilt `#c4a574` or blood `#7a1f2b`, never ice blue.

## Emissive vs albedo

Windows, runes, engine throats are **emissive meshes or maps**, not bright
paint on `map`. Albedo does not glow under ACES the way you think.

- Hull albedo stays ≤ bone. No white plates.
- Emissive texture: black with gilt/venom marks. `emissiveIntensity` 0.25 idle,
  1.4 surge.
- Bloom is **not** in core three without a composer. Fake bloom with a larger
  additive sprite. A full `EffectComposer` + UnrealBloom on mobile is a last
  resort (doubles fill). If used: `mipmapBlur`, strength ≤ 0.35, threshold 0.8.

## Precision & banding

- `renderer.outputColorSpace = SRGBColorSpace` (R3F default in r152+).
- `ACESFilmicToneMapping`, exposure 0.85–1.15. Do not stack Filmic + a custom
  tone curve in a shader.
- `dithering: true`.
- Avoid 1-pixel emissive lines (sparkle / disappear). Window slits ≥ 2–3 px
  in UV at the smallest shot.

## Instancing

Drones / tracers: `InstancedMesh` + Standard. Per-instance color via
`instanceColor`. Do not compile a custom shader that breaks instance attribs
(`USE_INSTANCING` must stay).

## TSL / WebGPU

Only if a future pass sets `gl="webgpu"` on `<Canvas>`. Until then, GLSL
chunks. Do not mix `NodeMaterial` with the current WebGL canvas.

## Finish
- Hero still lights under ACES with **zero** custom shader (standard + maps).
- Custom code is a **delta** (rim, heat), not a replacement renderer.
- No transmission on the nave. No per-drone ShaderMaterial.
