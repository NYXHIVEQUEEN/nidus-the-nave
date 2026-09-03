import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import type { Group, InstancedMesh, PointLight, MeshStandardMaterial, MeshBasicMaterial, Texture, SpotLight } from "three";
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BackSide,
  BoxGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  LatheGeometry,
  Object3D as Obj3D,
  Quaternion,
  RepeatWrapping,
  SRGBColorSpace,
  NoColorSpace,
  TOUCH,
  Vector2,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
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
  const body = new BoxGeometry(0.04 * s, 0.022 * s, 0.11 * s);
  const nose = new ConeGeometry(0.016 * s, 0.05 * s, 5);
  nose.rotateX(Math.PI / 2);
  nose.translate(0, 0, 0.075 * s);
  const wing = new BoxGeometry(0.1 * s, 0.006 * s, 0.03 * s);
  wing.translate(0, 0, 0.01 * s);
  const fin = new BoxGeometry(0.006 * s, 0.03 * s, 0.022 * s);
  fin.translate(0, 0.018 * s, -0.028 * s);
  const engine = new CylinderGeometry(0.01 * s, 0.014 * s, 0.02 * s, 6);
  engine.rotateX(Math.PI / 2);
  engine.translate(0, 0, -0.06 * s);
  const g = mergeGeometries([body, nose, wing, fin, engine], false) ?? body;
  g.computeVertexNormals();
  return g;
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
  gundeck: [0, 0.06, -1.68],
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
  plate.repeat.set(4.4, 6.2);
  rivet.wrapS = rivet.wrapT = RepeatWrapping;
  rivet.anisotropy = ani;
  rivet.repeat.set(5.2, 6.0);
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
  height.repeat.set(4.4, 6.2);
  rough.wrapS = rough.wrapT = RepeatWrapping;
  rough.anisotropy = ani;
  rough.repeat.set(4.4, 6.2);
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

function Hull() {
  const solar = useNidus((s) => Boolean(s.rooms.solar?.built));
  const orebay = useNidus((s) => Boolean(s.rooms.orebay?.built));
  const silo = useNidus((s) => Boolean(s.rooms.silo?.built));
  const barracks = useNidus((s) => Boolean(s.rooms.barracks?.built));
  const hangar = useNidus((s) => Boolean(s.rooms.hangar?.built));
  const gundeck = useNidus((s) => Boolean(s.rooms.gundeck?.built));
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
  const glow = useNidus((s) => Math.min(1, Math.round(s.charge) / 40));
  const surging = useNidus((s) => s.surgeUntil > Date.now());
  const raiding = useNidus((s) => Boolean(s.raid));
  const sparkFill = useNidus((s) => Math.min(1, s.spark / Math.max(1, s.sparkNeed)));
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
  const venom = useMemo(() => new Color(VENOM), []);
  const bloodC = useMemo(() => new Color(BLOOD), []);
  const naveGeo = useMemo(() => {
    const pts = [
      new Vector2(0.08, 2.02),
      new Vector2(0.26, 1.82),
      new Vector2(0.4, 1.35),
      new Vector2(0.46, 0.7),
      new Vector2(0.5, 0.05),
      new Vector2(0.46, -0.7),
      new Vector2(0.38, -1.4),
      new Vector2(0.24, -1.88),
      new Vector2(0.08, -2.08),
    ];
    const g = new LatheGeometry(pts, 20);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  const hopperGeo = useMemo(
    () => new LatheGeometry([new Vector2(0.05, 0), new Vector2(0.17, 0.05), new Vector2(0.19, 0.24), new Vector2(0.08, 0.34)], 10),
    [],
  );
  const gnatGeo = useMemo(() => craftGeo(1), []);
  const dartGeo = useMemo(() => craftGeo(1.4), []);
  const blisterGeo = useMemo(
    () => new LatheGeometry([new Vector2(0.04, 0), new Vector2(0.145, 0.06), new Vector2(0.155, 0.22), new Vector2(0.1, 0.34), new Vector2(0.03, 0.4)], 10),
    [],
  );
  const bowlGeo = useMemo(
    () => new LatheGeometry([new Vector2(0.04, 0), new Vector2(0.16, 0.04), new Vector2(0.18, 0.14), new Vector2(0.1, 0.2), new Vector2(0.05, 0.22)], 10),
    [],
  );
  const apseGeo = useMemo(
    () => new LatheGeometry([new Vector2(0.04, 0), new Vector2(0.16, 0.08), new Vector2(0.14, 0.22), new Vector2(0.04, 0.36)], 10),
    [],
  );
  const tendonTargets = useMemo(() => {
    const out: [number, number, number][] = [];
    if (solar) out.push(SOCKETS.solar);
    if (orebay) out.push(SOCKETS.orebay);
    if (silo) out.push(SOCKETS.silo);
    if (barracks) out.push(SOCKETS.barracks);
    if (hangar) out.push(SOCKETS.hangar);
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
  }, [solar, orebay, silo, barracks, hangar, gundeck, lab, nerve, reliquary, cloister, choir, vault, crypt, apse, spire, crucible, mill, refinery, sensor, armory, dock, gallery]);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.1);
    const t = state.clock.elapsedTime;
    const hidden = typeof document !== "undefined" && document.hidden;
    if (hidden) return;
    const dist = state.camera.position.length();
    const far = dist > 16 + roomsLit * 0.2;
    const mid = dist > 11;
    if (microRef.current) microRef.current.visible = !mid;
    if (midRef.current) midRef.current.visible = !far;
    if (sparkleRef.current) sparkleRef.current.visible = !far;
    if (skyRef.current) {
      skyRef.current.visible = true;
      skyRef.current.rotation.y += d * 0.008;
    }
    if (stationRef.current) {
      stationRef.current.visible = !watching;
      const grow = 1.38 + roomsLit * 0.035 + molt * 0.07;
      const breath = REDUCE ? 1 : surging ? 1 + Math.sin(t * 3.4) * 0.018 : 1;
      stationRef.current.scale.setScalar(grow * breath);
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
        (far ? 3.5 : (tide ? 8 : 5.5) + Math.sin(t * 11) * 0.9 + glow * 1.4 + (giftOpen ? 4 : 0)) * (watchNave ? 1.2 : 1);
      furnace.current.color.set(eventKind === "PULSAR" ? GILT : eventKind === "ROSE" ? VENOM : BLOOD);
    }
    if (naveMat.current) {
      naveMat.current.emissiveIntensity = 0.04 + molt * 0.12 + sparkFill * 0.08 + (giftOpen ? 0.18 : 0);
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
      engineHeat.current.opacity = 0.28 + glow * 0.45 + Math.sin(t * 7.4) * 0.1 + (surging ? 0.22 : 0);
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
          const z = -1.58 + Math.floor(i / 2) * 0.39;
          dummy.position.set(side * 0.4, 0.08 + (i % 4) * 0.04, z);
          dummy.scale.set(1, 1.1, 1);
          dummy.rotation.set(0, side > 0 ? Math.PI / 2 : -Math.PI / 2, 0);
          dummy.updateMatrix();
          win.setMatrixAt(i, dummy.matrix);
        }
        win.instanceMatrix.needsUpdate = true;
        win.visible = true;
      }
    }
    const rock = debris.current;
    if (rock) {
      for (let i = 0; i < 12; i++) {
        const a = t * 0.018 + i * 0.62;
        dummy.position.set(Math.cos(a) * (14 + (i % 5)) + 2, -7 + (i % 4) * 1.8, Math.sin(a * 0.8) * (12 + (i % 3)) - 6);
        dummy.rotation.set(t * 0.12 + i, i * 0.4, t * 0.07);
        dummy.scale.setScalar(0.22 + (i % 5) * 0.12);
        dummy.updateMatrix();
        rock.setMatrixAt(i, dummy.matrix);
      }
      rock.instanceMatrix.needsUpdate = true;
    }

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
      leakLite.current.intensity = 2.2 + glow * 3.2 + Math.sin(t * 2.1) * 0.6 + (surging ? 2 : 0) + (eventKind === "PULSAR" ? 2.4 : 0);
      leakLite.current.color.set(eventKind === "ECLIPSE" ? "#4a3a58" : GILT);
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
      if (far || hidden) mesh.visible = false;
      else {
        for (let i = 0; i < count; i++) {
          const belt = i % 2;
          const a = (i / count) * Math.PI * 2 + t * (belt ? 0.22 : -0.16);
          const r = 1.85 + belt * 0.45 + (i % 4) * 0.12;
          dummy.position.set(Math.cos(a) * r, Math.sin(t * 0.5 + i) * 0.42 + belt * 0.25, Math.sin(a) * r * 0.62);
          dummy.lookAt(0, 0, 0);
          dummy.rotateX(Math.PI / 2);
          dummy.scale.setScalar(0.85 + (i % 3) * 0.22);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          mesh.setColorAt(i, CRAFT_TINT[i % CRAFT_TINT.length] ?? _craftBone);
        }
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
        mesh.visible = true;
      }
    }

    const em = embers.current;
    if (em) {
      if (mid || hidden) em.visible = false;
      else {
        for (let i = 0; i < emberCount; i++) {
          const life = (t * (0.35 + (i % 5) * 0.05) + i * 0.37) % 1;
          dummy.position.set(((i * 17) % 10) * 0.04 - 0.2, -0.05 + life * 1.1, 2.05 + ((i * 13) % 7) * 0.04);
          dummy.scale.setScalar(0.4 + (1 - life) * 0.8);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          em.setMatrixAt(i, dummy.matrix);
        }
        em.instanceMatrix.needsUpdate = true;
        em.visible = true;
      }
    }

    const mo = motes.current;
    if (mo) {
      if ((far && !watchNave) || hidden) mo.visible = false;
      else {
        const ring = 2.05 + molt * 0.28;
        for (let i = 0; i < 16; i++) {
          const a = t * 0.22 + i * 0.39;
          dummy.position.set(Math.cos(a) * (ring + (i % 3) * 0.16), 0.12 + Math.sin(t * 0.8 + i) * 0.55, Math.sin(a) * (ring * 0.72 + (i % 2) * 0.18));
          dummy.scale.setScalar(0.45 + (i % 3) * 0.35 + sparkFill * 0.2);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          mo.setMatrixAt(i, dummy.matrix);
        }
        mo.instanceMatrix.needsUpdate = true;
        mo.visible = true;
      }
    }

    const tn = tendons.current;
    if (tn) {
      if ((far && !watchNave) || hidden) tn.visible = false;
      else {
        const n = tendonTargets.length;
        for (let i = 0; i < 24; i++) {
          if (i >= n) {
            dummy.position.set(0, -80, 0);
            dummy.scale.setScalar(0.001);
            dummy.rotation.set(0, 0, 0);
          } else {
            const p = tendonTargets[i];
            _dir.set(p[0], p[1], p[2]);
            const len = Math.max(0.16, _dir.length());
            _dir.normalize();
            dummy.position.set(p[0] * 0.58, p[1] * 0.58, p[2] * 0.58);
            dummy.quaternion.setFromUnitVectors(Y_UP, _dir);
            dummy.scale.set(1, len * 0.52, 1);
          }
          dummy.updateMatrix();
          tn.setMatrixAt(i, dummy.matrix);
        }
        tn.instanceMatrix.needsUpdate = true;
        tn.visible = true;
      }
    }

    const sp = sap.current;
    if (sp) {
      if ((far && !watchNave) || hidden || tendonTargets.length === 0) sp.visible = false;
      else {
        const n = tendonTargets.length;
        for (let i = 0; i < 12; i++) {
          const p = tendonTargets[i % n];
          const life = (t * (0.28 + (i % 4) * 0.05) + i * 0.17) % 1;
          dummy.position.set(p[0] * (0.18 + life * 0.82), p[1] * (0.18 + life * 0.82), p[2] * (0.18 + life * 0.82));
          dummy.scale.setScalar(0.4 + (1 - life) * 0.9 + sparkFill * 0.2);
          dummy.quaternion.identity();
          dummy.updateMatrix();
          sp.setMatrixAt(i, dummy.matrix);
        }
        sp.instanceMatrix.needsUpdate = true;
        sp.visible = true;
      }
    }

    const bs = buildSparks.current;
    if (bs) {
      if (!queued || far || hidden) bs.visible = false;
      else {
        const sock = SOCKETS[queued] ?? [0, 0, 0];
        for (let i = 0; i < 8; i++) {
          const life = (t * (0.55 + (i % 3) * 0.08) + i * 0.21) % 1;
          dummy.position.set(
            sock[0] + Math.cos(t * 2 + i) * 0.12 * (1 - life),
            sock[1] + life * 0.28,
            sock[2] + Math.sin(t * 2 + i) * 0.12 * (1 - life),
          );
          dummy.scale.setScalar(0.35 + (1 - life) * 0.8);
          dummy.quaternion.identity();
          dummy.updateMatrix();
          bs.setMatrixAt(i, dummy.matrix);
        }
        bs.instanceMatrix.needsUpdate = true;
        bs.visible = true;
      }
    }
    const info = state.gl.info.render;
    (globalThis as typeof globalThis & { __nidusPerf?: { calls: number; triangles: number; frameMs: number } }).__nidusPerf = {
      calls: info.calls,
      triangles: info.triangles,
      frameMs: d * 1000,
    };
  });

  const scaffoldPos = queued && SOCKETS[queued] ? SOCKETS[queued] : ([0, 0, 0] as [number, number, number]);

  return (
    <group>
      <group ref={skyRef}>
        <mesh rotation={[0, 0.18, 0.04]}>
          <cylinderGeometry args={[92, 92, 48, 40, 1, true]} />
          <meshBasicMaterial map={arch} color="#3a2a32" side={BackSide} />
        </mesh>
        <mesh position={[0, 14, 0]}>
          <sphereGeometry args={[92, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial map={voidMap} color="#1a1218" side={BackSide} />
        </mesh>
        <group position={[-38, -16, -22]}>
          <mesh>
            <sphereGeometry args={[5.4, 24, 16]} />
            <meshStandardMaterial map={rift} color="#8a6a72" roughness={0.88} metalness={0.08} emissive="#2a1820" emissiveIntensity={0.22} />
          </mesh>
          <mesh scale={1.04}>
            <sphereGeometry args={[5.4, 16, 12]} />
            <meshBasicMaterial color="#c4a090" transparent opacity={0.08} side={BackSide} depthWrite={false} />
          </mesh>
        </group>
        <group position={[32, -14, 22]}>
          <mesh>
            <sphereGeometry args={[4.2, 24, 16]} />
            <meshStandardMaterial map={titans} color="#8a7a68" roughness={0.86} metalness={0.08} emissive="#1a1610" emissiveIntensity={0.2} />
          </mesh>
          <mesh scale={1.05}>
            <sphereGeometry args={[4.2, 14, 10]} />
            <meshBasicMaterial color="#e0c8a8" transparent opacity={0.07} side={BackSide} depthWrite={false} />
          </mesh>
        </group>
        <group position={[12, -20, -36]}>
          <mesh>
            <sphereGeometry args={[3.4, 20, 14]} />
            <meshStandardMaterial map={rift} color="#7a5a62" roughness={0.9} metalness={0.06} emissive="#1a1014" emissiveIntensity={0.2} />
          </mesh>
          <mesh scale={1.05}>
            <sphereGeometry args={[3.4, 12, 10]} />
            <meshBasicMaterial color="#b08090" transparent opacity={0.07} side={BackSide} depthWrite={false} />
          </mesh>
        </group>
        <instancedMesh ref={debris} args={[undefined, undefined, 12]} frustumCulled={false}>
          <dodecahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial map={voidMap} color="#8a7a6c" roughness={0.92} metalness={0.12} />
        </instancedMesh>
      </group>

      <group ref={stationRef}>
      <mesh geometry={naveGeo}>
        <meshStandardMaterial
          ref={naveMat}
          map={rivet}
          bumpMap={height}
          bumpScale={0.07}
          roughnessMap={rough}
          color="#9a8c78"
          metalness={0.7}
          roughness={0.48}
          emissive={gilt}
          emissiveIntensity={0.03}
          polygonOffset
          polygonOffsetFactor={1}
        />
      </mesh>
      <mesh position={[0, 0.08, 0.05]}>
        <boxGeometry args={[0.72, 0.36, 2.95]} />
        <meshBasicMaterial color="#0c0a09" />
      </mesh>
      <mesh position={[0, 0.08, 0.05]}>
        <boxGeometry args={[0.78, 0.42, 3.05]} />
        <meshStandardMaterial map={plate} bumpMap={height} bumpScale={0.08} roughnessMap={rough} color="#b7a894" metalness={0.62} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.36, 0.1]}>
        <boxGeometry args={[0.34, 0.2, 2.15]} />
        <meshStandardMaterial map={plate} bumpMap={height} bumpScale={0.05} roughnessMap={rough} color="#c4b6a2" metalness={0.55} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.06, 0.12]}>
        <boxGeometry args={[1.72, 0.18, 0.52]} />
        <meshStandardMaterial map={plate} bumpMap={height} bumpScale={0.06} roughnessMap={rough} color="#b0a28e" metalness={0.64} roughness={0.46} />
      </mesh>
      <mesh position={[0, -0.28, 0.05]}>
        <boxGeometry args={[0.18, 0.16, 3.18]} />
        <meshStandardMaterial map={bone} color="#3a322c" metalness={0.8} roughness={0.3} />
      </mesh>
      {[-0.4, 0.4].map((x) => (
        <mesh key={`string-${x}`} position={[x, -0.2, 0.05]}>
          <boxGeometry args={[0.055, 0.09, 3.0]} />
          <meshStandardMaterial map={bone} color="#4a4038" metalness={0.82} roughness={0.28} />
        </mesh>
      ))}
      {[-1.15, -0.4, 0.38, 1.12].map((z) => (
        <group key={`rib-${z}`} position={[0, 0.08, z]}>
          <mesh position={[0, 0.24, 0]}>
            <boxGeometry args={[0.82, 0.045, 0.055]} />
            <meshStandardMaterial color="#3a342e" metalness={0.84} roughness={0.28} />
          </mesh>
          <mesh position={[0, -0.24, 0]}>
            <boxGeometry args={[0.82, 0.045, 0.055]} />
            <meshStandardMaterial color="#3a342e" metalness={0.84} roughness={0.28} />
          </mesh>
          <mesh position={[0.4, 0, 0]}>
            <boxGeometry args={[0.045, 0.5, 0.055]} />
            <meshStandardMaterial color="#3a342e" metalness={0.84} roughness={0.28} />
          </mesh>
          <mesh position={[-0.4, 0, 0]}>
            <boxGeometry args={[0.045, 0.5, 0.055]} />
            <meshStandardMaterial color="#3a342e" metalness={0.84} roughness={0.28} />
          </mesh>
        </group>
      ))}
      {[-0.55, 0.55].map((x) => (
        <mesh key={`butt-${x}`} position={[x, -0.02, 0.12]} rotation={[0, 0, x > 0 ? -0.45 : 0.45]}>
          <boxGeometry args={[0.55, 0.06, 0.1]} />
          <meshStandardMaterial map={bone} color="#c8bba8" metalness={0.55} roughness={0.42} />
        </mesh>
      ))}
      {[-0.95, 0.55].map((z) => (
        <group key={`hatch-${z}`}>
          <mesh position={[0.402, 0.1, z]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.26, 0.18, 0.022]} />
            <meshStandardMaterial map={grate} bumpMap={height} bumpScale={0.04} color="#6a5a4c" metalness={0.72} roughness={0.38} />
          </mesh>
          <mesh position={[0.416, 0.1, z]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.2, 0.12, 0.01]} />
            <meshStandardMaterial map={filigree} color="#c4a574" metalness={0.65} roughness={0.32} />
          </mesh>
        </group>
      ))}
      {[-1.35, -0.7, 0.05, 0.75, 1.4].map((z) =>
        [-0.07, 0.07].map((x) => (
          <mesh key={`bolt-${x}-${z}`} position={[x, -0.36, z]}>
            <boxGeometry args={[0.035, 0.028, 0.035]} />
            <meshStandardMaterial map={rivet} color="#4a4038" metalness={0.86} roughness={0.26} />
          </mesh>
        )),
      )}
      <Decal position={[0, 0.47, 0.1]} rotation={[-0.12, 0, 0]} size={[0.28, 1.6]} map={filigree} opacity={0.55} emissive={gilt} eInt={0.12} />
      {[-1.1, -0.35, 0.4, 1.15].map((z) => (
        <mesh key={`seam-${z}`} position={[0, 0.08, z]}>
          <boxGeometry args={[0.8, 0.44, 0.04]} />
          <meshStandardMaterial color="#9a8c78" metalness={0.7} roughness={0.36} />
        </mesh>
      ))}
      <mesh position={[0, 0, 2.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.34, 10]} />
        <meshStandardMaterial map={ember} color="#3a2c28" metalness={0.7} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, 2.28]}>
        <circleGeometry args={[0.1, 16]} />
        <meshBasicMaterial color="#ff6a4a" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, -2.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.24, 0.16, 10]} />
        <meshStandardMaterial map={voidMap} color="#2a221c" metalness={0.72} roughness={0.38} />
      </mesh>

      <group ref={microRef}>
      {[-0.42, 0.42].map((x) => (
        <mesh key={`pipe-${x}`} position={[x, 0.32, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 2.4, 8]} />
          <meshStandardMaterial color="#4a4038" metalness={0.85} roughness={0.32} />
        </mesh>
      ))}
      {[-0.9, -0.2, 0.5, 1.15].map((z, i) => (
        <mesh key={`ant-${z}`} position={[i % 2 ? 0.12 : -0.12, 0.58, z]} rotation={[0.15, 0, i % 2 ? 0.1 : -0.1]}>
          <cylinderGeometry args={[0.01, 0.016, 0.28 + (i % 3) * 0.08, 5]} />
          <meshStandardMaterial color="#3a342e" metalness={0.88} roughness={0.28} />
        </mesh>
      ))}
      <mesh position={[0.18, 0.62, 0.55]} rotation={[0.6, 0.2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.16, 5]} />
        <meshStandardMaterial color="#3a342e" metalness={0.88} roughness={0.28} />
      </mesh>
      <mesh position={[0.18, 0.72, 0.62]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.07, 10]} />
        <meshStandardMaterial map={grate} color="#c4b8a6" metalness={0.7} roughness={0.32} side={DoubleSide} />
      </mesh>
      {[-1.2, 0.2, 1.1].map((z) => (
        <mesh key={`vent-${z}`} position={[0, -0.42, z]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.12, 0.04, 0.18]} />
          <meshStandardMaterial map={grate} color="#6a5a4c" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
      <instancedMesh ref={windows} args={[undefined, undefined, 16]} visible={false}>
        <boxGeometry args={[0.045, 0.07, 0.028]} />
        <meshStandardMaterial ref={winMat} color={GILT} emissive={gilt} emissiveIntensity={0.7} toneMapped={false} />
      </instancedMesh>

      {[-0.95, 0, 0.95].map((z, i) => (
        <group key={`lancet-${z}`}>
          <mesh position={[0.4, 0.08, z]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.16, 0.32]} />
            <meshStandardMaterial color="#1c1612" metalness={0.7} roughness={0.45} />
          </mesh>
          <mesh position={[0.405, 0.08, z]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.14, 0.3]} />
            <meshStandardMaterial
              ref={i === 0 ? glassMat : undefined}
              map={rose}
              color={i % 2 ? venom : gilt}
              emissive={i % 2 ? venom : gilt}
              emissiveIntensity={0.45 + glow * 0.45}
              metalness={0.08}
              roughness={0.16}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0.408, 0.08, z]} rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.072, 0.088, 4]} />
            <meshStandardMaterial color="#3a342e" metalness={0.88} roughness={0.28} />
          </mesh>
          <mesh position={[0.405, 0.26, z]} rotation={[0, Math.PI / 2, 0]}>
            <coneGeometry args={[0.07, 0.14, 3]} />
            <meshStandardMaterial map={rose} color={GILT} emissive={gilt} emissiveIntensity={0.7 + glow} toneMapped={false} />
          </mesh>
          <mesh position={[-0.4, 0.08, z]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.16, 0.32]} />
            <meshStandardMaterial color="#1c1612" metalness={0.7} roughness={0.45} />
          </mesh>
          <mesh position={[-0.405, 0.08, z]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.14, 0.3]} />
            <meshStandardMaterial
              map={rose}
              color={i % 2 ? bloodC : gilt}
              emissive={i % 2 ? bloodC : gilt}
              emissiveIntensity={0.7 + glow * 0.8}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.12, -1.98]}>
        <circleGeometry args={[0.24, 16]} />
        <meshStandardMaterial color="#1c1612" metalness={0.7} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.12, -2.05]}>
        <circleGeometry args={[0.22, 16]} />
        <meshStandardMaterial map={rose} color={GILT} emissive={gilt} emissiveIntensity={1.1 + glow} toneMapped={false} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={`spoke-${i}`} position={[0, 0.12, -2.07]} rotation={[0, 0, (i * Math.PI) / 4]}>
          <boxGeometry args={[0.012, 0.38, 0.012]} />
          <meshStandardMaterial color="#3a342e" metalness={0.86} roughness={0.28} />
        </mesh>
      ))}
      <mesh position={[0, 0.12, -2.06]} rotation={[0, 0, Math.PI / 4]}>
        <ringGeometry args={[0.07, 0.2, 8]} />
        <meshStandardMaterial color="#2a221c" metalness={0.8} roughness={0.3} />
      </mesh>

      <Decal position={[0.4, 0.08, 0.1]} rotation={[0, Math.PI / 2, 0]} size={[1.4, 0.42]} map={giltMap} opacity={0.5} emissive={gilt} eInt={0.14} />
      <Decal position={[-0.4, 0.08, 0.25]} rotation={[0, -Math.PI / 2, 0]} size={[1.2, 0.38]} map={blood} color="#c45a4a" opacity={0.48} emissive={bloodC} eInt={0.1} />
      <Decal position={[0, -0.14, 0.1]} rotation={[-Math.PI / 2, 0, 0]} size={[0.7, 1.6]} map={hazard} opacity={0.35} />
      </group>

      {molt > 0 && (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.08, 0.1]}>
          <torusGeometry args={[0.42 + molt * 0.04, 0.016, 6, 28]} />
          <meshStandardMaterial color={GILT} emissive={gilt} emissiveIntensity={0.5 + molt * 0.22} metalness={0.82} roughness={0.26} toneMapped={false} />
        </mesh>
      )}
      <mesh position={[0, 0, 2.42]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.09, 0.28, 8, 1, true]} />
        <meshBasicMaterial ref={engineHeat} color="#ff8a55" transparent opacity={0.4} depthWrite={false} blending={AdditiveBlending} side={DoubleSide} toneMapped={false} />
      </mesh>
      <mesh position={[0.86, 0.14, 0.12]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshBasicMaterial ref={navA} color="#c45a4a" transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <mesh position={[-0.86, 0.14, 0.12]}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshBasicMaterial ref={navB} color="#c4a574" transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.52, 0.85]}>
        <boxGeometry args={[0.03, 0.22, 0.03]} />
        <meshStandardMaterial color={GILT} metalness={0.92} roughness={0.22} emissive={gilt} emissiveIntensity={0.55} />
      </mesh>
      <mesh position={[0, 0.46, 0.85]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.03, 0.12, 0.03]} />
        <meshStandardMaterial color={GILT} metalness={0.92} roughness={0.22} emissive={gilt} emissiveIntensity={0.55} />
      </mesh>
      <pointLight ref={furnace} position={[0, -0.1, 2.05]} color={BLOOD} distance={10} decay={2} intensity={16} />
      <pointLight ref={printLite} position={[0, 0.2, 0.1]} color={GILT} distance={6} decay={2} intensity={0} />
      <pointLight ref={leakLite} position={[0.55, 0.18, 0.3]} color={GILT} distance={6} decay={2} intensity={6} />

      <group ref={midRef}>
        <Ray position={[1.05, 0.12, 0]} rotation={[0, 0, -Math.PI / 2]} color={GILT} w={0.12} len={2.2} opacity={0.14} />
        <Ray position={[-1.05, 0.1, 0.2]} rotation={[0, 0, Math.PI / 2]} color={BLOOD} w={0.1} len={2} opacity={0.14} />
        <Ray position={[0, 0.08, -2.55]} rotation={[-Math.PI / 2, 0, 0]} color={GILT} w={0.16} len={2.4} opacity={0.12} />
        <Ray position={[0, -0.05, 2.7]} rotation={[Math.PI / 2, 0, 0]} color={BLOOD} w={0.14} len={1.8} opacity={0.16} />
        <Ray position={[0.2, 0.85, 0.1]} rotation={[0.2, 0, 0]} color={GILT} w={0.08} len={1.4} opacity={0.1} />
      </group>
      {/* iron halo */}
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[2.35, 0.018, 6, 48]} />
          <meshStandardMaterial
            color={surging ? VENOM : GILT}
            metalness={0.85}
            roughness={0.28}
            emissive={surging ? venom : gilt}
            emissiveIntensity={surging ? 1.1 : 0.35 + sparkFill * 0.4}
            toneMapped={false}
          />
        </mesh>
        {molt > 0 && (
          <mesh rotation={[Math.PI / 2.1, 0.2, 0]}>
            <torusGeometry args={[2.7, 0.014, 6, 40]} />
            <meshStandardMaterial color={BLOOD} emissive={bloodC} emissiveIntensity={0.7} toneMapped={false} />
          </mesh>
        )}
        {hiveRank >= 6 && (
          <mesh rotation={[Math.PI / 1.9, -0.15, 0.1]}>
            <torusGeometry args={[3.05, 0.012, 6, 36]} />
            <meshStandardMaterial color={VENOM} emissive={venom} emissiveIntensity={0.55 + sparkFill * 0.4} toneMapped={false} />
          </mesh>
        )}
      </group>

      <group ref={annexRef}>
      {solar && (
        <Dock id="solar" rank={solarRank}>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.07, 0.1, 0.12, 8]} />
            <meshStandardMaterial map={plate} color="#e8d4a8" metalness={0.55} roughness={0.36} emissive={gilt} emissiveIntensity={0.7} />
          </mesh>
          <group ref={solarRef} position={[0, 0.12, 0]}>
            {[0, 1, 2].map((i) => (
              <mesh key={`vane-${i}`} rotation={[Math.PI / 2, 0, (i * Math.PI) / 3]}>
                <circleGeometry args={[0.26, 6]} />
                <meshStandardMaterial map={glass} color={GILT} metalness={0.45} roughness={0.18} emissive={gilt} emissiveIntensity={1.15} toneMapped={false} side={DoubleSide} transparent opacity={0.92} />
              </mesh>
            ))}
          </group>
        </Dock>
      )}
      {silo && (
        <Dock id="silo" rank={siloRank}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.09, 0.13, 0.4, 8]} />
            <meshStandardMaterial map={plate} color={BONE} metalness={0.6} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.1, 8, 6]} />
            <meshStandardMaterial map={grate} color="#c4b8a6" metalness={0.7} roughness={0.35} />
          </mesh>
        </Dock>
      )}
      {orebay && (
        <Dock id="orebay" rank={orebayRank}>
          <mesh geometry={hopperGeo} dispose={null}>
            <meshStandardMaterial map={grate} color={BONE} metalness={0.62} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.1, 0.16, 8]} />
            <meshStandardMaterial map={hazard} color="#c4a574" metalness={0.5} roughness={0.42} />
          </mesh>
        </Dock>
      )}
      {barracks && (
        <Dock id="barracks" rank={barracksRank}>
          <mesh geometry={blisterGeo}>
            <meshStandardMaterial map={plate} color={BONE} metalness={0.55} roughness={0.46} />
          </mesh>
          <mesh position={[0, 0.18, 0.12]} rotation={[0, 0, 0]}>
            <planeGeometry args={[0.12, 0.18]} />
            <meshStandardMaterial map={filigree} color={GILT} transparent opacity={0.7} emissive={gilt} emissiveIntensity={0.15} side={DoubleSide} />
          </mesh>
        </Dock>
      )}
      {hangar && (
        <Dock id="hangar" rank={hangarRank}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.22, 0.28, 0.22, 8]} />
            <meshStandardMaterial map={grate} color={BONE} metalness={0.58} roughness={0.42} />
          </mesh>
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.16, 0.2, 0.08, 8, 1, true]} />
            <meshStandardMaterial ref={hangarGlow} map={grate} color={BONE} emissive={venom} emissiveIntensity={raiding ? 1 : 0.12} toneMapped={false} side={DoubleSide} />
          </mesh>
          <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.2, 8]} />
            <meshStandardMaterial color="#1c1612" metalness={0.7} roughness={0.4} />
          </mesh>
        </Dock>
      )}
      {gundeck && (
        <Dock id="gundeck" rank={gundeckRank}>
          <group ref={gunRef}>
            <mesh position={[0, 0.08, 0]}>
              <cylinderGeometry args={[0.1, 0.12, 0.18, 8]} />
              <meshStandardMaterial map={plate} color="#c4a0a0" metalness={0.62} roughness={0.36} emissive={bloodC} emissiveIntensity={0.35} />
            </mesh>
            <mesh position={[0, 0.38, 0]}>
              <cylinderGeometry args={[0.035, 0.055, 0.48, 8]} />
              <meshStandardMaterial color={BLOOD} metalness={0.55} roughness={0.36} emissive={bloodC} emissiveIntensity={0.45} />
            </mesh>
            <group ref={tracerRef} position={[0, 0.7, 0]} visible={false}>
              <mesh>
                <cylinderGeometry args={[0.012, 0.004, 1, 5]} />
                <meshBasicMaterial color={BLOOD} transparent opacity={0.75} toneMapped={false} />
              </mesh>
            </group>
            <pointLight ref={muzzle} position={[0, 0.55, 0]} color={BLOOD} distance={6} intensity={0} />
          </group>
        </Dock>
      )}
      {lab && (
        <Dock id="lab" rank={labRank}>
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 0.14, 8]} />
            <meshStandardMaterial map={plate} color="#b8d4c0" metalness={0.5} roughness={0.4} emissive={venom} emissiveIntensity={0.35} />
          </mesh>
          <group ref={labRef} position={[0, 0.28, 0]}>
            <mesh>
              <sphereGeometry args={[0.11, 12, 10]} />
              <meshStandardMaterial map={glass} color={VENOM} emissive={venom} emissiveIntensity={1.15} toneMapped={false} />
            </mesh>
          </group>
        </Dock>
      )}
      {nerve && (
        <Dock id="nerve" rank={nerveRank}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.09, 0.11, 0.1, 8]} />
            <meshStandardMaterial map={plate} color="#e8d4a8" metalness={0.55} roughness={0.4} />
          </mesh>
          <group ref={nerveRef} position={[0, 0.2, 0]}>
            <mesh>
              <sphereGeometry args={[0.1, 12, 12]} />
              <meshStandardMaterial color={GILT} emissive={gilt} emissiveIntensity={1.8 + sparkFill * 1.4} toneMapped={false} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.13, 0.012, 6, 16]} />
              <meshStandardMaterial color="#3a342e" metalness={0.85} roughness={0.28} />
            </mesh>
          </group>
        </Dock>
      )}
      {sparkFill > 0.82 && nerve && (
        <group position={SOCKETS.nerve} quaternion={RADIAL.nerve}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.012, 6, 24]} />
            <meshBasicMaterial color={VENOM} transparent opacity={0.4 + sparkFill * 0.35} toneMapped={false} blending={AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      )}
      {reliquary && (
        <Dock id="reliquary" rank={reliquaryRank}>
          <group ref={relicRef}>
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.07, 0.09, 0.1, 8]} />
              <meshStandardMaterial map={plate} color="#e8d4a8" metalness={0.6} roughness={0.36} emissive={bloodC} emissiveIntensity={0.35} />
            </mesh>
            <mesh position={[0, 0.26, 0]}>
              <coneGeometry args={[0.11, 0.28, 6]} />
              <meshStandardMaterial map={giltMap} color={GILT} emissive={bloodC} emissiveIntensity={1.15} metalness={0.62} roughness={0.28} />
            </mesh>
          </group>
        </Dock>
      )}
      {cloister && (
        <Dock id="cloister" rank={cloisterRank}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.11, 0.13, 0.24, 8]} />
            <meshStandardMaterial map={rose} color={VENOM} metalness={0.45} roughness={0.38} emissive={venom} emissiveIntensity={0.85} toneMapped={false} />
          </mesh>
        </Dock>
      )}
      {choir && (
        <Dock id="choir" rank={choirRank}>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.05, 0.13, 0.32, 7]} />
            <meshStandardMaterial map={giltMap} color={GILT} metalness={0.62} roughness={0.32} emissive={gilt} emissiveIntensity={0.9} />
          </mesh>
        </Dock>
      )}
      {vault && (
        <Dock id="vault" rank={vaultRank}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.14, 0.16, 0.2, 8]} />
            <meshStandardMaterial map={voidMap} color="#cfc3b2" metalness={0.72} roughness={0.32} />
          </mesh>
        </Dock>
      )}
      {crypt && (
        <Dock id="crypt" rank={cryptRank}>
          <mesh position={[0, 0.14, 0]}>
            <capsuleGeometry args={[0.1, 0.16, 4, 8]} />
            <meshStandardMaterial map={ember} color={BLOOD} metalness={0.5} roughness={0.4} emissive={bloodC} emissiveIntensity={0.55} />
          </mesh>
        </Dock>
      )}
      {crucible && (
        <Dock id="crucible" rank={crucibleRank}>
          <mesh geometry={bowlGeo} dispose={null}>
            <meshStandardMaterial map={ember} color="#c45a4a" metalness={0.55} roughness={0.36} emissive={bloodC} emissiveIntensity={1.1} toneMapped={false} />
          </mesh>
        </Dock>
      )}
      {mill && (
        <Dock id="mill" rank={millRank}>
          <mesh geometry={hopperGeo} dispose={null}>
            <meshStandardMaterial map={grate} color="#8a7358" metalness={0.7} roughness={0.35} />
          </mesh>
        </Dock>
      )}
      {refinery && (
        <Dock id="refinery" rank={refineryRank}>
          <mesh geometry={bowlGeo} dispose={null}>
            <meshStandardMaterial map={ember} color="#c4a574" metalness={0.6} roughness={0.32} emissive={gilt} emissiveIntensity={0.4} />
          </mesh>
        </Dock>
      )}
      {sensor && (
        <Dock id="sensor">
          <mesh position={[0, 0.14, 0]}>
            <sphereGeometry args={[0.09, 10, 8]} />
            <meshStandardMaterial map={glass} color={GILT} emissive={gilt} emissiveIntensity={0.8} toneMapped={false} />
          </mesh>
        </Dock>
      )}
      {armory && (
        <Dock id="armory">
          <mesh position={[0, 0.16, 0]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.08, 0.36, 0.08]} />
            <meshStandardMaterial map={rivet} color="#6a5044" metalness={0.75} roughness={0.3} />
          </mesh>
        </Dock>
      )}
      {dock && (
        <Dock id="dock">
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.28, 0.1, 0.22]} />
            <meshStandardMaterial map={plate} color="#8a7a68" metalness={0.62} roughness={0.4} />
          </mesh>
        </Dock>
      )}
      {gallery && (
        <Dock id="gallery">
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[0.22, 0.12, 0.34]} />
            <meshStandardMaterial map={filigree} color={GILT} metalness={0.55} roughness={0.36} />
          </mesh>
        </Dock>
      )}
      {spire && (
        <Dock id="spire" rank={spireRank}>
          <mesh position={[0, 0.22, 0]}>
            <coneGeometry args={[0.08, 0.48, 6]} />
            <meshStandardMaterial map={giltMap} color={GILT} metalness={0.7} roughness={0.28} emissive={gilt} emissiveIntensity={0.9} />
          </mesh>
        </Dock>
      )}
      {apse && (
        <Dock id="apse" rank={apseRank}>
          <mesh geometry={apseGeo} dispose={null}>
            <meshStandardMaterial map={rose} color={BLOOD} metalness={0.48} roughness={0.36} emissive={bloodC} emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
        </Dock>
      )}

      {ghostId && SOCKETS[ghostId] && (
        <group position={SOCKETS[ghostId]} quaternion={RADIAL[ghostId]}>
          <mesh position={[0, 0.14, 0]}>
            {KIND[ghostId] === "maw" || KIND[ghostId] === "coffer" || KIND[ghostId] === "hopper" ? (
              <cylinderGeometry args={[0.13, 0.16, 0.24, 8]} />
            ) : KIND[ghostId] === "needle" || KIND[ghostId] === "lance" || KIND[ghostId] === "bell" || KIND[ghostId] === "lantern" || KIND[ghostId] === "apse" ? (
              <coneGeometry args={[0.1, 0.34, 6]} />
            ) : KIND[ghostId] === "spindle" ? (
              <cylinderGeometry args={[0.08, 0.12, 0.36, 8]} />
            ) : KIND[ghostId] === "crown" || KIND[ghostId] === "dome" || KIND[ghostId] === "hearth" ? (
              <sphereGeometry args={[0.13, 10, 8]} />
            ) : (
              <capsuleGeometry args={[0.1, 0.16, 4, 8]} />
            )}
            <meshBasicMaterial color={GILT} transparent opacity={0.38} depthWrite={false} />
          </mesh>
        </group>
      )}
      </group>

      <group ref={printDart} visible={false}>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.035, 0.14, 5]} />
          <meshBasicMaterial color={VENOM} toneMapped={false} />
        </mesh>
      </group>

      <group ref={scaffoldRef} position={scaffoldPos}>
        {[-0.22, 0.22].map((x) =>
          [-0.22, 0.22].map((z) => (
            <mesh key={`post-${x}-${z}`} position={[x, 0.18, z]}>
              <boxGeometry args={[0.028, 0.55, 0.028]} />
              <meshStandardMaterial color="#4a4038" metalness={0.78} roughness={0.32} />
            </mesh>
          )),
        )}
        <mesh position={[0, 0.46, 0]}>
          <boxGeometry args={[0.5, 0.03, 0.5]} />
          <meshStandardMaterial map={grate} color="#6a5a4c" metalness={0.7} roughness={0.38} />
        </mesh>
        <mesh position={[0, -0.08, 0]}>
          <boxGeometry args={[0.48, 0.025, 0.48]} />
          <meshStandardMaterial map={hazard} color="#c4a574" metalness={0.55} roughness={0.4} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`brace-${i}`} position={[0, 0.2, 0]} rotation={[0.35, (i * Math.PI) / 2, 0.4]}>
            <cylinderGeometry args={[0.01, 0.01, 0.52, 5]} />
            <meshStandardMaterial color={GILT} metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, -0.22 + queueProg * 0.4, 0]}>
          <boxGeometry args={[0.42, 0.04, 0.42]} />
          <meshStandardMaterial color={GILT} emissive={gilt} emissiveIntensity={0.35 + queueProg} toneMapped={false} />
        </mesh>
      </group>

      <instancedMesh ref={drones} args={[gnatGeo, undefined, count]} key={count} visible={false}>
        <meshStandardMaterial color="#d8cbb8" metalness={0.72} roughness={0.3} emissive={gilt} emissiveIntensity={0.22} />
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
        <group position={[0.15, -0.35, -6.4]} rotation={[0.15, 0.4, -0.08]}>
          <mesh>
            <boxGeometry args={[1.6, 0.32, 0.48]} />
            <meshStandardMaterial map={plate} color="#6a5a4c" metalness={0.62} roughness={0.48} />
          </mesh>
          <mesh position={[0.7, 0.08, 0]} rotation={[0.2, 0, 0.55]}>
            <boxGeometry args={[0.9, 0.04, 0.28]} />
            <meshStandardMaterial map={plate} color="#8a7358" metalness={0.7} roughness={0.4} />
          </mesh>
          <mesh position={[-0.55, 0.02, 0.1]} rotation={[0.1, 0.3, -0.4]}>
            <boxGeometry args={[0.5, 0.08, 0.2]} />
            <meshStandardMaterial color="#3a2a26" metalness={0.75} roughness={0.36} emissive={bloodC} emissiveIntensity={0.35} />
          </mesh>
          <mesh rotation={[Math.PI / 2.4, 0.2, 0.1]}>
            <torusGeometry args={[2.1, 0.025, 6, 32]} />
            <meshBasicMaterial color={GILT} transparent opacity={0.45} depthWrite={false} blending={AdditiveBlending} />
          </mesh>
          <pointLight color={BLOOD} intensity={4.5} distance={8} decay={2} />
        </group>
      )}
    </group>
  );
}

function CornerSun() {
  const light = useRef<SpotLight>(null);
  const hold = useRef<Group>(null);
  const disc = useRef<Group>(null);
  const shaft = useRef<MeshBasicMaterial>(null);
  const dust = useRef<InstancedMesh>(null);
  const { camera } = useThree();
  const sleep = useTexture("/nidus/sky-sleep.jpg");
  sleep.colorSpace = SRGBColorSpace;
  const mobile = typeof window !== "undefined" && window.innerWidth < 500;
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = REDUCE ? 1 : 0.94 + Math.sin(t * 0.5) * 0.06;
    if (hold.current) {
      hold.current.position.copy(camera.position);
      hold.current.quaternion.copy(camera.quaternion);
    }
    if (disc.current) disc.current.scale.setScalar(pulse);
    if (light.current) {
      light.current.intensity = 9 + pulse * 5;
      light.current.target.position.set(0, 0, 0);
      light.current.target.updateMatrixWorld();
    }
    if (shaft.current) shaft.current.opacity = 0.06 + pulse * 0.03;
    const mesh = dust.current;
    if (mesh && !REDUCE) {
      for (let i = 0; i < 8; i++) {
        const k = 0.22 + i * 0.09 + Math.sin(t * 0.18 + i) * 0.015;
        dummy.position.set(-1.8 * (1 - k), 1.55 * (1 - k), -4.2 - k * 9);
        dummy.scale.setScalar(0.4 + (1 - k) * 0.6);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  });
  return (
    <group>
      <directionalLight position={[-8, 11, 6]} intensity={1.7} color="#ffe2b8" />
      <directionalLight position={[10, 6, 14]} intensity={1.05} color="#f0e4d4" />
      <group ref={hold}>
        <group ref={disc} position={[-6.4, 5.6, -16]}>
          <mesh>
            <sphereGeometry args={[0.22, 12, 12]} />
            <meshBasicMaterial color="#fff6dc" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.48, 10, 10]} />
            <meshBasicMaterial map={sleep} color="#ffd08a" transparent opacity={0.5} depthWrite={false} blending={AdditiveBlending} />
          </mesh>
          <pointLight color="#ffe6b8" intensity={5} distance={18} decay={2} />
        </group>
        {!mobile && (
          <mesh position={[-2.4, 2.1, -8]} rotation={[0.55, 0.4, 0]}>
            <coneGeometry args={[0.55, 9, 8, 1, true]} />
            <meshBasicMaterial
              ref={shaft}
              color="#ffd8a8"
              transparent
              opacity={0.07}
              depthWrite={false}
              blending={AdditiveBlending}
              side={DoubleSide}
            />
          </mesh>
        )}
        <instancedMesh ref={dust} args={[undefined, undefined, 8]} frustumCulled={false}>
          <sphereGeometry args={[0.03, 5, 5]} />
          <meshBasicMaterial color="#ffe6c4" transparent opacity={0.5} depthWrite={false} blending={AdditiveBlending} />
        </instancedMesh>
      </group>
      <spotLight
        ref={light}
        position={[-12, 16, 8]}
        angle={0.4}
        penumbra={0.9}
        color="#ffe2b0"
        intensity={12}
        distance={80}
        decay={1.7}
      />
    </group>
  );
}

function BattleField() {
  const raid = useNidus((s) => s.raid);
  const watching = Boolean(raid?.watching);
  const n = Math.min(16, raid?.strikers ?? 0);
  const boosted = (raid?.boostUntil ?? 0) > Date.now();
  const ships = useRef<InstancedMesh>(null);
  const pirates = useRef<InstancedMesh>(null);
  const sparks = useRef<InstancedMesh>(null);
  const dartGeo = useMemo(() => craftGeo(1.6), []);
  const pirateGeo = useMemo(() => craftGeo(3.4), []);
  const plate = useTexture("/nidus/tex-plate.jpg");
  plate.colorSpace = SRGBColorSpace;
  const lastHit = useRef(0);
  useFrame((state) => {
    if (!raid) return;
    const t = state.clock.elapsedTime;
    if (t - lastHit.current > (boosted ? 0.7 : 1.45)) {
      lastHit.current = t;
      chime("hit");
    }
    const mesh = ships.current;
    if (mesh) {
      for (let i = 0; i < 16; i++) {
        if (i >= n) {
          dummy.position.set(0, -80, 0);
          dummy.scale.setScalar(0.001);
        } else {
          const a = t * 0.7 + (i / Math.max(1, n)) * Math.PI * 2;
          dummy.position.set(Math.cos(a) * 2.8, 0.35 + Math.sin(t * 1.6 + i) * 0.32, Math.sin(a) * 1.9 - 0.2);
          dummy.lookAt(0.2, 0.1, 0);
          dummy.rotateX(Math.PI / 2);
          dummy.scale.setScalar((boosted ? 1.25 : 1) * (watching ? 1 : 0.85));
        }
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.visible = true;
    }
    const pr = pirates.current;
    if (pr) {
      dummy.position.set(0.15, 0.08, 0.1);
      dummy.rotation.set(0.18, t * 0.12, 0.08);
      dummy.scale.setScalar(1.15);
      dummy.updateMatrix();
      pr.setMatrixAt(0, dummy.matrix);
      dummy.position.set(-1.6, -0.3, 0.8);
      dummy.rotation.set(0.3, t * 0.08, -0.2);
      dummy.scale.setScalar(0.55);
      dummy.updateMatrix();
      pr.setMatrixAt(1, dummy.matrix);
      pr.instanceMatrix.needsUpdate = true;
      pr.visible = true;
    }
    const sp = sparks.current;
    if (sp) {
      for (let i = 0; i < 10; i++) {
        const a = t * 2.6 + i * 0.62;
        dummy.position.set(Math.cos(a) * 0.55, 0.12 + Math.sin(t * 4 + i) * 0.28, Math.sin(a * 0.7) * 0.4);
        dummy.scale.setScalar(0.45 + (i % 3) * 0.4);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        sp.setMatrixAt(i, dummy.matrix);
      }
      sp.instanceMatrix.needsUpdate = true;
      sp.visible = watching;
    }
  });
  if (!raid) return null;
  return (
    <group position={[0, 0.2, watching ? 0.4 : 1.6]} scale={watching ? 1 : 0.55}>
      <mesh rotation={[0.2, 0.4, 0.1]}>
        <boxGeometry args={[1.85, 0.42, 0.62]} />
        <meshStandardMaterial map={plate} color="#5a4038" metalness={0.62} roughness={0.48} emissive="#3a1a18" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0.85, 0.08, 0]} rotation={[0.2, 0, 0.5]}>
        <boxGeometry args={[0.9, 0.08, 0.55]} />
        <meshStandardMaterial map={plate} color="#3a2a24" metalness={0.7} roughness={0.36} />
      </mesh>
      <mesh position={[-0.7, 0.22, 0]} rotation={[0.4, 0, -0.3]}>
        <coneGeometry args={[0.18, 0.7, 6]} />
        <meshStandardMaterial color="#2a1a18" metalness={0.72} roughness={0.32} emissive="#7a1f2b" emissiveIntensity={0.8} />
      </mesh>
      <pointLight color={boosted ? GILT : BLOOD} intensity={boosted ? 9 : 6} distance={12} decay={2} />
      <instancedMesh ref={ships} args={[dartGeo, undefined, 16]} visible={false}>
        <meshStandardMaterial color={boosted ? GILT : BONE} metalness={0.72} roughness={0.28} emissive={boosted ? GILT : BLOOD} emissiveIntensity={boosted ? 0.55 : 0.35} />
      </instancedMesh>
      <instancedMesh ref={pirates} args={[pirateGeo, undefined, 2]} visible={false}>
        <meshStandardMaterial color="#6a5044" metalness={0.55} roughness={0.45} emissive="#5a2018" emissiveIntensity={0.35} />
      </instancedMesh>
      <instancedMesh ref={sparks} args={[undefined, undefined, 10]} visible={false}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshBasicMaterial color={BLOOD} transparent opacity={0.85} toneMapped={false} blending={AdditiveBlending} depthWrite={false} />
      </instancedMesh>
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
      Number(s.rooms.solar.built) +
      Number(s.rooms.orebay.built) +
      Number(s.rooms.silo.built) +
      Number(s.rooms.barracks.built) +
      Number(s.rooms.hangar.built) +
      Number(s.rooms.gundeck.built) +
      Number(s.rooms.lab.built) +
      Number(s.rooms.nerve.built) +
      Number(s.rooms.reliquary.built),
  );
  const molt = useNidus((s) => s.moltLayer);
  const surgeUntil = useNidus((s) => s.surgeUntil);
  const printed = useNidus((s) => s.printed);
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
      ctl.current.autoRotate = !p.spinPaused && !looking;
    }
    if (!REDUCE && trauma.current > 0.01) {
      const shake = trauma.current * trauma.current;
      cam.position.x += Math.sin(t * 53.1) * 0.11 * shake;
      cam.position.y += Math.sin(t * 41.7) * 0.07 * shake;
      trauma.current = Math.max(0, trauma.current - dt * 1.45);
    }
    if (prefs.camPull && performance.now() - touched.current > 1800) {
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
      enablePan={false}
      enableRotate
      enableZoom
      zoomSpeed={0.55 + prefs.camZoom * 0.7}
      rotateSpeed={0.85}
      minDistance={CAM_MIN}
      maxDistance={CAM_MAX + extent * 4}
      minPolarAngle={0.28}
      maxPolarAngle={Math.PI / 1.45}
      enableDamping
      dampingFactor={prefs.watchNave ? 0.12 : 0.085}
      autoRotate={!prefs.spinPaused}
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
      style={{ touchAction: "none", position: "absolute", inset: 0 }}
      onDoubleClick={() => applyCamPreset("nave")}
      onCreated={({ gl, camera }) => {
        gl.setClearColor("#0c0a0e");
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
        const [x, y, z] = camPosition();
        camera.position.set(x, y, z);
      }}
    >
      <fog attach="fog" args={["#100c12", 78, 250]} />
      <hemisphereLight args={["#f2e6d0", "#1c1014", 1.02]} />
      <ambientLight intensity={0.38} />
      <pointLight position={[0, 1.0, 2.6]} intensity={7.4} color={BLOOD} distance={11} decay={2} />
      <pointLight position={[0, 0.4, -2.1]} intensity={3.2} color={GILT} distance={8} decay={2} />
      <Stars radius={110} depth={60} count={mobile ? 140 : 260} factor={3.2} saturation={0.18} fade speed={REDUCE ? 0 : 0.22} />
      <FlightDust />
      <Mood />
      <CornerSun />
      <Hull />
      <BattleField />
      <Rig />
    </Canvas>
  );
}

function FlightDust() {
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
      dummy.scale.set(0.018, 0.018, REDUCE ? 0.22 : 0.62);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, n]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#e8dcc8" transparent opacity={0.5} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
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
      fog.near = 36;
      fog.far = 150;
      gl.toneMappingExposure = 0.92;
    } else if (kind === "PULSAR") {
      fog.color.set("#241818");
      fog.near = 52;
      fog.far = 190;
      gl.toneMappingExposure = 1.42;
    } else if (kind === "ROSE") {
      fog.color.set("#120814");
      fog.near = 44;
      fog.far = 170;
      gl.toneMappingExposure = 1.22;
    } else if (kind === "TIDE" || kind === "FURNACE" || surging) {
      fog.color.set("#1a0a0c");
      fog.near = 42;
      fog.far = 165;
      gl.toneMappingExposure = 1.34;
    } else if (gift) {
      fog.color.set("#1a1010");
      fog.near = 46;
      fog.far = 175;
      gl.toneMappingExposure = 1.36;
    } else {
      fog.color.set("#100c12");
      fog.near = 78;
      fog.far = 250;
      gl.toneMappingExposure = 1.12;
    }
  });
  return null;
}
