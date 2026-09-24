# In-app products (Play Console)

Create each as a **one-time product** (Monetize → Products → In-app products). Product IDs must match exactly or the court cannot sell or restore them.

| Product ID | Name | Price | Power |
| --- | --- | --- | --- |
| `boost_x2` | Double Tithe (permanent) | $2.99 | 2× ore, parts, spark, cut, offline and raid cut. Not part of the bundle. |
| `sovereign_all` | The Full Court (all 20) | $9.99 | every hero below |
| `hero_vesper` | VESPER — Saint of the Ice Ring | $0.99 | +60% ORE |
| `hero_mora` | MORA — Furnace Abbess | $0.99 | +60% PARTS |
| `hero_ashlar` | ASHLAR — Architect of Ribs | $0.99 | +70% BUILD |
| `hero_narthex` | NARTHEX — Oracle of the Dead Hive | $0.99 | +70% RITES |
| `hero_pyre` | PYRE — Solar Marquise | $0.99 | +55% SPARK |
| `hero_sable` | SABLE — Queen of Tithes | $0.99 | +60% CUT |
| `hero_dirge` | DIRGE — Lancer of the Black Choir | $0.99 | +50% RAID CUT |
| `hero_reliquary` | RELIQUARY — Keeper of Long Nights | $0.99 | +8h OFFLINE |
| `hero_briar` | BRIAR — Rose of the Stamp | $0.99 | -25% PRINT COST |
| `hero_nyxara` | NYXARA — Crown of the Nave | $0.99 | +20% EVERYTHING |
| `hero_cinder` | CINDER — Deep Vein Breaker | $0.99 | +45% ORE |
| `hero_brazier` | BRAZIER — Kiln Sister | $0.99 | +45% PARTS |
| `hero_spire` | SPIRE — Warden of Scaffolds | $0.99 | +50% BUILD |
| `hero_veil` | VEIL — Glass Mind | $0.99 | +50% RITES |
| `hero_halo` | HALO — Choir Conductor | $0.99 | +40% SPARK |
| `hero_tithe` | TITHE — Collector of the Ring | $0.99 | +45% CUT |
| `hero_thorn` | THORN — Wreck Reaver | $0.99 | +40% RAID CUT |
| `hero_matins` | MATINS — Dawn Sentinel | $0.99 | +5h OFFLINE |
| `hero_ossuary` | OSSUARY — Bone Printer | $0.99 | -18% PRINT COST |
| `hero_abbess` | ABBESS — Mother of the Molt | $0.99 | +14% EVERYTHING |

## How purchases work in the game

- The app asks Google Play what the player owns on every launch (Digital Goods API inside the Android app). Owning `sovereign_all` unlocks all 20.
- On the plain website there is no checkout: heroes show **GET ON GOOGLE PLAY** and every hero can still be tried free for 10 minutes once.
- A copy of the Android app installed from your website (sideloaded) cannot buy: Play Billing only works for installs from Google Play. Link your site to the Play listing instead of hosting the file.
- ERASE MY DATA clears the local list; the next launch restores it from Play. RESTORE PURCHASES in the court does the same on demand.

## Test before production (Internal testing track)

1. Add your Google account as a **license tester** (Play Console → Settings → License testing).
2. Buy one hero and the bundle with the test card. Confirm the court shows OWNED and ENTHRONE works.
3. Wait 3 days, then check Order management: the test orders must **not** be auto-refunded. They will be unless the purchase check below is on.
4. Refund one order in the Console, relaunch the app, and confirm that hero leaves the throne.
5. Uninstall, reinstall, and confirm heroes return without buying again.

The web wrapper settings for billing live in `store/twa-manifest.json` (`features.playBilling`).

## Purchase check (required before selling — needs your yes)

Google Play refunds and takes back every purchase that is not **acknowledged** within three days.
The web billing API the game uses has no in-app acknowledge, and the Android wrapper does not do it
either, so a small server step is needed. It is built and **off**:

- `src/server/playAck.ts` — checks the purchase with Google and acknowledges it. Stores nothing.
- `api/ack.ts` (Vercel) and `functions/api/ack.ts` (Cloudflare Pages) — the `/api/ack` address.
- `ACK_URL` in `src/lib/nidus/support.ts` — empty means the game sends nothing.

What turning it on means: after a purchase, the game sends Google's purchase code (not the player's
name, email, or card) to your own site, once. The privacy page adds a "Purchase check" paragraph by
itself when it is on. In Play Console Data safety, declare *Purchase history: collected, processed
ephemerally, not shared, app functionality* (`store/data-safety.json` → `if_purchase_check_on`).

To turn it on (host must be Vercel or Cloudflare Pages; GitHub Pages and Netlify cannot run it):

1. Google Cloud Console → create a project → enable **Google Play Android Developer API**.
2. IAM → Service accounts → create one (no roles needed there) → Keys → Add key → JSON. Keep the file
   off GitHub.
3. Play Console → Users and permissions → Invite the service account email → app `NIDUS` →
   permissions **View financial data** and **Manage orders and subscriptions**.
4. On the host, add encrypted environment variables:
   `PLAY_SA_EMAIL` = `client_email` from the JSON, `PLAY_SA_KEY` = `private_key` from the JSON.
   (`PLAY_PACKAGE` is optional; it defaults to `com.nyxhivequeen.nidus`.)
5. Set `ACK_URL = "/api/ack"` in `src/lib/nidus/support.ts`, merge, deploy.
6. Run the Internal testing purchase test above and confirm step 3 (no refund after 3 days).

The key lives only in the host's secret settings. Never paste it into the repo, a chat, or an issue.

