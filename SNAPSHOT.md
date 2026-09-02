# NIDUS snapshot — 2026-09-01 audio mixer

GitHub: `NYXHIVEQUEEN/nidus` `main` (audio pass on density `0b8312f`).
**No hive wipe.**

## Audio
- The anthem was stacking on its own hum stem + grain-sampling itself on every tap. Mixer is now a singleton (`__nidusAudio`).
- **One music bed.** 900ms crossfade. ANTHEM = Rules of Engagement — Nytheria Nyx. RAID may crossfade to her coda stem, then back. Never two copies of the song.
- **VOID** = procedural space pad (not stock replacing her) until more Nyx cuts.
- Station amb (air, rumble, hull ticks) lives on its own bus. Tap SFX are synth + noise, not slices of the anthem.
- SURGE ducks the bed instead of layering another mix.
- RITE → LOCAL: ANTHEM / VOID + **NYX ON SPOTIFY** (artist door: `open.spotify.com/artist/0h7eXQHwChoJ0FkFqrMQSA`). Spotify cannot stream inside the nave.
- Unlock still on first gesture. No autoplay before WAKE.

Playtest: printed 17, ore held, mixer live, ANTHEM/VOID/SPOTIFY present, no pageerrors, typecheck clean.
