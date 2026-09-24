import { useEffect, useRef, useState } from "react";
import { getPrefs, patchPrefs } from "@/lib/nidus/view";

const LOGO = "/nidus/studio-logo.webp";

// One full-screen quad. The logo forges out of embers, holds, then burns and melts into ash.
const VERT = `attribute vec2 p; varying vec2 v; void main(){ v = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `precision mediump float;
varying vec2 v;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uTime;
uniform float uIn;
uniform float uOut;
uniform float uFire;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) { float a = 0.5; float s = 0.0; for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; } return s; }
vec3 fireRamp(float t) {
  vec3 c = mix(vec3(0.22, 0.02, 0.0), vec3(0.86, 0.18, 0.03), smoothstep(0.0, 0.45, t));
  c = mix(c, vec3(1.0, 0.56, 0.12), smoothstep(0.45, 0.8, t));
  return mix(c, vec3(1.0, 0.9, 0.62), smoothstep(0.8, 1.0, t));
}
// Drifting specks: embers (small, hot) or ash (larger, grey), one per lit grid cell.
float specks(vec2 uv, float scale, float rise, float sway, float fill) {
  uv.y -= uTime * rise;
  uv.x += sin(uv.y * 3.1 + uTime * 0.8) * sway;
  vec2 g = uv * scale; vec2 id = floor(g); vec2 f = fract(g) - 0.5;
  float h = hash(id);
  vec2 o = vec2(hash(id + 1.3) - 0.5, hash(id + 7.1) - 0.5) * 0.6;
  float size = 0.07 + 0.09 * hash(id + 3.7);
  float twinkle = 0.55 + 0.45 * sin(uTime * 7.0 + h * 40.0);
  return step(1.0 - fill, h) * smoothstep(size, 0.0, length(f - o)) * twinkle;
}

void main() {
  vec2 px = v * uRes;
  float side = min(uRes.x, uRes.y) * 0.8;
  vec2 luv = (px - uRes * vec2(0.5, 0.54)) / side + 0.5;
  float n = fbm(luv * 5.0 + vec2(0.0, -uTime * 0.18));

  // Melt: as it burns, columns of the logo sag and drip downward.
  float drip = uOut * uOut * (0.22 * fbm(vec2(luv.x * 7.0, 2.3)) + 0.04);
  vec2 suv = vec2(luv.x, luv.y + drip);
  vec4 logo = vec4(0.0);
  if (suv.x > 0.0 && suv.x < 1.0 && suv.y > 0.0 && suv.y < 1.0) logo = texture2D(uTex, vec2(suv.x, 1.0 - suv.y));

  // Forge in: revealed from the heart outward through noise; the fresh edge runs white-hot.
  float rv = uIn * 1.5 - (n * 0.75 + length(luv - 0.5) * 0.75);
  float vis = smoothstep(0.0, 0.03, rv);
  float forge = step(0.0, rv) * smoothstep(0.16, 0.0, rv);
  // Burn out: a glowing front climbs from the base, leaves ash, then nothing.
  float b = uOut * 1.65 - (luv.y * 0.9 + n * 0.6);
  float front = smoothstep(-0.12, 0.0, b) * (1.0 - step(0.0, b));
  float ash = step(0.0, b) * (1.0 - smoothstep(0.03, 0.15, b));
  vis *= 1.0 - smoothstep(0.1, 0.15, b);

  vec3 col = logo.rgb;
  float red = clamp(logo.r - max(logo.g, logo.b), 0.0, 1.0);
  col += vec3(1.0, 0.22, 0.08) * red * (0.55 + 0.45 * sin(uTime * 8.0 + n * 7.0)) * 0.7 * uIn * (1.0 - uOut);
  float hot = smoothstep(0.55, 0.9, noise(luv * 38.0 + vec2(0.0, uTime * 1.5))) * (1.0 - smoothstep(0.02, 0.11, b));
  col = mix(col, vec3(0.13, 0.12, 0.11) * (0.55 + n), ash);
  col += vec3(1.0, 0.35, 0.08) * hot * ash * 0.9;
  col += fireRamp(forge * 0.95) * forge * 1.3;
  col += fireRamp(front * 0.85) * front * 1.25;
  float a = logo.a * vis;

  vec3 base = vec3(0.047, 0.039, 0.035) * (1.0 - 0.55 * length(v - 0.5));
  // Flames licking up from below, strongest while forging and burning.
  float aspect = uRes.x / uRes.y;
  float f = fbm(vec2(v.x * aspect * 3.2, v.y * 2.4 - uTime * 1.7));
  float flame = clamp((f - 0.28) * 2.4 - v.y * 2.0, 0.0, 1.0) * uFire;
  base += fireRamp(flame * 0.85) * flame * 0.9;
  // Heat on the burning edge of the logo itself.
  float tongue = clamp(fbm(vec2(luv.x * 9.0, luv.y * 5.0 - uTime * 2.4)) * 1.6 - 0.55, 0.0, 1.0) * smoothstep(-0.3, -0.02, b) * (1.0 - step(0.0, b)) * step(0.001, uOut) * logo.a;
  base += fireRamp(tongue * 0.9) * tongue * 1.1;

  vec3 outc = mix(base, col, a);
  vec2 suvS = vec2(v.x * aspect, v.y);
  float embers = specks(suvS, 14.0, 0.22, 0.04, 0.16) * (uFire * 0.9 + 0.12);
  float ashes = specks(suvS + 3.1, 8.0, 0.09, 0.09, 0.2) * uOut;
  outc += vec3(1.0, 0.5, 0.14) * embers * 1.4;
  outc += vec3(0.42, 0.4, 0.38) * ashes * (1.0 - uOut * 0.4);
  gl_FragColor = vec4(outc, 1.0);
}`;

type Timing = { pre: number; intro: number; hold: number; outro: number; fade: number };
// First viewing is a rite: forge, hold, slow burn, then a long dissolve.
// A return is the same shape, a little shorter. Tap still skips.
const FIRST: Timing = { pre: 600, intro: 3200, hold: 2400, outro: 3600, fade: 2600 };
const AGAIN: Timing = { pre: 400, intro: 2200, hold: 1800, outro: 2800, fade: 2600 };

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null;
}

function reducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** Nytheria Nyx studio splash. Plays over the title while the hive loads; any tap skips ahead. */
export function StudioSplash({ onDone }: { onDone: () => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const skip = useRef<() => void>(() => {});
  const [mode, setMode] = useState<"gl" | "css" | "calm">(() => (reducedMotion() ? "calm" : "gl"));
  const [fading, setFading] = useState(false);
  const [hint, setHint] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const timing = getPrefs().splashSeen ? AGAIN : FIRST;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      patchPrefs({ splashSeen: true });
      done.current();
    };
    const hintTimer = window.setTimeout(() => setHint(true), 2400);
    if (mode !== "gl") {
      // No shader: the same slow forge and dissolve, still skippable.
      const span = mode === "calm" ? 2200 : timing.pre + timing.intro + timing.hold + timing.outro + timing.fade;
      const t1 = window.setTimeout(() => setFading(true), span - timing.fade);
      const t2 = window.setTimeout(finish, span);
      skip.current = () => {
        setFading(true);
        window.clearTimeout(t1);
        window.clearTimeout(t2);
        window.setTimeout(finish, 1100);
      };
      return () => {
        window.clearTimeout(hintTimer);
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }

    // A fresh canvas per run: a context lost in cleanup can never be reused.
    const el = document.createElement("canvas");
    el.className = "h-full w-full";
    stage.current?.appendChild(el);
    const gl = el.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false, powerPreference: "low-power" }) as WebGLRenderingContext | null;
    const vs = gl && compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = gl && compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl && vs && fs ? gl.createProgram() : null;
    if (gl && prog && vs && fs) {
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
    }
    if (!gl || !prog || !gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      window.clearTimeout(hintTimer);
      el.remove();
      setMode("css");
      return;
    }

    let raf = 0;
    let alive = true;
    let start = 0;
    let outAt = Number.POSITIVE_INFINITY;
    let outSpeed = 1;
    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uRes = u("uRes");
    const uTime = u("uTime");
    const uIn = u("uIn");
    const uOut = u("uOut");
    const uFire = u("uFire");
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture();

    const size = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      el.width = Math.round(el.clientWidth * dpr);
      el.height = Math.round(el.clientHeight * dpr);
      gl.viewport(0, 0, el.width, el.height);
    };
    size();
    window.addEventListener("resize", size);

    const frame = (now: number) => {
      if (!alive) return;
      if (!start) start = now;
      const t = now - start;
      const inEnd = timing.pre + timing.intro;
      const holdEnd = inEnd + timing.hold;
      if (t >= holdEnd && outAt === Number.POSITIVE_INFINITY) outAt = holdEnd;
      const k = ease((t - timing.pre) / timing.intro);
      const o = outAt === Number.POSITIVE_INFINITY ? 0 : Math.min(1, ((t - outAt) * outSpeed) / timing.outro);
      const fire = Math.max(0.35 * (1 - k) * Math.min(1, t / 400), Math.sin(Math.PI * Math.min(1, k * 1.2)) * 0.55, o > 0 ? Math.sin(Math.PI * Math.min(1, o * 1.1)) * 0.8 : 0);
      gl.uniform2f(uRes, el.width, el.height);
      gl.uniform1f(uTime, t / 1000);
      gl.uniform1f(uIn, k);
      gl.uniform1f(uOut, ease(o));
      gl.uniform1f(uFire, fire);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (o >= 1) {
        alive = false;
        setFading(true);
        window.setTimeout(finish, timing.fade);
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    skip.current = () => {
      if (!start) return;
      const t = performance.now() - start;
      if (outAt === Number.POSITIVE_INFINITY) {
        outAt = t;
        outSpeed = 1.6;
      } else outSpeed = 3;
    };

    const img = new Image();
    // A slow first download never holds the player at the splash.
    const giveUp = window.setTimeout(() => {
      if (!start) {
        alive = false;
        finish();
      }
    }, 2500);
    img.onload = () => {
      window.clearTimeout(giveUp);
      if (!alive) return;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      raf = requestAnimationFrame(frame);
    };
    img.onerror = () => {
      window.clearTimeout(giveUp);
      alive = false;
      finish();
    };
    img.src = LOGO;

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(giveUp);
      window.clearTimeout(hintTimer);
      window.removeEventListener("resize", size);
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      el.remove();
    };
  }, [mode]);

  return (
    <div
      role="img"
      aria-label="Nytheria Nyx"
      className={`fixed inset-0 z-[100] cursor-pointer bg-void ease-out ${fading ? "pointer-events-none opacity-0" : "opacity-100"}`}
      style={{ transition: "opacity 2600ms ease-out" }}
      onPointerDown={() => skip.current()}
    >
      {mode === "gl" ? (
        <div ref={stage} className="h-full w-full" />
      ) : (
        <img src={LOGO} alt="" className={`absolute left-1/2 top-[46%] w-[80vmin] -translate-x-1/2 -translate-y-1/2 ${mode === "css" ? "nidus-splash-logo" : ""}`} />
      )}
      <p
        className={`pointer-events-none absolute inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] text-center font-display text-[0.55rem] tracking-[0.3em] text-gilt-dim transition-opacity duration-700 ${hint && !fading ? "opacity-70" : "opacity-0"}`}
      >
        TAP TO SKIP
      </p>
    </div>
  );
}
