# Grok.Art — NIDUS art generation rules

The single rulebook for every image made for NIDUS in Grok Imagine (or any
image model). Per-hero prompts live in `docs/ART-BRIEF.md`; this file is the
law they follow. Read **Bands** before generating and **Failures** before
accepting.

**Target look:** hyper-real. Photographic skin, real metal, real light.
**Allowed fallback:** high-end dark-fantasy CGI (cinematic game-trailer
render). **Never:** painterly, anime, cartoon, flat vector, sci-fi cyan.

---

## 1. Bands (stay inside these)

Every prompt picks **one value inside each band**. Anything outside a band is
a failure, even if it looks good.

| Band | Allowed | Out of band (reject) |
| --- | --- | --- |
| **Render** | hyper-real photograph · cinematic CGI render (Unreal 5 / Octane look) | oil paint, watercolor, concept sketch, anime, cel shade, 2D illustration |
| **Camera** | 85mm or 105mm portrait lens, f/2–f/4, eye-level or slightly low | fisheye, ultra-wide, top-down, dutch tilt over 10° |
| **Framing** | head to hips, face in upper third, hands or weapon in frame | face cut off, full body tiny in frame, cropped at the neck |
| **Aspect** | 2:3 or 3:4 portrait (game crops to 4:5 from center-top) | landscape for heroes, square |
| **Light** | one warm key (gilt/ember), one cool or crimson rim, deep shadows | flat front light, noon daylight, multiple colored party lights |
| **Background** | near-black void, gothic cathedral-factory interior, soft smoke | bright sky, daylight city, white studio, busy crowd |
| **Palette** | bone #e8dcc8 · dried blood #7a1f2b · ember #c45a4a · gilt #c4a574 · venom #1faf5b · void #0c0a09 | cyan, neon blue, pink, pastel, chrome-rainbow |
| **Skin** | real pores, fine texture, natural tone variety, subtle scars/tattoos OK | airbrushed, porcelain, plastic, wax, glossy doll |
| **Armor** | brushed iron, tarnished gilt filigree, rivets, leather straps, enamel, stained-glass inlay | shiny chrome, plastic, rubber latex, smooth toy armor |
| **Body** | adult woman (clearly 25+), athletic to strong, powerful stance | childlike, teen, exaggerated anatomy, impossible waist |
| **Rating** | M/17+: attractive, fierce, form-fitting armor, bare arms/shoulders OK | nudity, see-through, lingerie, cleavage windows, sexual poses |
| **Face** | original face, expressive, sharp eyes | the owner's face, any real person or celebrity |
| **Detail** | crisp edges, readable rivets and seams at 200% zoom | mushy edges, melted surfaces, noise that hides structure |
| **Text** | none | letters, logos, watermarks, signatures, frames, UI |

---

## 2. Prompt skeleton

Fill every bracket. Do not add extra style words; they drag the model out of band.

```
[RENDER: Hyper-real photograph | Cinematic dark-fantasy CGI render], premium game hero portrait.
Original adult woman, [ARCHETYPE], [AGE 25–45], [BUILD].
Wearing [ARMOR: 3–5 concrete pieces, materials named].
Holding [WEAPON or TOOL], both hands visible, five fingers each.
[EXPRESSION] expression, [POSE] pose, head to hips, face in upper third.
85mm lens, f/2.8, eye-level. Warm [gilt | ember] key light from [left | right], [crimson | cool] rim light.
Background: [near-black void | gothic cathedral-factory interior] with soft smoke, dark bottom quarter.
Palette: bone, dried blood, tarnished gilt, [ACCENT].
Real skin pores, crisp armor edges, readable rivets, subtle film grain.
```

**Negative** (paste in the negative field, or end the prompt with `Avoid:` and this list):

```
painting, painterly, oil paint, brush strokes, smudge, blur, airbrushed skin, plastic skin, wax skin, doll face,
melted armor, fused fingers, extra fingers, missing fingers, extra limbs, twisted wrist, broken weapon,
asymmetrical eyes, cross-eyed, warped face, duplicate face, floating armor pieces, mismatched pauldrons,
cut-off head, cropped chin, text, letters, watermark, signature, logo, frame, border, UI,
nudity, see-through, lingerie, cleavage window, child, teen, anime, cartoon, cel shading,
cyan, neon blue, pink, bright sky, white background, fisheye
```

---

## 3. Failures (the reject list)

Zoom to 200% before judging. One hard failure = regenerate. Do not "fix it in
the game"; the game shows portraits large.

| # | Failure | What it looks like | Usual cause | Fix (add to prompt) |
| --- | --- | --- | --- | --- |
| F1 | **Oil smudge** | surfaces look like wet paint, no hard edges, soft mush on armor | "art", "painting", "digital art", "epic" in prompt; low detail words | `hyper-real photograph, crisp armor edges, readable rivets, 85mm`; remove every art/painting word |
| F2 | **Plastic skin** | poreless, glossy, doll face | "beautiful", "flawless", "perfect skin" | `real skin pores, fine skin texture, natural imperfections`; replace "beautiful" with `striking` |
| F3 | **Broken hands** | fused, 6 fingers, claw grip, hand merges with weapon | hands small or partly hidden | `both hands visible, five fingers each, gloved hands gripping [weapon] naturally`; or hide hands behind the weapon haft |
| F4 | **Melted geometry** | armor flows into skin, straps go nowhere, weapon bends | too many armor items listed | cap armor at 3–5 named pieces; `symmetrical armor, clean construction, every strap attached` |
| F5 | **Mismatched sides** | left and right pauldrons differ, one earring, broken symmetry | model drift | `matching pauldrons, symmetrical armor`; regenerate with a different seed |
| F6 | **Dead eyes / wonky face** | eyes at different heights, cloudy irises, smeared lips | face too small in frame | tighter framing: `head and shoulders to waist, face large`; `sharp focused eyes, clear irises` |
| F7 | **Colour off-band** | cyan, neon blue, pink glow | "sci-fi", "cyberpunk", "neon" | remove those words; name the palette hex values; `no cyan, no neon` |
| F8 | **Light flat** | face evenly lit, no shadow, looks like a phone photo | no light direction given | `single warm key light from the left, crimson rim light, deep shadows` |
| F9 | **Background too busy** | crowds, bright windows, scenery steals focus | long scene description | cut background to one phrase: `near-black void with soft smoke` |
| F10 | **Rating break** | nudity, see-through, suggestive pose | "sexy", "seductive", "revealing" | use `fierce, confident, powerful, form-fitting armor`; drop sexual words entirely |
| F11 | **Age drift** | looks under 25 or childlike | "girl", "young", "petite" | `adult woman in her 30s`; never write "girl" |
| F12 | **Text artefacts** | fake letters on armor, a signature in a corner | words like "banner", "sign", "inscription" | add `no text, no letters`; describe runes as `abstract engraved patterns` |
| F13 | **Real-face leak** | resembles a celebrity or the owner | reference photo of a real person, celebrity name | never upload real faces as references; never name real people |
| F14 | **Tiny subject** | full body small in frame, lots of empty space | "full body", "standing in hall" | `head to hips, subject fills 80% of frame` |
| F15 | **Style drift across the set** | heroes look like 20 different games | changing render words per hero | use the exact same RENDER, lens, light, and palette lines for all 20; change only archetype, armor, weapon, accent, pose |
| F16 | **Dead crop zone** | name area (bottom quarter) is bright or busy | light pooled low | `dark lower quarter, light falls on face and chest` |

**Hard fail (always regenerate):** F3, F4, F6, F10, F11, F12, F13.
**Soft fail (fix with one reroll, then accept if it improves):** F1, F2, F5, F7, F8, F9, F14, F16.

---

## 4. Regeneration protocol

1. Generate **4 variations** per hero with the full skeleton + negative.
2. Reject any with a hard fail. Pick the best survivor.
3. If all 4 fail the same way, apply that row's **Fix** and generate 4 more.
4. Max 3 rounds. Still failing? Simplify: fewer armor pieces, tighter framing, plainer background.
5. Upscale the winner only after it passes (upscaling makes smudge worse, never better).
6. Run the **Accept check** below, then save.

## 5. Accept check (all must pass)

- [ ] 200% zoom: hands, eyes, armor edges are crisp.
- [ ] Shrunk to 160 px wide: silhouette and weapon still read.
- [ ] Every band in section 1 is respected.
- [ ] Looks like it belongs next to the heroes already accepted (F15).
- [ ] Bottom quarter is dark enough for white text.
- [ ] No text, no watermark, no real face.

---

## 6. Other game art (same bands, different framing)

| Asset | Size / aspect | Framing | Save to |
| --- | --- | --- | --- |
| Hero portrait | 1024×1280 (4:5) | head to hips | `public/nidus/heroes/<id>.webp` |
| Title / key art | 1536×2048 (3:4) | group or single hero, top-heavy | `public/nidus/title.jpg` |
| Room interior | — | **Not needed.** FORGE / LAB / MINDS are live 3D scenes now. Do not make painted interiors. | — |
| Raid wreck card | 1280×720 (16:9) | derelict ship silhouette in void, gilt-lit | `public/nidus/raid-<id>.jpg` |
| Store feature graphic | 1024×500 | key art, subject left, empty right third for title | `public/store/feature-graphic.png` |

Interiors and wrecks: replace the hero lines in the skeleton with
`wide cinematic environment, gothic cathedral-factory in orbit, industrial iron and gilt, no characters in focus`.
Same negative list.

## 7. Files

- WebP quality 85 (preferred) or JPG quality 88. Hero under 350 KB, interiors under 600 KB.
- Name files exactly as the table says; the game picks them up by name.
- Keep the original full-size export somewhere outside the repo. The repo holds only the final game-size file.
