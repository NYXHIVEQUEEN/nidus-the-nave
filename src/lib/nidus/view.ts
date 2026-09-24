const KEY = "nidus.prefs.v1";

export type HelpId = "hull" | "forge" | "lab" | "raid" | "minds" | "view" | "wake" | "idle" | "flow";
export type Density = "auto" | "compact" | "comfort" | "watch";
export type DensityResolved = "compact" | "comfort" | "watch";
export type MusicBed = "anthem" | "void";

export type ViewPrefs = {
  spinPaused: boolean;
  spinSpeed: number;
  music: number;
  sfx: number;
  muted: boolean;
  hints: boolean;
  camGen: number;
  camDist: number;
  camFov: number;
  camZoom: number;
  camPull: boolean;
  autoHide: boolean;
  watchNave: boolean;
  lookId: string;
  lookUntil: number;
  seenHelp: Partial<Record<HelpId, boolean>>;
  density: Density;
  uiScale: number;
  musicBed: MusicBed;
  prefsGen: number;
};

export const CAM_DIR = { x: 0.72, y: 0.28, z: -0.64 };
export const CAM_MIN = 8;
export const CAM_MAX = 48;
export const CAM_DEFAULT = 14;
export const CAM_POLAR = Math.acos(CAM_DIR.y / Math.hypot(CAM_DIR.x, CAM_DIR.y, CAM_DIR.z));

export const CAM_PRESETS = {
  close: { camDist: 10, camFov: 42, label: "CLOSE", why: "inspect a node" },
  nave: { camDist: 15, camFov: 46, label: "NAVE", why: "working shot" },
  wide: { camDist: 22, camFov: 48, label: "WIDE", why: "station in the glass" },
  void: { camDist: 36, camFov: 52, label: "VOID", why: "cathedral in the sky" },
} as const;

export type CamPresetId = keyof typeof CAM_PRESETS;

const listeners = new Set<() => void>();
let prefs: ViewPrefs = {
  spinPaused: false,
  spinSpeed: 0.85,
  music: 0.62,
  sfx: 0.78,
  muted: false,
  hints: true,
  camGen: 0,
  camDist: CAM_DEFAULT,
  camFov: 46,
  camZoom: 1,
  camPull: true,
  autoHide: false,
  watchNave: false,
  lookId: "",
  lookUntil: 0,
  seenHelp: {},
  density: "compact" as Density,
  uiScale: 0.58,
  musicBed: "anthem" as MusicBed,
  prefsGen: 10,
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function read() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<ViewPrefs>;
    prefs = {
      spinPaused: (parsed.prefsGen ?? 0) >= 10 ? Boolean(parsed.spinPaused) : false,
      spinSpeed: typeof parsed.spinSpeed === "number" ? parsed.spinSpeed : 0.85,
      music: typeof parsed.music === "number" ? parsed.music : 0.62,
      sfx: typeof parsed.sfx === "number" ? parsed.sfx : 0.78,
      muted: Boolean(parsed.muted),
      hints: parsed.hints !== false,
      camGen: typeof parsed.camGen === "number" ? parsed.camGen : 0,
      camDist: typeof parsed.camDist === "number" && (parsed.prefsGen ?? 0) >= 6
        ? clamp(parsed.camDist, CAM_MIN, CAM_MAX)
        : CAM_DEFAULT,
      camFov: typeof parsed.camFov === "number" && (parsed.prefsGen ?? 0) >= 6 ? clamp(parsed.camFov, 28, 70) : 46,
      camZoom: typeof parsed.camZoom === "number" ? clamp(parsed.camZoom, 0.35, 1.8) : 1,
      camPull: (parsed.prefsGen ?? 0) >= 10 ? Boolean(parsed.camPull) : true,
      autoHide: (parsed.prefsGen ?? 0) >= 7 ? Boolean(parsed.autoHide) : false,
      watchNave: false,
      lookId: typeof parsed.lookId === "string" ? parsed.lookId : "",
      lookUntil: typeof parsed.lookUntil === "number" ? parsed.lookUntil : 0,
      seenHelp: parsed.seenHelp && typeof parsed.seenHelp === "object" ? parsed.seenHelp : {},
      density:
        (parsed.prefsGen ?? 0) >= 7 &&
        (parsed.density === "compact" || parsed.density === "comfort" || parsed.density === "auto")
          ? parsed.density
          : "compact",
      uiScale: (parsed.prefsGen ?? 0) >= 8 && typeof parsed.uiScale === "number" ? clamp(parsed.uiScale, 0.5, 1) : 0.58,
      musicBed: parsed.musicBed === "void" ? "void" : "anthem",
      prefsGen: 10,
    };
  } catch {
    /* keep */
  }
}

read();

function write() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    /* private */
  }
}

function emit() {
  write();
  listeners.forEach((fn) => fn());
}

export function getPrefs() {
  return prefs;
}

export function patchPrefs(partial: Partial<ViewPrefs>) {
  prefs = { ...prefs, ...partial };
  prefs.uiScale = clamp(prefs.uiScale, 0.5, 1);
  emit();
}

export function getSpinPaused() {
  return prefs.spinPaused;
}

export function setSpinPaused(next: boolean) {
  patchPrefs({ spinPaused: next });
}

export function toggleSpinPaused() {
  setSpinPaused(!prefs.spinPaused);
}

export function bumpCam() {
  patchPrefs({ camGen: prefs.camGen + 1 });
}

export function lookAtRoom(id: string) {
  patchPrefs({ lookId: id === "foundry" ? "prow" : id, lookUntil: Date.now() + 3400, watchNave: false });
}

export function applyCamPreset(id: CamPresetId) {
  const p = CAM_PRESETS[id];
  patchPrefs({ camDist: p.camDist, camFov: p.camFov, camGen: prefs.camGen + 1 });
}

export function camPosition(dist = prefs.camDist): [number, number, number] {
  const d = clamp(dist, CAM_MIN, CAM_MAX);
  return [CAM_DIR.x * d, CAM_DIR.y * d, CAM_DIR.z * d];
}

export function markHelp(id: HelpId) {
  if (prefs.seenHelp[id]) return;
  patchPrefs({ seenHelp: { ...prefs.seenHelp, [id]: true } });
}

export function helpSeen(id: HelpId) {
  return Boolean(prefs.seenHelp[id]);
}

export function subscribeSpin(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function resolveDensity(p = prefs, _w = 390, h = 844, landscape = false): DensityResolved {
  if (p.density === "watch") return "compact";
  if (p.density === "compact" || p.density === "comfort") return p.density;
  if (landscape && h < 480) return "compact";
  if (h < 620) return "compact";
  return "comfort";
}

export function cycleDensity() {
  const order: Density[] = ["auto", "compact", "comfort"];
  const i = order.indexOf(prefs.density);
  patchPrefs({ density: order[(i + 1) % order.length] ?? "auto" });
}

export const DENSITY_LABEL: Record<Density, string> = {
  auto: "AUTO",
  compact: "TIGHT",
  comfort: "ROOMY",
  watch: "WATCH",
};
