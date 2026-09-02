# GitHub → live hive → Play

Two repos:

- [NYXHIVEQUEEN/nidus](https://github.com/NYXHIVEQUEEN/nidus) — game sources, art, store kit
- [NYXHIVEQUEEN/Nidus-AOS](https://github.com/NYXHIVEQUEEN/Nidus-AOS) — the running web app

Saves are **never** in git. `nidus.save.v1` lives in the player’s browser.

## 1. Host the hive on https

Play will not wrap a grok preview. Put AOS (or a static export) on a host you own.

GitHub Pages (static nidus tree):

1. Repo Settings → Pages → Deploy from branch `main` / `/ (root)` or `/docs`.
2. Wait for `https://nyxhivequeen.github.io/nidus/` (or the custom domain).
3. Privacy must open at `/privacy` or `/privacy.html`.

Custom domain: add a CNAME, then turn on HTTPS.

## 2. Wrap for Play (no Android Studio required)

1. Open [PWABuilder](https://www.pwabuilder.com)
2. Paste the https URL
3. Android → package id `com.nyxhivequeen.nidus`
4. App name `NIDUS: The Nave`
5. Download the `.aab`
6. Upload to Play Console → Internal testing

Target API 36. TWA recipe: `store/twa-manifest.json`.

After Play App Signing, paste the SHA-256 into `public/.well-known/assetlinks.json` and push. If you skip this, Android shows a URL bar on the nave.

## 3. Listing files in this repo

| File | Use |
| --- | --- |
| `store/listing.txt` | Name, short, full blurb |
| `store/NAME.md` | Why the title is `NIDUS: The Nave` |
| `store/data-safety.json` | Play Data safety: collect nothing |
| `store/content-rating.json` | IARC notes |
| `store/PLAY.md` | Console order of operations |
| `public/store/icon-512.png` | High-res icon |
| `public/store/feature-graphic.png` | 1024×500 |
| `public/store/shot-*.png` | Phone screenshots |

## 4. Local save (say it loud)

The hive does not sync. Players who uninstall, switch phones, or clear site data lose the nave unless they EXPORT. That is on purpose. WAKE says **LOCAL SAVE · THIS DEVICE**. RITE → SAVE has EXPORT / STASH / IMPORT. Do not add a cloud login to “fix” reviews — add a clearer EXPORT.

## 5. What git is for

Push sources and the store kit. Never commit `localStorage`. Never force-push `main`. After a green hive, snapshot and push; that is the build.
