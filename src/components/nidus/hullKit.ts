import {
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Float32BufferAttribute,
  IcosahedronGeometry,
  LatheGeometry,
  QuadraticBezierCurve3,
  Shape,
  SRGBColorSpace,
  TorusGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// Nose is +Z, stern is -Z, dorsal is +Y. Units match the room SOCKETS table.
export const HULL_OVAL = { x: 0.94, y: 0.68 };

function merge(parts: BufferGeometry[]): BufferGeometry {
  const clean = parts.map((p) => (p.index ? p.toNonIndexed() : p));
  for (const p of clean) {
    for (const k of Object.keys(p.attributes)) if (!["position", "normal", "uv"].includes(k)) p.deleteAttribute(k);
  }
  const g = mergeGeometries(clean, false);
  for (const p of parts) p.dispose();
  for (const p of clean) p.dispose();
  if (!g) throw new Error("hull merge failed");
  return g;
}

// Baked grime: darker belly and stern, lighter spine. Reads as ambient occlusion without a pass.
export function shade(g: BufferGeometry, belly = 0.42, spine = 1, sternZ = -2.4): BufferGeometry {
  const pos = g.getAttribute("position");
  const nor = g.getAttribute("normal");
  const col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const up = nor ? nor.getY(i) * 0.5 + 0.5 : 0.5;
    let k = belly + (spine - belly) * up ** 0.8;
    const z = pos.getZ(i);
    if (z < sternZ + 0.6) k *= 0.78 + 0.22 * Math.max(0, Math.min(1, (z - sternZ) / 0.6));
    const grit = 0.94 + 0.06 * Math.sin(pos.getX(i) * 37 + z * 11) * Math.sin(pos.getY(i) * 23);
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = k * grit;
  }
  g.setAttribute("color", new Float32BufferAttribute(col, 3));
  return g;
}

function lathe(profile: [number, number][], radial = 24) {
  return new LatheGeometry(
    profile.map(([r, z]) => new Vector2(r, z)),
    radial,
  );
}

// Duplicated points crease the panel breaks; single points round them. Long needle ram at the prow.
const NAVE_PROFILE: [number, number][] = [
  [0, -2.6],
  [0.2, -2.6],
  [0.2, -2.6],
  [0.4, -2.45],
  [0.46, -2.05],
  [0.46, -2.05],
  [0.4, -1.6],
  [0.29, -1.15],
  [0.29, -1.15],
  [0.27, -0.6],
  [0.31, -0.1],
  [0.31, -0.1],
  [0.43, 0.4],
  [0.45, 0.95],
  [0.45, 0.95],
  [0.37, 1.5],
  [0.25, 2.05],
  [0.25, 2.05],
  [0.13, 2.6],
  [0.045, 3.1],
  [0.012, 3.45],
  [0, 3.5],
];

export function naveGeo(): BufferGeometry {
  const body = lathe(NAVE_PROFILE, 28);
  body.rotateX(Math.PI / 2);
  body.scale(HULL_OVAL.x, HULL_OVAL.y, 1);
  const cheeks: BufferGeometry[] = [];
  for (const s of [-1, 1]) {
    const pod = new CapsuleGeometry(0.085, 1.25, 8, 16, 1);
    pod.rotateX(Math.PI / 2);
    pod.scale(1, 0.75, 1);
    pod.translate(s * 0.4, -0.08, 0.5);
    cheeks.push(pod);
  }
  return shade(merge([body, ...cheeks]));
}

function archShape(w: number, wall: number, peak: number): Shape {
  const s = new Shape();
  s.moveTo(-w, 0);
  s.lineTo(-w, wall);
  s.quadraticCurveTo(-w, wall + peak * 0.62, 0, wall + peak);
  s.quadraticCurveTo(w, wall + peak * 0.62, w, wall);
  s.lineTo(w, 0);
  s.closePath();
  return s;
}

export const ROOF = { w: 0.17, wall: 0.2, peak: 0.32, base: 0.16, z0: -0.55, z1: 1.2 };

function spire(h: number, r: number) {
  return lathe(
    [
      [0, 0],
      [r, 0],
      [r, h * 0.14],
      [r * 1.35, h * 0.18],
      [r * 0.75, h * 0.22],
      [r * 0.75, h * 0.5],
      [r * 0.3, h * 0.88],
      [0, h],
    ],
    16,
  );
}

export function roofGeo(): BufferGeometry {
  const len = ROOF.z1 - ROOF.z0;
  const roof = new ExtrudeGeometry(archShape(ROOF.w, ROOF.wall, ROOF.peak), {
    depth: len,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.01,
    bevelSegments: 2,
    curveSegments: 12,
  });
  roof.translate(0, ROOF.base, ROOF.z0);
  const top = ROOF.base + ROOF.wall + ROOF.peak;
  const main = spire(1.15, 0.065);
  main.translate(0, top - 0.05, 0.95);
  const parts: BufferGeometry[] = [roof, main];
  // Pinnacles march down the ridge.
  for (let i = 0; i < 4; i++) {
    const p = spire(0.26, 0.022);
    p.translate(0, top - 0.02, ROOF.z0 + 0.18 + i * 0.3);
    parts.push(p);
  }
  for (const s of [-1, 1]) {
    const small = spire(0.55, 0.045);
    small.translate(s * 0.15, ROOF.base + ROOF.wall, -0.46);
    parts.push(small);
    for (let i = 0; i < 3; i++) {
      const edge = spire(0.16, 0.016);
      edge.translate(s * (ROOF.w - 0.01), ROOF.base + ROOF.wall, ROOF.z0 + 0.35 + i * 0.42);
      parts.push(edge);
    }
  }
  return shade(merge(parts), 0.55, 1.05);
}

export function wingGeo(): BufferGeometry {
  const parts: BufferGeometry[] = [];
  for (const s of [-1, 1]) {
    // Planform in (span, -z): long swept blades with a trailing barb.
    const plan: [number, number][] = [
      [0, 1.25],
      [0.35, 1.08],
      [1.42, 1.9],
      [1.28, 1.56],
      [0.72, 1.02],
      [0.44, 0.42],
      [0, 0.32],
    ];
    const p = new Shape(plan.map(([x, y]) => new Vector2(s * x, y)));
    const g = new ExtrudeGeometry(p, { depth: 0.045, bevelEnabled: true, bevelThickness: 0.014, bevelSize: 0.012, bevelSegments: 2 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, -0.03, 0);
    g.rotateZ(s * -0.14);
    g.translate(s * 0.24, -0.06, 0);
    parts.push(g);
    // Forward canards near the chest.
    const c: [number, number][] = [
      [0, -1.6],
      [0.34, -1.35],
      [0.3, -1.22],
      [0, -1.2],
    ];
    const cs = new Shape(c.map(([x, y]) => new Vector2(s * x, y)));
    const cg = new ExtrudeGeometry(cs, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1 });
    cg.rotateX(-Math.PI / 2);
    cg.rotateZ(s * 0.08);
    cg.translate(s * 0.3, -0.04, 0);
    parts.push(cg);
  }
  return shade(merge(parts), 0.5, 1);
}

export function buttressGeo(): BufferGeometry {
  const parts: BufferGeometry[] = [];
  const top = ROOF.base + ROOF.wall * 0.95;
  for (const z of [-0.3, 0.25, 0.8]) {
    for (const s of [-1, 1]) {
      const a = new Vector3(s * 0.4, 0.02, z - 0.08);
      const c = new Vector3(s * 0.4, top + 0.18, z);
      const b = new Vector3(s * (ROOF.w + 0.01), top, z + 0.04);
      parts.push(new TubeGeometry(new QuadraticBezierCurve3(a, c, b), 16, 0.016, 6, false));
      const pin = spire(0.2, 0.018);
      pin.translate(s * 0.4, 0.1, z - 0.08);
      parts.push(pin);
    }
  }
  return merge(parts);
}

export function bandsGeo(): BufferGeometry {
  const parts: BufferGeometry[] = [];
  for (const [z, r] of [
    [-2.05, 0.462],
    [-1.15, 0.292],
    [0.95, 0.452],
  ] as [number, number][]) {
    const t = new TorusGeometry(r, 0.009, 6, 56);
    t.scale(HULL_OVAL.x, HULL_OVAL.y, 1);
    t.translate(0, 0, z);
    parts.push(t);
  }
  const ridge = new CylinderGeometry(0.008, 0.008, ROOF.z1 - ROOF.z0, 6);
  ridge.rotateX(Math.PI / 2);
  ridge.translate(0, ROOF.base + ROOF.wall + ROOF.peak + 0.008, (ROOF.z0 + ROOF.z1) / 2);
  parts.push(ridge);
  return merge(parts);
}

export function keelGeo(): BufferGeometry {
  const p = new Shape();
  p.moveTo(-1.9, 0);
  p.lineTo(2.3, 0);
  p.lineTo(1.5, -0.16);
  p.lineTo(-0.5, -0.22);
  p.lineTo(-1.6, -0.12);
  p.closePath();
  const g = new ExtrudeGeometry(p, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1 });
  g.rotateY(-Math.PI / 2);
  g.translate(0.02, -0.25, 0);
  return merge([g]);
}

export function machineryGeo(): BufferGeometry {
  // Engine block + nacelle housings: dark iron, the working end of the ship.
  const parts: BufferGeometry[] = [];
  const bell = (x: number, y: number, r: number) => {
    const g = lathe(
      [
        [r * 0.7, 0],
        [r, 0.06],
        [r * 1.04, 0.28],
        [r * 0.9, 0.42],
        [r * 0.9, 0.42],
        [r * 0.6, 0.48],
      ],
      24,
    );
    g.rotateX(-Math.PI / 2);
    g.translate(x, y, -2.5);
    return g;
  };
  parts.push(bell(0, 0, 0.16), bell(0.3, -0.09, 0.1), bell(-0.3, -0.09, 0.1));
  for (const s of [-1, 1]) {
    const strut = new CapsuleGeometry(0.04, 0.55, 6, 12, 1);
    strut.rotateX(Math.PI / 2);
    strut.translate(s * 0.24, -0.06, -2.2);
    parts.push(strut);
  }
  return shade(merge(parts), 0.5, 1, -3);
}

export const ENGINES: [number, number, number, number][] = [
  [0, 0, -2.99, 0.11],
  [0.3, -0.09, -2.99, 0.07],
  [-0.3, -0.09, -2.99, 0.07],
];

export function lancetGeo(): BufferGeometry {
  // Stained-glass lancets set into both roof walls, plus the rose window.
  const parts: BufferGeometry[] = [];
  const lancet = archShape(0.035, 0.11, 0.07);
  for (let i = 0; i < 5; i++) {
    const z = ROOF.z0 + 0.2 + i * 0.32;
    for (const s of [-1, 1]) {
      const g = new ExtrudeGeometry(lancet, { depth: 0.006, bevelEnabled: false, curveSegments: 6 });
      g.rotateY(s * (Math.PI / 2));
      g.translate(s * (ROOF.w + 0.014), ROOF.base + 0.03, z);
      parts.push(g);
    }
  }
  return merge(parts);
}

export const ROSE = { y: ROOF.base + ROOF.wall * 0.8, z: ROOF.z1 + 0.018, r: 0.1 };

// Nav lights: blood port, venom starboard, gilt beacon on the main spire.
export const NAV_LIGHTS: { p: [number, number, number]; color: string; phase: number }[] = [
  { p: [-1.62, -0.28, -1.72], color: "#ff3a2a", phase: 0 },
  { p: [1.62, -0.28, -1.72], color: "#2aff7a", phase: 0 },
  { p: [0, ROOF.base + ROOF.wall + ROOF.peak + 1.12, 0.95], color: "#ffd59a", phase: 0.5 },
];

export function rockGeo(): BufferGeometry {
  const g = new IcosahedronGeometry(1, 1);
  const pos = g.getAttribute("position");
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    // Hash the position, not the index, so shared corners move together and faces stay closed.
    const h = Math.sin(Math.round(x * 97) * 12.9898 + Math.round(y * 97) * 78.233 + Math.round(z * 97) * 37.719) * 43758.5453;
    const k = 0.8 + 0.3 * (h - Math.floor(h));
    pos.setXYZ(i, x * k, y * k * 0.82, z * k);
  }
  g.computeVertexNormals();
  return g;
}

export function droneGeo(): BufferGeometry {
  const body = new CapsuleGeometry(0.018, 0.07, 4, 10, 1);
  body.rotateX(Math.PI / 2);
  const pods: BufferGeometry[] = [body];
  for (const s of [-1, 1]) {
    const arm = new CapsuleGeometry(0.008, 0.04, 3, 6, 1);
    arm.rotateZ(Math.PI / 2);
    arm.translate(s * 0.03, 0, -0.01);
    pods.push(arm);
  }
  return merge(pods);
}

let glow: CanvasTexture | null = null;

// Soft radial falloff for engine cores and halos; drawn once.
export function glowTexture(): CanvasTexture {
  if (glow) return glow;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.22, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.12)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  glow = new CanvasTexture(c);
  glow.colorSpace = SRGBColorSpace;
  return glow;
}
