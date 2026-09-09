import { FRAMES, RAIDS } from "./content";

export const BOOT_ASSETS: string[] = [
  ...new Set([
    "/nidus/interior-hull.jpg",
    "/nidus/interior-forge.jpg",
    "/nidus/interior-minds.jpg",
    "/nidus/keyart.jpg",
    "/nidus/nave.jpg",
    "/nidus/tex-plate.jpg",
    "/nidus/tex-glass.jpg",
    "/nidus/tex-grate.jpg",
    "/nidus/tex-nebula.jpg",
    "/nidus/tex-filigree.jpg",
    "/nidus/tex-blood.jpg",
    "/nidus/tex-hazard.jpg",
    "/nidus/tex-rivet.jpg",
    "/nidus/tex-gilt.jpg",
    "/nidus/tex-rose.jpg",
    "/nidus/tex-void.jpg",
    "/nidus/tex-ember.jpg",
    "/nidus/tex-bone.jpg",
    "/nidus/tex-height.jpg",
    "/nidus/tex-rough.jpg",
    "/nidus/sky-arch.jpg",
    "/nidus/sky-sleep.jpg",
    "/nidus/sky-rift.jpg",
    "/nidus/sky-titans.jpg",
    ...Object.values(FRAMES).flatMap((f) => f.portraits),
    ...RAIDS.map((r) => r.image),
  ]),
];

export type BootState = { pct: number; ready: boolean; label: string };

export const BOOT_IDLE: BootState = { pct: 0, ready: false, label: "BINDING" };

function loadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(done, 3500);
    img.onload = done;
    img.onerror = done;
    try {
      img.crossOrigin = "anonymous";
    } catch {
      /* webview */
    }
    img.src = src;
    if (img.complete) done();
  });
}

export async function runBoot(onProgress: (boot: BootState) => void): Promise<void> {
  const steps = Math.max(1, BOOT_ASSETS.length);
  let done = 0;
  const labels = ["BINDING", "NAVE", "FORGE", "MINDS", "HULL"];
  const bump = () => {
    done += 1;
    const pct = Math.min(99, Math.round((done / steps) * 99));
    onProgress({
      pct,
      ready: false,
      label: labels[Math.min(labels.length - 1, Math.floor((done / steps) * labels.length))] ?? "BINDING",
    });
  };
  const scene = import("@/components/nidus/StationScene").catch(() => undefined);
  const batch = 4;
  for (let i = 0; i < BOOT_ASSETS.length; i += batch) {
    await Promise.all(BOOT_ASSETS.slice(i, i + batch).map(loadImage));
    for (let j = 0; j < Math.min(batch, BOOT_ASSETS.length - i); j++) bump();
  }
  await Promise.race([
    scene,
    new Promise<void>((resolve) => {
      window.setTimeout(resolve, 5000);
    }),
  ]);
  onProgress({ pct: 100, ready: true, label: "READY" });
}
