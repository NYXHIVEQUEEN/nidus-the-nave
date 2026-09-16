# Public release package

Canonical GitHub repo: **[NYXHIVEQUEEN/nidus-the-nave](https://github.com/NYXHIVEQUEEN/nidus-the-nave)**

Store title: **NIDUS: The Nave**. In-game title stays **NIDUS**.
Package id: `com.nyxhivequeen.nidus`.

`NYXHIVEQUEEN/nidus` is the older private snapshot. Do not split work across both.

## Already in this tree

| Piece | Path |
| --- | --- |
| License | `LICENSE` |
| Privacy | `/privacy` (`src/routes/privacy.tsx`) |
| Terms | `/terms` |
| PWA manifest + icons | `public/manifest.webmanifest`, `public/icons/` |
| Play listing copy | `store/listing.txt` |
| Name check | `store/NAME.md` |
| Data safety | `store/data-safety.json` |
| Content rating notes | `store/content-rating.json` |
| TWA recipe | `store/twa-manifest.json` |
| Feature graphic / shots | `public/store/` |
| Asset links stub | `public/.well-known/assetlinks.json` |
| OG game card | `src/lib/og/site.json` (`type: x:game`) |

Saves are **never** in git. Players keep `nidus.save.v1` in the browser.

## You still do (cannot finish from this chat)

1. A live **https** host you own (Pages, Cloudflare, Vercel, your domain).
2. Paste that host into `store/twa-manifest.json` and Play privacy/terms URLs.
3. After Play App Signing, paste the SHA-256 into `public/.well-known/assetlinks.json`.
4. Play Console: listing, Data safety, IARC, Internal testing `.aab` via PWABuilder.

## GitHub checklist (this pass)

- Repo name: `nidus-the-nave` (not `Nidus-AOS`)
- Description, topics, public visibility
- `LICENSE` + README that a stranger can follow
- A tagged GitHub Release for the source
