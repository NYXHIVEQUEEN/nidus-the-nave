import {
  BufferGeometry,
  CapsuleGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  LatheGeometry,
  Quaternion,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { shade } from "./hullKit";

// Room modules for the hero hull. Each module is built at the origin with +Y pointing out of the
// hull, then oriented to its socket normal. Parts: body (plated iron), glow (emissive), spin
// (a separately animated part), and trim (gilt).

export type Spin = { geo: BufferGeometry; at: [number, number, number]; axis: "x" | "y" | "z"; speed: number; swing?: boolean };
export type Module = { body: BufferGeometry[]; glow: BufferGeometry[]; trim: BufferGeometry[]; spin?: Spin };
export type Socket = { p: [number, number, number]; n: [number, number, number]; s?: number };

// Ship-local sockets on the lean hull (nose +Z, dorsal +Y).
export const ROOM_SOCKETS: Record<string, Socket> = {
  solar: { p: [0, 0.3, -1.85], n: [0, 1, 0] },
  orebay: { p: [0, -0.27, 0.35], n: [0, -1, 0] },
  silo: { p: [0, -0.24, -1.55], n: [0, -1, 0] },
  barracks: { p: [-0.26, 0.06, -0.45], n: [-1, 0.25, 0] },
  nerve: { p: [0, 0.21, -1.25], n: [0, 1, 0] },
  lab: { p: [0.26, 0.06, -0.55], n: [1, 0.25, 0] },
  hangar: { p: [0, -0.28, -2.1], n: [0, -1, 0] },
  gundeck: { p: [0, -0.14, 1.85], n: [0, -1, 0] },
  reliquary: { p: [0, 0.2, -0.85], n: [0, 1, 0] },
  crucible: { p: [0.39, -0.02, -2.0], n: [1, 0, 0] },
  cloister: { p: [-0.42, 0.1, 0.62], n: [-1, 0.2, 0] },
  choir: { p: [0, 0.66, 1.26], n: [0, 1, 0], s: 0.85 },
  vault: { p: [0, -0.3, 0.95], n: [0, -1, 0] },
  crypt: { p: [0, 0.24, -2.35], n: [0, 1, 0.2] },
  spire: { p: [0, 0.68, 0.2], n: [0, 1, 0] },
  apse: { p: [0, 0.16, -0.6], n: [0, 1, 0] },
  mill: { p: [-0.39, -0.02, -2.0], n: [-1, 0, 0] },
  refinery: { p: [-0.2, -0.2, -0.95], n: [-0.6, -1, 0] },
  sensor: { p: [0, 0.14, 2.15], n: [0, 1, 0], s: 0.8 },
  armory: { p: [0.42, 0.1, 0.62], n: [1, 0.2, 0] },
  dock: { p: [0, -0.26, 1.35], n: [0, -1, 0] },
  gallery: { p: [-0.3, 0.1, -1.45], n: [-1, 0.3, 0] },
  prow: { p: [0, 0.04, 3.1], n: [0, 0, 1] },
};

export function merge(parts: BufferGeometry[]): BufferGeometry | null {
  if (parts.length === 0) return null;
  const clean = parts.map((p) => {
    const g = p.index ? p.toNonIndexed() : p.clone();
    for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(k)) g.deleteAttribute(k);
    return g;
  });
  const g = mergeGeometries(clean, false);
  for (const c of clean) c.dispose();
  return g;
}

const lathe = (pts: [number, number][], radial = 20) => new LatheGeometry(pts.map(([r, y]) => new Vector2(r, y)), radial);
const cyl = (r0: number, r1: number, h: number, seg = 16) => new CylinderGeometry(r0, r1, h, seg);
const cap = (r: number, len: number) => new CapsuleGeometry(r, len, 6, 14);
const at = <T extends BufferGeometry>(g: T, x: number, y: number, z: number) => {
  g.translate(x, y, z);
  return g;
};
const alongZ = <T extends BufferGeometry>(g: T) => {
  g.rotateX(Math.PI / 2);
  return g;
};
const collar = (r: number) => at(alongY(new TorusGeometry(r, 0.012, 6, 28)), 0, 0.005, 0);
function alongY<T extends BufferGeometry>(g: T) {
  g.rotateX(Math.PI / 2);
  return g;
}
const dome = (r: number, squash = 1) => {
  const g = new SphereGeometry(r, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  g.scale(1, squash, 1);
  return g;
};
function arch(w: number, h: number, peak: number) {
  const s = new Shape();
  s.moveTo(-w, 0);
  s.lineTo(-w, h);
  s.quadraticCurveTo(-w, h + peak * 0.7, 0, h + peak);
  s.quadraticCurveTo(w, h + peak * 0.7, w, h);
  s.lineTo(w, 0);
  s.closePath();
  return s;
}
const pinnacle = (h: number, r: number) =>
  lathe(
    [
      [0, 0],
      [r, 0],
      [r, h * 0.3],
      [r * 0.6, h * 0.45],
      [0, h],
    ],
    12,
  );

const MODULES: Record<string, () => Module> = {
  solar: () => ({
    body: [at(cyl(0.02, 0.028, 0.34), 0, 0.17, 0), collar(0.06)],
    glow: [],
    trim: [],
    spin: {
      // Twin sail vanes turn slowly to the corner sun.
      geo: (() => {
        const vanes: BufferGeometry[] = [];
        for (const s of [-1, 1]) {
          const v = new ExtrudeGeometry(new Shape([new Vector2(0, -0.1), new Vector2(0.34, -0.14), new Vector2(0.38, 0.12), new Vector2(0, 0.1)]), {
            depth: 0.008,
            bevelEnabled: false,
          });
          if (s < 0) v.rotateY(Math.PI);
          vanes.push(v);
        }
        return merge(vanes)!;
      })(),
      at: [0, 0.32, 0],
      axis: "y",
      speed: 0.05,
    },
  }),
  orebay: () => ({
    body: [at(alongZ(cap(0.1, 0.5)), 0, 0.09, 0), at(alongZ(cap(0.07, 0.4)), 0.13, 0.06, 0), at(alongZ(cap(0.07, 0.4)), -0.13, 0.06, 0), collar(0.12)],
    glow: [at(alongZ(cyl(0.012, 0.012, 0.42, 8)), 0, 0.19, 0)],
    trim: [],
  }),
  silo: () => ({
    body: [
      at(lathe([[0, 0], [0.08, 0], [0.08, 0.22], [0.05, 0.28], [0, 0.29]]), 0.08, 0, 0),
      at(lathe([[0, 0], [0.08, 0], [0.08, 0.22], [0.05, 0.28], [0, 0.29]]), -0.08, 0, 0),
      collar(0.16),
    ],
    glow: [],
    trim: [at(alongY(new TorusGeometry(0.082, 0.008, 6, 24)), 0.08, 0.12, 0), at(alongY(new TorusGeometry(0.082, 0.008, 6, 24)), -0.08, 0.12, 0)],
  }),
  barracks: () => ({
    body: [0, 1, 2].map((i) => at(dome(0.075, 0.8), 0, 0, -0.18 + i * 0.18)),
    glow: [0, 1, 2].map((i) => at(dome(0.03, 0.4), 0, 0.055, -0.18 + i * 0.18)),
    trim: [],
  }),
  nerve: () => ({
    body: [at(dome(0.13, 0.7), 0, 0, 0), ...[0, 1, 2, 3, 4, 5].map((i) => {
      const p = pinnacle(0.16, 0.014);
      p.rotateZ(0.5);
      p.rotateY((i / 6) * Math.PI * 2);
      return at(p, 0, 0.02, 0);
    })],
    glow: [at(dome(0.06, 0.9), 0, 0.07, 0)],
    trim: [collar(0.135)],
  }),
  lab: () => ({
    body: [collar(0.13), at(cyl(0.13, 0.14, 0.04, 20), 0, 0.02, 0)],
    glow: [at(dome(0.11, 1), 0, 0.04, 0)],
    trim: [at(alongY(new TorusGeometry(0.113, 0.01, 6, 28)), 0, 0.045, 0)],
  }),
  hangar: () => ({
    body: [
      (() => {
        const g = new ExtrudeGeometry(arch(0.16, 0.05, 0.08), { depth: 0.5, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 });
        g.translate(0, 0, -0.25);
        return g;
      })(),
    ],
    glow: [0, 1, 2, 3].map((i) => at(new SphereGeometry(0.012, 8, 6), -0.12 + i * 0.08, 0.03, -0.26)),
    trim: [],
  }),
  gundeck: () => ({
    body: [at(alongZ(cap(0.05, 0.3)), 0, 0.05, 0), at(alongZ(cyl(0.018, 0.024, 0.7)), 0, 0.06, 0.45)],
    glow: [at(new SphereGeometry(0.014, 8, 6), 0, 0.06, 0.8)],
    trim: [at(new TorusGeometry(0.026, 0.006, 6, 16), 0, 0.06, 0.62)],
  }),
  reliquary: () => ({
    body: [collar(0.08), ...[0, 1, 2, 3].map((i) => {
      const bar = cyl(0.006, 0.006, 0.22, 6);
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      return at(bar, Math.cos(a) * 0.06, 0.11, Math.sin(a) * 0.06);
    }), at(pinnacle(0.14, 0.07), 0, 0.22, 0)],
    glow: [at(new SphereGeometry(0.04, 12, 8), 0, 0.11, 0)],
    trim: [],
  }),
  crucible: () => ({
    body: [lathe([[0.04, 0], [0.12, 0.02], [0.15, 0.1], [0.13, 0.14], [0.13, 0.14], [0.1, 0.12]]), collar(0.08)],
    glow: [at(dome(0.1, 0.25), 0, 0.1, 0)],
    trim: [at(alongY(new TorusGeometry(0.14, 0.008, 6, 28)), 0, 0.12, 0)],
  }),
  cloister: () => ({
    body: [0, 1, 2, 3].map((i) => {
      const g = new ExtrudeGeometry(arch(0.04, 0.06, 0.04), { depth: 0.05, bevelEnabled: false, curveSegments: 6 });
      g.rotateY(Math.PI / 2);
      return at(g, 0, 0, -0.2 + i * 0.12);
    }),
    glow: [0, 1, 2, 3].map((i) => {
      const g = new ExtrudeGeometry(arch(0.022, 0.04, 0.025), { depth: 0.006, bevelEnabled: false, curveSegments: 6 });
      g.rotateY(Math.PI / 2);
      return at(g, 0.052, 0.01, -0.2 + i * 0.12);
    }),
    trim: [],
  }),
  choir: () => ({
    body: [at(cyl(0.045, 0.05, 0.16, 12), 0, 0.08, 0), at(pinnacle(0.2, 0.05), 0, 0.2, 0)],
    glow: [],
    trim: [],
    spin: { geo: lathe([[0, 0.05], [0.02, 0.05], [0.035, 0.01], [0.045, -0.02], [0, -0.02]], 16), at: [0, 0.12, 0], axis: "x", speed: 1.1, swing: true },
  }),
  vault: () => ({
    body: [
      (() => {
        const s = new Shape([new Vector2(-0.12, 0), new Vector2(0.12, 0), new Vector2(0.1, 0.1), new Vector2(-0.1, 0.1)]);
        const g = new ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2 });
        g.translate(0, 0, -0.15);
        return g;
      })(),
    ],
    glow: [],
    trim: [at(alongZ(cyl(0.006, 0.006, 0.32, 6)), 0, 0.105, 0), at(new SphereGeometry(0.02, 10, 8), 0, 0.1, 0.16)],
  }),
  crypt: () => ({
    body: [collar(0.1), at(pinnacle(0.3, 0.05), 0, 0, 0), at(pinnacle(0.18, 0.03), 0.07, 0, 0.03), at(pinnacle(0.18, 0.03), -0.07, 0, 0.03)],
    glow: [at(new SphereGeometry(0.018, 8, 6), 0, 0.12, 0.05)],
    trim: [],
  }),
  spire: () => ({
    body: [at(pinnacle(0.9, 0.05), 0, 0, 0), collar(0.06)],
    glow: [at(new SphereGeometry(0.016, 8, 6), 0, 0.5, 0)],
    trim: [at(alongY(new TorusGeometry(0.04, 0.008, 6, 20)), 0, 0.3, 0)],
  }),
  apse: () => ({
    body: [
      (() => {
        const g = new SphereGeometry(0.17, 20, 10, Math.PI / 2, Math.PI, 0, Math.PI / 2);
        g.scale(1, 1.1, 1);
        return g;
      })(),
    ],
    glow: [],
    trim: [at(pinnacle(0.12, 0.02), 0, 0.18, -0.02)],
  }),
  mill: () => ({
    body: [collar(0.05), at(cyl(0.03, 0.03, 0.08, 12), 0, 0.04, 0)],
    glow: [],
    trim: [],
    spin: {
      // Stamp wheel: rim, hub, spokes.
      geo: (() => {
        const parts: BufferGeometry[] = [new TorusGeometry(0.16, 0.014, 6, 32), alongY(cyl(0.035, 0.035, 0.05, 12))];
        for (let i = 0; i < 6; i++) {
          const sp = cyl(0.006, 0.006, 0.3, 6);
          sp.rotateZ((i / 6) * Math.PI);
          parts.push(sp);
        }
        return merge(parts)!;
      })(),
      at: [0, 0.13, 0],
      axis: "z",
      speed: 0.6,
    },
  }),
  refinery: () => ({
    body: [at(lathe([[0, 0], [0.06, 0], [0.06, 0.16], [0, 0.2]]), 0.05, 0, 0), at(lathe([[0, 0], [0.045, 0], [0.045, 0.12], [0, 0.15]]), -0.06, 0, 0.04), collar(0.11)],
    glow: [at(new SphereGeometry(0.014, 8, 6), 0.05, 0.19, 0)],
    trim: [],
  }),
  sensor: () => ({
    body: [at(cyl(0.012, 0.02, 0.14, 10), 0, 0.07, 0), collar(0.04)],
    glow: [],
    trim: [],
    spin: {
      geo: (() => {
        const dish = new SphereGeometry(0.11, 18, 8, 0, Math.PI * 2, 0, 0.9);
        dish.rotateX(-Math.PI / 2.4);
        const feed = cyl(0.004, 0.004, 0.12, 6);
        feed.rotateX(Math.PI / 3);
        feed.translate(0, 0.02, 0.04);
        return merge([dish, feed])!;
      })(),
      at: [0, 0.16, 0],
      axis: "y",
      speed: 0.35,
    },
  }),
  armory: () => ({
    body: [0, 1, 2].map((i) => at(alongZ(cap(0.028, 0.26)), 0, 0.03 + (i % 2) * 0.03, -0.06 + i * 0.06)),
    glow: [0, 1, 2].map((i) => at(new SphereGeometry(0.01, 6, 4), 0, 0.03 + (i % 2) * 0.03, 0.12 + i * 0.06)),
    trim: [],
  }),
  dock: () => ({
    body: [at(cyl(0.05, 0.07, 0.08, 16), 0, 0.04, 0)],
    glow: [at(alongY(new TorusGeometry(0.11, 0.008, 6, 32)), 0, 0.1, 0)],
    trim: [at(alongY(new TorusGeometry(0.13, 0.016, 8, 36)), 0, 0.09, 0)],
  }),
  gallery: () => ({
    body: [
      (() => {
        const g = new ExtrudeGeometry(arch(0.05, 0.05, 0.05), { depth: 0.5, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1 });
        g.translate(0, 0, -0.25);
        return g;
      })(),
    ],
    glow: [0, 1, 2, 3].map((i) => {
      const g = new ExtrudeGeometry(arch(0.018, 0.035, 0.02), { depth: 0.004, bevelEnabled: false, curveSegments: 5 });
      g.rotateY(Math.PI / 2);
      return at(g, 0.054, 0.012, -0.18 + i * 0.12);
    }),
    trim: [],
  }),
};

export const MODULE_IDS = Object.keys(MODULES);

const UP = new Vector3(0, 1, 0);

export function socketQuat(id: string): Quaternion {
  const s = ROOM_SOCKETS[id];
  return new Quaternion().setFromUnitVectors(UP, new Vector3(...s.n).normalize());
}

// Places a module's parts in ship space.
export function placedModule(id: string): Module | null {
  const make = MODULES[id];
  const sock = ROOM_SOCKETS[id];
  if (!make || !sock) return null;
  const m = make();
  const q = socketQuat(id);
  const sc = sock.s ?? 1;
  const place = (g: BufferGeometry) => {
    g.scale(sc, sc, sc);
    g.applyQuaternion(q);
    g.translate(...sock.p);
    return g;
  };
  m.body.forEach(place);
  m.glow.forEach(place);
  m.trim.forEach(place);
  return m;
}

// Gilt rank collars stacked at the socket, one per rank.
export function rankRings(id: string, rank: number): BufferGeometry[] {
  const sock = ROOM_SOCKETS[id];
  if (!sock || rank <= 0) return [];
  const q = socketQuat(id);
  const out: BufferGeometry[] = [];
  for (let i = 0; i < Math.min(5, rank); i++) {
    const r = alongY(new TorusGeometry(0.05 + i * 0.022, 0.006, 5, 24));
    r.translate(0, 0.012, 0);
    r.applyQuaternion(q);
    r.translate(...sock.p);
    out.push(r);
  }
  return out;
}

export function bakedBodies(ids: string[], ranks: Record<string, number> = {}) {
  const body: BufferGeometry[] = [];
  const glow: BufferGeometry[] = [];
  const trim: BufferGeometry[] = [];
  for (const id of ids) {
    const m = placedModule(id);
    if (!m) continue;
    body.push(...m.body);
    glow.push(...m.glow);
    trim.push(...m.trim, ...rankRings(id, ranks[id] ?? 0));
    m.spin?.geo.dispose();
  }
  const b = merge(body);
  const gl = merge(glow);
  const tr = merge(trim);
  for (const g of [...body, ...glow, ...trim]) g.dispose();
  return { body: b ? shade(b, 0.55, 1) : null, glow: gl, trim: tr };
}
