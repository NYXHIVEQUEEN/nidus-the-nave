import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import type { Group, InstancedMesh, MeshBasicMaterial, MeshStandardMaterial } from "three";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  Color,
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
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { CapsuleGeometry, CylinderGeometry, BoxGeometry, BufferGeometry, ConeGeometry } from "three";
import { useNidus } from "@/lib/nidus/store";
import { chime } from "@/lib/nidus/audio";
import { CAM_DEFAULT, CAM_MAX, CAM_MIN, CAM_POLAR, applyCamPreset, camPosition, getPrefs, patchPrefs, subscribeSpin } from "@/lib/nidus/view";

const dummy = new Obj3D();
const _look = new Vector3();
const GILT = "#c4a574";
const BLOOD = "#7a1f2b";
const STEEL = "#8a929c";
const STEEL_DARK = "#5c646e";
const VIEWPORT = "#1c242c";
const REDUCE =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const SOCKETS: Record<string, [number, number, number]> = {
  solar: [0, 0.9, 0],
  orebay: [0.76, -0.12, -0.52],
  silo: [0.7, 0.46, -0.14],
  barracks: [-0.76, 0.08, 0.3],
  hangar: [0, -0.5, -1.12],
  railgun: [0.62, 0.14, -0.28],
  cannon: [-0.62, 0.14, 0.32],
  gundeck: [0, -0.2, -1.72],
  lab: [0.64, 0.4, 0.64],
  nerve: [0, 0.76, 0.16],
  reliquary: [0, 1.02, 0],
  cloister: [0.68, 0.5, 0.68],
  choir: [-0.26, 0.88, 0.4],
  vault: [0.78, 0.54, -0.4],
  crypt: [0.54, -0.34, -0.86],
  apse: [0, 1.12, 0.36],
  spire: [0, 0.58, -2.02],
  crucible: [0.4, -0.26, 0.54],
  mill: [0.48, -0.22, 0.18],
  refinery: [0.88, -0.2, -0.18],
  sensor: [0.22, 0.62, -1.35],
  armory: [-0.48, 0.1, -1.38],
  dock: [0.52, -0.44, -0.92],
  gallery: [-0.58, 0.7, 0.12],
  prow: [0, 0.04, 2.15],
};

function craftGeo(s = 1) {
  const body = new CapsuleGeometry(0.016 * s, 0.09 * s, 6, 12);
  body.rotateX(Math.PI / 2);
  const fin = new CapsuleGeometry(0.005 * s, 0.03 * s, 4, 8);
  fin.rotateZ(Math.PI / 2);
  fin.translate(0, 0.012 * s, -0.018 * s);
  const engine = new CylinderGeometry(0.007 * s, 0.011 * s, 0.018 * s, 8);
  engine.rotateX(Math.PI / 2);
  engine.translate(0, 0, -0.065 * s);
  const g = mergeGeometries([body, fin, engine], false) ?? body;
  g.computeVertexNormals();
  return g;
}

function mergeParts(parts: BufferGeometry[]) {
  const g = mergeGeometries(parts, false);
  for (const p of parts) p.dispose();
  if (!g) return new BoxGeometry(0.2, 0.2, 1);
  g.computeVertexNormals();
  return g;
}

function boxAt(w: number, h: number, d: number, x: number, y: number, z: number) {
  const g = new BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}

function cylAt(rt: number, rb: number, h: number, segs: number, x: number, y: number, z: number, rotX = Math.PI / 2) {
  const g = new CylinderGeometry(rt, rb, h, segs);
  g.rotateX(rotX);
  g.translate(x, y, z);
  return g;
}

function heroHullGeo() {
  // Faceted capital: hard panel breaks, oval section, chisel prow — not a sausage.
  const pts = [
    new Vector2(0.0, -2.58),
    new Vector2(0.045, -2.58),
    new Vector2(0.045, -2.58),
    new Vector2(0.16, -2.36),
    new Vector2(0.16, -2.36),
    new Vector2(0.3, -2.08),
    new Vector2(0.3, -2.08),
    new Vector2(0.42, -1.52),
    new Vector2(0.42, -1.52),
    new Vector2(0.46, -0.92),
    new Vector2(0.46, -0.92),
    new Vector2(0.34, -0.18),
    new Vector2(0.34, -0.18),
    new Vector2(0.34, 0.32),
    new Vector2(0.44, 0.82),
    new Vector2(0.44, 0.82),
    new Vector2(0.52, 1.32),
    new Vector2(0.52, 1.32),
    new Vector2(0.46, 1.78),
    new Vector2(0.28, 2.12),
    new Vector2(0.28, 2.12),
    new Vector2(0.14, 2.34),
    new Vector2(0.14, 2.34),
    new Vector2(0.0, 2.4),
  ];
  const body = new LatheGeometry(pts, 10);
  body.rotateX(Math.PI / 2);
  body.scale(1.32, 0.54, 1);

  const prow = new ConeGeometry(0.2, 0.62, 8);
  prow.rotateX(-Math.PI / 2);
  prow.translate(0, 0.02, 2.52);

  const parts: BufferGeometry[] = [
    body,
    prow,
    boxAt(0.18, 0.2, 2.55, 0, 0.26, 0.08),
    boxAt(0.38, 0.16, 0.58, 0, 0.08, 2.12),
    boxAt(0.22, 0.1, 0.36, 0, 0.14, 2.38),
    boxAt(0.28, 0.18, 0.5, 0, 0.4, 0.88),
    boxAt(0.18, 0.08, 0.28, 0, 0.52, 0.86),
    boxAt(0.08, 0.16, 0.22, 0, 0.58, 0.78),
    boxAt(0.7, 0.34, 0.7, 0, -0.02, -1.98),
    boxAt(0.1, 0.12, 0.55, 0, 0.42, -1.55),
    boxAt(0.36, 0.08, 0.42, 0, 0.22, -1.15),
  ];
  for (const s of [-1, 1]) {
    parts.push(boxAt(0.16, 0.26, 1.42, s * 0.5, 0.02, 0.12));
    parts.push(boxAt(0.62, 0.055, 0.92, s * 0.78, -0.02, -0.28));
    parts.push(boxAt(0.34, 0.04, 0.42, s * 0.7, 0.04, 0.42));
    parts.push(boxAt(0.2, 0.14, 1.05, s * 0.6, -0.14, -0.62));
    parts.push(boxAt(0.08, 0.22, 0.7, s * 0.36, 0.18, 0.55));
    parts.push(boxAt(0.1, 0.08, 0.28, s * 0.22, 0.16, 1.65));
    parts.push(cylAt(0.035, 0.05, 0.22, 6, s * 0.42, 0.12, 1.95));
  }
  return mergeParts(parts);
}

function heroDarkGeo() {
  const parts: BufferGeometry[] = [
    boxAt(0.62, 0.22, 0.48, 0, -0.08, -2.12),
    cylAt(0.12, 0.16, 0.42, 8, 0, -0.04, -2.28),
    boxAt(0.38, 0.16, 0.28, 0, -0.18, -0.95),
    boxAt(0.14, 0.06, 1.8, 0, 0.32, 0.1),
  ];
  for (const s of [-1, 1]) {
    parts.push(cylAt(0.1, 0.12, 0.92, 8, s * 0.6, -0.14, -1.12));
    parts.push(boxAt(0.14, 0.1, 0.32, s * 0.6, -0.14, -1.62));
    parts.push(boxAt(0.12, 0.05, 0.4, s * 0.82, 0.02, 0.15));
    parts.push(boxAt(0.08, 0.12, 0.18, s * 0.48, -0.16, 0.55));
  }
  return mergeParts(parts);
}

function heroKeelGeo() {
  return mergeParts([boxAt(0.1, 0.18, 2.85, 0, -0.3, 0.02), boxAt(0.22, 0.08, 0.7, 0, -0.34, 0.85)]);
}

function viewportGeo() {
  const parts: BufferGeometry[] = [];
  for (const z of [-1.02, -0.42, 0.22, 0.88]) {
    for (const s of [-1, 1]) parts.push(boxAt(0.018, 0.042, 0.095, s * 0.4, 0.1, z));
  }
  parts.push(boxAt(0.12, 0.04, 0.08, 0, 0.5, 0.92));
  return mergeParts(parts);
}

function useSpin() {
  return useSyncExternalStore(subscribeSpin, getPrefs, getPrefs);
}

function useHullTextures() {
  const [rivet, height, rough, arch, rift] = useTexture([
    "/nidus/tex-rivet.jpg",
    "/nidus/tex-height.jpg",
    "/nidus/tex-rough.jpg",
    "/nidus/sky-arch.jpg",
    "/nidus/sky-rift.jpg",
  ]);
  rivet.colorSpace = SRGBColorSpace;
  arch.colorSpace = SRGBColorSpace;
  rift.colorSpace = SRGBColorSpace;
  height.colorSpace = NoColorSpace;
  rough.colorSpace = NoColorSpace;
  const ani = typeof window !== "undefined" && window.innerWidth < 500 ? 4 : 8;
  for (const t of [rivet, height, rough]) {
    t.wrapS = t.wrapT = RepeatWrapping;
    t.anisotropy = ani;
    t.repeat.set(2.2, 3.4);
  }
  return { rivet, height, rough, arch, rift };
}

function Hardpoints({
  railgun,
  cannon,
  railRank = 0,
  canRank = 0,
}: {
  railgun: boolean;
  cannon: boolean;
  railRank?: number;
  canRank?: number;
}) {
  // Teeth only. Other rooms keep their sim bonus and do not glue leftover hull blobs.
  return (
    <group>
      {railgun && (
        <group position={[0.68, 0.12, 0.08]}>
          <mesh>
            <boxGeometry args={[0.16, 0.1, 0.26]} />
            <meshStandardMaterial color="#3a4048" metalness={0.28} roughness={0.52} dithering />
          </mesh>
          <mesh position={[0, 0.02, -0.42]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.022, 0.62 + railRank * 0.05, 8]} />
            <meshStandardMaterial color="#2a3036" metalness={0.32} roughness={0.46} />
          </mesh>
        </group>
      )}
      {cannon && (
        <group position={[-0.68, 0.1, 0.28]}>
          <mesh>
            <boxGeometry args={[0.18, 0.1, 0.22]} />
            <meshStandardMaterial color="#3a4048" metalness={0.26} roughness={0.54} dithering />
          </mesh>
          {(canRank >= 2 ? [-0.04, 0.04] : [0]).map((x) => (
            <mesh key={`can-${x}`} position={[x, 0.02, -0.24]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.026, 0.3 + canRank * 0.02, 8]} />
              <meshStandardMaterial color="#2a3036" metalness={0.28} roughness={0.48} />
            </mesh>
          ))}
        </group>
      )}
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
  const glow = useNidus((s) => Math.min(1, s.spark / 18));
  const surging = useNidus((s) => s.surgeUntil > Date.now());
  const raiding = useNidus((s) => Boolean(s.raid));
  const railgunRank = useNidus((s) => s.rooms.railgun?.rank ?? 0);
  const cannonRank = useNidus((s) => s.rooms.cannon?.rank ?? 0);

  const { rivet, height, rough, arch, rift } = useHullTextures();
  const engineHeat = useRef<MeshBasicMaterial>(null);
  const naveMat = useRef<MeshStandardMaterial>(null);
  const stationRef = useRef<Group>(null);
  const fighters = useRef<InstancedMesh>(null);
  const hullGeo = useMemo(() => heroHullGeo(), []);
  const darkGeo = useMemo(() => heroDarkGeo(), []);
  const keelGeo = useMemo(() => heroKeelGeo(), []);
  const portGeo = useMemo(() => viewportGeo(), []);
  const dartGeo = useMemo(() => craftGeo(1.4), []);
  const bloodC = useMemo(() => new Color(BLOOD), []);

  useEffect(
    () => () => {
      hullGeo.dispose();
      darkGeo.dispose();
      keelGeo.dispose();
      portGeo.dispose();
    },
    [hullGeo, darkGeo, keelGeo, portGeo],
  );

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;
    if (typeof document !== "undefined" && document.hidden) return;
    if (stationRef.current) {
      stationRef.current.visible = !watching;
      stationRef.current.rotation.z = 0;
      stationRef.current.position.y = 0;
      stationRef.current.scale.setScalar(1.72 + roomsLit * 0.01 + molt * 0.018);
    }
    if (naveMat.current) naveMat.current.emissiveIntensity = 0.03 + glow * 0.04;
    if (engineHeat.current) {
      engineHeat.current.opacity = 0.55 + glow * 0.25 + (REDUCE ? 0 : Math.sin(t * 6.2) * 0.06) + (surging ? 0.12 : 0);
    }
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
          dummy.position.set(Math.sin(a) * (0.35 + launch * 1.1), -0.55 + launch * 0.9, -1.45 - launch * (5.5 + i * 0.22));
          dummy.lookAt(dummy.position.x, dummy.position.y, dummy.position.z - 1);
          dummy.rotateX(Math.PI / 2);
          dummy.scale.setScalar(0.7 + launch * 0.5);
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
      <mesh rotation={[0, 0.18, 0.04]}>
        <cylinderGeometry args={[92, 92, 48, 24, 1, true]} />
        <meshBasicMaterial map={arch} color="#3a3238" side={BackSide} />
      </mesh>
      <mesh position={[-24, -16, 22]}>
        <sphereGeometry args={[10, 24, 16]} />
        <meshBasicMaterial map={rift} color="#8a8e96" />
      </mesh>
      <mesh position={[8, 0.8, 20]} rotation={[0.4, 0.2, 0.15]}>
        <torusGeometry args={[4.2, 0.06, 6, 32]} />
        <meshBasicMaterial color={GILT} transparent opacity={0.28} depthWrite={false} />
      </mesh>

      <group ref={stationRef}>
        <mesh geometry={hullGeo}>
          <meshStandardMaterial
            ref={naveMat}
            map={rivet}
            bumpMap={height}
            bumpScale={0.18}
            roughnessMap={rough}
            color={STEEL}
            metalness={0.28}
            roughness={0.62}
            dithering
            envMapIntensity={0.28}
            emissive="#1a1e24"
            emissiveIntensity={0.04}
          />
        </mesh>
        <mesh position={[0, 0.36, 0.08]}>
          <boxGeometry args={[0.035, 0.028, 2.15]} />
          <meshStandardMaterial color={GILT} metalness={0.62} roughness={0.3} envMapIntensity={0.72} dithering />
        </mesh>
        <mesh geometry={darkGeo}>
          <meshStandardMaterial
            map={rivet}
            bumpMap={height}
            bumpScale={0.12}
            roughnessMap={rough}
            color={STEEL_DARK}
            metalness={0.36}
            roughness={0.48}
            dithering
            envMapIntensity={0.34}
          />
        </mesh>
        <mesh geometry={keelGeo}>
          <meshStandardMaterial
            color={molt > 0 ? BLOOD : "#3a424a"}
            metalness={0.3}
            roughness={0.5}
            emissive={molt > 0 ? BLOOD : "#000000"}
            emissiveIntensity={molt > 0 ? 0.16 + molt * 0.07 : 0}
            dithering
          />
        </mesh>
        <mesh geometry={portGeo}>
          <meshStandardMaterial color={VIEWPORT} metalness={0.18} roughness={0.22} envMapIntensity={0.55} />
        </mesh>
        {([[0, -0.04, -2.42], [0.28, -0.12, -2.32], [-0.28, -0.12, -2.32]] as [number, number, number][]).map((p, i) => (
          <group key={`eng-${i}`} position={p}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.09, 0.14, 0.28, 8]} />
              <meshStandardMaterial color="#2e343a" metalness={0.34} roughness={0.46} dithering />
            </mesh>
            <mesh position={[0, 0, -0.14]} rotation={[Math.PI, 0, 0]}>
              <circleGeometry args={[0.072, 10]} />
              <meshBasicMaterial color="#c45a4a" toneMapped={false} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, -0.04, -2.58]}>
          <sphereGeometry args={[0.09, 8, 6]} />
          <meshBasicMaterial ref={engineHeat} color="#c45a4a" transparent opacity={0.5} depthWrite={false} toneMapped={false} />
        </mesh>
        <Hardpoints railgun={railgun} cannon={cannon} railRank={railgunRank} canRank={cannonRank} />
      </group>

      <instancedMesh ref={fighters} args={[dartGeo, undefined, 8]} visible={false}>
        <meshStandardMaterial color={STEEL} metalness={0.18} roughness={0.62} emissive={bloodC} emissiveIntensity={0.2} />
      </instancedMesh>
      {raiding && (
        <group position={[7.2, 0.4, -4.8]} rotation={[0.1, 0.55, -0.05]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.22, 1.25, 8]} />
            <meshStandardMaterial map={rivet} color="#5a6068" metalness={0.22} roughness={0.62} />
          </mesh>
          <mesh position={[0, 0.1, 0.15]}>
            <boxGeometry args={[0.16, 0.08, 0.32]} />
            <meshStandardMaterial color="#4a5058" metalness={0.24} roughness={0.58} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function BlackWell() {
  const disk = useRef<Group>(null);
  useFrame((state) => {
    if (disk.current) disk.current.rotation.z = state.clock.elapsedTime * 0.04;
  });
  return (
    <group position={[12, -9.5, 6]}>
      <mesh>
        <sphereGeometry args={[1.5, 24, 16]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <group rotation={[0.62, 0.32, 0.1]} ref={disk}>
        <mesh>
          <torusGeometry args={[1.7, 0.018, 6, 48]} />
          <meshBasicMaterial color="#c4b8b0" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

function BattleField() {
  const raid = useNidus((s) => s.raid);
  const boosted = (raid?.boostUntil ?? 0) > Date.now();
  const dead = Boolean(raid && raid.hp <= 0);
  const rivet = useTexture("/nidus/tex-rivet.jpg");
  rivet.colorSpace = SRGBColorSpace;
  const group = useRef<Group>(null);
  const tracerA = useRef<MeshBasicMaterial>(null);
  const tracerB = useRef<MeshBasicMaterial>(null);
  const lastHit = useRef(0);
  useFrame((state) => {
    if (!raid || !group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.z = dead ? -7.2 - (t % 8) * 0.08 : -7.15;
    group.current.rotation.y = Math.PI;
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
    <group ref={group} position={[0, 0.05, -7.2]} rotation={[0, Math.PI, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 1.7, 8]} />
        <meshStandardMaterial map={rivet} color={dead ? "#1a1614" : "#5a6068"} metalness={0.22} roughness={0.62} dithering />
      </mesh>
      <mesh position={[0, 0.12, 0.2]}>
        <boxGeometry args={[0.18, 0.1, 0.4]} />
        <meshStandardMaterial color={dead ? "#141210" : "#4a5058"} metalness={0.24} roughness={0.58} />
      </mesh>
      {!dead && (
        <>
          <mesh position={[0.2, 0.12, -2.4]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 4.6, 5]} />
            <meshBasicMaterial ref={tracerA} color="#ffb08a" transparent opacity={0.35} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
          </mesh>
          <mesh position={[-0.25, 0.08, -2.1]} rotation={[Math.PI / 2, 0, 0]}>
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
  const extent = 1 + roomsLit * 0.55 + molt * 0.85;
  const touched = useRef(0);
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const cam = state.camera;
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
    else if (raiding) _look.set(0, 0.1, -3.4);
    else _look.set(0, 0.05, 0);
    if (ctl.current) {
      const k = 1 - Math.exp(-dt * (looking ? 3.4 : 1.8));
      ctl.current.target.lerp(_look, k);
      ctl.current.autoRotate = !p.spinPaused && !looking && !raiding;
    }
    if (raiding && performance.now() - touched.current > 900) {
      const want = watching ? 11.5 : 15;
      const [tx, ty, tz] = [want * 0.72, want * 0.28, -3.4 + want * 0.18];
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
  const { gl, scene } = useThree();
  useFrame(() => {
    const fog = scene.fog as { color: Color; near: number; far: number } | null;
    if (!fog) return;
    fog.color.set("#0c0a09");
    fog.near = 70;
    fog.far = 200;
    gl.toneMappingExposure = kind === "ECLIPSE" ? 0.92 : kind === "PULSAR" ? 1.08 : 1.0;
  });
  return null;
}

export function StationScene() {
  const mobile = typeof window !== "undefined" && window.innerWidth < 500;
  const start = camPosition(CAM_DEFAULT);
  const [paused, setPaused] = useState(false);
  const showShip = useNidus((s) => s.tab === "raid" || s.tab === "hull");
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
      dpr={mobile ? [1, 1] : [1, 1.4]}
      gl={{ antialias: !mobile, alpha: false, powerPreference: "high-performance" }}
      style={{ touchAction: "none", pointerEvents: showShip ? "auto" : "none", position: "absolute", inset: 0 }}
      onDoubleClick={() => applyCamPreset("nave")}
      onCreated={({ gl, camera, scene }) => {
        gl.setClearColor("#0c0a09");
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
        const [x, y, z] = camPosition();
        camera.position.set(x, y, z);
        const pmrem = new PMREMGenerator(gl);
        const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
        scene.environment = env.texture;
        scene.environmentIntensity = 0.2;
      }}
    >
      <fog attach="fog" args={["#0c0a09", 70, 200]} />
      <hemisphereLight args={["#a8b0b8", "#1a1816", 0.62]} />
      <directionalLight position={[8, 6, -7]} intensity={1.7} color="#e4ddd6" />
      <directionalLight position={[-6, 2, 5]} intensity={0.32} color="#8a96a4" />
      <Stars radius={110} depth={50} count={mobile ? 80 : 160} factor={2.8} saturation={0.08} fade speed={REDUCE ? 0 : 0.12} />
      <Mood />
      <BlackWell />
      <Hull />
      <BattleField />
      <Rig />
    </Canvas>
  );
}
