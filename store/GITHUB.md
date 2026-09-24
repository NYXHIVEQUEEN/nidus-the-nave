# GitHub → live hive → Play

Canonical repo:

- [NYXHIVEQUEEN/nidus-the-nave](https://github.com/NYXHIVEQUEEN/nidus-the-nave) — game sources, art, store kit, this web app

Older private snapshot (do not split work): [NYXHIVEQUEEN/nidus](https://github.com/NYXHIVEQUEEN/nidus)

Saves are **never** in git. `nidus.save.v3` lives in the player’s browser.

Public package checklist: `store/RELEASE.md`.

## 1. Host the hive on https

The game must sit at the **root** of its address: `https://nidus.example.com/` or
`https://nidus-the-nave.pages.dev/`. A subfolder such as
`https://nyxhivequeen.github.io/nidus-the-nave/` **will not work**: the art, music,
and offline cache all load from `/nidus/...` and `/assets/...` at the root.

Easiest (free, connects straight to this repo):

| Host | Build command | Output folder | Security headers come from |
| --- | --- | --- | --- |
| Cloudflare Pages | `npm run build` | `dist` | `public/_headers` |
| Netlify | `npm run build` | `dist` | `public/_headers` |
| Vercel | `npm run build` | `dist` | `vercel.json` |

Set Node to **22** in the host's build settings. Deploy from `main` only after the PR is merged.

Selling heroes on Play? Pick **Cloudflare Pages or Vercel**: they also run the purchase check
that stops Google from auto-refunding sales (`store/PRODUCTS.md` → Purchase check).

GitHub Pages works only with a **custom domain** (Settings → Pages → Custom domain,
then Enforce HTTPS) or from a repo named `nyxhivequeen.github.io`. Pages also ignores
`_headers`, so the page falls back to the built-in Content-Security-Policy only.

After it is live, check:

1. `/` plays, `/privacy`, `/terms`, `/support` each open on their own (reload them too).
2. RITE → SAVE → EXPORT downloads a file; IMPORT puts it back.
3. On a phone: SETTINGS → INSTALL HOME adds it to the home screen.

### Browsers that run NIDUS

Chrome / Edge / Android WebView **111+**, Safari / iOS **16.4+**, Firefox **128+**,
Samsung Internet **22+**. Older browsers show a broken layout. Devices without 3D
graphics (WebGL) still play: the rooms show painted art and a "3D OFF" chip instead of
the live scenes.

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
