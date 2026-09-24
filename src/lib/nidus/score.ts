// Generative ambient pieces for the rotation. Procedural only: they frame the anthem, never replace it.

export type ScoreHandle = { name: ScoreName; stop: (when: number) => void };
export type ScoreName = "nave" | "drift" | "hum";

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const between = (a: number, b: number) => a + Math.random() * (b - a);

const organWaves = new WeakMap<BaseAudioContext, PeriodicWave>();
function organ(ctx: AudioContext) {
  let w = organWaves.get(ctx);
  if (!w) {
    const real = new Float32Array([0, 1, 0.55, 0.32, 0.4, 0.12, 0.18, 0.05, 0.14]);
    w = ctx.createPeriodicWave(real, new Float32Array(real.length));
    organWaves.set(ctx, w);
  }
  return w;
}

export function hallImpulse(ctx: AudioContext, seconds = 3.4): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2.6;
  }
  return buf;
}

type Voice = { osc: AudioScheduledSourceNode[]; stopAt: number };

function envelope(g: GainNode, t: number, peak: number, attack: number, hold: number, release: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.setValueAtTime(peak, t + attack + hold);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
  return t + attack + hold + release;
}

// level brings each piece to roughly half the anthem's loudness (anthem RMS ~0.15).
function piece(ctx: AudioContext, out: AudioNode, hall: AudioNode, wetLevel: number, level: number) {
  const bus = ctx.createGain();
  bus.gain.value = level;
  bus.connect(out);
  const wet = ctx.createGain();
  wet.gain.value = wetLevel;
  bus.connect(wet);
  wet.connect(hall);
  const timers: number[] = [];
  const voices: Voice[] = [];
  const later = (ms: number, fn: () => void): void => {
    timers.push(window.setTimeout(() => (ctx.state === "running" ? fn() : later(ms, fn)), ms));
  };
  const track = (osc: AudioScheduledSourceNode[], stopAt: number) => {
    for (const o of osc) o.stop(stopAt + 0.05);
    voices.push({ osc, stopAt });
    const now = ctx.currentTime;
    for (let i = voices.length - 1; i >= 0; i--) if (voices[i].stopAt < now) voices.splice(i, 1);
  };
  const stop = (when: number) => {
    for (const t of timers) window.clearTimeout(t);
    timers.length = 0;
    bus.gain.cancelScheduledValues(when);
    bus.gain.setValueAtTime(bus.gain.value, when);
    bus.gain.linearRampToValueAtTime(0, when + 2.4);
    for (const v of voices) for (const o of v.osc) {
      try {
        o.stop(when + 2.5);
      } catch {
        /* already stopped */
      }
    }
    window.setTimeout(() => {
      bus.disconnect();
      wet.disconnect();
    }, 3000);
  };
  return { bus, later, track, stop };
}

// Slow cathedral organ progression over a D pedal.
function nave(ctx: AudioContext, out: AudioNode, hall: AudioNode): ScoreHandle {
  const p = piece(ctx, out, hall, 0.55, 1.5);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  lp.Q.value = 0.4;
  lp.connect(p.bus);
  const lfo = ctx.createOscillator();
  const lfoAmt = ctx.createGain();
  lfo.frequency.value = 0.035;
  lfoAmt.gain.value = 380;
  lfo.connect(lfoAmt);
  lfoAmt.connect(lp.frequency);
  lfo.start();
  p.track([lfo], ctx.currentTime + 3600);

  const pedal = ctx.createOscillator();
  const pg = ctx.createGain();
  pedal.type = "sine";
  pedal.frequency.value = midi(26);
  pedal.connect(pg);
  pg.connect(p.bus);
  envelope(pg, ctx.currentTime, 0.1, 6, 3500, 3);
  pedal.start();
  p.track([pedal], ctx.currentTime + 3600);

  const chords = [
    [38, 45, 50, 53, 57],
    [34, 41, 46, 50, 53],
    [36, 43, 48, 51, 55],
    [33, 40, 45, 49, 52],
    [31, 38, 43, 46, 50],
    [35, 42, 47, 50, 54],
  ];
  let last = -1;
  const play = () => {
    let i = Math.floor(Math.random() * chords.length);
    if (i === last) i = (i + 1) % chords.length;
    last = i;
    const t = ctx.currentTime + 0.05;
    const len = between(9, 14);
    const oscs: OscillatorNode[] = [];
    for (const n of chords[i]) {
      const o = ctx.createOscillator();
      o.setPeriodicWave(organ(ctx));
      o.frequency.value = midi(n);
      o.detune.value = between(-7, 7);
      const g = ctx.createGain();
      o.connect(g);
      g.connect(lp);
      const end = envelope(g, t, 0.035, 3.2, len - 3, 4.5);
      o.start(t);
      oscs.push(o);
      p.track([o], end);
    }
    p.later(len * 1000, play);
  };
  play();
  return { name: "nave", stop: p.stop };
}

// Echoing bell tones over a slow-beating drone.
function drift(ctx: AudioContext, out: AudioNode, hall: AudioNode): ScoreHandle {
  const p = piece(ctx, out, hall, 0.7, 2);
  const delay = ctx.createDelay(2);
  delay.delayTime.value = 0.46;
  const fb = ctx.createGain();
  fb.gain.value = 0.42;
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2400;
  delay.connect(tone);
  tone.connect(fb);
  fb.connect(delay);
  tone.connect(p.bus);

  const t0 = ctx.currentTime;
  for (const [n, d] of [
    [26, -4],
    [33, 5],
  ] as const) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = midi(n);
    o.detune.value = d;
    o.connect(g);
    g.connect(p.bus);
    envelope(g, t0, 0.07, 8, 3500, 3);
    o.start(t0);
    p.track([o], t0 + 3600);
  }

  const scale = [62, 65, 67, 69, 72, 74, 77, 79, 81];
  const bell = () => {
    const t = ctx.currentTime + 0.05;
    const n = pick(scale);
    const oscs: OscillatorNode[] = [];
    for (const [ratio, amp] of [
      [1, 0.05],
      [2.76, 0.014],
      [5.4, 0.006],
    ] as const) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = midi(n) * ratio;
      o.connect(g);
      g.connect(p.bus);
      g.connect(delay);
      const end = envelope(g, t, amp, 0.01, 0, ratio === 1 ? 3.6 : 1.4);
      o.start(t);
      oscs.push(o);
      p.track([o], end);
    }
    p.later(between(1800, 5200), bell);
  };
  p.later(2500, bell);
  return { name: "drift", stop: p.stop };
}

// The recorded hum under a slow two-voice choir.
function hum(ctx: AudioContext, out: AudioNode, hall: AudioNode, bed?: AudioBuffer): ScoreHandle {
  const p = piece(ctx, out, hall, 0.6, 2.4);
  if (bed) {
    const src = ctx.createBufferSource();
    src.buffer = bed;
    src.loop = true;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 5);
    src.connect(g);
    g.connect(p.bus);
    src.start();
    p.track([src], ctx.currentTime + 3600);
  }
  const formants = [700, 1150];
  const line = [50, 53, 52, 50, 48, 50, 45, 50];
  let step = 0;
  const sing = () => {
    const t = ctx.currentTime + 0.05;
    const len = between(12, 18);
    const n = line[step++ % line.length];
    for (const shift of [0, -12]) {
      const o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = midi(n + shift);
      const vib = ctx.createOscillator();
      const vg = ctx.createGain();
      vib.frequency.value = between(4.4, 5.4);
      vg.gain.value = 4;
      vib.connect(vg);
      vg.connect(o.detune);
      const g = ctx.createGain();
      for (const f of formants) {
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = f + between(-40, 40);
        bp.Q.value = 7;
        o.connect(bp);
        bp.connect(g);
      }
      g.connect(p.bus);
      const end = envelope(g, t, shift ? 0.05 : 0.08, 4, len - 4, 5);
      o.start(t);
      vib.start(t);
      p.track([o, vib], end);
    }
    p.later(len * 1000, sing);
  };
  sing();
  return { name: "hum", stop: p.stop };
}

export function startScore(ctx: AudioContext, out: AudioNode, hall: AudioNode, opts: { avoid?: ScoreName; hum?: AudioBuffer } = {}): ScoreHandle {
  const names: ScoreName[] = (["nave", "drift", "hum"] as const).filter((n) => n !== opts.avoid);
  const name = pick(names);
  if (name === "nave") return nave(ctx, out, hall);
  if (name === "drift") return drift(ctx, out, hall);
  return hum(ctx, out, hall, opts.hum);
}
