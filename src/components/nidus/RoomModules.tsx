import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { BufferGeometry, Group, MeshBasicMaterial, Texture } from "three";
import { AdditiveBlending } from "three";
import { useNidus } from "@/lib/nidus/store";
import { ROOMS } from "@/lib/nidus/content";
import { MODULE_IDS, ROOM_SOCKETS, bakedBodies, placedModule, socketQuat, merge } from "./roomKit";

const REDUCE =
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const GILT = "#c4a574";

type Mats = { plate: Texture; glass: Texture };

function useBuilt() {
  const key = useNidus((s) => MODULE_IDS.filter((id) => s.rooms[id as keyof typeof s.rooms]?.built).join(","));
  const ranks = useNidus((s) =>
    MODULE_IDS.map((id) => `${id}:${s.rooms[id as keyof typeof s.rooms]?.built ? (s.rooms[id as keyof typeof s.rooms]?.rank ?? 0) : 0}`).join(","),
  );
  return { key, ranks };
}

function Baked({ ids, ranks, mats }: { ids: string[]; ranks: Record<string, number>; mats: Mats }) {
  const geo = useMemo(() => bakedBodies(ids, ranks), [ids, ranks]);
  useEffect(
    () => () => {
      geo.body?.dispose();
      geo.glow?.dispose();
      geo.trim?.dispose();
    },
    [geo],
  );
  return (
    <group>
      {geo.body && (
        <mesh geometry={geo.body}>
          <meshStandardMaterial map={mats.plate} color="#c7bba8" vertexColors metalness={0.5} roughness={0.5} envMapIntensity={0.7} dithering />
        </mesh>
      )}
      {geo.glow && (
        <mesh geometry={geo.glow}>
          <meshStandardMaterial map={mats.glass} emissiveMap={mats.glass} emissive="#ffffff" emissiveIntensity={0.75} roughness={0.25} metalness={0} />
        </mesh>
      )}
      {geo.trim && (
        <mesh geometry={geo.trim}>
          <meshStandardMaterial color={GILT} metalness={0.9} roughness={0.28} envMapIntensity={1.1} dithering />
        </mesh>
      )}
    </group>
  );
}

// A room that just finished: grows out of the hull with a small overshoot, then joins the bake.
function Fresh({ id, mats, onDone }: { id: string; mats: Mats; onDone: (id: string) => void }) {
  const ref = useRef<Group>(null);
  const k = useRef(0);
  const sock = ROOM_SOCKETS[id];
  const geo = useMemo(() => {
    const m = placedModule(id);
    if (!m) return null;
    const out = { body: merge(m.body), glow: merge(m.glow), trim: merge(m.trim) };
    for (const g of [...m.body, ...m.glow, ...m.trim]) g.dispose();
    m.spin?.geo.dispose();
    return out;
  }, [id]);
  useEffect(() => () => void (geo && [geo.body, geo.glow, geo.trim].forEach((g) => g?.dispose())), [geo]);
  useFrame((_, dt) => {
    k.current = Math.min(1, k.current + Math.min(dt, 0.1) * (REDUCE ? 10 : 0.8));
    const e = 1 - (1 - k.current) ** 3;
    const over = k.current < 1 ? 1 + Math.sin(k.current * Math.PI) * 0.12 : 1;
    const g = ref.current;
    if (g) {
      // Grow about the socket, not the ship origin.
      const s = 0.02 + e * 0.98 * over;
      g.scale.setScalar(s);
      g.position.set(sock.p[0] * (1 - s), sock.p[1] * (1 - s), sock.p[2] * (1 - s));
    }
    if (k.current >= 1) onDone(id);
  });
  if (!geo) return null;
  return (
    <group ref={ref} scale={0.02}>
      {geo.body && (
        <mesh geometry={geo.body}>
          <meshStandardMaterial map={mats.plate} color="#c7bba8" metalness={0.5} roughness={0.5} envMapIntensity={0.7} emissive={GILT} emissiveIntensity={0.25} />
        </mesh>
      )}
      {geo.glow && (
        <mesh geometry={geo.glow}>
          <meshStandardMaterial map={mats.glass} emissiveMap={mats.glass} emissive="#ffffff" emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      )}
      {geo.trim && (
        <mesh geometry={geo.trim}>
          <meshStandardMaterial color={GILT} metalness={0.9} roughness={0.28} />
        </mesh>
      )}
    </group>
  );
}

// Animated part of a built module: sails turn, wheels spin, dishes sweep, bells swing.
function Spinner({ id, mats }: { id: string; mats: Mats }) {
  const spin = useMemo(() => placedModule(id)?.spin ?? null, [id]);
  const quat = useMemo(() => socketQuat(id), [id]);
  const sock = ROOM_SOCKETS[id];
  const pivot = useRef<Group>(null);
  useEffect(() => () => spin?.geo.dispose(), [spin]);
  useFrame((state, dt) => {
    const p = pivot.current;
    if (!p || !spin || REDUCE) return;
    if (spin.swing) p.rotation[spin.axis] = Math.sin(state.clock.elapsedTime * spin.speed) * 0.35;
    else p.rotation[spin.axis] += Math.min(dt, 0.1) * spin.speed;
  });
  if (!spin) return null;
  const s = sock.s ?? 1;
  return (
    <group position={sock.p} quaternion={quat} scale={s}>
      <group position={spin.at}>
        <group ref={pivot}>
          <mesh geometry={spin.geo}>
            <meshStandardMaterial map={mats.plate} color="#b9ad9a" metalness={0.6} roughness={0.42} envMapIntensity={0.8} dithering />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// The room being raised: a gilt scaffold ghost that fills in with build progress.
function Scaffold({ id, pct }: { id: string; pct: number }) {
  const mat = useRef<MeshBasicMaterial>(null);
  const geo = useMemo<BufferGeometry | null>(() => {
    const m = placedModule(id);
    if (!m) return null;
    const g = merge([...m.body, ...m.trim]);
    for (const p of [...m.body, ...m.glow, ...m.trim]) p.dispose();
    m.spin?.geo.dispose();
    return g;
  }, [id]);
  useEffect(() => () => geo?.dispose(), [geo]);
  useFrame((state) => {
    if (mat.current) mat.current.opacity = 0.1 + pct * 0.16 + (REDUCE ? 0 : Math.sin(state.clock.elapsedTime * 4) * 0.04);
  });
  if (!geo) return null;
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial ref={mat} color="#a8844e" wireframe transparent opacity={0.2} depthWrite={false} blending={AdditiveBlending} />
    </mesh>
  );
}

export function RoomModules({ plate, glass }: Mats) {
  const { key, ranks } = useBuilt();
  const queued = useNidus((s) => {
    const q = s.queuedRoom;
    return q && MODULE_IDS.includes(q) && !s.rooms[q]?.built ? q : "";
  });
  const pct = useNidus((s) => {
    const q = s.queuedRoom;
    const r = q ? s.rooms[q] : null;
    const work = ROOMS.find((x) => x.id === q)?.work ?? 1;
    return r ? Math.round(Math.min(1, r.progress / Math.max(1, work)) * 10) / 10 : 0;
  });
  const built = useMemo(() => (key ? key.split(",") : []), [key]);
  const rankMap = useMemo(() => Object.fromEntries(ranks.split(",").map((p) => [p.split(":")[0], Number(p.split(":")[1])])), [ranks]);
  const seen = useRef<Set<string> | null>(null);
  const [fresh, setFresh] = useState<string[]>([]);
  useEffect(() => {
    if (!seen.current) {
      seen.current = new Set(built);
      return;
    }
    const added = built.filter((id) => !seen.current!.has(id));
    for (const id of added) seen.current.add(id);
    if (added.length) setFresh((f) => [...f, ...added]);
  }, [built]);
  const settled = useMemo(() => built.filter((id) => !fresh.includes(id)), [built, fresh]);
  const mats = useMemo(() => ({ plate, glass }), [plate, glass]);
  const done = useRef((id: string) => setFresh((f) => (f.includes(id) ? f.filter((x) => x !== id) : f)));
  const spinners = built.filter((id) => placedModuleHasSpin(id));

  return (
    <group>
      <Baked ids={settled} ranks={rankMap} mats={mats} />
      {fresh.map((id) => (
        <Fresh key={id} id={id} mats={mats} onDone={done.current} />
      ))}
      {spinners.map((id) => (
        <Spinner key={`spin-${id}`} id={id} mats={mats} />
      ))}
      {queued && <Scaffold id={queued} pct={pct} />}
    </group>
  );
}

const SPIN_IDS = new Set(["solar", "choir", "mill", "sensor"]);
function placedModuleHasSpin(id: string) {
  return SPIN_IDS.has(id);
}
