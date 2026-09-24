import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import type { BufferGeometry, Group, InstancedMesh, Mesh, MeshStandardMaterial, PointLight, PointsMaterial, ShaderMaterial, Texture } from "three";
import {
  AdditiveBlending,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Float32BufferAttribute,
  BufferGeometry as BufferGeometryC,
  LatheGeometry,
  Object3D,
  QuadraticBezierCurve3,
  RepeatWrapping,
  SRGBColorSpace,
  Shape,
  TextureLoader,
  TubeGeometry,
  Vector2,
  Vector3,
} from "three";
import { useNidus } from "@/lib/nidus/store";
import { TECH, throneCap, totalSwarm } from "@/lib/nidus/content";
import { droneGeo, glowTexture } from "./hullKit";
import { SOVEREIGNS } from "@/lib/nidus/heroes";
import { merge } from "./roomKit";

// Live 3D rooms for FORGE, LAB and MINDS. They share the ship's Canvas: one WebGL context.
// The camera sits at INTERIOR_CAM looking at INTERIOR_LOOK; the bottom sheet covers the lower
// third, so each room keeps its focal action in the upper middle of a portrait frame.

export const INTERIOR_CAM = new Vector3(0, 1.55, 5.4);
export const INTERIOR_LOOK = new Vector3(0, 2.05, -2.2);
export const ROOM_CAMS: Record<string, { cam: Vector3; look: Vector3 }> = {
  forge: { cam: new Vector3(0.7, 2.4, 6.4), look: new Vector3(0, 1.9, -3.2) },
  lab: { cam: INTERIOR_CAM, look: INTERIOR_LOOK },
  minds: { cam: new Vector3(0, 1.8, 5.2), look: new Vector3(0, 2.1, -3) },
};

const FIRE_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
// Cheap value-noise fire: a hot core that licks upward, red at the edges.
const FIRE_FRAG = `uniform float uTime; uniform vec2 uScale; uniform float uFlow; varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0; float a = 0.5; for (int i = 0; i < 4; i++) { v += a * n(p); p *= 2.03; a *= 0.5; } return v; }
void main(){
  vec2 p = vUv * uScale + vec2(0.0, -uTime * uFlow);
  float f = fbm(p + fbm(p * 0.7 + uTime * 0.1));
  float heat = clamp(f * 1.35 - 0.12, 0.0, 1.0);
  vec3 col = mix(vec3(0.12, 0.02, 0.01), vec3(0.85, 0.18, 0.05), smoothstep(0.1, 0.55, heat));
  col = mix(col, vec3(1.0, 0.72, 0.3), smoothstep(0.55, 0.9, heat));
  col = mix(col, vec3(1.0, 0.95, 0.8), smoothstep(0.88, 1.0, heat));
  gl_FragColor = vec4(col * 1.6, 1.0);
}`;

function Fire({ scale, flow, children }: { scale: [number, number]; flow: number; children: React.ReactNode }) {
  const mat = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uScale: { value: new Vector2(...scale) }, uFlow: { value: flow } }), [scale, flow]);
  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = REDUCE ? 0 : state.clock.elapsedTime;
  });
  return (
    <mesh>
      {children}
      <shaderMaterial ref={mat} vertexShader={FIRE_VERT} fragmentShader={FIRE_FRAG} uniforms={uniforms} toneMapped={false} />
    </mesh>
  );
}

const REDUCE =
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const GILT = "#c4a574";
const dummy = new Object3D();
const HIDDEN = new Vector3(0, -99, 0);

function useRoomTextures() {
  const [grate, bone, filigree, rose, rivet] = useTexture([
    "/nidus/tex-grate-s.jpg",
    "/nidus/tex-bone-s.jpg",
    "/nidus/tex-filigree-s.jpg",
    "/nidus/tex-rose.jpg",
    "/nidus/tex-rivet.jpg",
  ]);
  for (const t of [grate, bone, filigree, rose, rivet]) {
    t.wrapS = t.wrapT = RepeatWrapping;
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
  }
  return { grate, bone, filigree, rose, rivet };
}

function tiled(t: Texture, x: number, y: number) {
  const c = t.clone();
  c.repeat.set(x, y);
  c.needsUpdate = true;
  return c;
}

function useTiled(t: Texture, x: number, y: number) {
  const c = useMemo(() => tiled(t, x, y), [t, x, y]);
  useEffect(() => () => c.dispose(), [c]);
  return c;
}

function useGeo<T extends BufferGeometry>(make: () => T, deps: unknown[] = []) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const g = useMemo(make, deps);
  useEffect(() => () => g.dispose(), [g]);
  return g;
}

function archShape(w: number, h: number, peak: number) {
  const s = new Shape();
  s.moveTo(-w, 0);
  s.lineTo(-w, h);
  s.quadraticCurveTo(-w, h + peak * 0.62, 0, h + peak);
  s.quadraticCurveTo(w, h + peak * 0.62, w, h);
  s.lineTo(w, 0);
  s.closePath();
  return s;
}

const COLUMN_Z = [2.2, 0, -2.2, -4.4];
const COLUMN_X = 2;

function columnGeo() {
  const col = new LatheGeometry(
    (
      [
        [0, 0],
        [0.3, 0],
        [0.3, 0.14],
        [0.22, 0.22],
        [0.17, 0.3],
        [0.15, 3.2],
        [0.22, 3.34],
        [0.28, 3.46],
        [0.28, 3.56],
        [0, 3.56],
      ] as [number, number][]
    ).map(([r, y]) => new Vector2(r, y)),
    16,
  );
  const parts: BufferGeometry[] = [];
  for (const z of COLUMN_Z) for (const s of [-1, 1]) parts.push(col.clone().translate(s * COLUMN_X, 0, z));
  col.dispose();
  return merge(parts)!;
}

// Pointed ribs: across the nave at each column pair, and along each side between columns.
function ribGeo() {
  const parts: BufferGeometry[] = [];
  const top = 3.5;
  for (const z of COLUMN_Z) {
    for (const s of [-1, 1]) {
      parts.push(new TubeGeometry(new QuadraticBezierCurve3(new Vector3(s * COLUMN_X, top, z), new Vector3(s * COLUMN_X * 0.5, top + 2.3, z), new Vector3(0, top + 2.6, z)), 16, 0.05, 6));
    }
  }
  for (let i = 0; i < COLUMN_Z.length - 1; i++) {
    for (const s of [-1, 1]) {
      const a = COLUMN_Z[i];
      const b = COLUMN_Z[i + 1];
      parts.push(new TubeGeometry(new QuadraticBezierCurve3(new Vector3(s * COLUMN_X, top, a), new Vector3(s * COLUMN_X, top + 1.4, (a + b) / 2), new Vector3(s * COLUMN_X, top, b)), 12, 0.04, 6));
    }
  }
  return merge(parts)!;
}

// Shared gothic hall: grate floor, stone columns, iron ribs, filigree walls.
function Nave({ tone = "#d6cab6", back = true }: { tone?: string; back?: boolean }) {
  const tex = useRoomTextures();
  const floor = useTiled(tex.grate, 5, 8);
  const wall = useTiled(tex.filigree, 3, 3);
  const stone = useTiled(tex.bone, 1, 4);
  const cols = useGeo(columnGeo);
  const ribs = useGeo(ribGeo);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]}>
        <planeGeometry args={[6, 14]} />
        <meshStandardMaterial map={floor} color="#8a7d72" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh geometry={cols}>
        <meshStandardMaterial map={stone} color={tone} metalness={0.1} roughness={0.75} />
      </mesh>
      <mesh geometry={ribs}>
        <meshStandardMaterial color="#5a4e44" metalness={0.75} roughness={0.35} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 2.7, 3, -1]} rotation={[0, -s * (Math.PI / 2), 0]}>
          <planeGeometry args={[14, 7]} />
          <meshStandardMaterial map={wall} color="#8c7c68" metalness={0.4} roughness={0.55} />
        </mesh>
      ))}
      {back && (
        <mesh position={[0, 3, -6.2]}>
          <planeGeometry args={[6, 7]} />
          <meshStandardMaterial map={wall} color="#8c7c68" metalness={0.4} roughness={0.55} />
        </mesh>
      )}
    </group>
  );
}

// FORGE: blood furnace, stamp press that slams on every PRINT, drones riding a conveyor.
const SPARKS = 48;

function Forge() {
  const tex = useRoomTextures();
  const printed = useNidus((s) => s.printed);
  const auto = useNidus((s) => s.autoPrint);
  const swarm = useNidus((s) => Math.min(10, totalSwarm(s)));
  const belt = useTiled(tex.rivet, 6, 1);
  const hammer = useRef<Group>(null);
  const furnace = useRef<PointLight>(null);
  const sparks = useRef<InstancedMesh>(null);
  const drones = useRef<InstancedMesh>(null);
  const dart = useGeo(droneGeo);
  const mouthGeo = useGeo(() => new ExtrudeGeometry(archShape(1.05, 1.5, 1.1), { depth: 0.04, bevelEnabled: false, curveSegments: 12 }));
  const frame = useGeo(() => new ExtrudeGeometry(archShape(1.25, 1.6, 1.3), { depth: 0.2, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 12 }));
  const anvil = useGeo(
    () =>
      new LatheGeometry(
        ([[0, 0], [0.62, 0], [0.62, 0.14], [0.42, 0.3], [0.38, 0.62], [0.5, 0.72], [0.5, 0.82], [0, 0.82]] as [number, number][]).map(([r, y]) => new Vector2(r, y)),
        20,
      ),
  );
  const head = useGeo(() => {
    // Stamp die: a bevelled slab with a gilt-banded ram rod above it.
    const slab = new Shape([new Vector2(-0.48, 0), new Vector2(0.48, 0), new Vector2(0.42, 0.34), new Vector2(-0.42, 0.34)]);
    const die = new ExtrudeGeometry(slab, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 });
    die.translate(0, 0, -0.3);
    const rod = new CylinderGeometry(0.09, 0.11, 1.6, 16);
    rod.translate(0, 1.14, 0);
    return merge([die, rod])!;
  });
  const cycle = useRef({ t: 0, lastPrinted: printed, slam: false });
  const vel = useMemo(() => Array.from({ length: SPARKS }, () => new Vector3()), []);
  const pos = useMemo(() => Array.from({ length: SPARKS }, () => new Vector3(0, -99, 0)), []);
  const life = useMemo(() => new Float32Array(SPARKS), []);

  useEffect(() => {
    for (let i = 0; i < SPARKS; i++) {
      dummy.position.set(0, -99, 0);
      dummy.updateMatrix();
      sparks.current?.setMatrixAt(i, dummy.matrix);
    }
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;
    belt.offset.x = REDUCE ? 0 : -t * 0.25;
    if (furnace.current) furnace.current.intensity = 7 + (REDUCE ? 0 : Math.sin(t * 7.3) * 0.8 + Math.sin(t * 2.1) * 1.2);

    const c = cycle.current;
    if (printed !== c.lastPrinted) {
      c.lastPrinted = printed;
      c.t = Math.max(c.t, 0.78);
    }
    const period = auto ? 1.8 : 3.4;
    c.t += dt / period;
    if (c.t >= 1) {
      c.t = 0;
      c.slam = false;
    }
    // Slow rise, hold, then a hard drop in the last 8% of the cycle.
    const u = c.t;
    const y = u < 0.7 ? 0.82 + (u / 0.7) * 0.9 : u < 0.92 ? 1.72 : 1.72 - ((u - 0.92) / 0.08) * 0.9;
    if (hammer.current) hammer.current.position.y = REDUCE ? 1.2 : y;
    if (!c.slam && u >= 0.99 && !REDUCE) {
      c.slam = true;
      for (let i = 0; i < SPARKS; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 1.2 + Math.random() * 2.6;
        pos[i].set(0, 1.62, -3.2);
        vel[i].set(Math.cos(a) * sp, 1.5 + Math.random() * 2.8, Math.sin(a) * sp * 0.6);
        life[i] = 0.5 + Math.random() * 0.6;
      }
    }
    const m = sparks.current;
    if (m) {
      for (let i = 0; i < SPARKS; i++) {
        if (life[i] > 0) {
          life[i] -= dt;
          vel[i].y -= 9.8 * dt;
          pos[i].addScaledVector(vel[i], dt);
          if (pos[i].y < 0.8 && Math.abs(pos[i].x) < 0.9 && Math.abs(pos[i].z + 3.2) < 0.9) {
            pos[i].y = 0.8;
            vel[i].y *= -0.3;
          } else if (pos[i].y < 0.02) {
            pos[i].y = 0.02;
            vel[i].y *= -0.3;
          }
        }
        dummy.position.copy(life[i] > 0 ? pos[i] : HIDDEN);
        dummy.scale.setScalar(Math.max(0.2, life[i]));
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    }
    const d = drones.current;
    if (d) {
      for (let i = 0; i < 10; i++) {
        if (i >= swarm) dummy.position.set(0, -99, 0);
        else {
          const x = 0.9 + (((REDUCE ? 0 : t * 0.25) + i * 0.42) % 4.2);
          dummy.position.set(x, 0.92, -3.1);
        }
        dummy.rotation.set(0, Math.PI / 2, 0);
        dummy.scale.setScalar(2.4);
        dummy.updateMatrix();
        d.setMatrixAt(i, dummy.matrix);
      }
      d.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <Nave tone="#b8a894" back />
      <group position={[0, 0, -6.1]}>
        <mesh geometry={frame}>
          <meshStandardMaterial color="#3e3a37" metalness={0.8} roughness={0.35} />
        </mesh>
        <group position={[0, 0, 0.21]}>
          <Fire scale={[3, 4]} flow={0.35}>
            <primitive object={mouthGeo} attach="geometry" />
          </Fire>
        </group>
      </group>
      <pointLight ref={furnace} position={[0, 1.6, -5.2]} color="#ff6a3a" intensity={7} distance={14} decay={1.6} />
      <group rotation={[-Math.PI / 2, 0, 0]} position={[-1.1, 0.012, -1.6]}>
        <Fire scale={[1.2, 14]} flow={0.2}>
          <planeGeometry args={[0.55, 9]} />
        </Fire>
      </group>
      <pointLight position={[-1.1, 0.5, -1.2]} color="#ff5a2a" intensity={2.2} distance={5} decay={2} />
      <group position={[0, 0, -3.2]}>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[1.05, 1.15, 0.8, 24]} />
          <meshStandardMaterial map={tex.rivet} color="#4a423c" metalness={0.75} roughness={0.4} />
        </mesh>
        <mesh geometry={anvil} position={[0, 0.8, 0]} scale={0.9}>
          <meshStandardMaterial map={tex.rivet} color="#6a625c" metalness={0.8} roughness={0.35} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.75, 2.1, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 2.8, 16]} />
            <meshStandardMaterial color="#4a423c" metalness={0.8} roughness={0.35} />
          </mesh>
        ))}
        <mesh position={[0, 3.45, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 1.7, 16]} />
          <meshStandardMaterial color={GILT} metalness={0.85} roughness={0.3} />
        </mesh>
        <group ref={hammer} position={[0, 1.2, 0]}>
          <mesh geometry={head}>
            <meshStandardMaterial color="#55504a" metalness={0.85} roughness={0.3} />
          </mesh>
        </group>
      </group>
      <mesh position={[2.3, 0.85, -3.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.4, 0.5]} />
        <meshStandardMaterial map={belt} color="#6a625c" metalness={0.6} roughness={0.5} />
      </mesh>
      <instancedMesh ref={drones} args={[dart, undefined, 10]}>
        <meshStandardMaterial color="#6e655c" metalness={0.7} roughness={0.4} emissive="#c45a4a" emissiveIntensity={0.5} />
      </instancedMesh>
      <instancedMesh ref={sparks} args={[undefined, undefined, SPARKS]}>
        <sphereGeometry args={[0.018, 4, 3]} />
        <meshBasicMaterial color="#ffc27a" toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

// LAB: a rite chamber. The relic turns inside rune rings; the floor ring fills with the rite.
const BUBBLES = 36;
const TANKS: [number, number][] = [
  [-1.55, -1.2],
  [1.55, -1.2],
  [-1.55, -3.6],
  [1.55, -3.6],
];

function Lab() {
  const tex = useRoomTextures();
  const active = useNidus((s) => s.activeTech);
  const progress = useNidus((s) => {
    const id = s.activeTech;
    if (!id) return 0;
    const spec = TECH.find((x) => x.id === id);
    return Math.round(Math.min(1, (s.tech[id]?.progress ?? 0) / Math.max(1, spec?.work ?? 1)) * 40) / 40;
  });
  const floorTex = useTiled(tex.filigree, 2, 2);
  const glass = useTiled(tex.rose, 2, 2);
  const relic = useRef<Mesh>(null);
  const rings = useRef<Group>(null);
  const light = useRef<PointLight>(null);
  const bubbles = useRef<InstancedMesh>(null);
  const seeds = useMemo(() => Array.from({ length: BUBBLES }, (_, i) => ({ tank: i % 4, off: Math.random(), speed: 0.2 + Math.random() * 0.35, x: (Math.random() - 0.5) * 0.3, z: (Math.random() - 0.5) * 0.3 })), []);
  const altar = useGeo(
    () =>
      new LatheGeometry(
        ([[0, 0], [0.9, 0], [0.9, 0.12], [0.6, 0.24], [0.36, 0.3], [0.3, 1.0], [0.52, 1.14], [0.52, 1.22], [0, 1.22]] as [number, number][]).map(([r, y]) => new Vector2(r, y)),
        24,
      ),
  );
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.1);
    const pace = active ? 2.6 : 0.8;
    if (relic.current && !REDUCE) {
      relic.current.rotation.y += dt * 0.4 * pace;
      relic.current.rotation.x += dt * 0.13 * pace;
      relic.current.position.y = 2.25 + Math.sin(t * 0.9) * 0.08;
    }
    if (rings.current && !REDUCE) {
      rings.current.children.forEach((r, i) => {
        r.rotation.z += dt * (0.25 + i * 0.18) * pace * (i % 2 ? -1 : 1);
        r.rotation.x += dt * 0.05 * pace;
      });
    }
    if (light.current) light.current.intensity = 3.2 + (active ? 1.6 : 0) + (REDUCE ? 0 : Math.sin(t * 2.4) * 0.6);
    glass.offset.y = REDUCE ? 0 : t * 0.03;
    const b = bubbles.current;
    if (b) {
      seeds.forEach((s, i) => {
        const [tx, tz] = TANKS[s.tank];
        const u = REDUCE ? s.off : (s.off + t * s.speed * (active ? 1.8 : 1)) % 1;
        dummy.position.set(tx + s.x, 0.3 + u * 1.9, tz + s.z);
        dummy.scale.setScalar(0.6 + u * 0.6);
        dummy.updateMatrix();
        b.setMatrixAt(i, dummy.matrix);
      });
      b.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group>
      <Nave tone="#cfc2ad" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -2.4]}>
        <circleGeometry args={[2.1, 48]} />
        <meshStandardMaterial map={floorTex} color="#b8a88c" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -2.4]}>
        <ringGeometry args={[1.7, 1.82, 96]} />
        <meshBasicMaterial color="#1f3a2a" />
      </mesh>
      {progress > 0 && (
        <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.04, -2.4]}>
          <ringGeometry args={[1.7, 1.82, 96, 1, 0, Math.PI * 2 * progress]} />
          <meshBasicMaterial color="#2aff7a" toneMapped={false} />
        </mesh>
      )}
      <mesh geometry={altar} position={[0, 0, -2.4]}>
        <meshStandardMaterial map={tex.bone} color="#d8cbb8" metalness={0.2} roughness={0.6} />
      </mesh>
      <mesh ref={relic} position={[0, 2.25, -2.4]}>
        <icosahedronGeometry args={[0.36, 1]} />
        <meshStandardMaterial map={glass} emissiveMap={glass} emissive="#8affb8" emissiveIntensity={1.4} flatShading metalness={0.2} roughness={0.2} toneMapped={false} />
      </mesh>
      <group ref={rings} position={[0, 2.25, -2.4]}>
        {[0.7, 0.95, 1.2].map((r, i) => (
          <mesh key={r} rotation={[0.6 + i * 0.5, i * 0.7, 0]}>
            <torusGeometry args={[r, 0.018, 6, 72]} />
            <meshStandardMaterial color={GILT} emissive={GILT} emissiveIntensity={0.5} metalness={0.9} roughness={0.25} />
          </mesh>
        ))}
      </group>
      <pointLight ref={light} position={[0, 2.25, -2.4]} color="#2aff7a" intensity={3.2} distance={7} decay={1.8} />
      {TANKS.map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 2.2, 20, 1, true]} />
            <meshStandardMaterial color="#a8ffd0" transparent opacity={0.16} metalness={0.1} roughness={0.05} side={DoubleSide} depthWrite={false} />
          </mesh>
          <mesh position={[0, 1.0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 1.8, 16]} />
            <meshStandardMaterial color="#0e3a22" emissive="#1faf5b" emissiveIntensity={0.9} transparent opacity={0.55} depthWrite={false} />
          </mesh>
          {[0.1, 2.3].map((y) => (
            <mesh key={y} position={[0, y, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.12, 20]} />
              <meshStandardMaterial color={GILT} metalness={0.85} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      <instancedMesh ref={bubbles} args={[undefined, undefined, BUBBLES]}>
        <sphereGeometry args={[0.025, 6, 4]} />
        <meshBasicMaterial color="#b8ffd8" toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

// MINDS: throne hall. Every seat is a throne; seated commanders hang as lit portrait banners.
const BANNER_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const BANNER_FRAG = `uniform sampler2D uMap; uniform float uTime; uniform float uOn; varying vec2 vUv;
void main(){
  vec2 uv = vec2(vUv.x, 0.35 + vUv.y * 0.65);
  vec4 c = texture2D(uMap, uv);
  float scan = 0.92 + 0.08 * sin(vUv.y * 180.0 + uTime * 3.0);
  float edge = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x) * smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
  gl_FragColor = vec4(c.rgb * scan * mix(0.25, 1.1, uOn), edge * mix(0.35, 0.95, uOn));
}`;

function Banner({ src, position, on }: { src: string; position: [number, number, number]; on: boolean }) {
  const mat = useRef<ShaderMaterial>(null);
  const map = useMemo(() => {
    const t = new TextureLoader().load(src);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [src]);
  useEffect(() => () => map.dispose(), [map]);
  const uniforms = useMemo(() => ({ uMap: { value: map }, uTime: { value: 0 }, uOn: { value: on ? 1 : 0 } }), [map, on]);
  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = REDUCE ? 0 : state.clock.elapsedTime;
  });
  return (
    <mesh position={position}>
      <planeGeometry args={[0.9, 1.35]} />
      <shaderMaterial ref={mat} vertexShader={BANNER_VERT} fragmentShader={BANNER_FRAG} uniforms={uniforms} transparent depthWrite={false} />
    </mesh>
  );
}

function throneGeo() {
  const back = new ExtrudeGeometry(archShape(0.3, 0.9, 0.55), { depth: 0.1, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1, curveSegments: 8 });
  back.translate(0, 0.35, -0.25);
  const seat = new CylinderGeometry(0.34, 0.36, 0.35, 16);
  seat.translate(0, 0.175, 0);
  const parts: BufferGeometry[] = [back, seat];
  for (const s of [-1, 1]) {
    const p = new LatheGeometry(([[0, 0], [0.05, 0], [0.05, 0.3], [0, 0.55]] as [number, number][]).map(([r, y]) => new Vector2(r, y)), 10);
    p.translate(s * 0.3, 1.25, -0.2);
    parts.push(p);
  }
  return merge(parts)!;
}

const CANDLES = 28;

function Minds() {
  const cap = useNidus((s) => Math.max(1, Math.min(7, throneCap(s))));
  const seated = useNidus((s) =>
    s.minds
      .filter((m) => m.alive && m.seated)
      .slice(0, 7)
      .map((m) => m.portrait)
      .join("|"),
  );
  const waking = useNidus((s) => Boolean(s.waking));
  const court = useNidus((s) => {
    const ids = [...s.sovereigns];
    if (s.trial && Date.now() < s.trial.until && !ids.includes(s.trial.id)) ids.push(s.trial.id);
    return ids.slice(0, 3).join("|");
  });
  const courtArt = court ? court.split("|").map((id) => SOVEREIGNS.find((h) => h.id === id)?.art).filter((a): a is string => Boolean(a)) : [];
  const tex = useRoomTextures();
  const velvet = useTiled(tex.filigree, 4, 1);
  const thrones = useRef<InstancedMesh>(null);
  const circle = useRef<MeshStandardMaterial>(null);
  const flames = useRef<PointsMaterial>(null);
  const tGeo = useGeo(throneGeo);
  const portraits = seated ? seated.split("|") : [];
  const seats = useMemo(
    () =>
      Array.from({ length: cap }, (_, i) => {
        const a = cap === 1 ? 0 : -0.9 + (1.8 * i) / (cap - 1);
        return { x: Math.sin(a) * 1.7, z: -3.9 + (1 - Math.cos(a)) * 1.1, ry: -a };
      }),
    [cap],
  );
  useEffect(() => {
    const m = thrones.current;
    if (!m) return;
    seats.forEach((s, i) => {
      dummy.position.set(s.x, 0.34, s.z);
      dummy.rotation.set(0, s.ry, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.count = seats.length;
    m.instanceMatrix.needsUpdate = true;
  }, [seats]);
  const candleGeo = useGeo(() => {
    const g = new BufferGeometryC();
    const a: number[] = [];
    for (let i = 0; i < CANDLES; i++) {
      const side = i % 2 ? 1 : -1;
      a.push(side * (1.35 + (i % 4) * 0.05), 0.95 + (i % 3) * 0.08, 2.4 - Math.floor(i / 2) * 0.42);
    }
    g.setAttribute("position", new Float32BufferAttribute(a, 3));
    return g;
  });
  const glow = useMemo(() => glowTexture(), []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (circle.current) circle.current.emissiveIntensity = waking ? 1.2 + (REDUCE ? 0 : Math.sin(t * 4) * 0.5) : 0.15;
    if (flames.current) flames.current.size = 0.32 + (REDUCE ? 0 : Math.sin(t * 13) * 0.03 + Math.sin(t * 5.3) * 0.03);
  });
  return (
    <group>
      <Nave tone="#c2b49e" />
      <mesh position={[0, 0.17, -3.6]}>
        <cylinderGeometry args={[2.3, 2.45, 0.34, 40]} />
        <meshStandardMaterial map={velvet} color="#6a2a30" metalness={0.3} roughness={0.6} />
      </mesh>
      <instancedMesh ref={thrones} args={[tGeo, undefined, 7]}>
        <meshStandardMaterial map={tex.rivet} color="#b09a80" metalness={0.8} roughness={0.3} envMapIntensity={1.2} />
      </instancedMesh>
      {seats.map((s, i) => (
        <Banner key={`${i}-${portraits[i] ?? "none"}`} src={portraits[i] ?? "/nidus/warden.jpg"} on={Boolean(portraits[i])} position={[s.x, 2.75, s.z - 0.15]} />
      ))}
      {courtArt.length > 0 && (
        <group position={[0, 0, -5.4]}>
          <mesh position={[0, 0.45, 0]}>
            <cylinderGeometry args={[1.6, 1.7, 0.9, 32]} />
            <meshStandardMaterial map={tex.rivet} color="#7a2a30" metalness={0.5} roughness={0.45} />
          </mesh>
          {courtArt.map((art, i) => {
            const x = (i - (courtArt.length - 1) / 2) * 1.2;
            return (
              <group key={art}>
                <Banner src={art} on position={[x, 4.15, 0.1]} />
                <mesh position={[x, 4.15, 0.05]}>
                  <planeGeometry args={[1.0, 1.46]} />
                  <meshStandardMaterial color="#6e5530" emissive="#8a6a3a" emissiveIntensity={0.18} metalness={0.9} roughness={0.35} />
                </mesh>
              </group>
            );
          })}
          <pointLight position={[0, 4.0, 1.2]} color="#ffd59a" intensity={3} distance={5} decay={1.8} />
        </group>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -0.4]}>
        <ringGeometry args={[0.7, 0.8, 64]} />
        <meshStandardMaterial ref={circle} color="#2a0e10" emissive="#c45a4a" emissiveIntensity={0.15} toneMapped={false} />
      </mesh>
      <points geometry={candleGeo}>
        <pointsMaterial ref={flames} map={glow} color="#ffb070" size={0.32} transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </points>
      <pointLight position={[0, 3.2, -2.2]} color="#ffc890" intensity={7} distance={9} decay={1.6} />
      <pointLight position={[0, 1.2, 1.2]} color="#c45a4a" intensity={2} distance={6} decay={2} />
      <pointLight position={[0, 4.5, -4.8]} color="#d8b884" intensity={3} distance={6} decay={2} />
    </group>
  );
}

export function Interior({ tab }: { tab: string }) {
  if (tab === "forge") return <Forge />;
  if (tab === "lab") return <Lab />;
  if (tab === "minds") return <Minds />;
  return null;
}

export const INTERIOR_TABS = new Set(["forge", "lab", "minds"]);
