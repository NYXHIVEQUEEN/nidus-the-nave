import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import type { Group, InstancedMesh, PointLight, MeshStandardMaterial, MeshBasicMaterial, Texture, SpotLight } from "three";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  BoxGeometry,
  CapsuleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  LatheGeometry,
  Object3D as Obj3D,
  PMREMGenerator,
  Quaternion,
  RepeatWrapping,
  SRGBColorSpace,
  NoColorSpace,
  TOUCH,
  Vector2,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { useNidus } from "@/lib/nidus/store";
import { ROOMS } from "@/lib/nidus/content";
import { chime } from "@/lib/nidus/audio";
import { CAM_DEFAULT, CAM_MAX, CAM_MIN, applyCamPreset, camPosition, getPrefs, patchPrefs, subscribeSpin } from "@/lib/nidus/view";

const dummy = new Obj3D();
const Y_UP = new Vector3(0, 1, 0);
const _dir = new Vector3();
const _quat = new Quaternion();
const _look = new Vector3();
const BLOOD = "#7a1f2b";
const GILT = "#c4a574";
const VENOM = "#1faf5b";
const BONE = "#d8cbb8";
const REDUCE =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

function heroHullGeo() {
  const pts = [
    new Vector2(0.02, -2.42),
    new Vector2(0.20, -2.26),
    new Vector2(0.36, -2.02),
    new Vector2(0.48, -1.42),
    new Vector2(0.48, -1.42),
    new Vector2(0.30, -0.38),
    new Vector2(0.30, -0.38),
    new Vector2(0.42, 0.52),
    new Vector2(0.40, 1.18),
    new Vector2(0.24, 1.82),
    new Vector2(0.10, 2.18),
    new Vector2(0.02, 2.36),
  ];
  const g = new LatheGeometry(pts, 28);
  g.rotateX(Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

function cloneRepeat(src: Texture, x: number, y: number) {
  const t = src.clone();
  t.wrapS = t.wrapT = RepeatWrapping;
  t.repeat.set(x, y);
  t.anisotropy = src.anisotropy;
  t.needsUpdate = true;
  return t;
}

const _craftGilt = new Color(GILT);
const _craftBone = new Color(BONE);
const _craftBlood = new Color(BLOOD);
const _craftVenom = new Color(VENOM);
const CRAFT_TINT = [_craftGilt, _craftBone, _craftBlood, _craftVenom, _craftGilt];

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

function useSpin() {
  return useSyncExternalStore(subscribeSpin, getPrefs, getPrefs);
}

function useHullTextures() {
  const [plate, glass, grate, filigree, blood, hazard, arch, sleep, rift, titans, rivet, giltMap, rose, voidMap, ember, bone, height, rough] = useTexture([
    "/nidus/tex-plate.jpg",
    "/nidus/tex-glass.jpg",
    "/nidus/tex-grate.jpg",
    "/nidus/tex-filigree.jpg",
    "/nidus/tex-blood.jpg",
    "/nidus/tex-hazard.jpg",
    "/nidus/sky-arch.jpg",
    "/nidus/sky-sleep.jpg",
    "/nidus/sky-rift.jpg",
    "/nidus/sky-titans.jpg",
    "/nidus/tex-rivet.jpg",
    "/nidus/tex-gilt.jpg",
    "/nidus/tex-rose.jpg",
    "/nidus/tex-void.jpg",
    "/nidus/tex-ember.jpg",
    "/nidus/tex-bone.jpg",
    "/nidus/tex-height.jpg",
    "/nidus/tex-rough.jpg",
  ]);
  for (const t of [plate, glass, grate, filigree, blood, hazard, arch, sleep, rift, titans, rivet, giltMap, rose, voidMap, ember, bone]) {
    t.colorSpace = SRGBColorSpace;
  }
  height.colorSpace = NoColorSpace;
  rough.colorSpace = NoColorSpace;
  const ani = typeof window !== "undefined" && window.innerWidth < 500 ? 4 : 8;
  plate.wrapS = plate.wrapT = RepeatWrapping;
  plate.anisotropy = ani;
  plate.repeat.set(1.2, 2.2);
  rivet.wrapS = rivet.wrapT = RepeatWrapping;
  rivet.anisotropy = ani;
  rivet.repeat.set(1.6, 2.4);
  bone.wrapS = bone.wrapT = RepeatWrapping;
  bone.anisotropy = ani;
  bone.repeat.set(3.6, 4.4);
  grate.wrapS = grate.wrapT = RepeatWrapping;
  grate.anisotropy = ani;
  grate.repeat.set(3.4, 2.8);
  glass.wrapS = glass.wrapT = RepeatWrapping;
  glass.repeat.set(2.2, 2.2);
  filigree.wrapS = filigree.wrapT = RepeatWrapping;
  filigree.repeat.set(3.0, 3.0);
  giltMap.wrapS = giltMap.wrapT = RepeatWrapping;
  giltMap.repeat.set(3.2, 2.4);
  blood.wrapS = blood.wrapT = RepeatWrapping;
  blood.repeat.set(2.4, 2.4);
  hazard.wrapS = hazard.wrapT = RepeatWrapping;
  hazard.repeat.set(5.5, 1.0);
  rose.wrapS = rose.wrapT = RepeatWrapping;
  voidMap.wrapS = voidMap.wrapT = RepeatWrapping;
  ember.wrapS = ember.wrapT = RepeatWrapping;
  ember.repeat.set(2.2, 2.2);
  height.wrapS = height.wrapT = RepeatWrapping;
  height.anisotropy = ani;
  height.repeat.set(1.2, 2.2);
  rough.wrapS = rough.wrapT = RepeatWrapping;
  rough.anisotropy = ani;
  rough.repeat.set(1.2, 2.2);
  return { plate, glass, grate, filigree, blood, hazard, arch, sleep, rift, titans, rivet, giltMap, rose, voidMap, ember, bone, height, rough };
}

function Decal({
  position,
  rotation,
  size,
  map,
  color = "#ffffff",
  opacity = 0.72,
  emissive,
  eInt = 0,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
  map: Texture;
  color?: string;
  opacity?: number;
  emissive?: Color | string;
  eInt?: number;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        map={map}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-2}
        metalness={0.35}
        roughness={0.45}
        emissive={emissive}
        emissiveIntensity={eInt}
        side={DoubleSide}
      />
    </mesh>
  );
}

function Ray({
  position,
  rotation,
  color,
  w = 0.2,
  len = 3.2,
  opacity = 0.13,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  color: string;
  w?: number;
  len?: number;
  opacity?: number;
}) {
  const mat = useRef<MeshBasicMaterial>(null);
  const seed = position[0] + position[2];
  useFrame((state) => {
    if (REDUCE || !mat.current) return;
    const t = state.clock.elapsedTime;
    mat.current.opacity = opacity + Math.sin(t * 1.35 + seed) * opacity * 0.35;
  });
  return (
    <mesh position={position} rotation={rotation}>
      <coneGeometry args={[w, len, 3, 1, true]} />
      <meshBasicMaterial
        ref={mat}
        color={color}
        transparent
        opacity={opacity}
        blending={AdditiveBlending}
        depthWrite={false}
        side={DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

function Grow({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  const k = useRef(0);
  useFrame((_, dt) => {
    k.current = Math.min(1, k.current + Math.min(dt, 0.1) * 1.85);
    if (!ref.current) return;
    const e = 1 - (1 - k.current) ** 3;
    const over = k.current < 1 ? 1 + Math.sin(k.current * Math.PI) * 0.1 : 1;
    ref.current.scale.setScalar(0.06 + e * 0.94 * over);
  });
  return (
    <group ref={ref} scale={0.06}>
      {children}
    </group>
  );
}

const RADIAL: Record<string, Quaternion> = {};
for (const [k, p] of Object.entries(SOCKETS)) {
  const dir = new Vector3(p[0], p[1], p[2]);
  RADIAL[k] = dir.lengthSq() < 1e-8 ? new Quaternion() : new Quaternion().setFromUnitVectors(Y_UP, dir.normalize());
}

type AnnexKind = "crown" | "hopper" | "spindle" | "blister" | "maw" | "lance" | "dome" | "hearth" | "lantern" | "arcade" | "bell" | "coffer" | "ossuary" | "bowl" | "needle" | "apse";

const KIND: Record<string, AnnexKind> = {
  solar: "crown",
  orebay: "hopper",
  silo: "spindle",
  barracks: "blister",
  hangar: "maw",
  railgun: "lance",
  cannon: "lance",
  gundeck: "lance",
  lab: "dome",
  nerve: "hearth",
  reliquary: "lantern",
  cloister: "arcade",
  choir: "bell",
  vault: "coffer",
  crypt: "ossuary",
  crucible: "bowl",
  mill: "hopper",
  refinery: "bowl",
  sensor: "lantern",
  armory: "lance",
  dock: "maw",
  gallery: "arcade",
  spire: "needle",
  apse: "apse",
};

function Dock({ id, rank = 0, children }: { id: string; rank?: number; children: ReactNode }) {
  const r = Math.max(0, Math.min(5, rank));
  const pos = SOCKETS[id] ?? ([0, 0, 0] as [number, number, number]);
  const quat = RADIAL[id];
  return (
    <Grow>
      <group position={pos} quaternion={quat}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.115, 0.016, 5, 12]} />
          <meshStandardMaterial color="#3a342e" metalness={0.88} roughness={0.28} />
        </mesh>
        {r > 0 && (
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.06 + r * 0.018, 0]}>
            <torusGeometry args={[0.1 + r * 0.016, 0.01, 5, 12]} />
            <meshStandardMaterial color={GILT} metalness={0.86} roughness={0.26} emissive={GILT} emissiveIntensity={0.2 + r * 0.12} toneMapped={false} />
          </mesh>
        )}
        {children}
      </group>
    </Grow>
  );
}

function ShipDress({
  plate,
  giltMap,
  bone,
  grate,
  glass,
  solar,
  orebay,
  hangar,
  lab,
  nerve,
  gundeck,
  railgun,
  cannon,
  barracks,
  silo,
  spire,
  hiveRank,
  molt,
  railRank = 0,
  canRank = 0,
  gunRank = 0,
}: {
  plate: Texture;
  giltMap: Texture;
  bone: Texture;
  grate: Texture;
  glass: Texture;
  solar: boolean;
  orebay: boolean;
  hangar: boolean;
  lab: boolean;
  nerve: boolean;
  gundeck: boolean;
  railgun: boolean;
  cannon: boolean;
  barracks: boolean;
  silo: boolean;
  spire: boolean;
  hiveRank: number;
  molt: number;
  railRank?: number;
  canRank?: number;
  gunRank?: number;
}) {
  return (
    <group>
      {solar && (
        <mesh position={[0, 0.42, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.04, 0.55, 6, 12]} />
          <meshStandardMaterial map={grate} color="#4a4640" metalness={0.62} roughness={0.4} emissive="#8a7a68" emissiveIntensity={0.08} />
        </mesh>
      )}
      {hangar && (
        <mesh position={[0.52, -0.08, 0.3]} rotation={[0, 0, Math.PI / 2]}>
          <capsuleGeometry args={[0.055, 0.22, 6, 12]} />
          <meshStandardMaterial map={grate} color="#3a3632" metalness={0.7} roughness={0.38} />
        </mesh>
      )}
      {gundeck && (
        <group position={[0, -0.18, -1.55]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.055, 0.16, 6, 12]} />
            <meshStandardMaterial map={bone} color="#4a4440" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, -0.28]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.024, 0.032, 0.32 + gunRank * 0.04, 10]} />
            <meshStandardMaterial color="#3a3834" metalness={0.82} roughness={0.3} />
          </mesh>
        </group>
      )}
      {railgun && (
        <group position={[0.58, 0.08, -0.2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.045, 0.14, 6, 12]} />
            <meshStandardMaterial map={bone} color="#3a3834" metalness={0.78} roughness={0.34} />
          </mesh>
          <mesh position={[0, 0.01, -0.32]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.016, 0.42 + railRank * 0.04, 10]} />
            <meshStandardMaterial color="#2a2824" metalness={0.86} roughness={0.28} />
          </mesh>
          {railRank >= 3 && (
            <mesh position={[0.04, 0.01, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.01, 0.013, 0.3, 8]} />
              <meshStandardMaterial color="#2a2824" metalness={0.86} roughness={0.28} />
            </mesh>
          )}
        </group>
      )}
      {cannon && (
        <group position={[-0.58, 0.08, 0.28]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.05, 0.12, 6, 12]} />
            <meshStandardMaterial map={bone} color="#3a3834" metalness={0.76} roughness={0.36} />
          </mesh>
          {(canRank >= 2 ? [-0.03, 0.03] : [0]).map((x) => (
            <mesh key={`can-${x}`} position={[x, 0.02, -0.18]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.026, 0.22 + canRank * 0.02, 8]} />
              <meshStandardMaterial color="#2c2a26" metalness={0.82} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}
      {hiveRank >= 2 && solar && (
        <mesh position={[0, 0.44, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.025, 0.32, 4, 10]} />
          <meshStandardMaterial map={giltMap} color={GILT} metalness={0.8} roughness={0.4} emissive={GILT} emissiveIntensity={0.06} />
        </mesh>
      )}
      {hiveRank >= 4 && (
        <>
          <mesh position={[0.28, -0.08, 1.95]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.07, 0.18, 6, 12]} />
            <meshStandardMaterial color="#2a2622" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[-0.28, -0.08, 1.95]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.07, 0.18, 6, 12]} />
            <meshStandardMaterial color="#2a2622" metalness={0.8} roughness={0.3} />
          </mesh>
        </>
      )}
      {molt > 0 && (
        <mesh position={[0, -0.22, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.04, 1.7, 6, 12]} />
          <meshStandardMaterial color={BLOOD} metalness={0.55} roughness={0.4} emissive={BLOOD} emissiveIntensity={0.28 + molt * 0.1} />
        </mesh>
      )}
    </group>
  );
}

function SearchLights() {
  const port = useRef<Group>(null);
  const star = useRef<Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (REDUCE) return;
    if (port.current) port.current.rotation.set(0.55 + Math.sin(t * 0.21) * 0.28, 0.15 + Math.sin(t * 0.17) * 0.85, 0.04);
    if (star.current) star.current.rotation.set(0.5 + Math.cos(t * 0.19) * 0.26, -0.15 + Math.cos(t * 0.14) * 0.8, -0.04);
  });
  return (
    <group>
      <group ref={port} position={[0.22, 0.58, -0.05]}>
        <mesh>
          <cylinderGeometry args={[0.028, 0.04, 0.08, 8]} />
          <meshStandardMaterial color="#2a2824" metalness={0.82} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshBasicMaterial color="#f2e6cc" toneMapped={false} />
        </mesh>
        <spotLight color="#efe2c4" intensity={2.6} distance={18} angle={0.42} penumbra={0.72} decay={2} />
      </group>
      <group ref={star} position={[-0.22, 0.56, 0.12]}>
        <mesh>
          <cylinderGeometry args={[0.026, 0.038, 0.07, 8]} />
          <meshStandardMaterial color="#2a2824" metalness={0.82} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.045, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#e8d4b0" toneMapped={false} />
        </mesh>
        <spotLight color="#e8d0b8" intensity={2.2} distance={16} angle={0.4} penumbra={0.75} decay={2} />
      </group>
    </group>
  );
}

function Hull() {
  const solar = useNidus((s) => Boolean(s.rooms.solar?.built));
  const orebay = useNidus((s) => Boolean(s.rooms.orebay?.built));
  const silo = useNidus((s) => Boolean(s.rooms.silo?.built));
  const barracks = useNidus((s) => Boolean(s.rooms.barracks?.built));
  const hangar = useNidus((s) => Boolean(s.rooms.hangar?.built));
  const gundeck = useNidus((s) => Boolean(s.rooms.gundeck?.built));
  const railgun = useNidus((s) => Boolean(s.rooms.railgun?.built));
  const cannon = useNidus((s) => Boolean(s.rooms.cannon?.built));
  const lab = useNidus((s) => Boolean(s.rooms.lab?.built));
  const nerve = useNidus((s) => Boolean(s.rooms.nerve?.built));
  const reliquary = useNidus((s) => Boolean(s.rooms.reliquary?.built));
  const cloister = useNidus((s) => Boolean(s.rooms.cloister?.built));
  const choir = useNidus((s) => Boolean(s.rooms.choir?.built));
  const vault = useNidus((s) => Boolean(s.rooms.vault?.built));
  const crypt = useNidus((s) => Boolean(s.rooms.crypt?.built));
  const apse = useNidus((s) => Boolean(s.rooms.apse?.built));
  const spire = useNidus((s) => Boolean(s.rooms.spire?.built));
  const crucible = useNidus((s) => Boolean(s.rooms.crucible?.built));
  const mill = useNidus((s) => Boolean(s.rooms.mill?.built));
  const refinery = useNidus((s) => Boolean(s.rooms.refinery?.built));
  const sensor = useNidus((s) => Boolean(s.rooms.sensor?.built));
  const armory = useNidus((s) => Boolean(s.rooms.armory?.built));
  const dock = useNidus((s) => Boolean(s.rooms.dock?.built));
  const gallery = useNidus((s) => Boolean(s.rooms.gallery?.built));
  const roomsLit = useNidus(
    (s) =>
      Number(Boolean(s.rooms.solar?.built)) +
      Number(Boolean(s.rooms.orebay?.built)) +
      Number(Boolean(s.rooms.silo?.built)) +
      Number(Boolean(s.rooms.barracks?.built)) +
      Number(Boolean(s.rooms.hangar?.built)) +
      Number(Boolean(s.rooms.gundeck?.built)) +
      Number(Boolean(s.rooms.lab?.built)) +
      Number(Boolean(s.rooms.nerve?.built)) +
      Number(Boolean(s.rooms.reliquary?.built)) +
      Number(Boolean(s.rooms.cloister?.built)) +
      Number(Boolean(s.rooms.choir?.built)) +
      Number(Boolean(s.rooms.vault?.built)) +
      Number(Boolean(s.rooms.crypt?.built)) +
      Number(Boolean(s.rooms.apse?.built)) +
      Number(Boolean(s.rooms.spire?.built)) +
      Number(Boolean(s.rooms.crucible?.built)) +
      Number(Boolean(s.rooms.mill?.built)) +
      Number(Boolean(s.rooms.refinery?.built)),
  );
  const molt = useNidus((s) => s.moltLayer);
  const raidEnds = useNidus((s) => s.raid?.endsAt ?? 0);
  const raidStart = useNidus((s) => s.raid?.startedAt ?? 0);
  const raidWing = useNidus((s) => s.raid?.strikers ?? 0);
  const watching = useNidus((s) => Boolean(s.raid?.watching));
  const queued = useNidus((s) => s.queuedRoom);
  const swarm = useNidus((s) => s.swarm.miner + s.swarm.fab + s.swarm.builder + s.swarm.lab + s.swarm.striker);
  const glow = useNidus((s) => Math.min(1, s.spark / 18));
  const surging = useNidus((s) => s.surgeUntil > Date.now());
  const raiding = useNidus((s) => Boolean(s.raid));
  const sparkFill = useNidus((s) => Math.min(1, s.spark / 18));
  const printed = useNidus((s) => s.printed);
  const eventKind = useNidus((s) => s.eventKind);
  const hiveRank = useNidus((s) => s.hiveRank ?? 0);
  const ghostId = useNidus((s) => {
    if (s.queuedRoom) return "";
    for (const r of ROOMS) {
      if (r.id === "foundry") continue;
      if (s.rooms[r.id]?.built) continue;
      if (r.requires && !s.rooms[r.requires]?.built) continue;
      if (r.also && !s.rooms[r.also]?.built) continue;
      if (r.needMolt && s.moltLayer < r.needMolt) continue;
      if (r.needRaid && !s.raidCleared.includes(r.needRaid)) continue;
      if (r.needRank) {
        const n = s.rooms[r.needRank.id];
        if (!n?.built || (n.rank ?? 0) < r.needRank.rank) continue;
      }
      return r.id;
    }
    return "";
  });
  const watchNave = useSpin().watchNave;
  const giftOpen = useNidus((s) => Boolean(s.pendingGift));
  const seatedN = useNidus((s) => s.minds.reduce((n, m) => n + (m.alive && m.seated ? 1 : 0), 0));
  const printCaste = useNidus((s) => s.printCaste);
  const queueProg = useNidus((s) => {
    const id = s.queuedRoom;
    if (!id) return 0;
    const spec = ROOMS.find((r) => r.id === id);
    const st = s.rooms[id];
    if (!spec || !st) return 0;
    return Math.min(1, st.progress / Math.max(1, spec.work));
  });
  const solarRank = useNidus((s) => s.rooms.solar?.rank ?? 0);
  const orebayRank = useNidus((s) => s.rooms.orebay?.rank ?? 0);
  const siloRank = useNidus((s) => s.rooms.silo?.rank ?? 0);
  const barracksRank = useNidus((s) => s.rooms.barracks?.rank ?? 0);
  const hangarRank = useNidus((s) => s.rooms.hangar?.rank ?? 0);
  const gundeckRank = useNidus((s) => s.rooms.gundeck?.rank ?? 0);
  const railgunRank = useNidus((s) => s.rooms.railgun?.rank ?? 0);
  const cannonRank = useNidus((s) => s.rooms.cannon?.rank ?? 0);
  const labRank = useNidus((s) => s.rooms.lab?.rank ?? 0);
  const nerveRank = useNidus((s) => s.rooms.nerve?.rank ?? 0);
  const reliquaryRank = useNidus((s) => s.rooms.reliquary?.rank ?? 0);
  const cloisterRank = useNidus((s) => s.rooms.cloister?.rank ?? 0);
  const choirRank = useNidus((s) => s.rooms.choir?.rank ?? 0);
  const vaultRank = useNidus((s) => s.rooms.vault?.rank ?? 0);
  const cryptRank = useNidus((s) => s.rooms.crypt?.rank ?? 0);
  const apseRank = useNidus((s) => s.rooms.apse?.rank ?? 0);
  const spireRank = useNidus((s) => s.rooms.spire?.rank ?? 0);
  const crucibleRank = useNidus((s) => s.rooms.crucible?.rank ?? 0);
  const millRank = useNidus((s) => s.rooms.mill?.rank ?? 0);
  const refineryRank = useNidus((s) => s.rooms.refinery?.rank ?? 0);

  const { plate, glass, grate, filigree, blood, hazard, arch, sleep, rift, titans, rivet, giltMap, rose, voidMap, ember, bone, height, rough } = useHullTextures();
  const drones = useRef<InstancedMesh>(null);
  const embers = useRef<InstancedMesh>(null);
  const furnace = useRef<PointLight>(null);
  const glassMat = useRef<MeshStandardMaterial>(null);
  const solarRef = useRef<Group>(null);
  const nerveRef = useRef<Group>(null);
  const relicRef = useRef<Group>(null);
  const labRef = useRef<Group>(null);
  const gunRef = useRef<Group>(null);
  const siloRef = useRef<Group>(null);
  const choirRef = useRef<Group>(null);
  const hopperChip = useRef<Group>(null);
  const annexRef = useRef<Group>(null);
  const windows = useRef<InstancedMesh>(null);
  const queueFill = useRef<Group>(null);
  const printDartMat = useRef<MeshBasicMaterial>(null);
  const ringRef = useRef<Group>(null);
  const scaffoldRef = useRef<Group>(null);
  const rayRef = useRef<MeshStandardMaterial>(null);
  const microRef = useRef<Group>(null);
  const midRef = useRef<Group>(null);
  const stationRef = useRef<Group>(null);
  const beamRef = useRef<Group>(null);
  const fighters = useRef<InstancedMesh>(null);
  const tracerRef = useRef<Group>(null);
  const muzzle = useRef<PointLight>(null);
  const sparkleRef = useRef<Group>(null);
  const skyRef = useRef<Group>(null);
  const motes = useRef<InstancedMesh>(null);
  const printLite = useRef<PointLight>(null);
  const leakLite = useRef<PointLight>(null);
  const printDart = useRef<Group>(null);
  const hangarGlow = useRef<MeshStandardMaterial>(null);
  const naveMat = useRef<MeshStandardMaterial>(null);
  const tendons = useRef<InstancedMesh>(null);
  const sap = useRef<InstancedMesh>(null);
  const buildSparks = useRef<InstancedMesh>(null);
  const debris = useRef<InstancedMesh>(null);
  const engineHeat = useRef<MeshBasicMaterial>(null);
  const navA = useRef<MeshBasicMaterial>(null);
  const navB = useRef<MeshBasicMaterial>(null);
  const winMat = useRef<MeshStandardMaterial>(null);
  const printFlash = useRef(0);
  const lastPrinted = useRef(printed);

  const mobile = typeof window !== "undefined" && window.innerWidth < 500;
  const count = Math.min(mobile ? 24 : 40, 8 + swarm);
  const emberCount = mobile ? 22 : 38;

  const gilt = useMemo(() => new Color(GILT), []);
  const bloodC = useMemo(() => new Color(BLOOD), []);
  const skin = useMemo(
    () => ({
      body: cloneRepeat(rivet, 2.4, 3.8),
      bodyH: cloneRepeat(height, 2.4, 3.8),
      bodyR: cloneRepeat(rough, 2.4, 3.8),
      prow: cloneRepeat(rivet, 1.5, 2.4),
      prowH: cloneRepeat(height, 1.5, 2.4),
      spon: cloneRepeat(rivet, 1.7, 2.8),
      sponH: cloneRepeat(height, 1.7, 2.8),
      isle: cloneRepeat(rivet, 1.8, 1.6),
      isleH: cloneRepeat(height, 1.8, 1.6),
      grate2: cloneRepeat(grate, 2.4, 2.0),
      ember2: cloneRepeat(ember, 1.8, 1.6),
      bone2: cloneRepeat(bone, 2.2, 2.6),
    }),
    [rivet, height, rough, grate, ember, bone],
  );
  const hopperGeo = useMemo(
    () => new LatheGeometry([new Vector2(0.05, 0), new Vector2(0.17, 0.05), new Vector2(0.19, 0.24), new Vector2(0.08, 0.34)], 16),
    [],
  );
  const hullGeo = useMemo(() => heroHullGeo(), []);
  const gnatGeo = useMemo(() => craftGeo(1), []);
  const dartGeo = useMemo(() => craftGeo(1.4), []);
  const blisterGeo = useMemo(
    () => new LatheGeometry([new Vector2(0.04, 0), new Vector2(0.145, 0.06), new Vector2(0.155, 0.22), new Vector2(0.1, 0.34), new Vector2(0.03, 0.4)], 16),
    [],
  );
  const bowlGeo = useMemo(
    () => new LatheGeometry([new Vector2(0.04, 0), new Vector2(0.16, 0.04), new Vector2(0.18, 0.14), new Vector2(0.1, 0.2), new Vector2(0.05, 0.22)], 16),
    [],
  );
  const apseGeo = useMemo(
    () => new LatheGeometry([new Vector2(0.04, 0), new Vector2(0.16, 0.08), new Vector2(0.14, 0.22), new Vector2(0.04, 0.36)], 16),
    [],
  );
  const tendonTargets = useMemo(() => {
    const out: [number, number, number][] = [];
    if (solar) out.push(SOCKETS.solar);
    if (orebay) out.push(SOCKETS.orebay);
    if (silo) out.push(SOCKETS.silo);
    if (barracks) out.push(SOCKETS.barracks);
    if (hangar) out.push(SOCKETS.hangar);
    if (railgun) out.push(SOCKETS.railgun);
    if (cannon) out.push(SOCKETS.cannon);
    if (gundeck) out.push(SOCKETS.gundeck);
    if (lab) out.push(SOCKETS.lab);
    if (nerve) out.push(SOCKETS.nerve);
    if (reliquary) out.push(SOCKETS.reliquary);
    if (cloister) out.push(SOCKETS.cloister);
    if (choir) out.push(SOCKETS.choir);
    if (vault) out.push(SOCKETS.vault);
    if (crypt) out.push(SOCKETS.crypt);
    if (apse) out.push(SOCKETS.apse);
    if (spire) out.push(SOCKETS.spire);
    if (crucible) out.push(SOCKETS.crucible);
    if (mill) out.push(SOCKETS.mill);
    if (refinery) out.push(SOCKETS.refinery);
    if (sensor) out.push(SOCKETS.sensor);
    if (armory) out.push(SOCKETS.armory);
    if (dock) out.push(SOCKETS.dock);
    if (gallery) out.push(SOCKETS.gallery);
    return out;
  }, [solar, orebay, silo, barracks, hangar, railgun, cannon, gundeck, lab, nerve, reliquary, cloister, choir, vault, crypt, apse, spire, crucible, mill, refinery, sensor, armory, dock, gallery]);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;
    const hidden = typeof document !== "undefined" && document.hidden;
    if (hidden) return;
    const dist = state.camera.position.length();
    const far = dist > 16 + roomsLit * 0.2;
    const mid = dist > 11;
    if (microRef.current) microRef.current.visible = !far;
    if (midRef.current) midRef.current.visible = !far;
    if (sparkleRef.current) sparkleRef.current.visible = !far;
    if (skyRef.current) {
      skyRef.current.visible = true;
      skyRef.current.rotation.y += d * 0.008;
    }
    if (stationRef.current) {
      stationRef.current.visible = !watching;
      const grow = 1.72 + roomsLit * 0.01 + molt * 0.018;
      if (REDUCE) {
        stationRef.current.scale.setScalar(grow);
        stationRef.current.rotation.z = 0;
        stationRef.current.position.y = 0;
      } else {
        const bank = Math.sin(t * 0.17) * 0.035;
        const breath = Math.sin(t * 0.22) * 0.035;
        stationRef.current.rotation.z = bank;
        stationRef.current.position.y = breath;
        stationRef.current.scale.setScalar(grow * (surging ? 1.012 : 1));
      }
    }
    if (annexRef.current) {
      const p = getPrefs();
      const looking = Boolean(p.lookId) && Date.now() < p.lookUntil;
      annexRef.current.visible = (!far || watchNave || looking) && !watching;
    }
    if (ringRef.current) {
      ringRef.current.visible = !far;
      ringRef.current.scale.setScalar(1 + roomsLit * 0.06 + molt * 0.14);
      ringRef.current.rotation.z += d * (surging ? 0.55 : 0.12);
      ringRef.current.rotation.y = Math.sin(t * 0.2) * 0.08;
    }
    if (furnace.current) {
      const tide = eventKind === "TIDE" || eventKind === "FURNACE" || surging;
      furnace.current.intensity =
        (far ? 3.0 : (tide ? 3.2 : 2.5) + Math.sin(t * 4) * 0.18 + glow * 0.4) * (watchNave ? 1.05 : 1);
      furnace.current.color.set(eventKind === "PULSAR" ? GILT : eventKind === "ROSE" ? VENOM : BLOOD);
    }
    if (naveMat.current) {
      naveMat.current.emissiveIntensity = 0.18 + molt * 0.05 + sparkFill * 0.06 + (giftOpen ? 0.08 : 0);
    }
    if (glassMat.current) {
      glassMat.current.emissiveIntensity = 0.45 + sparkFill * 1.15 + Math.sin(t * 2.4) * (0.08 + sparkFill * 0.14) + (surging ? 0.45 : 0);
    }
    if (rayRef.current) {
      rayRef.current.opacity = mid ? 0 : 0.07 + glow * 0.08 + Math.sin(t * 1.4) * 0.02;
    }
    if (solarRef.current) solarRef.current.rotation.y += d * 0.35;
    if (siloRef.current) siloRef.current.rotation.y += d * 0.55;
    if (choirRef.current) choirRef.current.rotation.x = Math.sin(t * 2.2) * 0.14;
    if (hopperChip.current) hopperChip.current.position.y = 0.22 - ((t * 0.65) % 1) * 0.18;
    if (nerveRef.current) {
      const s = 1 + Math.sin(t * 2.6) * 0.08 + sparkFill * 0.14 + seatedN * 0.05;
      nerveRef.current.scale.setScalar(s);
    }
    if (relicRef.current) relicRef.current.rotation.y += d * 0.7;
    if (labRef.current) labRef.current.position.y = 0.28 + Math.sin(t * 1.8) * 0.05;
    if (gunRef.current) gunRef.current.position.y = Math.sin(t * 0.9) * 0.025;
    if (engineHeat.current) {
      engineHeat.current.opacity = (far ? 0.55 : 0.38) + glow * 0.28 + Math.sin(t * 7.4) * 0.06 + (surging ? 0.16 : 0);
    }
    if (navA.current) navA.current.opacity = 0.35 + (REDUCE ? 0.4 : Math.sin(t * 3.1) * 0.45);
    if (navB.current) navB.current.opacity = 0.35 + (REDUCE ? 0.4 : Math.sin(t * 3.1 + 1.4) * 0.45);
    if (winMat.current) {
      winMat.current.emissiveIntensity = 0.5 + glow * 0.85 + Math.sin(t * 1.15) * 0.12 + (surging ? 0.35 : 0);
    }
    const win = windows.current;
    if (win) {
      if (far || hidden) win.visible = false;
      else {
        for (let i = 0; i < 16; i++) {
          const side = i % 2 ? 1 : -1;
          dummy.position.set(side * 0.3, 0.4 + (i % 3) * 0.03, -0.35 + Math.floor(i / 2) * 0.14);
          dummy.scale.set(1, 1, 1);
          dummy.rotation.set(Math.PI / 2, 0, 0);
          dummy.updateMatrix();
          win.setMatrixAt(i, dummy.matrix);
        }
        win.instanceMatrix.needsUpdate = true;
        win.visible = true;
      }
    }
    const rock = debris.current;
    if (rock) rock.visible = false;

    if (printed !== lastPrinted.current) {
      lastPrinted.current = printed;
      printFlash.current = 1;
    }
    printFlash.current = Math.max(0, printFlash.current - d * 1.8);
    if (printLite.current) printLite.current.intensity = printFlash.current * 28 + glow * 4;
    if (printDart.current) {
      const k = printFlash.current;
      printDart.current.visible = k > 0.04;
      printDart.current.position.set(0.18 + (1 - k) * 1.4, 0.04 + k * 0.12, 0.08);
      printDart.current.rotation.z = (1 - k) * 1.2;
      printDart.current.scale.setScalar(0.45 + k * 0.7);
    }
    if (printDartMat.current) {
      printDartMat.current.color.set(printCaste === "lab" ? VENOM : printCaste === "striker" || printCaste === "fab" ? BLOOD : GILT);
    }
    if (queueFill.current) {
      const on = Boolean(queued);
      queueFill.current.visible = on;
      queueFill.current.scale.set(1, 0.08 + queueProg * 0.92, 1);
    }
    if (hangarGlow.current) {
      hangarGlow.current.emissiveIntensity = raiding ? 0.9 + Math.sin(t * 6) * 0.35 : 0.12;
    }
    if (leakLite.current) {
      leakLite.current.intensity = 0.95 + glow * 0.35 + Math.sin(t * 2.1) * 0.08 + (surging ? 0.25 : 0);
      leakLite.current.color.set(eventKind === "ECLIPSE" ? "#4a3a58" : "#c4b090");
    }

    if (scaffoldRef.current) {
      scaffoldRef.current.visible = Boolean(queued);
      const pulse = 0.55 + Math.sin(t * 6) * 0.45;
      scaffoldRef.current.scale.setScalar(0.92 + pulse * 0.08);
    }

    if (beamRef.current) {
      const sock = queued ? SOCKETS[queued] : null;
      if (!sock) beamRef.current.visible = false;
      else {
        beamRef.current.visible = !far;
        const [x, y, z] = sock;
        _dir.set(x, y, z);
        const len = Math.max(0.2, _dir.length());
        _dir.normalize();
        _quat.setFromUnitVectors(Y_UP, _dir);
        beamRef.current.quaternion.copy(_quat);
        beamRef.current.position.set(x * 0.5, y * 0.5, z * 0.5);
        beamRef.current.scale.set(1, len, 1);
      }
    }

    const now = Date.now();
    const fighting = raidEnds > now;
    const u = fighting ? (now - raidStart) / Math.max(1, raidEnds - raidStart) : 0;
    const wing = fighters.current;
    if (wing) {
      const n = Math.min(12, Math.max(0, raidWing));
      for (let i = 0; i < 12; i++) {
        if (!fighting || i >= n) {
          dummy.position.set(0, -80, 0);
          dummy.scale.setScalar(0.001);
        } else {
          const launch = Math.max(0, Math.min(1, u * 2.4 - i * 0.07));
          const a = t * 0.9 + i * 0.7;
          dummy.position.set(Math.sin(a) * (0.35 + launch * 1.1), -0.55 + launch * 0.9 + Math.sin(t * 2 + i) * 0.08, -1.45 - launch * (5.5 + i * 0.22));
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
    if (tracerRef.current) {
      tracerRef.current.visible = Boolean(gundeck && (fighting || surging) && !far);
      tracerRef.current.scale.y = fighting ? 2.4 + Math.sin(t * 14) * 0.5 : 1.2 + Math.sin(t * 4) * 0.2;
    }
    if (muzzle.current) {
      muzzle.current.intensity = gundeck && fighting ? 18 + Math.sin(t * 22) * 12 : 0;
    }

    const mesh = drones.current;
    if (mesh) {
      mesh.visible = !far && !watching;
      const n = count;
      for (let i = 0; i < n; i++) {
        const a = t * (0.28 + (i % 5) * 0.04) + i * 0.61;
        const r = 0.95 + (i % 4) * 0.22;
        const y = Math.sin(a * 0.85 + i) * 0.28 + (i % 3) * 0.06;
        dummy.position.set(Math.cos(a) * r, y, Math.sin(a) * r * 0.72 - 0.15);
        dummy.lookAt(dummy.position.x * 0.2, dummy.position.y, dummy.position.z - 0.4);
        dummy.rotateX(Math.PI / 2);
        dummy.scale.setScalar(2.7);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }

    const em = embers.current;
    if (em) em.visible = false;

    const mo = motes.current;
    if (mo) mo.visible = false;

    const tn = tendons.current;
    if (tn) tn.visible = false;

    const sp = sap.current;
    if (sp) sp.visible = false;

    const bs = buildSparks.current;
    if (bs) bs.visible = false;
    const info = state.gl.info.render;
    (globalThis as typeof globalThis & { __nidusPerf?: { calls: number; triangles: number; frameMs: number } }).__nidusPerf = {
      calls: info.calls,
      triangles: info.triangles,
      frameMs: d * 1000,
    };
  });

  const scaffoldPos = queued ? ([0, 0.42, 0.2] as [number, number, number]) : ([0, 0, 0] as [number, number, number]);

  return (
    <group>
      <group ref={skyRef}>
        <mesh rotation={[0, 0.18, 0.04]}>
          <cylinderGeometry args={[92, 92, 48, 40, 1, true]} />
          <meshBasicMaterial map={arch} color="#5a3a42" side={BackSide} />
        </mesh>
        <mesh position={[0, 14, 0]}>
          <sphereGeometry args={[92, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial map={voidMap} color="#241820" side={BackSide} />
        </mesh>
      </group>
      <group position={[-26, -18, 26]}>
        <mesh>
          <sphereGeometry args={[11.2, 32, 24]} />
          <meshBasicMaterial map={rift} color="#c4a090" />
        </mesh>
        <mesh scale={1.03}>
          <sphereGeometry args={[11.2, 20, 16]} />
          <meshBasicMaterial color="#e0c0b0" transparent opacity={0.1} side={BackSide} depthWrite={false} />
        </mesh>
      </group>
      <group position={[28, -10, -8]}>
        <mesh>
          <sphereGeometry args={[3.8, 20, 14]} />
          <meshBasicMaterial map={titans} color="#c8b090" />
        </mesh>
      </group>
      <mesh position={[6, 1.2, 22]} rotation={[0.4, 0.2, 0.15]}>
        <torusGeometry args={[4.6, 0.07, 8, 48]} />
        <meshBasicMaterial color="#c4a574" transparent opacity={0.42} depthWrite={false} />
      </mesh>
      <group position={[-7.5, -1.4, 11]} rotation={[0.15, 0.7, -0.1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.18, 1.05, 6, 12]} />
          <meshBasicMaterial color="#6a5a52" />
        </mesh>
        <mesh position={[0.35, 0.04, -0.1]} rotation={[0, 0, 0.5]}>
          <capsuleGeometry args={[0.05, 0.42, 4, 8]} />
          <meshBasicMaterial color="#8a7358" />
        </mesh>
      </group>
      <instancedMesh ref={debris} args={[undefined, undefined, 12]} frustumCulled={false} visible={false}>
        <dodecahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial map={voidMap} color="#8a7a6c" roughness={0.92} metalness={0.12} />
      </instancedMesh>

      <group ref={stationRef}>
      <mesh geometry={hullGeo}>
        <meshStandardMaterial
          ref={naveMat}
          map={skin.body}
          bumpMap={skin.bodyH}
          bumpScale={0.18}
          roughnessMap={skin.bodyR}
          color="#e6dcc8"
          metalness={0.16}
          roughness={0.62}
          dithering
          envMapIntensity={0.62}
          emissive="#5a4e44"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0, 0, 2.34]}>
        <sphereGeometry args={[0.06, 16, 12]} />
        <meshStandardMaterial map={skin.prow} bumpMap={skin.prowH} bumpScale={0.1} color="#d8d0c4" metalness={0.28} roughness={0.48} dithering />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={`nac-${s}`} position={[s * 0.54, -0.06, -0.22]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.145, 1.62, 8, 16]} />
          <meshStandardMaterial map={skin.spon} bumpMap={skin.sponH} bumpScale={0.14} color="#c8beb4" metalness={0.28} roughness={0.5} dithering />
        </mesh>
      ))}
      <mesh position={[0, 0.38, 0.72]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.14, 0.42, 8, 16]} />
        <meshStandardMaterial map={skin.isle} bumpMap={skin.isleH} bumpScale={0.08} color="#8a8680" metalness={0.22} roughness={0.32} dithering envMapIntensity={0.8} />
      </mesh>
      <mesh position={[0, -0.18, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.075, 1.95, 6, 12]} />
        <meshStandardMaterial map={giltMap} color={GILT} metalness={0.62} roughness={0.36} emissive={GILT} emissiveIntensity={0.1} dithering />
      </mesh>
      <mesh position={[0, 0.02, -0.22]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.32, 0.02, 8, 28]} />
        <meshStandardMaterial color="#6a645c" metalness={0.35} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.02, 0.88]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.42, 0.018, 8, 28]} />
        <meshStandardMaterial map={skin.grate2} color="#8a8074" metalness={0.4} roughness={0.42} />
      </mesh>
      <Decal position={[0.02, 0.12, 1.35]} rotation={[0, 0, 0]} size={[0.55, 0.16]} map={hazard} color="#c4a574" opacity={0.55} />
      <SearchLights />
      {([-0.85, -0.2, 0.45, 1.05] as number[]).flatMap((z) =>
        [-1, 1].map((s) => (
          <mesh key={`port-${s}-${z}`} position={[s * 0.5, 0.08, z]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.016, 0.07, 4, 8]} />
            <meshStandardMaterial color="#e8d4b0" emissive="#c4a090" emissiveIntensity={1.05} toneMapped={false} />
          </mesh>
        )),
      )}
      {([-0.7, 0.15, 0.9] as number[]).flatMap((z) =>
        [-1, 1].map((s) => (
          <mesh key={`run-${s}-${z}`} position={[s * 0.64, 0.12, z]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color={s > 0 ? "#c45a4a" : "#c4a574"} transparent opacity={0.8} toneMapped={false} />
          </mesh>
        )),
      )}
      <mesh position={[0, 0.08, 2.18]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshBasicMaterial color="#e8e0d4" transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.4, 0.4]} color="#d4c4a8" intensity={1.15} distance={7} decay={2} />
      {([[0, 0.02, -2.28], [0.24, -0.08, -2.2], [-0.24, -0.08, -2.2]] as [number, number, number][]).map((p, i) => (
        <group key={`eng-${i}`} position={p}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.155, 0.34, 12]} />
            <meshStandardMaterial map={ember} color="#5a524c" metalness={0.42} roughness={0.46} dithering />
          </mesh>
          <mesh position={[0, 0, -0.16]} rotation={[Math.PI, 0, 0]}>
            <circleGeometry args={[0.09, 16]} />
            <meshBasicMaterial color="#ffc090" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, -0.32]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.035, 0.1, 0.38, 10]} />
            <meshBasicMaterial color="#ff8a55" transparent opacity={0.5} depthWrite={false} blending={AdditiveBlending} side={DoubleSide} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.0, -2.62]}>
        <sphereGeometry args={[0.14, 10, 8]} />
        <meshBasicMaterial ref={engineHeat} color="#ff9a60" transparent opacity={0.42} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
      </mesh>
      <group ref={microRef}>
      <instancedMesh ref={windows} args={[undefined, undefined, 16]} visible={false}>
        <capsuleGeometry args={[0.014, 0.05, 4, 8]} />
        <meshStandardMaterial ref={winMat} color={GILT} emissive={gilt} emissiveIntensity={0.7} toneMapped={false} />
      </instancedMesh>
      <mesh position={[0.2, 0.5, 0.22]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.022, 0.16, 4, 8]} />
        <meshStandardMaterial ref={glassMat} color={GILT} emissive={gilt} emissiveIntensity={0.55} metalness={0.2} roughness={0.18} toneMapped={false} />
      </mesh>
      <mesh position={[-0.2, 0.5, 0.22]} rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.022, 0.16, 4, 8]} />
        <meshStandardMaterial color={BLOOD} emissive={bloodC} emissiveIntensity={0.4} metalness={0.2} roughness={0.18} toneMapped={false} />
      </mesh>
      <mesh position={[0.58, 0.1, 0.65]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial ref={navA} color="#c45a4a" transparent opacity={0.75} toneMapped={false} />
      </mesh>
      <mesh position={[-0.58, 0.1, 0.65]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshBasicMaterial ref={navB} color="#c4a574" transparent opacity={0.75} toneMapped={false} />
      </mesh>
      </group>

      <pointLight ref={furnace} position={[0, 0, -2.15]} color={BLOOD} distance={10} decay={2} intensity={1.6} />
      <pointLight ref={printLite} position={[0, 0.3, 0.1]} color={GILT} distance={6} decay={2} intensity={0} />
      <pointLight ref={leakLite} position={[0.15, 0.28, 0.1]} color="#c4b090" distance={6} decay={2} intensity={0.95} />

      <group ref={midRef} visible={false} />
      <group ref={ringRef} visible={false} />

      <group ref={annexRef}>
        <ShipDress
          plate={plate}
          giltMap={giltMap}
          bone={bone}
          grate={grate}
          glass={glass}
          solar={solar}
          orebay={orebay}
          hangar={hangar}
          lab={lab}
          nerve={nerve}
          gundeck={gundeck}
          railgun={railgun}
          cannon={cannon}
          barracks={barracks}
          silo={silo}
          spire={spire}
          hiveRank={hiveRank}
          molt={molt}
          railRank={railgunRank}
          canRank={cannonRank}
          gunRank={gundeckRank}
        />
      </group>
      <group ref={printDart} visible={false}>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.035, 0.14, 8]} />
          <meshBasicMaterial color={VENOM} toneMapped={false} />
        </mesh>
      </group>

      <group ref={scaffoldRef} position={scaffoldPos} visible={Boolean(queued)}>
        {[-0.06, 0.06].map((x) =>
          [-0.06, 0.06].map((z) => (
            <mesh key={`post-${x}-${z}`} position={[x, 0.04, z]}>
              <boxGeometry args={[0.01, 0.1, 0.01]} />
              <meshStandardMaterial color="#3a3834" metalness={0.7} roughness={0.4} />
            </mesh>
          )),
        )}
      </group>

      <instancedMesh ref={drones} args={[gnatGeo, undefined, count]} key={count}>
        <meshStandardMaterial color="#e8dcc8" metalness={0.28} roughness={0.42} emissive={gilt} emissiveIntensity={0.35} dithering />
      </instancedMesh>
      <instancedMesh ref={embers} args={[undefined, undefined, emberCount]} visible={false}>
        <sphereGeometry args={[0.022, 5, 5]} />
        <meshBasicMaterial color={BLOOD} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={motes} args={[undefined, undefined, 16]} visible={false}>
        <sphereGeometry args={[0.016, 5, 5]} />
        <meshBasicMaterial color={GILT} transparent opacity={0.85} toneMapped={false} blending={AdditiveBlending} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={tendons} args={[undefined, undefined, 24]} visible={false}>
        <cylinderGeometry args={[0.022, 0.016, 1, 6]} />
        <meshStandardMaterial color="#8a7358" metalness={0.86} roughness={0.32} emissive={gilt} emissiveIntensity={0.18} />
      </instancedMesh>
      <instancedMesh ref={sap} args={[undefined, undefined, 12]} visible={false}>
        <sphereGeometry args={[0.022, 5, 5]} />
        <meshBasicMaterial color={GILT} transparent opacity={0.95} toneMapped={false} blending={AdditiveBlending} depthWrite={false} />
      </instancedMesh>
      <instancedMesh ref={buildSparks} args={[undefined, undefined, 8]} visible={false}>
        <sphereGeometry args={[0.018, 5, 5]} />
        <meshBasicMaterial color={GILT} transparent opacity={0.9} toneMapped={false} blending={AdditiveBlending} depthWrite={false} />
      </instancedMesh>

      <group ref={sparkleRef} />
      </group>

      <group ref={beamRef} visible={false}>
        <mesh>
          <cylinderGeometry args={[0.035, 0.012, 1, 6]} />
          <meshBasicMaterial color={GILT} transparent opacity={0.62} toneMapped={false} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
      <instancedMesh ref={fighters} args={[dartGeo, undefined, 12]} visible={false}>
        <meshStandardMaterial color="#e8dcc8" metalness={0.7} roughness={0.28} emissive={bloodC} emissiveIntensity={0.45} />
      </instancedMesh>
      {raiding && (
        <group position={[7.2, 0.4, -4.8]} rotation={[0.1, 0.55, -0.05]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.22, 1.35, 8, 16]} />
            <meshStandardMaterial map={plate} color="#6a5a4c" metalness={0.62} roughness={0.48} />
          </mesh>
          <mesh position={[0.55, 0.04, 0]} rotation={[0, 0, 0.6]}>
            <capsuleGeometry args={[0.05, 0.7, 6, 10]} />
            <meshStandardMaterial map={plate} color="#8a7358" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[-0.45, 0.02, 0.08]} rotation={[Math.PI / 2, 0.3, 0]}>
            <capsuleGeometry args={[0.06, 0.35, 6, 10]} />
            <meshStandardMaterial color="#3a2a26" metalness={0.75} roughness={0.36} emissive={bloodC} emissiveIntensity={0.35} />
          </mesh>
          <mesh rotation={[Math.PI / 2.4, 0.2, 0.1]}>
            <torusGeometry args={[2.1, 0.025, 6, 32]} />
            <meshBasicMaterial color={GILT} transparent opacity={0.45} depthWrite={false} blending={AdditiveBlending} />
          </mesh>
          <pointLight color={BLOOD} intensity={3.2} distance={8} decay={2} />
        </group>
      )}
    </group>
  );
}

function BlackWell() {
  const disk = useRef<Group>(null);
  const fill = useRef<PointLight>(null);
  const hot = useRef<MeshBasicMaterial>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = REDUCE ? 1 : 0.96 + Math.sin(t * 0.22) * 0.04;
    if (disk.current) disk.current.rotation.z = t * 0.04;
    if (fill.current) fill.current.intensity = 1.7 + pulse * 0.3;
    if (hot.current) hot.current.opacity = 0.32 + pulse * 0.1;
  });
  return (
    <group>
      <group position={[12, -9.5, 6]}>
        <mesh>
          <sphereGeometry args={[1.7, 32, 24]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <group rotation={[0.62, 0.32, 0.1]}>
          <group ref={disk}>
            <mesh>
              <torusGeometry args={[1.82, 0.02, 8, 72]} />
              <meshBasicMaterial color="#e2d4c8" transparent opacity={0.62} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
            </mesh>
            <mesh>
              <torusGeometry args={[2.15, 0.055, 8, 56]} />
              <meshBasicMaterial ref={hot} color="#8a2428" transparent opacity={0.4} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
            </mesh>
          </group>
        </group>
        <pointLight ref={fill} color="#5a2024" intensity={1.6} distance={26} decay={2} />
      </group>
      <directionalLight position={[3.2, -4.5, -8]} intensity={0.55} color="#5a3038" />
    </group>
  );
}

function BattleField() {
  const raid = useNidus((s) => s.raid);
  const boosted = (raid?.boostUntil ?? 0) > Date.now();
  const dead = Boolean(raid && raid.hp <= 0);
  const plate = useTexture("/nidus/tex-rivet.jpg");
  plate.colorSpace = SRGBColorSpace;
  const group = useRef<Group>(null);
  const tracerA = useRef<MeshBasicMaterial>(null);
  const tracerB = useRef<MeshBasicMaterial>(null);
  const flash = useRef<MeshBasicMaterial>(null);
  const lastHit = useRef(0);
  useFrame((state) => {
    if (!raid || !group.current) return;
    const t = state.clock.elapsedTime;
    if (dead) {
      group.current.position.z = -7.2 - (t % 8) * 0.08;
      group.current.rotation.y = Math.PI + 0.08;
    } else {
      group.current.position.z = -7.15 + Math.sin(t * 0.35) * 0.08;
      group.current.rotation.y = Math.PI;
    }
    const pulse = dead ? 0.05 : 0.25 + Math.sin(t * (boosted ? 14 : 8)) * 0.25;
    if (tracerA.current) tracerA.current.opacity = pulse;
    if (tracerB.current) tracerB.current.opacity = pulse * 0.7;
    if (flash.current) flash.current.opacity = dead ? 0 : 0.35 + pulse * 0.4;
    if (!dead && t - lastHit.current > (boosted ? 0.85 : 1.35)) {
      lastHit.current = t;
      try {
        chime(t % 2 > 1 ? "rail" : "cannon");
        if (Math.random() > 0.55) chime("ping");
      } catch {
        /* audio optional */
      }
    }
  });
  if (!raid) return null;
  return (
    <group ref={group} position={[0, 0.05, -7.2]} rotation={[0, Math.PI, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.22, 1.85, 8, 18]} />
        <meshStandardMaterial map={plate} color={dead ? "#1a1614" : "#3a3230"} metalness={0.7} roughness={0.48} dithering />
      </mesh>
      <mesh position={[0, 0.02, -1.15]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.14, 0.42, 6, 12]} />
        <meshStandardMaterial map={plate} color="#2e2a28" metalness={0.72} roughness={0.44} />
      </mesh>
      <mesh position={[0, 0.0, -1.55]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color="#242018" metalness={0.76} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.22, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.1, 0.42, 6, 12]} />
        <meshStandardMaterial color="#2a2624" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.0, 1.15]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.16, 0.28, 6, 12]} />
        <meshStandardMaterial color="#1e1816" metalness={0.8} roughness={0.34} emissive={dead ? "#000" : "#5a2018"} emissiveIntensity={dead ? 0 : 0.55} />
      </mesh>
      <mesh position={[0.32, 0.08, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.035, 0.22, 4, 8]} />
        <meshStandardMaterial color="#2a2420" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-0.32, 0.08, -0.28]} rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.04, 0.16, 4, 8]} />
        <meshStandardMaterial color="#2a2420" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.18, 0.52, 0.05]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#c45a4a" toneMapped={false} />
      </mesh>
      <pointLight position={[0.18, 0.55, 0.05]} color="#c45a4a" intensity={dead ? 0.2 : 2.4} distance={8} decay={2} />
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
          <mesh position={[0, 0.08, -2.05]}>
            <sphereGeometry args={[0.05, 8, 6]} />
            <meshBasicMaterial ref={flash} color="#ffc8a0" transparent opacity={0.4} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
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
  const trauma = useRef(0);
  const lastSurge = useRef(0);
  const lastPrinted = useRef(-1);
  const roomsLit = useNidus(
    (s) =>
      Number(Boolean(s.rooms.solar?.built)) +
      Number(Boolean(s.rooms.orebay?.built)) +
      Number(Boolean(s.rooms.silo?.built)) +
      Number(Boolean(s.rooms.barracks?.built)) +
      Number(Boolean(s.rooms.hangar?.built)) +
      Number(Boolean(s.rooms.gundeck?.built)) +
      Number(Boolean(s.rooms.lab?.built)) +
      Number(Boolean(s.rooms.nerve?.built)) +
      Number(Boolean(s.rooms.reliquary?.built)),
  );
  const molt = useNidus((s) => s.moltLayer);
  const surgeUntil = useNidus((s) => s.surgeUntil);
  const printed = useNidus((s) => s.printed);
  const raiding = useNidus((s) => Boolean(s.raid));
  const watching = useNidus((s) => Boolean(s.raid?.watching));
  const live = useNidus((s) => s.tab === "raid");
  const extent = 1 + roomsLit * 0.55 + molt * 0.85;
  const touched = useRef(0);
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;
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
    if (surgeUntil > Date.now() && surgeUntil !== lastSurge.current) {
      lastSurge.current = surgeUntil;
      if (!REDUCE) trauma.current = Math.min(1, trauma.current + 0.62);
    }
    if (printed !== lastPrinted.current) {
      if (lastPrinted.current >= 0 && printed > lastPrinted.current && !REDUCE) {
        trauma.current = Math.min(1, trauma.current + 0.22);
      }
      lastPrinted.current = printed;
    }
    if (ctl.current) {
      const k = 1 - Math.exp(-dt * (looking ? 3.4 : 1.8));
      ctl.current.target.lerp(_look, k);
      ctl.current.autoRotate = !p.spinPaused && !looking && !raiding;
    }
    if (!REDUCE && trauma.current > 0.01) {
      const shake = trauma.current * trauma.current;
      cam.position.x += Math.sin(t * 53.1) * 0.11 * shake;
      cam.position.y += Math.sin(t * 41.7) * 0.07 * shake;
      trauma.current = Math.max(0, trauma.current - dt * 1.45);
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
      enabled={live}
      enablePan={false}
      enableRotate={live}
      enableZoom={live}
      zoomSpeed={0.55 + prefs.camZoom * 0.7}
      rotateSpeed={0.85}
      minDistance={CAM_MIN}
      maxDistance={CAM_MAX + extent * 4}
      minPolarAngle={0.72}
      maxPolarAngle={Math.PI / 1.72}
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

export function StationScene() {
  const mobile = typeof window !== "undefined" && window.innerWidth < 500;
  const start = camPosition(CAM_DEFAULT);
  const [paused, setPaused] = useState(false);
  const live = useNidus((s) => s.tab === "raid");
  useEffect(() => {
    const on = () => setPaused(typeof document !== "undefined" && document.hidden);
    on();
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      camera={{ position: start, fov: 46, near: 0.8, far: 260 }}
      dpr={mobile ? [1, 1.15] : [1, 1.5]}
      gl={{ antialias: !mobile, alpha: false, powerPreference: "high-performance" }}
      style={{ touchAction: "none", pointerEvents: live ? "auto" : "none", position: "absolute", inset: 0 }}
      onDoubleClick={() => applyCamPreset("nave")}
      onCreated={({ gl, camera, scene }) => {
        gl.setClearColor("#0c0a09");
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.22;
        const [x, y, z] = camPosition();
        camera.position.set(x, y, z);
        const pmrem = new PMREMGenerator(gl);
        const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
        scene.environment = env.texture;
        scene.environmentIntensity = 0.55;
      }}
    >
      <fog attach="fog" args={["#0c0a09", 72, 210]} />
      <hemisphereLight args={["#d0b8a8", "#2a1814", 0.9]} />
      <ambientLight intensity={0.14} />
      <directionalLight position={[8, 7, -6]} intensity={2.9} color="#ffc4a8" />
      <directionalLight position={[-6, 3, 5]} intensity={0.75} color="#c4a574" />
      <directionalLight position={[2, -5, -4]} intensity={0.5} color="#6a3038" />
      <pointLight position={[7, 4.2, -8]} intensity={3.8} color="#f2e0cc" distance={28} decay={2} />
      <Stars radius={110} depth={60} count={mobile ? 140 : 260} factor={3.2} saturation={0.12} fade speed={REDUCE ? 0 : 0.18} />
      <FlightDust />
      <Mood />
      <BlackWell />
      <Hull />
      <BattleField />
      <Rig />
    </Canvas>
  );
}

function FlightDust() {
  const raid = useNidus((s) => Boolean(s.raid));
  const mesh = useRef<InstancedMesh>(null);
  const mobile = typeof window !== "undefined" && window.innerWidth < 500;
  const n = mobile ? 40 : 72;
  const pts = useMemo(() => {
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const ang = (i / n) * Math.PI * 2 + (i % 5) * 0.37;
      const r = 3.1 + (i % 7) * 1.15;
      a[i * 3] = Math.cos(ang) * r;
      a[i * 3 + 1] = ((i % 9) - 4) * 0.72;
      a[i * 3 + 2] = ((i * 17) % 29) - 14;
    }
    return a;
  }, [n]);
  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const speed = REDUCE ? 0.35 : 5.4;
    for (let i = 0; i < n; i++) {
      pts[i * 3 + 2] -= speed * dt;
      if (pts[i * 3 + 2] < -16) pts[i * 3 + 2] = 16;
      dummy.position.set(pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]);
      dummy.scale.set(0.85, REDUCE ? 0.4 : 1.15, 0.85);
      dummy.rotation.set(Math.PI / 2, 0, 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, n]} frustumCulled={false} visible={!raid}>
      <cylinderGeometry args={[0.004, 0.004, 1.15, 4]} />
      <meshBasicMaterial color="#c8b8a8" transparent opacity={0.48} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
    </instancedMesh>
  );
}

function Mood() {
  const kind = useNidus((s) => s.eventKind);
  const gift = useNidus((s) => Boolean(s.pendingGift));
  const surging = useNidus((s) => s.surgeUntil > Date.now());
  const { gl, scene } = useThree();
  useFrame(() => {
    const fog = scene.fog as { color: Color; near: number; far: number } | null;
    if (!fog) return;
    if (kind === "ECLIPSE") {
      fog.color.set("#0a0812");
      fog.near = 64;
      fog.far = 200;
      gl.toneMappingExposure = 1.08;
    } else if (kind === "PULSAR") {
      fog.color.set("#241818");
      fog.near = 70;
      fog.far = 210;
      gl.toneMappingExposure = 1.28;
    } else if (kind === "ROSE") {
      fog.color.set("#120814");
      fog.near = 68;
      fog.far = 200;
      gl.toneMappingExposure = 1.14;
    } else if (kind === "TIDE" || kind === "FURNACE" || surging) {
      fog.color.set("#1a0a0c");
      fog.near = 64;
      fog.far = 195;
      gl.toneMappingExposure = 1.2;
    } else if (gift) {
      fog.color.set("#1a1010");
      fog.near = 68;
      fog.far = 205;
      gl.toneMappingExposure = 1.22;
    } else {
      fog.color.set("#0c0a09");
      fog.near = 72;
      fog.far = 210;
      gl.toneMappingExposure = 1.22;
    }
  });
  return null;
}
