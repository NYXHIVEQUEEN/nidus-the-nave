# NIDUS snapshot — 2026-09-01 offline fallback + spine tick

GitHub: `NYXHIVEQUEEN/nidus` `main`.
**No hive wipe.**

- Spine complete no longer blows the tick or the wake roll.
- Net: try 2.8s then cache. Fonts ship local. Hull error bound.
- Offline uses the **same** rates as online. No extra cut for being on wifi.

Tests: 20 persist pass. Playtest: hive held through offline, no pageerrors.
