import { getPrefs, patchPrefs, type MusicBed } from "./view";

/** Nytheria Nyx on Spotify — in-hive player cannot stream Spotify, so this is a real door. */
export const NYX_SPOTIFY = "https://open.spotify.com/artist/0h7eXQHwChoJ0FkFqrMQSA";
export const NYX_ANTHEM_SPOTIFY = "https://open.spotify.com/track/5B0hF5OoWMG6AWsASSRtyr";

export type ChimeKind = "print" | "wake" | "surge" | "snap" | "raid" | "dead" | "seat" | "cook" | "claim";
export type AmbKind = "idle" | "raid" | "surge" | "wake";

type Slot = { gain: GainNode; src: AudioBufferSourceNode | null; voidGain: GainNode | null };
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
  voidOsc: OscillatorNode[];
  voidGain: GainNode | null;
  ambKind: AmbKind;
  tickTimer: number;
  duckUntil: number;
};

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

function now() {
  return hold.m?.ctx.currentTime ?? 0;
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
  return pref === "void" ? "void" : "anthem";
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
      return { gain, src: null, voidGain: null };
    };
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
      voidOsc: [],
      voidGain: null,
      ambKind: "idle",
      tickTimer: 0,
      duckUntil: 0,
    };
    hold.m = m;
    applyGains();
    startStation(m);
  }
  if (m.ctx.state === "suspended") void m.ctx.resume();
  if (!m.loading) m.loading = loadBeds(m);
}

async function loadBeds(m: Mixer) {
  const names: Record<string, string> = {
    anthem: "/nidus/rules.mp3",
    coda: "/nidus/loop-coda.mp3",
    brk: "/nidus/loop-break.mp3",
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
}

function playBuffer(slot: Slot, buf: AudioBuffer, when: number) {
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
  src.loop = true;
  src.connect(slot.gain);
  src.start(when);
  slot.src = src;
}

function attachVoid(slot: Slot) {
  const m = hold.m;
  if (!m) return;
  if (!m.voidGain) {
    const g = m.ctx.createGain();
    g.gain.value = 1;
    const o1 = m.ctx.createOscillator();
    const o2 = m.ctx.createOscillator();
    const o3 = m.ctx.createOscillator();
    o1.type = "sine";
    o2.type = "triangle";
    o3.type = "sine";
    o1.frequency.value = 55;
    o2.frequency.value = 82.4;
    o3.frequency.value = 110;
    o1.detune.value = -6;
    o2.detune.value = 9;
    const f = m.ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 420;
    f.Q.value = 0.7;
    const og = m.ctx.createGain();
    og.gain.value = 0.22;
    o1.connect(og);
    o2.connect(og);
    o3.connect(og);
    og.connect(f);
    f.connect(g);
    o1.start();
    o2.start();
    o3.start();
    m.voidOsc = [o1, o2, o3];
    m.voidGain = g;
  }
  try {
    m.voidGain.disconnect();
  } catch {
    /* not connected */
  }
  m.voidGain.connect(slot.gain);
  slot.voidGain = m.voidGain;
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
  if (bed === "void") {
    if (incoming.src) {
      try {
        incoming.src.stop();
      } catch {
        /* */
      }
      incoming.src = null;
    }
    attachVoid(incoming);
  } else {
    const buf = bed === "coda" ? m.buffers.coda : m.buffers.anthem;
    if (!buf) {
      attachVoid(incoming);
      bed = "void";
    } else {
      playBuffer(incoming, buf, t);
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

  if (!m.tickTimer) m.tickTimer = window.setInterval(() => hullTick(), 3800);
}

function hullTick() {
  const m = hold.m;
  if (!m || getPrefs().muted) return;
  if (m.ambKind === "surge") return;
  ping(m, 880 + Math.random() * 420, 0.035, 0.09, m.amb);
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

export function resumeAudio() {
  const m = hold.m;
  if (m?.ctx.state === "suspended") void m.ctx.resume();
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

export function setMuted(muted: boolean) {
  patchPrefs({ muted });
  applyGains();
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
