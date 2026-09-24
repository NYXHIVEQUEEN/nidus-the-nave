# NIDUS: The Nave

Lone hive-brain. Gothic cathedral station. Idle drones. Sentient Command minds.

Owner: **Nytheria Nyx**. Audio: *Rules of Engagement* (Nytheria Nyx). Keep the credit.

**Play the hive** once it is on a host you own. This repo is the game, the PWA, and the Play kit.

## What it is

You are the hive-brain. Raise rooms on the nave. Stamp drones. Seat commanders. Raid wrecks. Leave — the hive still works. Come back and claim the cut.

Single player. Offline honest. **Local save only** (this device). No account. No ads.

## Repo

Canonical: [NYXHIVEQUEEN/nidus-the-nave](https://github.com/NYXHIVEQUEEN/nidus-the-nave)

Store title **NIDUS: The Nave**. In-game title **NIDUS**. Package `com.nyxhivequeen.nidus`.

## Run from source

Needs Node 22.

```
npm install
npm run dev
```

The app listens on port 8080. **CONTINUE** if a hive is bound. **WAKE** if not.

```
npm run build
npm test
```

## Save keys (do not wipe)

- `nidus.save.v3` live hive
- `nidus.save.v3.bak` previous write
- `nidus.save.v3.preimport` the hive as it was before the last IMPORT
- `nidus.slot.v3.0..2` pew copies
- `nidus.prefs.v1` local sliders

NEW HIVE is the only burn. Confirm first. Git never holds a player hive.

## Support

In the hive: SETTINGS → FAQ (answers + a fault report the player copies by hand). Public page: `/support`.
Rules for every agent: `AGENTS.project.md`. Launch gaps: `store/MARKET.md`.

## License

See [LICENSE](LICENSE). Source is here so you can play and inspect. Art, music, and likenesses stay with Nytheria Nyx.

## Play Store

Local save only — no cloud. Host + PWABuilder wrap + listing files:

- [store/RELEASE.md](store/RELEASE.md) — public package checklist
- [store/GITHUB.md](store/GITHUB.md) — host + wrap
- [store/PLAY.md](store/PLAY.md) — Console order
- [store/NAME.md](store/NAME.md) — why the title is NIDUS: The Nave
