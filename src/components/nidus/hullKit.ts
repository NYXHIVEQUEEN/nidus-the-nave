import {
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
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
export const HULL_OVAL = { x: 1.12, y: 0.74 };

function merge(parts: BufferGeometry[]): BufferGeometry {
  const clean = parts.map((p) => (p.index ? p.toNonIndexed() : p));
  for (const p of clean) {
    if (!p.getAttribute("uv")) continue;
    for (const k of Object.keys(p.attributes)) if (!["position", "normal", "uv"].includes(k)) p.deleteAttribute(k);
  }
  const g = mergeGeometries(clean, false);
  for (const p of parts) p.dispose();
  for (const p of clean) p.dispose();
  if (!g) throw new Error("hull merge failed");
  return g;
}

function lathe(profile: [number, number][], radial = 24) {
  return new LatheGeometry(
    profile.map(([r, z]) => new Vector2(r, z)),
    radial,
  );
}

// Duplicated points crease the panel breaks; single points round them.
const NAVE_PROFILE: [number, number][] = [
  [0, -2.46],
  [0.22, -2.46],
  [0.22, -2.46],
  [0.44, -2.3],
  [0.5, -1.9],
  [0.5, -1.9],
  [0.46, -1.52],
  [0.36, -1.12],
  [0.36, -1.12],
  [0.33, -0.62],
  [0.36, -0.18],
  [0.36, -0.18],
  [0.5, 0.3],
  [0.54, 0.86],
  [0.54, 0.86],
  [0.48, 1.36],
  [0.34, 1.86],
  [0.34, 1.86],
  [0.18, 2.34],
  [0.06, 2.62],
  [0, 2.7],
];

export function naveGeo(): BufferGeometry {
  const body = lathe(NAVE_PROFILE, 24);
  body.rotateX(Math.PI / 2);
  body.scale(HULL_OVAL.x, HULL_OVAL.y, 1);
  const cheeks: BufferGeometry[] = [];
  for (const s of [-1, 1]) {
    const pod = new CapsuleGeometry(0.13, 0.9, 8, 16, 1);
    pod.rotateX(Math.PI / 2);
    pod.scale(1, 0.8, 1);
    pod.translate(s * 0.5, -0.1, 0.62);
    cheeks.push(pod);
  }
  return merge([body, ...cheeks]);
}

function archShape(w: number, wall: number, peak: number): Shape {
  const s = new Shape();
  s.moveTo(-w, 0);
  s.lineTo(-w, wall);
  s.quadraticCurveTo(-w, wall + peak * 0.78, 0, wall + peak);
  s.quadraticCurveTo(w, wall + peak * 0.78, w, wall);
  s.lineTo(w, 0);
  s.closePath();
  return s;
}

export const ROOF = { w: 0.25, wall: 0.24, peak: 0.24, base: 0.22, z0: -0.46, z1: 1.32 };

export function roofGeo(): BufferGeometry {
  const len = ROOF.z1 - ROOF.z0;
  const roof = new ExtrudeGeometry(archShape(ROOF.w, ROOF.wall, ROOF.peak), {
    depth: len,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.014,
    bevelSegments: 2,
    curveSegments: 10,
  });
  roof.translate(0, ROOF.base, ROOF.z0);
  const spire = (h: number, r: number) => {
    const g = lathe(
      [
        [0, 0],
        [r, 0],
        [r, h * 0.16],
        [r * 1.3, h * 0.2],
        [r * 0.8, h * 0.24],
        [r * 0.8, h * 0.55],
        [r * 0.34, h * 0.9],
        [0, h],
      ],
      16,
    );
    return g;
  };
  const top = ROOF.base + ROOF.wall + ROOF.peak;
  const main = spire(0.92, 0.1);
  main.translate(0, top - 0.06, 1.02);
  const parts: BufferGeometry[] = [roof, main];
  for (const s of [-1, 1]) {
    const small = spire(0.5, 0.06);
    small.translate(s * 0.2, ROOF.base + ROOF.wall, -0.36);
    parts.push(small);
  }
  return merge(parts);
}

export function wingGeo(): BufferGeometry {
  const parts: BufferGeometry[] = [];
  for (const s of [-1, 1]) {
    // Planform in (span, -z): root chord hugs the waist, tip is a swept lance.
    const plan: [number, number][] = [
      [0, 1.35],
      [0.42, 1.18],
      [1.12, 1.62],
      [0.98, 1.4],
      [0.5, 0.62],
      [0, 0.5],
    ];
    const p = new Shape(plan.map(([x, y]) => new Vector2(s * x, y)));
    const g = new ExtrudeGeometry(p, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.016, bevelSegments: 2 });
    g.rotateX(-Math.PI / 2);
    g.translate(0, -0.04, 0);
    g.rotateZ(s * -0.1);
    g.translate(s * 0.3, -0.08, 0);
    parts.push(g);
  }
  return merge(parts);
}

export function buttressGeo(): BufferGeometry {
  const parts: BufferGeometry[] = [];
  const top = ROOF.base + ROOF.wall * 0.95;
  for (const z of [-0.2, 0.36, 0.92]) {
    for (const s of [-1, 1]) {
      const a = new Vector3(s * 0.5, 0.06, z - 0.08);
      const c = new Vector3(s * 0.52, top + 0.16, z);
      const b = new Vector3(s * (ROOF.w + 0.01), top, z + 0.04);
      parts.push(new TubeGeometry(new QuadraticBezierCurve3(a, c, b), 14, 0.022, 6, false));
      const pin = new CylinderGeometry(0.004, 0.03, 0.18, 8);
      pin.translate(s * 0.5, 0.18, z - 0.08);
      parts.push(pin);
    }
  }
  return merge(parts);
}

export function bandsGeo(): BufferGeometry {
  const parts: BufferGeometry[] = [];
  for (const [z, r] of [
    [-1.9, 0.505],
    [-1.12, 0.365],
    [-0.18, 0.365],
    [0.86, 0.545],
    [1.86, 0.345],
  ] as [number, number][]) {
    const t = new TorusGeometry(r, 0.016, 6, 48);
    t.scale(HULL_OVAL.x, HULL_OVAL.y, 1);
    t.translate(0, 0, z);
    parts.push(t);
  }
  const ridge = new CylinderGeometry(0.012, 0.012, 1.7, 6);
  ridge.rotateX(Math.PI / 2);
  ridge.translate(0, ROOF.base + ROOF.wall + ROOF.peak + 0.012, (ROOF.z0 + ROOF.z1) / 2);
  parts.push(ridge);
  return merge(parts);
}

export function keelGeo(): BufferGeometry {
  const p = new Shape();
  p.moveTo(-1.6, 0);
  p.lineTo(1.9, 0);
  p.lineTo(1.2, -0.2);
  p.lineTo(-0.6, -0.26);
  p.lineTo(-1.4, -0.14);
  p.closePath();
  const g = new ExtrudeGeometry(p, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1 });
  g.rotateY(-Math.PI / 2);
  g.translate(0.025, -0.3, 0);
  return merge([g]);
}

export function machineryGeo(): BufferGeometry {
  // Engine block + nacelle housings: dark iron, the working end of the ship.
  const parts: BufferGeometry[] = [];
  const bell = (x: number, y: number, r: number) => {
    const g = lathe(
      [
        [r * 0.72, 0],
        [r, 0.08],
        [r * 1.06, 0.34],
        [r * 0.9, 0.52],
        [r * 0.9, 0.52],
        [r * 0.62, 0.6],
      ],
      24,
    );
    g.rotateX(-Math.PI / 2);
    g.translate(x, y, -2.2);
    return g;
  };
  parts.push(bell(0, 0, 0.2), bell(0.36, -0.1, 0.13), bell(-0.36, -0.1, 0.13));
  for (const s of [-1, 1]) {
    const strut = new CapsuleGeometry(0.05, 0.5, 6, 12, 1);
    strut.rotateX(Math.PI / 2);
    strut.translate(s * 0.28, -0.06, -1.95);
    parts.push(strut);
  }
  return merge(parts);
}

export const ENGINES: [number, number, number, number][] = [
  [0, 0, -2.82, 0.14],
  [0.36, -0.1, -2.82, 0.09],
  [-0.36, -0.1, -2.82, 0.09],
];

export function lancetGeo(): BufferGeometry {
  // Stained-glass lancets set into both roof walls, plus the rose window.
  const parts: BufferGeometry[] = [];
  const lancet = archShape(0.05, 0.13, 0.07);
  for (let i = 0; i < 5; i++) {
    const z = ROOF.z0 + 0.22 + i * 0.32;
    for (const s of [-1, 1]) {
      const g = new ExtrudeGeometry(lancet, { depth: 0.006, bevelEnabled: false, curveSegments: 6 });
      g.rotateY(s * (Math.PI / 2));
      g.translate(s * (ROOF.w + 0.016), ROOF.base + 0.03, z);
      parts.push(g);
    }
  }
  return merge(parts);
}

export const ROSE = { y: ROOF.base + ROOF.wall * 0.75, z: ROOF.z1 + 0.02, r: 0.13 };

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
