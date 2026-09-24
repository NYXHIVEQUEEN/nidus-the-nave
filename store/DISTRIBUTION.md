# Where NIDUS can ship — store-by-store (checked 24 Sep 2026)

One codebase, one web build (`npm run build` → `dist/`). Every store below wraps that same build.
Money, pricing, and anything public under the owner's name stay the owner's decision.

## Summary

| Store | Status | Payments | Store cut | Effort left |
| --- | --- | --- | --- | --- |
| **Your website** (Cloudflare Pages / Vercel) | Ready | none (free play + 10-min hero trials) | 0% | Host it (`store/GITHUB.md`) |
| **Google Play** (Android phones/tablets) | Ready to wrap | Play Billing (built) | 10% + 5% billing fee on first $1M/yr (US/UK/EEA since 30 Jun 2026) | Purchase check needs owner's yes + key; Play Console setup |
| **Microsoft Store** (Windows 10/11) | Ready to wrap | Microsoft Store billing (built this pass) | 12% for games | Free individual account; PWABuilder → Windows package; add-ons in Partner Center |
| **Steam** (Windows/Mac/Linux/Steam Deck) | Not started | Steam DLC / microtransactions | 30% (first $10M) + $100 per app, refunded after $1,000 | Desktop wrapper (Tauri or Electron) + Steamworks |
| **Amazon Appstore** (Fire tablets / Fire TV only) | Not started | Amazon In-App Purchasing (required) | 20% under $1M/yr (Small Business program) | Separate build with Amazon IAP |
| **Apple App Store** (iPhone/iPad) | Not started | StoreKit (required) | 15% under $1M/yr (Small Business program) | Native wrapper (Capacitor) + StoreKit; web-wrapper rejection risk |
| **itch.io** (web/desktop) | Ready | pay-what-you-want / fixed price | you choose (default 10%) | Upload `dist/` as an HTML game |

Amazon closed its app store on **regular Android phones on 20 Aug 2025**; it lives on only on Fire tablets and Fire TV.

## Google Play — Android (first)

Already in the repo: TWA recipe (`store/twa-manifest.json`, Play Billing on), Data safety, IARC notes, listing copy,
privacy/terms/support pages, asset links stub, adaptive 3D sharpness, offline cache, install flow.

1. Host at a domain root (`store/GITHUB.md`).
2. **Say yes to the purchase check** and add the Play service key (`store/PRODUCTS.md`). Without it Google refunds every sale after 3 days.
3. PWABuilder → Android → turn on Google Play Billing → `.aab` → Internal testing.
4. Create the 22 in-app products with the exact IDs in `store/PRODUCTS.md`.
5. Paste the Play App Signing SHA-256 into `public/.well-known/assetlinks.json`.
6. Screenshots: `store/screenshots/phone-*.jpg` (1080×1920). Feature graphic: `public/store/feature-graphic.png`.

## Microsoft Store — Windows (cheap second)

New this pass: the game detects the Microsoft Store and sells through it with the **same product IDs**;
the desktop layout keeps the HUD in a readable column over the full-screen nave; the web manifest has wide screenshots.

1. Partner Center account (free for individuals since June 2025).
2. Reserve the name **NIDUS: The Nave**.
3. PWABuilder → paste the https URL → **Windows** → download the package → upload it.
4. Create durable add-ons whose **Product ID** equals each SKU (`hero_vesper` … `sovereign_all`, `boost_x2`) with the same prices.
5. Screenshots: `store/screenshots/wide-*.png` (1920×1080).
6. Age rating: the Store runs IARC too; reuse `store/content-rating.json`.
7. Test a purchase with a test account; heroes should show OWNED after relaunch.

Microsoft Store durables need no acknowledgement; the purchase check is Google-only.

## Steam — PC idle players (biggest upside, most work)

Why: idle games sell on Steam (IdleOn passed $22M; Rusty's Retirement passed $4.5M on ~880K copies, per AppMagic).
Steam players expect a desktop-first layout (now in place), keyboard shortcuts (1–5 switch tabs; S, P, C, W, H, U already work),
achievements, and **cloud saves** (fixes the "local save only" weakness on PC).

Build plan (CTO estimate: 1–2 focused weeks):
1. Wrap `dist/` in Tauri (small download) or Electron (simplest Steamworks bindings).
2. Steamworks: achievements, Steam Cloud for `nidus.save.v3`, overlay.
3. Sell heroes as DLC (or a premium price that includes the full court — owner's call).
4. Store page + trailer + a free demo for **Steam Next Fest**.

## Amazon Appstore — Fire tablets (optional)

Fire tablets have no Chrome, so the Play build won't sell there. It needs its own build:
a WebView wrapper plus Amazon In-App Purchasing (Amazon's older web IAP library loads from an http script host,
which the current Content-Security-Policy blocks on purpose). Fire tablets run WebGL fine; Fire OS 7 WebViews may be
older than Chrome 111, the game's browser floor, so test on a Fire OS 8 device. Recommendation: defer until Play shows traction.

## Apple App Store — iPhone/iPad (later)

Pure web wrappers are often rejected under guideline 4.2 (minimum functionality). A native Capacitor shell with
StoreKit purchases, haptics, and offline play is the usual path. Players on iPhone can already play free on the website
and "Add to Home Screen".

## Platform checks run this pass

Production build, Chromium, no page/console/CSP errors, no sideways scroll at:
360×740 and 412×915 (Android phones), 800×1280 and 1280×800 (Fire tablets), 1366×768 and 1920×1080 (Windows).
Fixes: HUD column capped at 52rem on wide screens; larger type on tablets and desktops; the court shows 4 heroes per row on
desktop; the bottom sheet hides behind the court on phones; officer cards frame the face; 3D sharpness adapts to frame rate.
Not verified: real Fire tablet, real Windows Store install, real Steam build.
