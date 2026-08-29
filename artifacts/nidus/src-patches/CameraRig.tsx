import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TOUCH } from "three";
import { useNidus } from "@/lib/nidus/store";
import { getPrefs, subscribeSpin } from "@/lib/nidus/view";
import { useSyncExternalStore } from "react";

function useSpin() {
  return useSyncExternalStore(subscribeSpin, getPrefs, getPrefs);
}

/** Wide station viewer. Drop in for the old close Rig. */
export function Rig() {
  const prefs = useSpin();
  const lastCam = useRef(prefs.camGen);
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
  const extent = 1 + roomsLit * 0.55 + molt * 0.85;
  const touched = useRef(0);
  const start: [number, number, number] = [11.6, 5.1, 15.2];
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const want = 16.4 + extent * 1.55;
    if (lastCam.current !== prefs.camGen) {
      lastCam.current = prefs.camGen;
      state.camera.position.set(...start);
    }
    const p = state.camera.position;
    const dist = p.length();
    if (dist < want && performance.now() - touched.current > 1800) {
      const k = 1 - Math.exp(-dt * 1.35);
      p.multiplyScalar(1 + (want / Math.max(0.2, dist) - 1) * k);
    }
  });
  return (
    <OrbitControls
      enablePan={false}
      enableRotate
      enableZoom
      zoomSpeed={0.95}
      rotateSpeed={0.85}
      minDistance={10.4 + extent * 0.45}
      maxDistance={42 + extent * 14}
      minPolarAngle={0.28}
      maxPolarAngle={Math.PI / 1.45}
      enableDamping
      dampingFactor={0.085}
      autoRotate={!prefs.spinPaused}
      autoRotateSpeed={prefs.spinSpeed}
      touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
      onStart={() => {
        touched.current = performance.now();
      }}
    />
  );
}

export const STATION_CAM = { position: [11.6, 5.1, 15.2] as [number, number, number], fov: 46, near: 0.45, far: 220 };
