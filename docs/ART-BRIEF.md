# SOVEREIGN art brief (20 heroes)

Generate these in Grok Imagine (or any image tool). Save each final as
`public/nidus/heroes/<id>.webp` (or `.jpg`). The game picks it up on the next build; until then it shows a stand-in.

## File spec

- **Size:** 1024 × 1280 (4:5 portrait). Minimum 800 × 1000.
- **Framing:** head to hips, face in the upper third, weapon or hands visible. Leave dark space at the bottom 25% (the name and power sit there).
- **Background:** near-black void or gothic cathedral-station interior. No bright sky.
- **Format:** WebP quality 85, or JPG quality 88. Under 350 KB each.
- **No** text, logos, watermarks, frames, or UI in the image.

## Style block (paste before every hero prompt)

```
Premium mobile game hero portrait, original adult woman, industrial femme deathcore, gothic cathedral-station in orbit.
Photoreal-stylized 3D character render, crisp PBR materials: brushed iron, tarnished gilt filigree, rivets, leather, enamel.
Sharp micro-detail on armor edges and seams, clean anatomy, symmetrical armor, correct hands with five fingers.
Dramatic rim light and a single warm key light, deep black background, subtle film grain.
Confident, powerful, attractive, fully armored. Palette: bone #e8dcc8, dried blood #7a1f2b, gilt #c4a574, venom #1faf5b, void #0c0a09.
```

## Negative prompt (paste into the negative field, or end the prompt with "Avoid:")

```
painterly smudge, oil-paint blur, airbrushed skin, plastic skin, melted armor, fused fingers, extra fingers, extra limbs,
asymmetrical eyes, warped face, broken geometry, floating armor pieces, text, watermark, signature, frame, nudity, lingerie,
cleavage window, child, teen, cartoon, anime, sci-fi cyan, neon blue, bright background
```

## Quality check before you accept an image

1. **Hands:** five fingers each, holding the weapon naturally. Reject any fused or melted grip.
2. **Face:** eyes level and matching, sharp irises, no smeared lips. Zoom to 200%.
3. **Armor:** left and right pauldrons match; rivets and edges are crisp lines, not mush.
4. **Smudge test:** zoom into the armor. If it looks like wet oil paint or has no hard edges, regenerate.
5. **Rating line:** armored and powerful; suggestive is fine (M/17+), nudity is not.
6. **Original face:** never your own face or a real person's face.
7. **Reads small:** shrink to 160 px wide. The silhouette and weapon should still read.

## Heroes

### VESPER — Saint of the Ice Ring
File: `public/nidus/heroes/vesper.webp` · Edict: +60% ORE

```
Void Valkyrie. winged plate, frost gilt, halberd. Accent color tarnished gilt (#c4a574) in trims and light.
Expression and pose that says: "The ring kneels. So will you."
```

### MORA — Furnace Abbess
File: `public/nidus/heroes/mora.webp` · Edict: +60% PARTS

```
Forge Priestess. blackened apron-plate, ember sigils, hammer. Accent color ember red (#c45a4a) in trims and light.
Expression and pose that says: "Heat is scripture."
```

### ASHLAR — Architect of Ribs
File: `public/nidus/heroes/ashlar.webp` · Edict: +70% BUILD

```
Siege Engineer. exo-frame, rivet gauntlets, plumb-line. Accent color bone white (#e8dcc8) in trims and light.
Expression and pose that says: "Every rib is a promise."
```

### NARTHEX — Oracle of the Dead Hive
File: `public/nidus/heroes/narthex.webp` · Edict: +70% RITES

```
Blind Seer. veiled helm, stained-glass visor, censer. Accent color venom green (#1faf5b) in trims and light.
Expression and pose that says: "I read the wreck's last dream."
```

### PYRE — Solar Marquise
File: `public/nidus/heroes/pyre.webp` · Edict: +55% SPARK

```
Sun-Bearer. radiant halo-plate, sunburst cuirass. Accent color tarnished gilt (#c4a574) in trims and light.
Expression and pose that says: "Kneel closer to the light."
```

### SABLE — Queen of Tithes
File: `public/nidus/heroes/sable.webp` · Edict: +60% CUT

```
Mercenary Duchess. fur-trimmed pauldrons, coin chains, rapier. Accent color tarnished gilt (#c4a574) in trims and light.
Expression and pose that says: "Everything has a price. I set it."
```

### DIRGE — Lancer of the Black Choir
File: `public/nidus/heroes/dirge.webp` · Edict: +50% RAID CUT

```
Dragoon. lance, crested helm, dried-blood plate. Accent color dried-blood crimson (#7a1f2b) in trims and light.
Expression and pose that says: "Point. Pierce. Pray."
```

### RELIQUARY — Keeper of Long Nights
File: `public/nidus/heroes/reliquary.webp` · Edict: +8h OFFLINE

```
Sleepwarden. sarcophagus armor, candle crown. Accent color bone white (#e8dcc8) in trims and light.
Expression and pose that says: "Sleep. I keep the hive."
```

### BRIAR — Rose of the Stamp
File: `public/nidus/heroes/briar.webp` · Edict: -25% PRINT COST

```
Thorn Matriarch. thorned plate, rose-glass visor, whip-chain. Accent color ember red (#c45a4a) in trims and light.
Expression and pose that says: "Bloom cheap. Bleed rich."
```

### NYXARA — Crown of the Nave
File: `public/nidus/heroes/nyxara.webp` · Edict: +20% EVERYTHING

```
Hive Empress. cathedral crown, cape of banners, scepter. Accent color tarnished gilt (#c4a574) in trims and light.
Expression and pose that says: "The nave was always mine."
```

### CINDER — Deep Vein Breaker
File: `public/nidus/heroes/cinder.webp` · Edict: +45% ORE

```
Pit Brawler. mining gauntlets, soot tattoos, bandana. Accent color ember red (#c45a4a) in trims and light.
Expression and pose that says: "The rock gives. Or it breaks."
```

### BRAZIER — Kiln Sister
File: `public/nidus/heroes/brazier.webp` · Edict: +45% PARTS

```
Flame Gunner. heat-scarred plate, flamer, visor. Accent color ember red (#c45a4a) in trims and light.
Expression and pose that says: "Keep the mouth fed."
```

### SPIRE — Warden of Scaffolds
File: `public/nidus/heroes/spire.webp` · Edict: +50% BUILD

```
Iron Bastion. tower shield, scaffold spikes, heavy greaves. Accent color bone white (#e8dcc8) in trims and light.
Expression and pose that says: "Up. Always up."
```

### VEIL — Glass Mind
File: `public/nidus/heroes/veil.webp` · Edict: +50% RITES

```
Techno-Mystic. crystal circuitry, lace-steel hood. Accent color venom green (#1faf5b) in trims and light.
Expression and pose that says: "I think in stained glass."
```

### HALO — Choir Conductor
File: `public/nidus/heroes/halo.webp` · Edict: +40% SPARK

```
War Cantor. choir collar, tuning-fork glaive. Accent color tarnished gilt (#c4a574) in trims and light.
Expression and pose that says: "Sing, and the spine lights."
```

### TITHE — Collector of the Ring
File: `public/nidus/heroes/tithe.webp` · Edict: +45% CUT

```
Bounty Queen. longcoat plate, ledger-chain, twin pistols. Accent color tarnished gilt (#c4a574) in trims and light.
Expression and pose that says: "Pay the queen."
```

### THORN — Wreck Reaver
File: `public/nidus/heroes/thorn.webp` · Edict: +40% RAID CUT

```
Boarding Blade. boarding axe, grapple, hazard gilt. Accent color dried-blood crimson (#7a1f2b) in trims and light.
Expression and pose that says: "Their hull is my door."
```

### MATINS — Dawn Sentinel
File: `public/nidus/heroes/matins.webp` · Edict: +5h OFFLINE

```
Night Watch. lantern pauldron, long rifle, hooded plate. Accent color bone white (#e8dcc8) in trims and light.
Expression and pose that says: "I was awake before you."
```

### OSSUARY — Bone Printer
File: `public/nidus/heroes/ossuary.webp` · Edict: -18% PRINT COST

```
Necro-Smith. bone filigree armor, skull-press gauntlet. Accent color bone white (#e8dcc8) in trims and light.
Expression and pose that says: "The dead still work."
```

### ABBESS — Mother of the Molt
File: `public/nidus/heroes/abbess.webp` · Edict: +14% EVERYTHING

```
Iron Saint. wimple-helm, reliquary chest, mace. Accent color tarnished gilt (#c4a574) in trims and light.
Expression and pose that says: "Shed. Rise. Again."
```
