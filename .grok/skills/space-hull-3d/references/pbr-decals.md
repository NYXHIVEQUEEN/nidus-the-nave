# PBR plating + decals

Authoring the maps (tile test, height→normal, Imagine prompts, ORM) lives in
`texture-design.md`. This file is **how they bind on a mesh**.


## Maps on disk (NIDUS)

`public/nidus/tex-plate.jpg`, `tex-rivet.jpg`, `tex-grate.jpg`,
`tex-filigree.jpg`, `tex-hazard.jpg`, `tex-height.jpg`, `tex-rough.jpg`,
`tex-gilt.jpg`, `tex-bone.jpg`, `tex-blood.jpg`.

Load with drei `useTexture`. Set color space **per slot**:

```ts
plate.colorSpace = SRGBColorSpace;      // albedo
height.colorSpace = NoColorSpace;       // data
rough.colorSpace = NoColorSpace;
plate.wrapS = plate.wrapT = RepeatWrapping;
plate.anisotropy = 8;
plate.repeat.set(6, 2);                 // spine
```

Clone before changing `repeat` (`tex.clone()` + `needsUpdate`) so two
sections can share the GPU image with different UVs.

## Material recipe (brushed iron hull)

```ts
<meshStandardMaterial
  map={plate}
  roughnessMap={rough}
  metalnessMap={metal}
  normalMap={nml}
  roughness={0.52}
  metalness={0.72}
  color="#c9b7a2"
  envMapIntensity={0.55}
  normalScale={[0.45, 0.45]}
/>
```

Gilt trim = separate mesh, `color="#c4a574"`, metalness 0.9, roughness 0.28.
Emissive windows = unlit or `emissive="#c4a574"` at 0.2–0.6, **not** on the
hull material (or the whole ship glows).

## UV sectioning

| Part | repeat | why |
| --- | --- | --- |
| Spine / nave | 6 × 2 | long plates read as panels |
| Nose | 2 × 2 | avoid smear at the tip |
| Wings / fins | 3 × 1 | flow along chord |
| Engine bells | 2 × 2 | concentric, not stretched |

If a close-up looks like stretched rubber, the repeat is too low or the
lathe UVs are mapping a tiny image across meters.

## DecalGeometry notes

Import from `three/addons/geometries/DecalGeometry.js` (not a CDN).

- Projector **size.z** is depth — too small and it misses; too big and it
  wraps the far side. Start at ~0.3 of the local radius.
- `polygonOffsetFactor: -4` stops z-fight. `depthWrite: false`.
- Rebuild the decal if the hull geo is replaced (stage change).
- Distortion on tight curves is expected; slide the projector onto a flatter
  plate.

Shell fallback when you only need livery stripes:

```ts
<mesh scale={1.008}>
  <latheGeometry args={[pts, 24]} />
  <meshStandardMaterial map={hazard} transparent depthWrite={false} />
</mesh>
```

## Perf

- Share materials across pirate rams / player guns.
- Cap `anisotropy` at 4 on `renderer.capabilities.isWebGL2 === false`.
- Do not add a unique standard material per drone. Instanced + one mat.
