import { getPrefs, patchPrefs, type MusicBed } from "./view";
import { hallImpulse, startScore, type ScoreHandle, type ScoreName } from "./score";

/** Nytheria Nyx on Spotify — in-hive player cannot stream Spotify, so this is a real door. */
export const NYX_SPOTIFY = "https://open.spotify.com/artist/0h7eXQHwChoJ0FkFqrMQSA";
export const NYX_ANTHEM_SPOTIFY = "https://open.spotify.com/track/5B0hF5OoWMG6AWsASSRtyr";

export type ChimeKind = "print" | "wake" | "surge" | "snap" | "raid" | "dead" | "seat" | "cook" | "claim" | "hit" | "rail" | "cannon" | "ping" | "deny";
export type AmbKind = "idle" | "raid" | "surge" | "wake";

type Slot = { gain: GainNode; src: AudioBufferSourceNode | null; score: ScoreHandle | null };
type Mixer = {
  ctx: AudioContext;
  master: GainNode;
  music: GainNode;
  amb: GainNode;
  sfx: GainNode;
  a: Slot;
  b: Slot;
  live: "a" | "b";
  bed: string;
  buffers: Record<string, AudioBuffer>;
  loading: Promise<void> | null;
  noise: AudioBufferSourceNode | null;
  noiseFilter: BiquadFilterNode | null;
  noiseGain: GainNode | null;
  rumble: OscillatorNode | null;
  rumbleGain: GainNode | null;
  air: OscillatorNode | null;
  airGain: GainNode | null;
  hall: ConvolverNode;
  ambKind: AmbKind;
  tickTimer: number;
  duckUntil: number;
  rot: { phase: "anthem" | "rancid" | "hellfire" | "void"; until: number; last: ScoreName | undefined };
};

// ROTATE: anthem once, then My Rancid Divine, then A Heart of Hellfire, then a short void, then the anthem again.
const SONGS = ["anthem", "rancid", "hellfire"] as const;
const ROTATION = ["anthem", "rancid", "hellfire", "void"] as const;
const AMBIENT_MIN = 80;
const AMBIENT_MAX = 120;

const FADE = 0.9;

function root(): { m: Mixer | null } {
  const g = globalThis as typeof globalThis & { __nidusAudio?: Mixer };
  return {
    get m() {
      return g.__nidusAudio ?? null;
    },
    set m(v: Mixer | null) {
      if (v) g.__nidusAudio = v;
    },
  };
}

const hold = root();

function curve(v: number) {
  return Math.max(0, Math.min(1, v)) ** 2;
}

function applyGains() {
  const m = hold.m;
  if (!m) return;
  const p = getPrefs();
  const mute = p.muted ? 0 : 1;
  const t = m.ctx.currentTime;
  m.master.gain.setTargetAtTime(0.9 * mute, t, 0.05);
  const duck = t < m.duckUntil ? 0.42 : 1;
  m.music.gain.setTargetAtTime(curve(p.music) * 0.62 * duck, t, 0.05);
  m.sfx.gain.setTargetAtTime(curve(p.sfx), t, 0.04);
  const amb = p.muted ? 0 : 0.16 * curve(p.sfx) + 0.1 * curve(p.music);
  m.amb.gain.setTargetAtTime(amb, t, 0.08);
}

export function syncAudioGains() {
  applyGains();
  const p = getPrefs();
  const wanted = wantedBed(p.musicBed);
  if (hold.m && hold.m.bed !== wanted) void fadeTo(wanted);
}

function wantedBed(pref: MusicBed): string {
  const m = hold.m;
  if (m?.ambKind === "raid" && m.buffers.coda) return "coda";
  if (pref === "void" || pref === "anthem" || pref === "rancid" || pref === "hellfire") return pref;
  return m?.rot.phase ?? "anthem";
}

function rotateTick() {
  const m = hold.m;
  if (!m || getPrefs().musicBed !== "rotate" || m.ambKind === "raid") return;
  const t = m.ctx.currentTime;
  if (t < m.rot.until) return;
  const i = ROTATION.indexOf(m.rot.phase as (typeof ROTATION)[number]);
  for (let n = 1; n <= ROTATION.length; n++) {
    const next = ROTATION[(i + n) % ROTATION.length] ?? "anthem";
    if (next !== "void" && !m.buffers[next]) continue;
    if (next === "void") {
      m.rot.phase = "void";
      m.rot.until = t + AMBIENT_MIN + Math.random() * (AMBIENT_MAX - AMBIENT_MIN);
      void fadeTo("void");
      return;
    }
    void fadeTo(next);
    return;
  }
}

export function unlockAudio() {
  if (typeof window === "undefined") return;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  let m = hold.m;
  if (!m) {
    const ctx = new AC({ latencyHint: "interactive" });
    const master = ctx.createGain();
    const music = ctx.createGain();
    const amb = ctx.createGain();
    const sfx = ctx.createGain();
    music.connect(master);
    amb.connect(master);
    sfx.connect(master);
    master.connect(ctx.destination);
    const mkSlot = (): Slot => {
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(music);
      return { gain, src: null, score: null };
    };
    const hall = ctx.createConvolver();
    hall.buffer = hallImpulse(ctx);
    const hallOut = ctx.createGain();
    hallOut.gain.value = 0.5;
    hall.connect(hallOut);
    hallOut.connect(music);
    m = {
      ctx,
      master,
      music,
      amb,
      sfx,
      a: mkSlot(),
      b: mkSlot(),
      live: "a",
      bed: "",
      buffers: {},
      loading: null,
      noise: null,
      noiseFilter: null,
      noiseGain: null,
      rumble: null,
      rumbleGain: null,
      air: null,
      airGain: null,
      hall,
      ambKind: "idle",
      tickTimer: 0,
      duckUntil: 0,
      rot: { phase: "anthem", until: Number.POSITIVE_INFINITY, last: undefined },
    };
    hold.m = m;
    applyGains();
    startStation(m);
  }
  if (m.ctx.state !== "running" && m.ctx.state !== "closed") void m.ctx.resume().catch(() => {});
  if (!m.loading) m.loading = loadBeds(m);
}

async function loadBeds(m: Mixer) {
  const names: Record<string, string> = {
    anthem: "/nidus/rules.mp3",
    rancid: "/nidus/rancid-divine.mp3",
    hellfire: "/nidus/heart-of-hellfire.mp3",
    coda: "/nidus/loop-coda.mp3",
    brk: "/nidus/loop-break.mp3",
    hum: "/nidus/loop-hum.mp3",
  };
  await Promise.all(
    Object.entries(names).map(async ([k, src]) => {
      try {
        const res = await fetch(src);
        const arr = await res.arrayBuffer();
        m.buffers[k] = await m.ctx.decodeAudioData(arr.slice(0));
      } catch {
        /* skip */
      }
    }),
  );
  const wanted = wantedBed(getPrefs().musicBed);
  if (m.bed !== wanted) await fadeTo(wanted);
}

function stopSlot(slot: Slot, when: number) {
  slot.gain.gain.cancelScheduledValues(when);
  slot.gain.gain.setValueAtTime(slot.gain.gain.value, when);
  slot.gain.gain.linearRampToValueAtTime(0, when + FADE);
  const src = slot.src;
  if (src) {
    window.setTimeout(() => {
      try {
        src.stop();
      } catch {
        /* already */
      }
    }, (FADE + 0.05) * 1000);
  }
  slot.src = null;
  slot.score?.stop(when);
  slot.score = null;
}

function playBuffer(slot: Slot, buf: AudioBuffer, when: number, loop = true) {
  const m = hold.m;
  if (!m) return;
  if (slot.src) {
    try {
      slot.src.stop(when);
    } catch {
      /* */
    }
  }
  const src = m.ctx.createBufferSource();
  src.buffer = buf;
  src.loop = loop;
  src.connect(slot.gain);
  src.start(when);
  slot.src = src;
}

async function fadeTo(bed: string) {
  const m = hold.m;
  if (!m) return;
  if (m.bed === bed) return;
  const t = m.ctx.currentTime;
  const next: "a" | "b" = m.live === "a" ? "b" : "a";
  const incoming = m[next];
  const outgoing = m[m.live];
  stopSlot(outgoing, t);
  incoming.gain.gain.cancelScheduledValues(t);
  incoming.gain.gain.setValueAtTime(0, t);
  const ambient = () => {
    if (incoming.src) {
      try {
        incoming.src.stop();
      } catch {
        /* */
      }
      incoming.src = null;
    }
    incoming.score?.stop(t);
    incoming.score = startScore(m.ctx, incoming.gain, m.hall, { avoid: m.rot.last, hum: m.buffers.hum });
    m.rot.last = incoming.score.name;
  };
  if (bed === "void") {
    ambient();
  } else {
    const buf = bed === "coda" ? m.buffers.coda : m.buffers[bed];
    if (!buf) {
      ambient();
      bed = "void";
    } else {
      const once = (SONGS as readonly string[]).includes(bed) && getPrefs().musicBed === "rotate";
      playBuffer(incoming, buf, t, !once);
      if (once) {
        m.rot.phase = bed as "anthem" | "rancid" | "hellfire";
        m.rot.until = t + buf.duration - FADE;
      }
    }
  }
  incoming.gain.gain.linearRampToValueAtTime(1, t + FADE);
  m.live = next;
  m.bed = bed;
}

function startStation(m: Mixer) {
  if (m.noise) return;
  const dur = 2;
  const noiseBuf = m.ctx.createBuffer(1, Math.floor(m.ctx.sampleRate * dur), m.ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    last = last * 0.97 + white * 0.03;
    data[i] = last;
  }
  const src = m.ctx.createBufferSource();
  src.buffer = noiseBuf;
  src.loop = true;
  const filter = m.ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 280;
  filter.Q.value = 0.6;
  const g = m.ctx.createGain();
  g.gain.value = 0.45;
  src.connect(filter);
  filter.connect(g);
  g.connect(m.amb);
  src.start();
  m.noise = src;
  m.noiseFilter = filter;
  m.noiseGain = g;

  const rumble = m.ctx.createOscillator();
  rumble.type = "sine";
  rumble.frequency.value = 36;
  const rg = m.ctx.createGain();
  rg.gain.value = 0.22;
  rumble.connect(rg);
  rg.connect(m.amb);
  rumble.start();
  m.rumble = rumble;
  m.rumbleGain = rg;

  const air = m.ctx.createOscillator();
  air.type = "triangle";
  air.frequency.value = 240;
  const ag = m.ctx.createGain();
  ag.gain.value = 0.04;
  const af = m.ctx.createBiquadFilter();
  af.type = "highpass";
  af.frequency.value = 180;
  air.connect(af);
  af.connect(ag);
  ag.connect(m.amb);
  air.start();
  m.air = air;
  m.airGain = ag;

  if (!m.tickTimer) m.tickTimer = window.setInterval(() => rotateTick(), 1000);
  scheduleSpace(m);
}

type SpaceEvent = (m: Mixer, out: AudioNode) => void;

function spaceOut(m: Mixer): AudioNode {
  // Older Safari has no StereoPanner; fall back to a plain gain so the event still plays centered.
  const pan: AudioNode & { pan?: AudioParam } = typeof m.ctx.createStereoPanner === "function" ? m.ctx.createStereoPanner() : m.ctx.createGain();
  if (pan.pan) pan.pan.value = Math.random() * 1.6 - 0.8;
  const send = m.ctx.createGain();
  send.gain.value = 0.6;
  pan.connect(m.amb);
  pan.connect(send);
  send.connect(m.hall);
  window.setTimeout(() => {
    pan.disconnect();
    send.disconnect();
  }, 9000);
  return pan;
}

function noiseSrc(m: Mixer, seconds: number) {
  const buf = m.ctx.createBuffer(1, Math.floor(m.ctx.sampleRate * seconds), m.ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = m.ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

// Hull under strain: a resonant band sliding through filtered noise.
const creak: SpaceEvent = (m, out) => {
  const t = m.ctx.currentTime;
  const dur = 1.6 + Math.random() * 1.6;
  const src = noiseSrc(m, dur);
  const bp = m.ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 18;
  bp.frequency.setValueAtTime(160 + Math.random() * 120, t);
  bp.frequency.exponentialRampToValueAtTime(70 + Math.random() * 40, t + dur);
  const g = m.ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.55, t + 0.4);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp);
  bp.connect(g);
  g.connect(out);
  src.start(t);
};

// Far comms: a few band-limited chirps, like a voice you cannot read.
const comms: SpaceEvent = (m, out) => {
  const bp = m.ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1600;
  bp.Q.value = 3;
  bp.connect(out);
  const n = 3 + Math.floor(Math.random() * 5);
  for (let i = 0; i < n; i++) {
    const t = m.ctx.currentTime + i * (0.09 + Math.random() * 0.12);
    const o = m.ctx.createOscillator();
    o.type = "square";
    o.frequency.setValueAtTime(700 + Math.random() * 900, t);
    const g = m.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.018, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    o.connect(g);
    g.connect(bp);
    o.start(t);
    o.stop(t + 0.1);
  }
};

// The deep: a slow low groan that swells and falls.
const groan: SpaceEvent = (m, out) => {
  const t = m.ctx.currentTime;
  const dur = 4 + Math.random() * 3;
  const o = m.ctx.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(58 + Math.random() * 20, t);
  o.frequency.exponentialRampToValueAtTime(34 + Math.random() * 8, t + dur);
  const g = m.ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.3, t + dur * 0.4);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(out);
  o.start(t);
  o.stop(t + dur + 0.1);
};

// Debris: a scatter of tiny metal ticks.
const debris: SpaceEvent = (m, out) => {
  const n = 2 + Math.floor(Math.random() * 4);
  for (let i = 0; i < n; i++) {
    const t = m.ctx.currentTime + Math.random() * 0.9;
    const o = m.ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(1800 + Math.random() * 2600, t);
    const g = m.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.03, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    o.connect(g);
    g.connect(out);
    o.start(t);
    o.stop(t + 0.15);
  }
};

// Solar wind: a noise swell with a moving lowpass.
const gust: SpaceEvent = (m, out) => {
  const t = m.ctx.currentTime;
  const dur = 3 + Math.random() * 3;
  const src = noiseSrc(m, dur);
  const lp = m.ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(300, t);
  lp.frequency.exponentialRampToValueAtTime(1400 + Math.random() * 1200, t + dur * 0.5);
  lp.frequency.exponentialRampToValueAtTime(260, t + dur);
  const g = m.ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.16, t + dur * 0.5);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(lp);
  lp.connect(g);
  g.connect(out);
  src.start(t);
};

// A lone hull ping, kept from the old station loop.
const hullPing: SpaceEvent = (m, out) => ping(m, 880 + Math.random() * 420, 0.03, 0.09, out as GainNode);

const SPACE: [SpaceEvent, number][] = [
  [creak, 3],
  [comms, 2],
  [groan, 2],
  [debris, 3],
  [gust, 2],
  [hullPing, 1],
];

function scheduleSpace(m: Mixer) {
  const next = 4500 + Math.random() * 9500;
  window.setTimeout(() => {
    const live = hold.m;
    if (live && !getPrefs().muted && live.ctx.state === "running" && live.ambKind !== "surge") {
      const total = SPACE.reduce((n, [, w]) => n + w, 0);
      let r = Math.random() * total;
      for (const [ev, w] of SPACE) {
        r -= w;
        if (r <= 0) {
          try {
            ev(live, spaceOut(live));
          } catch {
            /* audio optional */
          }
          break;
        }
      }
    }
    scheduleSpace(m);
  }, next);
}

function ping(m: Mixer, freq: number, peak: number, dur: number, bus: GainNode, type: OscillatorType = "triangle") {
  const o = m.ctx.createOscillator();
  const g = m.ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  const t = m.ctx.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(bus);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noiseBurst(m: Mixer, peak: number, dur: number, hp: number) {
  const len = Math.max(0.04, dur);
  const buf = m.ctx.createBuffer(1, Math.floor(m.ctx.sampleRate * len), m.ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = m.ctx.createBufferSource();
  src.buffer = buf;
  const f = m.ctx.createBiquadFilter();
  f.type = "highpass";
  f.frequency.value = hp;
  const g = m.ctx.createGain();
  const t = m.ctx.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f);
  f.connect(g);
  g.connect(m.sfx);
  src.start(t);
}

/** Leaving the app pauses every sound, so the hive never plays from a pocket. */
export function pauseAudio() {
  const m = hold.m;
  if (m?.ctx.state === "running") void m.ctx.suspend().catch(() => {});
}

export function resumeAudio() {
  const m = hold.m;
  if (m && m.ctx.state !== "running" && m.ctx.state !== "closed") void m.ctx.resume().catch(() => {});
  applyGains();
}

export function chime(kind: ChimeKind) {
  const m = hold.m;
  if (!m) return;
  const t = m.ctx.currentTime;
  const table: Record<ChimeKind, { f: number; peak: number; dur: number; noise?: number; hp?: number; type?: OscillatorType }> = {
    print: { f: 196, peak: 0.11, dur: 0.16, noise: 0.08, hp: 900 },
    snap: { f: 330, peak: 0.09, dur: 0.1 },
    wake: { f: 392, peak: 0.14, dur: 0.28, noise: 0.05, hp: 1200 },
    surge: { f: 98, peak: 0.16, dur: 0.42, noise: 0.14, hp: 180, type: "sawtooth" },
    raid: { f: 130, peak: 0.13, dur: 0.32, noise: 0.12, hp: 240 },
    dead: { f: 70, peak: 0.12, dur: 0.4, type: "sawtooth" },
    seat: { f: 262, peak: 0.12, dur: 0.22 },
    cook: { f: 174, peak: 0.1, dur: 0.2, noise: 0.07, hp: 600 },
    claim: { f: 523, peak: 0.13, dur: 0.26 },
    hit: { f: 88, peak: 0.1, dur: 0.12, noise: 0.16, hp: 320, type: "sawtooth" },
    rail: { f: 62, peak: 0.14, dur: 0.18, noise: 0.22, hp: 180, type: "sawtooth" },
    cannon: { f: 140, peak: 0.09, dur: 0.08, noise: 0.14, hp: 520, type: "square" },
    ping: { f: 740, peak: 0.06, dur: 0.07, hp: 1400 },
    deny: { f: 104, peak: 0.07, dur: 0.09, type: "square" },
  };
  const spec = table[kind];
  ping(m, spec.f, spec.peak, spec.dur, m.sfx, spec.type ?? "triangle");
  if (kind === "wake" || kind === "claim" || kind === "seat") ping(m, spec.f * 1.5, spec.peak * 0.45, spec.dur * 0.8, m.sfx);
  if (spec.noise) noiseBurst(m, spec.noise, spec.dur, spec.hp ?? 400);
  if (kind === "surge") {
    m.duckUntil = t + 1.15;
    applyGains();
    window.setTimeout(() => {
      m.duckUntil = 0;
      applyGains();
    }, 1200);
    const brk = m.buffers.brk;
    if (brk) {
      const src = m.ctx.createBufferSource();
      src.buffer = brk;
      const g = m.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      src.connect(g);
      g.connect(m.sfx);
      src.start(t, 0, 1.15);
    }
  }
}

export function setAmbiance(kind: AmbKind) {
  const m = hold.m;
  if (!m) return;
  if (m.ambKind === kind) return;
  m.ambKind = kind;
  const t = m.ctx.currentTime;
  const rumble = kind === "raid" ? 0.55 : kind === "surge" ? 0.7 : kind === "wake" ? 0.32 : 0.22;
  const air = kind === "raid" ? 0.08 : kind === "surge" ? 0.05 : 0.04;
  const noiseF = kind === "raid" ? 520 : kind === "surge" ? 160 : kind === "wake" ? 340 : 280;
  if (m.rumbleGain) m.rumbleGain.gain.setTargetAtTime(rumble, t, 0.25);
  if (m.airGain) m.airGain.gain.setTargetAtTime(air, t, 0.25);
  if (m.noiseFilter) m.noiseFilter.frequency.setTargetAtTime(noiseF, t, 0.3);
  const wanted = wantedBed(getPrefs().musicBed);
  if (m.bed !== wanted) void fadeTo(wanted);
}

export function setMusicBed(bed: MusicBed) {
  patchPrefs({ musicBed: bed });
  syncAudioGains();
}

export function openNyxSpotify() {
  try {
    window.open(NYX_SPOTIFY, "_blank", "noopener,noreferrer");
  } catch {
    window.location.assign(NYX_SPOTIFY);
  }
}
