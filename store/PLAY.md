# NIDUS → Google Play

GitHub steps (host + wrap + listing files) live in `store/GITHUB.md`.
Name check lives in `store/NAME.md`. Ship the store title as **NIDUS: The Nave**.


You cannot finish Play from this chat. You need: a Play developer account, a live **https** host you control, and one afternoon in [Play Console](https://play.google.com/console).

## Already in the hive

- Privacy at `/privacy` (Play will refuse without a public policy URL)
- Terms at `/terms`
- Support at `/support` + in-game SETTINGS → FAQ with a fault report
- PWA manifest + icons + feature graphic
- Data-safety answers: `store/data-safety.json`
- Content-rating notes: `store/content-rating.json`
- Listing copy: `store/listing.txt`
- TWA recipe: `store/twa-manifest.json`
- Legal links in RITE → PRIVACY / TERMS
- No ads, no account, no cloud. Save stays on the device.

## You still do

1. **Play developer account**  
   [play.google.com/console](https://play.google.com/console) — one-time $25, identity check (Google is tightening this in 2026). Use a mail you read. Developer name: Nytheria Nyx.

2. **A real https address**  
   Put the hive on a host you own, at the **root** of the address (see `store/GITHUB.md` §1: Cloudflare Pages, Netlify, Vercel, or GitHub Pages with a custom domain). Example: `https://nidus.yourdomain`. Privacy must be reachable at `https://that-host/privacy`.

3. **Wrap it**  
   Easiest: [PWABuilder](https://www.pwabuilder.com) → paste your https URL → Android package → **All settings → turn on Google Play Billing** → download the `.aab`. Without that switch the court cannot sell.  
   Or Bubblewrap with `store/twa-manifest.json` (replace the host; Play Billing is already on there).  
   Package name: `com.nyxhivequeen.nidus`.  
   Target API **36** (Android 16) — required for new apps from 31 Aug 2026.  
   16 KB page size: a TWA/PWABuilder package already complies if you take a current Android Gradle.

4. **Digital Asset Links**  
   After Play App Signing, copy the SHA-256 from Console → Setup → App signing. Put it in `public/.well-known/assetlinks.json` replacing `REPLACE_WITH_PLAY_APP_SIGNING_SHA256`. Redeploy. If this file is wrong, Android shows a URL bar on top of the hive.

5. **Listing**  
   Paste `store/listing.txt`. Upload `public/store/icon-512.png`, `public/store/feature-graphic.png`, and the `shot-*.png` phone captures. Privacy URL = `https://YOUR-HOST/privacy`.

6. **Data safety**  
   Console → App content → Data safety. Copy `store/data-safety.json`: we collect nothing. Users can wipe with NEW HIVE.

7. **Content rating**  
   Run the IARC form. Use `store/content-rating.json`. Target Mature 17+ / PEGI 16 — armored adult heroines, fantasy violence, in-app purchases, no nudity, no chat.

8. **Testing track**  
   Upload the `.aab` to Internal testing first. Install from the test link on a phone. Confirm: no URL bar, WAKE works, save survives leaving the app, song does not stack, PRIVACY opens. Then run the purchase test in `store/PRODUCTS.md` (license tester, one hero, the bundle, Double Tithe, RESTORE).

9. **Production**  
   When the test hive feels like the nave, promote to Production. Review takes days, not minutes.

## Do not

- Do not upload a debug APK.
- Do not put her face as the small icon (the gilt N is the mark; keyart is the feature graphic).
- Do not add ads. Any new paid item: add it to `store/PRODUCTS.md`, privacy, terms, and data safety first.
- Do not wipe player saves to “ship 1.0”.

## Money

The court sells through Play Billing inside the Android package only: 20 heroes at $0.99, all 20 for $9.99, Double Tithe for $2.99. Product IDs and the test plan live in `store/PRODUCTS.md`. The plain website cannot sell; there every hero has a free 10-minute trial and a GET ON GOOGLE PLAY note.
