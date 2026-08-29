import { getPrefs, patchPrefs } from "./view";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicBus: GainNode | null = null;
let sfxBus: GainNode | null = null;
let buffers: Record<string, AudioBuffer> = {};
let musicSrc: AudioBufferSourceNode | null = null;
let humSrc: AudioBufferSourceNode | null = null;
let rumble: OscillatorNode | null = null;
let rumbleGain: GainNode | null = null;
let raidSrc: AudioBufferSourceNode | null = null;
let ambKind = "idle";
let loading: Promise<void> | null = null;

function curve(v: number) {
  return Math.max(0, Math.min(1, v)) ** 2;
}

function applyGains() {
  if (!ctx || !master || !musicBus || !sfxBus) return;
  const p = getPrefs();
  const mute = p.muted ? 0 : 1;
  master.gain.setTargetAtTime(0.9 * mute, ctx.currentTime, 0.05);
  musicBus.gain.setTargetAtTime(curve(p.music) * 0.55, ctx.currentTime, 0.05);
  sfxBus.gain.setTargetAtTime(curve(p.sfx), ctx.currentTime, 0.04);
}

export function syncAudioGains() {
  applyGains();
}

export function unlockAudio() {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!ctx) ctx = new AC({ latencyHint: "interactive" });
  if (ctx.state === "suspended") void ctx.resume();
  if (!master) {
    master = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    musicBus.connect(master);
    sfxBus.connect(master);
    master.connect(ctx.destination);
    applyGains();
  }
  if (!loading) loading = loadBeds();
}

async function loadBeds() {
  if (!ctx) return;
  const names = {
    rules: "/nidus/rules.mp3",
    hum: "/nidus/loop-hum.mp3",
    brk: "/nidus/loop-break.mp3",
    coda: "/nidus/loop-coda.mp3",
  };
  await Promise.all(
    Object.entries(names).map(async ([k, src]) => {
      try {
        const res = await fetch(src);
        const arr = await res.arrayBuffer();
        buffers[k] = await ctx!.decodeAudioData(arr.slice(0));
      } catch {
        /* skip */
      }
    }),
  );
  startLoops();
  startRumble();
}

function startRumble() {
  if (!ctx || rumble || !sfxBus) return;
  rumble = ctx.createOscillator();
  rumble.type = "sine";
  rumble.frequency.value = 38;
  rumbleGain = ctx.createGain();
  rumbleGain.gain.value = 0.03;
  rumble.connect(rumbleGain);
  rumbleGain.connect(sfxBus);
  rumble.start();
}

function startSource(buf: AudioBuffer, bus: GainNode, gain: number, loop: boolean) {
  if (!ctx) return null;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = loop;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(bus);
  src.start();
  return src;
}

function startLoops() {
  if (!ctx || !musicBus) return;
  if (buffers.rules && !musicSrc) musicSrc = startSource(buffers.rules, musicBus, 1, true);
  if (buffers.hum && !humSrc) humSrc = startSource(buffers.hum, musicBus, 0.35, true);
}

export function resumeAudio() {
  if (ctx?.state === "suspended") void ctx.resume();
  applyGains();
}

function grain(kind: "print" | "wake" | "surge" | "snap" | "raid" | "dead") {
  if (!ctx || !sfxBus) return;
  const buf = buffers.brk || buffers.rules || buffers.hum;
  if (buf) {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const dur = kind === "wake" ? 0.9 : kind === "surge" ? 1.4 : 0.22;
    const start = Math.min(buf.duration - dur, Math.random() * Math.max(0.1, buf.duration - dur));
    src.playbackRate.value = kind === "dead" ? 0.7 : kind === "wake" ? 1.05 : 0.92 + Math.random() * 0.18;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(kind === "surge" ? 0.55 : 0.28, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    src.connect(g);
    g.connect(sfxBus);
    src.start(ctx.currentTime, start, dur + 0.05);
  }
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = kind === "dead" ? "sawtooth" : "triangle";
  const freqs = { print: 220, wake: 392, surge: 174, snap: 330, raid: 130, dead: 90 };
  o.frequency.value = freqs[kind];
  g.gain.setValueAtTime(0.0001, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
  o.connect(g);
  g.connect(sfxBus);
  o.start();
  o.stop(ctx.currentTime + 0.22);
}

export function chime(kind: "print" | "wake" | "surge" | "snap" | "raid" | "dead") {
  if (!ctx || !sfxBus) return;
  grain(kind);
  if (kind === "surge" && buffers.brk && musicBus) {
    startSource(buffers.brk, musicBus, 0.85, false);
  }
  if (kind === "raid" && buffers.coda && musicBus) {
    startSource(buffers.coda, musicBus, 0.7, false);
  }
}

export function setAmbiance(kind: "idle" | "raid" | "surge" | "wake") {
  if (!ctx || !rumbleGain || !musicBus) return;
  if (ambKind === kind) return;
  ambKind = kind;
  const now = ctx.currentTime;
  const rumbleLevel = kind === "raid" ? 0.07 : kind === "surge" ? 0.09 : kind === "wake" ? 0.05 : 0.028;
  rumbleGain.gain.setTargetAtTime(rumbleLevel, now, 0.2);
  if (kind === "raid" && buffers.coda && !raidSrc) {
    raidSrc = startSource(buffers.coda, musicBus, 0.45, true);
  }
  if (kind !== "raid" && raidSrc) {
    try {
      raidSrc.stop();
    } catch {
      /* already */
    }
    raidSrc = null;
  }
}

export function setMuted(muted: boolean) {
  patchPrefs({ muted });
  applyGains();
}
