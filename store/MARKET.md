# NIDUS — launch gaps (market audit, 24 Sep 2026)

What a paying player expects from an idle game on Play, measured against this
build. Checked boxes are done in the tree. Unchecked boxes marked **QUEEN** are
decisions only Nytheria Nyx can make.

## Closed this pass

- [x] In-game help: SETTINGS → FAQ answers the six most common tickets
      (lost hive, no sound, slow phone, idle earnings, bad import, install).
- [x] Fault report the player copies by hand: build, rough hive size, screen, browser.
      Never the hive name. Nothing is sent automatically.
- [x] Public `/support` page for the store listing's support URL.
- [x] Import cannot burn a hive: non-hive files are refused with a clear
      message, oversized files are refused, and the live hive is kept under
      `nidus.save.v3.preimport` before any import.
- [x] A missing main save now loads from `.bak` instead of starting fresh.
- [x] Version shown in-game (`APP_VERSION` in `src/lib/nidus/support.ts`).
- [x] Team and security rules for every agent: `AGENTS.project.md`.
- [x] Docs named the wrong save keys (`v1`). Fixed to the real `v3` keys.

## Must before launch

- [ ] **QUEEN — support inbox.** Pick a mail you will read (ideally a new one,
      not your personal inbox, since it becomes public). Put it in
      `SUPPORT_EMAIL`. Until then the FAQ button opens a GitHub issue, which
      needs a GitHub account and is public. Most players will not do that.
- [ ] **QUEEN — money model.** Pick one:
      1. *Premium* (one price, e.g. $2.99–$4.99). No code change, privacy stays
         "collect nothing", fits "no ads". Lowest risk. Fewer downloads.
      2. *Free + supporter pack / cosmetics* through Play Billing. More
         downloads. Needs Digital Goods API work, a restore-purchase button,
         and privacy + data-safety updates.
      3. *Free + ads.* Breaks the "no ads" promise on the listing. Not advised.
- [ ] **QUEEN — private files in a public repo.** `attachments/` (33 MB of
      reference photos + the WAV master) and `artifacts/` (zips, generated
      images) are committed. If any are personal, they must leave the repo
      *and* its history. That is a destructive history rewrite; do it only
      on your word.
- [ ] `.vercel/output/` build files (88) are committed. Untrack and ignore them.
- [ ] Live https host + `assetlinks.json` SHA-256 (see `store/PLAY.md`).
- [ ] Test on a real mid-range Android phone: 30+ FPS, no heat, save survives
      force-close and reboot. `store/QUALITY.md` lists this as unverified.
- [ ] Bump `APP_VERSION` and `appVersionCode` in `store/twa-manifest.json`
      together on every store upload.
- [ ] 8 Grok platform tests (`scripts/grok-pwa*`) fail. They are not game
      code, but check the share card and install page before launch.

## Should, first update after launch

- **Achievements** (local trophies: first raid, first molt, 100 prints…). The
  top retention hook in idle games. Pure game code, no data collected.
- **Rate prompt.** A quiet "rate the nave" link after a few hours of play.
  A TWA has no in-app review sheet, so it opens the store page.
- **Community door.** A Discord or subreddit link next to FAQ. Player-to-player
  help lowers support load.
- **Crash screen report.** Add COPY REPORT to the error screen so a crash
  still yields a report.
- **Accessibility.** Screen-reader labels on stat chips, a colour-blind check
  of venom-green vs blood-red status, and a larger-text option beyond UI SCALE.

## Could, growth

- **Languages.** English only today. The terse UI translates cheaply. Top idle
  markets after EN: PT-BR, ES, DE, JA, KO.
- **More storefronts.** itch.io takes the web build as-is (paid or
  pay-what-you-want). Steam needs a desktop wrapper and Steamworks.
- **Cross-device move.** EXPORT / COPY JSON already works. A short transfer
  code or QR would make phone-to-phone moves easy, with no cloud account.
- **Return reminders.** Web push needs a server and permission. It goes
  against "collect nothing". Skip unless the model changes.

## Never (brand promises on the listing)

No ads SDK without a yes. No account wall. No analytics that identify players.
No gacha for money. No wipe to "ship 1.0".
