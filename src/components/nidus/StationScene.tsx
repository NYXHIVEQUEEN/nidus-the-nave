import { Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PerformanceMonitor, Stars, useTexture } from "@react-three/drei";
import type { BufferGeometry as BufferGeometryT, Group, InstancedMesh, Mesh, MeshBasicMaterial, MeshStandardMaterial, Points, SpriteMaterial, Texture } from "three";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  LatheGeometry,
  Object3D as Obj3D,
  PMREMGenerator,
  RepeatWrapping,
  SRGBColorSpace,
  NoColorSpace,
  TOUCH,
  Vector2,
  Vector3,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoomModules } from "./RoomModules";
import { INTERIOR_CAM, INTERIOR_LOOK, INTERIOR_TABS, Interior, ROOM_CAMS } from "./Interiors";
import { ROOM_SOCKETS } from "./roomKit";
import { useNidus } from "@/lib/nidus/store";
import { chime } from "@/lib/nidus/audio";
import { CAM_DEFAULT, CAM_MAX, CAM_MIN, CAM_POLAR, applyCamPreset, camPosition, getPrefs, patchPrefs, subscribeSpin } from "@/lib/nidus/view";
import {
  ENGINES,
  NAV_LIGHTS,
  ROSE,
  bandsGeo,
  buttressGeo,
  droneGeo,
  glowTexture,
  keelGeo,
  lancetGeo,
  machineryGeo,
  naveGeo,
  rockGeo,
  roofGeo,
  wingGeo,
} from "./hullKit";

const dummy = new Obj3D();
// Raid duel sits above and behind the ship so both hulls fit a portrait phone.
const FOE = new Vector3(0.3, 1.7, -3.8);
const FOE_LOOK = new Vector3(0.35, 0.85, -1.7);
const _look = new Vector3();
const GILT = "#c4a574";
const BLOOD = "#7a1f2b";
const BONE_IRON = "#cfc3b0";
const IRON = "#3e3a37";
const REDUCE =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Camera look-at targets: room sockets in ship space, scaled roughly to the on-screen ship.
const SOCKETS: Record<string, [number, number, number]> = Object.fromEntries(
  Object.entries(ROOM_SOCKETS).map(([id, k]) => [id, [k.p[0] * 1.25, k.p[1] * 1.25, k.p[2] * 1.25]]),
);

function useSpin() {
  return useSyncExternalStore(subscribeSpin, getPrefs, getPrefs);
}

function useHullTextures() {
  const [rivet, rough, rose, plate] = useTexture([
    "/nidus/tex-rivet.jpg",
    "/nidus/tex-rough.jpg",
    "/nidus/tex-rose.jpg",
    "/nidus/tex-hull.jpg",
  ]);
  rivet.colorSpace = SRGBColorSpace;
  plate.colorSpace = SRGBColorSpace;
  rose.colorSpace = SRGBColorSpace;
  rough.colorSpace = NoColorSpace;
  const ani = typeof window !== "undefined" && window.innerWidth < 500 ? 4 : 8;
  for (const t of [rivet, rough, rose, plate]) {
    t.wrapS = t.wrapT = RepeatWrapping;
    t.anisotropy = ani;
  }
  return { rivet, rough, rose, plate };
}

function tiled(t: Texture, x: number, y: number) {
  const c = t.clone();
  c.repeat.set(x, y);
  c.needsUpdate = true;
  return c;
}

function Hardpoints({ railgun, cannon, railRank = 0, canRank = 0 }: { railgun: boolean; cannon: boolean; railRank?: number; canRank?: number }) {
  // Only designed teeth change the silhouette. Other rooms pay their sim bonus.
  return (
    <group>
      {railgun && (
        <group position={[0.44, 0.0, 0.2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.06, 0.18, 6, 16]} />
            <meshStandardMaterial color={IRON} metalness={0.6} roughness={0.42} dithering />
          </mesh>
          <mesh position={[0, 0.02, 0.44 + railRank * 0.025]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.014, 0.02, 0.7 + railRank * 0.05, 12]} />
            <meshStandardMaterial color={GILT} metalness={0.85} roughness={0.32} envMapIntensity={1} />
          </mesh>
        </group>
      )}
      {cannon && (
        <group position={[-0.44, 0.0, 0.2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.065, 0.14, 6, 16]} />
            <meshStandardMaterial color={IRON} metalness={0.6} roughness={0.42} dithering />
          </mesh>
          {(canRank >= 2 ? [-0.035, 0.035] : [0]).map((x) => (
            <mesh key={`can-${x}`} position={[x, 0.02, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.018, 0.024, 0.34 + canRank * 0.02, 12]} />
              <meshStandardMaterial color={IRON} metalness={0.7} roughness={0.36} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function EngineGlow({ glow, surging }: { glow: number; surging: boolean }) {
  const tex = useMemo(() => glowTexture(), []);
  const cores = useRef<(SpriteMaterial | null)[]>([]);
  const halos = useRef<(SpriteMaterial | null)[]>([]);
  const plumes = useRef<(Mesh | null)[]>([]);
  const plumeU = useMemo(() => ({ uHeat: { value: 0.6 }, uTime: { value: 0 } }), []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const heat = 0.55 + glow * 0.3 + (surging ? 0.25 : 0);
    plumeU.uHeat.value = heat;
    plumeU.uTime.value = REDUCE ? 0 : t;
    for (const m of plumes.current) if (m) m.scale.set(1, 0.75 + heat * 0.45 + (surging ? 0.3 : 0), 1);
    ENGINES.forEach((_, i) => {
      const flick = REDUCE ? 0 : Math.sin(t * 23 + i * 1.7) * 0.05 + Math.sin(t * 7.1 + i) * 0.04;
      const c = cores.current[i];
      const h = halos.current[i];
      if (c) c.opacity = Math.min(1, heat + flick);
      if (h) h.opacity = Math.min(0.85, heat * 0.55 + flick);
    });
  });
  return (
    <group>
      {ENGINES.map(([x, y, z, r], i) => (
        <group key={`eng-${i}`} position={[x, y, z]}>
          <mesh position={[0, 0, 0.03]} rotation={[0, Math.PI, 0]}>
            <circleGeometry args={[r * 0.95, 24]} />
            <meshBasicMaterial color="#ffc89a" toneMapped={false} />
          </mesh>
          <sprite scale={[r * 3.2, r * 3.2, 1]}>
            <spriteMaterial ref={(m) => { cores.current[i] = m; }} map={tex} color="#ffd9b0" blending={AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
          </sprite>
          <sprite scale={[r * 7, r * 7, 1]}>
            <spriteMaterial ref={(m) => { halos.current[i] = m; }} map={tex} color="#c45a4a" blending={AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
          </sprite>
          <mesh ref={(m) => { plumes.current[i] = m; }} position={[0, 0, -r * 5]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[r * 0.35, r * 0.9, r * 10, 16, 1, true]} />
            <shaderMaterial vertexShader={PLUME_VERT} fragmentShader={PLUME_FRAG} uniforms={plumeU} transparent depthWrite={false} blending={AdditiveBlending} side={DoubleSide} />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, 0, -3.3]} color="#ff9a6a" intensity={surging ? 3 : 1.6} distance={3.2} decay={2} />
    </group>
  );
}

const PLUME_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;
const PLUME_FRAG = `uniform float uHeat; uniform float uTime; varying vec2 vUv;
void main(){
  float along = 1.0 - vUv.y;
  float core = pow(along, 2.2);
  float flick = 0.85 + 0.15 * sin(uTime * 31.0 + along * 18.0);
  vec3 hot = mix(vec3(0.77, 0.21, 0.16), vec3(1.0, 0.85, 0.6), core);
  gl_FragColor = vec4(hot * core * flick * uHeat * 0.55, core * uHeat * 0.7);
}`;

function NavLights() {
  const tex = useMemo(() => glowTexture(), []);
  const mats = useRef<(SpriteMaterial | null)[]>([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    NAV_LIGHTS.forEach((l, i) => {
      const m = mats.current[i];
      if (!m) return;
      const cycle = (t / 1.6 + l.phase) % 1;
      m.opacity = REDUCE ? 0.7 : cycle < 0.08 ? 1 : 0.18 + 0.12 * Math.max(0, 1 - cycle * 4);
    });
  });
  return (
    <group>
      {NAV_LIGHTS.map((l, i) => (
        <sprite key={`nav-${i}`} position={l.p} scale={[0.16, 0.16, 1]}>
          <spriteMaterial ref={(m) => { mats.current[i] = m; }} map={tex} color={l.color} blending={AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
        </sprite>
      ))}
    </group>
  );
}

function RoseWindow({ rose }: { rose: Texture }) {
  return (
    <group position={[0, ROSE.y, ROSE.z]}>
      <mesh>
        <circleGeometry args={[ROSE.r, 32]} />
        <meshStandardMaterial map={rose} emissiveMap={rose} emissive="#ffffff" emissiveIntensity={0.85} roughness={0.2} metalness={0} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <torusGeometry args={[ROSE.r, 0.014, 8, 40]} />
        <meshStandardMaterial color={GILT} metalness={0.9} roughness={0.28} envMapIntensity={1.1} />
      </mesh>
    </group>
  );
}

function Hull() {
  const railgun = useNidus((s) => Boolean(s.rooms.railgun?.built));
  const cannon = useNidus((s) => Boolean(s.rooms.cannon?.built));
  const roomsLit = useNidus(
    (s) =>
      Number(Boolean(s.rooms.solar?.built)) +
      Number(Boolean(s.rooms.orebay?.built)) +
      Number(Boolean(s.rooms.hangar?.built)) +
      Number(Boolean(s.rooms.gundeck?.built)) +
      Number(Boolean(s.rooms.lab?.built)) +
      Number(Boolean(s.rooms.nerve?.built)),
  );
  const molt = useNidus((s) => s.moltLayer);
  const raidEnds = useNidus((s) => s.raid?.endsAt ?? 0);
  const raidStart = useNidus((s) => s.raid?.startedAt ?? 0);
  const raidWing = useNidus((s) => s.raid?.strikers ?? 0);
  const watching = useNidus((s) => Boolean(s.raid?.watching));
  const glow = useNidus((s) => Math.round(Math.min(1, s.spark / 18) * 10) / 10);
  const surging = useNidus((s) => s.surgeUntil > Date.now());
  const railgunRank = useNidus((s) => s.rooms.railgun?.rank ?? 0);
  const cannonRank = useNidus((s) => s.rooms.cannon?.rank ?? 0);
  const { size } = useThree();

  const { rivet, rough, rose, plate } = useHullTextures();
  const tex = useMemo(
    () => ({
      nave: tiled(plate, 3, 5),
      naveRough: tiled(rough, 3, 5),
      roof: tiled(plate, 2.4, 2.4),
      wing: tiled(plate, 1.6, 1.6),
      iron: tiled(rivet, 3, 3),
      lead: tiled(rivet, 2, 3),
      glass: tiled(rose, 4, 4),
    }),
    [rivet, rough, rose, plate],
  );
  const geo = useMemo(
    () => ({
      nave: naveGeo(),
      roof: roofGeo(),
      wing: wingGeo(),
      buttress: buttressGeo(),
      bands: bandsGeo(),
      keel: keelGeo(),
      machine: machineryGeo(),
      lancets: lancetGeo(),
      dart: droneGeo(),
    }),
    [],
  );
  useEffect(
    () => () => {
      for (const g of Object.values(geo)) g.dispose();
      for (const t of Object.values(tex)) t.dispose();
    },
    [geo, tex],
  );

  const stationRef = useRef<Group>(null);
  const fighters = useRef<InstancedMesh>(null);
  const glass = useRef<MeshStandardMaterial>(null);
  const bloodC = useMemo(() => new Color(BLOOD), []);
  const fit = Math.min(1, Math.max(0.62, (size.width / Math.max(1, size.height)) * 1.35));

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;
    if (typeof document !== "undefined" && document.hidden) return;
    const ship = stationRef.current;
    if (ship) {
      ship.visible = !watching;
      ship.scale.setScalar((1.34 + roomsLit * 0.008 + molt * 0.016) * fit);
      // A slow patrol weave: yaw leads, the bank follows the turn, the nose dips into it.
      const yaw = REDUCE ? 0 : Math.sin(t * 0.075) * 0.07;
      const turn = REDUCE ? 0 : Math.cos(t * 0.075) * 0.075 * 0.07;
      ship.rotation.y = yaw;
      ship.rotation.z = -turn * 9 + (REDUCE ? 0 : Math.sin(t * 0.43) * 0.006);
      ship.rotation.x = REDUCE ? 0 : Math.sin(t * 0.11 + 1.3) * 0.01;
      ship.position.y = REDUCE ? 0 : Math.sin(t * 0.21) * 0.04;
    }
    if (glass.current) glass.current.emissiveIntensity = 0.9 + glow * 0.4 + (surging ? 0.35 : 0);
    const now = Date.now();
    const fighting = raidEnds > now;
    const u = fighting ? (now - raidStart) / Math.max(1, raidEnds - raidStart) : 0;
    const wing = fighters.current;
    if (wing) {
      const n = Math.min(8, Math.max(0, raidWing));
      for (let i = 0; i < 8; i++) {
        if (!fighting || i >= n) {
          dummy.position.set(0, -80, 0);
          dummy.scale.setScalar(0.001);
        } else {
          const launch = Math.max(0, Math.min(1, u * 2.4 - i * 0.07));
          const a = t * 0.9 + i * 0.7;
          const wob = Math.sin(a) * (0.25 + launch * 0.5);
          dummy.position.set(
            FOE.x * launch + wob,
            -0.5 + (FOE.y + 0.5) * launch + Math.cos(a) * 0.2 * launch,
            -1.4 + (FOE.z + 1.4 + 0.8) * launch,
          );
          dummy.lookAt(FOE);
          dummy.scale.setScalar(2.2 + launch * 0.8);
        }
        dummy.updateMatrix();
        wing.setMatrixAt(i, dummy.matrix);
      }
      wing.instanceMatrix.needsUpdate = true;
      wing.visible = fighting;
    }
    const info = state.gl.info.render;
    (globalThis as typeof globalThis & { __nidusPerf?: { calls: number; triangles: number; frameMs: number } }).__nidusPerf = {
      calls: info.calls,
      triangles: info.triangles,
      frameMs: d * 1000,
    };
  });

  return (
    <group>
      <group ref={stationRef}>
        <mesh geometry={geo.nave}>
          <meshStandardMaterial map={tex.nave} bumpMap={tex.nave} bumpScale={1.1} roughnessMap={tex.naveRough} color={BONE_IRON} vertexColors metalness={0.5} roughness={0.52} envMapIntensity={0.7} dithering />
        </mesh>
        <mesh geometry={geo.roof}>
          <meshStandardMaterial map={tex.lead} bumpMap={tex.lead} bumpScale={0.5} color="#6f6862" vertexColors metalness={0.55} roughness={0.5} envMapIntensity={0.6} dithering />
        </mesh>
        <mesh geometry={geo.wing}>
          <meshStandardMaterial map={tex.wing} bumpMap={tex.wing} bumpScale={0.7} color="#a79c8e" vertexColors metalness={0.55} roughness={0.46} envMapIntensity={0.65} dithering />
        </mesh>
        <mesh geometry={geo.machine}>
          <meshStandardMaterial map={tex.iron} color="#8a8078" vertexColors metalness={0.72} roughness={0.4} envMapIntensity={0.7} side={DoubleSide} dithering />
        </mesh>
        <mesh geometry={geo.buttress}>
          <meshStandardMaterial color="#9a8e80" metalness={0.65} roughness={0.4} envMapIntensity={0.8} dithering />
        </mesh>
        <mesh geometry={geo.bands}>
          <meshStandardMaterial color={GILT} metalness={0.9} roughness={0.28} envMapIntensity={1.1} dithering />
        </mesh>
        <mesh geometry={geo.keel}>
          <meshStandardMaterial
            color={molt > 0 ? BLOOD : "#3a2226"}
            metalness={0.3}
            roughness={0.34}
            emissive={molt > 0 ? BLOOD : "#000000"}
            emissiveIntensity={molt > 0 ? 0.16 + molt * 0.07 : 0}
            envMapIntensity={0.8}
            dithering
          />
        </mesh>
        <mesh geometry={geo.lancets}>
          <meshStandardMaterial ref={glass} map={tex.glass} emissiveMap={tex.glass} emissive="#ffffff" emissiveIntensity={1.1} roughness={0.25} metalness={0} toneMapped={false} />
        </mesh>
        <RoseWindow rose={rose} />
        <EngineGlow glow={glow} surging={surging} />
        <NavLights />
        <RoomModules plate={tex.roof} glass={tex.glass} />
        <Hardpoints railgun={railgun} cannon={cannon} railRank={railgunRank} canRank={cannonRank} />
      </group>
      <Harvest dart={geo.dart} shipScale={1.34 * fit} />
      <instancedMesh ref={fighters} args={[geo.dart, undefined, 8]} visible={false}>
        <meshStandardMaterial color="#9a9186" metalness={0.5} roughness={0.5} emissive={bloodC} emissiveIntensity={0.35} />
      </instancedMesh>
    </group>
  );
}

const ROCKS = 14;
const FIELD = new Vector3(-2.4, 1.0, 7.6);

function Harvest({ dart, shipScale }: { dart: BufferGeometry; shipScale: number }) {
  const miners = useNidus((s) => Math.min(22, 2 + s.swarm.miner));
  const raiding = useNidus((s) => Boolean(s.raid));
  const rough = useTexture("/nidus/tex-rough.jpg");
  const rock = useMemo(() => rockGeo(), []);
  const rocks = useRef<InstancedMesh>(null);
  const drones = useRef<InstancedMesh>(null);
  const field = useRef<Group>(null);
  const seats = useMemo(
    () =>
      Array.from({ length: ROCKS }, (_, i) => {
        const a = i * 2.399;
        const r = 0.6 + (i % 5) * 0.42;
        return {
          p: new Vector3(Math.cos(a) * r, Math.sin(i * 1.7) * 0.7, Math.sin(a) * r * 0.8),
          s: 0.14 + ((i * 37) % 11) * 0.035,
          rot: new Vector3(i * 0.7, i * 1.3, i * 0.4),
        };
      }),
    [],
  );
  useEffect(() => () => rock.dispose(), [rock]);
  useEffect(() => {
    const m = rocks.current;
    if (!m) return;
    seats.forEach((k, i) => {
      dummy.position.copy(k.p);
      dummy.rotation.set(k.rot.x, k.rot.y, k.rot.z);
      dummy.scale.setScalar(k.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  }, [seats]);

  const from = useMemo(() => new Vector3(), []);
  const to = useMemo(() => new Vector3(), []);
  const mid = useMemo(() => new Vector3(), []);
  const ahead = useMemo(() => new Vector3(), []);
  const at = (a: Vector3, c: Vector3, b: Vector3, u: number, out: Vector3) => {
    const v = 1 - u;
    return out.set(v * v * a.x + 2 * v * u * c.x + u * u * b.x, v * v * a.y + 2 * v * u * c.y + u * u * b.y, v * v * a.z + 2 * v * u * c.z + u * u * b.z);
  };

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (field.current && !REDUCE) field.current.rotation.y += Math.min(delta, 0.1) * 0.03;
    const m = drones.current;
    if (!m) return;
    m.visible = !raiding;
    if (raiding) return;
    from.set(0, -0.32 * shipScale, -0.8 * shipScale);
    for (let i = 0; i < 22; i++) {
      if (i >= miners) {
        dummy.position.set(0, -80, 0);
        dummy.scale.setScalar(0.001);
      } else {
        const seat = seats[i % ROCKS];
        to.copy(seat.p).applyAxisAngle(Y_AXIS, field.current?.rotation.y ?? 0).add(FIELD);
        mid.addVectors(from, to).multiplyScalar(0.5);
        mid.x += (i % 2 ? 1 : -1) * (1.2 + (i % 3) * 0.4);
        mid.y += 0.9 + (i % 4) * 0.2;
        const phase = (t * (0.045 + (i % 5) * 0.006) + i / miners) % 1;
        const out = phase < 0.5;
        const raw = out ? phase * 2 : 1 - (phase - 0.5) * 2;
        const u = raw * raw * (3 - 2 * raw);
        at(from, mid, to, u, dummy.position);
        at(from, mid, to, Math.min(1, Math.max(0, u + (out ? 0.01 : -0.01))), ahead);
        dummy.lookAt(ahead);
        dummy.scale.setScalar(1.7);
      }
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <group ref={field} position={FIELD}>
        <instancedMesh ref={rocks} args={[rock, undefined, ROCKS]}>
          <meshStandardMaterial map={rough} color="#8a7466" roughness={0.9} metalness={0.05} dithering />
        </instancedMesh>
      </group>
      <instancedMesh ref={drones} args={[dart, undefined, 22]}>
        <meshStandardMaterial color="#6e655c" metalness={0.65} roughness={0.4} emissive="#c45a4a" emissiveIntensity={0.55} envMapIntensity={0.8} />
      </instancedMesh>
    </group>
  );
}

const Y_AXIS = new Vector3(0, 1, 0);

function Dust() {
  const n = typeof window !== "undefined" && window.innerWidth < 500 ? 110 : 200;
  const pts = useRef<Points>(null);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = (Math.sin(i * 91.7) * 0.5 + 0.5) * 16 - 8;
      a[i * 3 + 1] = (Math.sin(i * 47.3) * 0.5 + 0.5) * 10 - 5;
      a[i * 3 + 2] = (Math.sin(i * 13.1) * 0.5 + 0.5) * 24 - 10;
    }
    g.setAttribute("position", new Float32BufferAttribute(a, 3));
    return g;
  }, [n]);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame((_, delta) => {
    if (REDUCE || !pts.current) return;
    const p = geo.getAttribute("position");
    const arr = p.array as Float32Array;
    const step = Math.min(delta, 0.1) * 0.9;
    for (let i = 0; i < n; i++) {
      let z = arr[i * 3 + 2] - step;
      if (z < -10) z += 24;
      arr[i * 3 + 2] = z;
    }
    p.needsUpdate = true;
  });
  return (
    <points ref={pts} geometry={geo}>
      <pointsMaterial color="#d8cbb8" size={0.035} sizeAttenuation transparent opacity={0.45} depthWrite={false} />
    </points>
  );
}

const PLANET_VERT = `varying vec3 vN; varying vec3 vW;
void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * w; }`;
const PLANET_FRAG = `uniform vec3 uLight; uniform vec3 uDay; uniform vec3 uNight; uniform vec3 uAir; varying vec3 vN; varying vec3 vW;
void main(){
  vec3 v = normalize(cameraPosition - vW);
  float l = dot(vN, normalize(uLight));
  float day = smoothstep(-0.08, 0.55, l);
  float band = 0.5 + 0.5 * sin(vN.y * 38.0 + vN.x * 7.0);
  vec3 col = mix(uNight, uDay * (0.82 + 0.18 * band), day);
  float rim = pow(1.0 - max(dot(vN, v), 0.0), 3.0);
  col += uAir * rim * (0.08 + 0.8 * smoothstep(-0.1, 0.5, l));
  gl_FragColor = vec4(col, 1.0);
}`;

// Planet limb: its own light so the crescent always faces the ship, whatever the key does.
function Planet() {
  const uniforms = useMemo(
    () => ({
      uLight: { value: new Vector3(-0.92, -0.13, -0.37) },
      uDay: { value: new Color("#9a6a52") },
      uNight: { value: new Color("#0e0b0b") },
      uAir: { value: new Color("#c45a4a") },
    }),
    [],
  );
  return (
    <mesh position={[-64, -2, 72]}>
      <sphereGeometry args={[13, 64, 40]} />
      <shaderMaterial vertexShader={PLANET_VERT} fragmentShader={PLANET_FRAG} uniforms={uniforms} fog={false} />
    </mesh>
  );
}

function Backdrop() {
  const arch = useTexture("/nidus/sky-arch.jpg");
  arch.colorSpace = SRGBColorSpace;
  return (
    <group>
      <mesh rotation={[0, 0.18, 0.04]}>
        <cylinderGeometry args={[150, 150, 320, 32, 1, true]} />
        <meshBasicMaterial map={arch} color="#2a2328" side={BackSide} depthWrite={false} fog={false} />
      </mesh>
      <mesh position={[26, 6, 60]} rotation={[0.35, 0.3, 0.12]}>
        <torusGeometry args={[7.5, 0.08, 8, 64]} />
        <meshBasicMaterial color={GILT} transparent opacity={0.22} depthWrite={false} />
      </mesh>
    </group>
  );
}


function BlackWell() {
  const disk = useRef<Group>(null);
  const tex = useMemo(() => glowTexture(), []);
  useFrame((state) => {
    if (disk.current && !REDUCE) disk.current.rotation.z = state.clock.elapsedTime * 0.04;
  });
  return (
    <group position={[-96, 6, 66]} scale={0.8}>
      <sprite scale={[16, 16, 1]}>
        <spriteMaterial map={tex} color="#7a1f2b" blending={AdditiveBlending} depthWrite={false} transparent opacity={0.55} toneMapped={false} fog={false} />
      </sprite>
      <mesh>
        <sphereGeometry args={[2.4, 32, 20]} />
        <meshBasicMaterial color="#000000" fog={false} />
      </mesh>
      <group rotation={[1.2, 0.32, 0.1]} ref={disk}>
        <mesh>
          <torusGeometry args={[3.4, 0.06, 8, 96]} />
          <meshBasicMaterial color="#c45a4a" transparent opacity={0.55} depthWrite={false} blending={AdditiveBlending} toneMapped={false} fog={false} />
        </mesh>
        <mesh>
          <torusGeometry args={[4.1, 0.025, 6, 96]} />
          <meshBasicMaterial color="#c4a574" transparent opacity={0.35} depthWrite={false} blending={AdditiveBlending} toneMapped={false} fog={false} />
        </mesh>
      </group>
    </group>
  );
}

function wreckGeo(): BufferGeometryT {
  const g = new LatheGeometry(
    ([[0, -0.9], [0.14, -0.86], [0.24, -0.5], [0.22, 0.1], [0.26, 0.4], [0.14, 0.82], [0, 0.9]] as [number, number][]).map(([r, z]) => new Vector2(r, z)),
    20,
  );
  g.rotateX(Math.PI / 2);
  g.scale(1.1, 0.75, 1);
  return g;
}

function BattleField() {
  const raid = useNidus((s) => s.raid);
  const boosted = (raid?.boostUntil ?? 0) > Date.now();
  const dead = Boolean(raid && raid.hp <= 0);
  const rivet = useTexture("/nidus/tex-rivet.jpg");
  rivet.colorSpace = SRGBColorSpace;
  const hull = useMemo(() => wreckGeo(), []);
  const fins = useMemo(() => wingGeo(), []);
  const tex = useMemo(() => glowTexture(), []);
  useEffect(
    () => () => {
      hull.dispose();
      fins.dispose();
    },
    [hull, fins],
  );
  const group = useRef<Group>(null);
  const tracerA = useRef<MeshBasicMaterial>(null);
  const tracerB = useRef<MeshBasicMaterial>(null);
  const lastHit = useRef(0);
  useFrame((state) => {
    if (!raid || !group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.set(FOE.x, FOE.y, dead ? FOE.z - (t % 8) * 0.08 : FOE.z);
    group.current.lookAt(0, 0, 0);
    const pulse = dead ? 0.05 : 0.25 + Math.sin(t * (boosted ? 14 : 8)) * 0.25;
    if (tracerA.current) tracerA.current.opacity = pulse;
    if (tracerB.current) tracerB.current.opacity = pulse * 0.7;
    if (!dead && t - lastHit.current > (boosted ? 0.85 : 1.35)) {
      lastHit.current = t;
      try {
        chime(t % 2 > 1 ? "rail" : "cannon");
      } catch {
        /* audio optional */
      }
    }
  });
  if (!raid) return null;
  return (
    <group ref={group} position={FOE}>
      <mesh geometry={hull} scale={1.3}>
        <meshStandardMaterial map={rivet} color={dead ? "#1a1614" : "#6a5e56"} metalness={0.4} roughness={0.6} envMapIntensity={0.5} dithering />
      </mesh>
      <mesh position={[0, 0.2, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.07, 0.4, 6, 12]} />
        <meshStandardMaterial color={dead ? "#141210" : "#3e3a37"} metalness={0.6} roughness={0.45} />
      </mesh>
      <mesh geometry={fins} scale={[0.7, 0.9, 0.62]} position={[0, 0.02, 0.9]}>
        <meshStandardMaterial color={dead ? "#141210" : "#4a3e3a"} metalness={0.55} roughness={0.5} dithering />
      </mesh>
      {!dead && (
        <>
          <sprite position={[0, 0, -1.25]} scale={[0.7, 0.7, 1]}>
            <spriteMaterial map={tex} color="#c45a4a" blending={AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
          </sprite>
          <sprite position={[0, 0.28, 0.5]} scale={[0.22, 0.22, 1]}>
            <spriteMaterial map={tex} color="#ff3a2a" blending={AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
          </sprite>
        </>
      )}
      {!dead && (
        <>
          <mesh position={[0.2, 0.12, 2.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 4.6, 5]} />
            <meshBasicMaterial ref={tracerA} color="#ffb08a" transparent opacity={0.35} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
          </mesh>
          <mesh position={[-0.25, 0.08, 2.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 3.4, 5]} />
            <meshBasicMaterial ref={tracerB} color="#ff7a55" transparent opacity={0.28} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
          </mesh>
        </>
      )}
    </group>
  );
}

function Rig() {
  const prefs = useSpin();
  const { size } = useThree();
  const lastCam = useRef(-1);
  const lastDist = useRef(-1);
  const ctl = useRef<{ target: Vector3; autoRotate: boolean } | null>(null);
  const roomsLit = useNidus(
    (s) => Number(Boolean(s.rooms.solar?.built)) + Number(Boolean(s.rooms.hangar?.built)) + Number(Boolean(s.rooms.gundeck?.built)),
  );
  const molt = useNidus((s) => s.moltLayer);
  const raiding = useNidus((s) => Boolean(s.raid));
  const watching = useNidus((s) => Boolean(s.raid?.watching));
  const showShip = useNidus((s) => s.tab === "raid" || s.tab === "hull");
  const tab = useNidus((s) => s.tab);
  const inside = INTERIOR_TABS.has(tab);
  const wasInside = useRef(false);
  const extent = 1 + roomsLit * 0.55 + molt * 0.85;
  const touched = useRef(0);
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const cam = state.camera;
    if (inside) {
      // A slow breathing dolly inside the room; no orbit.
      const t = state.clock.elapsedTime;
      const k = wasInside.current ? 1 - Math.exp(-dt * 2.2) : 1;
      wasInside.current = true;
      const pose = ROOM_CAMS[tab] ?? { cam: INTERIOR_CAM, look: INTERIOR_LOOK };
      _look.set(pose.cam.x + (REDUCE ? 0 : Math.sin(t * 0.13) * 0.25), pose.cam.y + (REDUCE ? 0 : Math.sin(t * 0.21) * 0.06), pose.cam.z);
      cam.position.lerp(_look, k);
      cam.lookAt(pose.look);
      return;
    }
    if (wasInside.current) {
      wasInside.current = false;
      const [x, y, z] = camPosition(prefs.camDist);
      cam.position.set(x, y, z);
      touched.current = performance.now();
    }
    if ("fov" in cam && Math.abs((cam.fov as number) - prefs.camFov) > 0.04) {
      cam.fov = prefs.camFov;
      cam.updateProjectionMatrix();
    }
    const framed = lastCam.current !== prefs.camGen;
    const slid = Math.abs(lastDist.current - prefs.camDist) > 0.04;
    if (framed || slid) {
      lastCam.current = prefs.camGen;
      lastDist.current = prefs.camDist;
      const [x, y, z] = camPosition(prefs.camDist);
      cam.position.set(x, y, z);
      touched.current = performance.now();
    }
    const p = getPrefs();
    const looking = Boolean(p.lookId) && Date.now() < p.lookUntil;
    const sock = looking ? SOCKETS[p.lookId] : undefined;
    if (sock) _look.set(sock[0], sock[1] * 0.85, sock[2]);
    else if (raiding) _look.copy(FOE_LOOK);
    else _look.set(0, 0.05, 0);
    if (ctl.current) {
      const k = 1 - Math.exp(-dt * (looking ? 3.4 : 1.8));
      ctl.current.target.lerp(_look, k);
      ctl.current.autoRotate = !p.spinPaused && !looking && !raiding;
    }
    if (raiding && performance.now() - touched.current > 900) {
      const tall = size.height > size.width * 1.2 ? 1.5 : 1;
      const want = (watching ? 11.5 : 14) * tall;
      const [tx, ty, tz] = [FOE_LOOK.x + want * 0.8, FOE_LOOK.y + want * 0.3, FOE_LOOK.z - want * 0.52];
      const k = 1 - Math.exp(-dt * 1.4);
      cam.position.x += (tx - cam.position.x) * k;
      cam.position.y += (ty - cam.position.y) * k;
      cam.position.z += (tz - cam.position.z) * k;
    } else if (prefs.camPull && performance.now() - touched.current > 1800) {
      const pos = cam.position;
      const dist = pos.length();
      const want = prefs.camDist;
      if (Math.abs(dist - want) > 0.08) {
        const k = 1 - Math.exp(-dt * 1.1);
        pos.multiplyScalar(1 + (want / Math.max(0.2, dist) - 1) * k);
      }
    }
  });
  return (
    <OrbitControls
      ref={ctl as never}
      enabled={showShip}
      enablePan={false}
      enableRotate={showShip}
      enableZoom={showShip}
      zoomSpeed={0.55 + prefs.camZoom * 0.7}
      rotateSpeed={0.85}
      minDistance={CAM_MIN}
      maxDistance={CAM_MAX + extent * 4}
      minPolarAngle={CAM_POLAR}
      maxPolarAngle={CAM_POLAR}
      enableDamping
      dampingFactor={prefs.watchNave ? 0.12 : 0.085}
      autoRotate={!prefs.spinPaused && !raiding}
      autoRotateSpeed={prefs.spinSpeed * (prefs.watchNave ? 0.42 : 1)}
      touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
      onStart={() => {
        touched.current = performance.now();
        if (getPrefs().lookId) patchPrefs({ lookId: "", lookUntil: 0 });
      }}
    />
  );
}

function Mood() {
  const kind = useNidus((s) => s.eventKind);
  const inside = useNidus((s) => INTERIOR_TABS.has(s.tab));
  const { gl, scene } = useThree();
  useFrame(() => {
    const fog = scene.fog as { color: Color; near: number; far: number } | null;
    if (!fog) return;
    fog.color.set("#0c0a09");
    fog.near = inside ? 7 : 70;
    fog.far = inside ? 24 : 200;
    gl.toneMappingExposure = kind === "ECLIPSE" ? 1.0 : kind === "PULSAR" ? 1.3 : 1.15;
  });
  return null;
}

export function StationScene() {
  const mobile = typeof window !== "undefined" && window.innerWidth < 500;
  const start = camPosition(CAM_DEFAULT);
  const [paused, setPaused] = useState(false);
  const showShip = useNidus((s) => s.tab === "raid" || s.tab === "hull");
  const tab = useNidus((s) => s.tab);
  const inside = INTERIOR_TABS.has(tab);
  // Sharpness follows the phone: start light, sharpen while frames stay smooth, back off when they drop.
  const dprCap = Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio || 1, mobile ? 1.75 : 1.5);
  const [dpr, setDpr] = useState(mobile ? 1 : Math.min(1.25, dprCap));
  useEffect(() => {
    const on = () => setPaused(typeof document !== "undefined" && document.hidden);
    on();
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      camera={{ position: start, fov: 46, near: 0.8, far: 220 }}
      dpr={dpr}
      gl={{ antialias: !mobile, alpha: false, powerPreference: "high-performance" }}
      style={{ touchAction: "none", pointerEvents: showShip ? "auto" : "none", position: "absolute", inset: 0 }}
      onDoubleClick={() => applyCamPreset("nave")}
      onCreated={({ gl, camera, scene }) => {
        gl.setClearColor("#0c0a09");
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
        const [x, y, z] = camPosition();
        camera.position.set(x, y, z);
        const pmrem = new PMREMGenerator(gl);
        const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
        scene.environment = env.texture;
        scene.environmentIntensity = 0.5;
      }}
    >
      <PerformanceMonitor
        bounds={(hz) => (hz > 100 ? [55, 90] : [38, 55])}
        flipflops={3}
        onIncline={() => setDpr((d) => Math.min(dprCap, d + 0.25))}
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onFallback={() => setDpr(1)}
      />
      <fog attach="fog" args={["#0c0a09", 70, 200]} />
      <hemisphereLight args={["#2e2434", "#0c0a09", 0.55]} />
      <directionalLight position={[7, 6, 8]} intensity={2.3} color="#ffcdb0" />
      <directionalLight position={[-7, 4, 5]} intensity={1.3} color="#d8b884" />
      <directionalLight position={[8, 1.5, -7]} intensity={0.45} color="#6c5a78" />
      <Mood />
      <group visible={!inside}>
        <Stars radius={110} depth={50} count={mobile ? 80 : 160} factor={2.8} saturation={0.08} fade speed={REDUCE ? 0 : 0.12} />
        <Backdrop />
        <Planet />
        <BlackWell />
        <Dust />
        <Hull />
        <BattleField />
      </group>
      {inside && (
        <Suspense fallback={null}>
          <Interior tab={tab} />
        </Suspense>
      )}
      <Rig />
    </Canvas>
  );
}
