const KEY = "nidus.prefs.v1";

export type HelpId = "hull" | "forge" | "raid" | "minds" | "view" | "wake" | "idle";

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
};

export const CAM_DIR = { x: 0.594, y: 0.259, z: 0.761 };
export const CAM_MIN = 8;
export const CAM_MAX = 48;
export const CAM_DEFAULT = 18;

export const CAM_PRESETS = {
  close: { camDist: 12, camFov: 42, label: "CLOSE", why: "inspect a node" },
  nave: { camDist: 18, camFov: 46, label: "NAVE", why: "working shot" },
  wide: { camDist: 24, camFov: 48, label: "WIDE", why: "station in the glass" },
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
  camPull: false,
  autoHide: true,
  watchNave: false,
  lookId: "",
  lookUntil: 0,
  seenHelp: {},
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
      spinPaused: Boolean(parsed.spinPaused),
      spinSpeed: typeof parsed.spinSpeed === "number" ? parsed.spinSpeed : 0.85,
      music: typeof parsed.music === "number" ? parsed.music : 0.62,
      sfx: typeof parsed.sfx === "number" ? parsed.sfx : 0.78,
      muted: Boolean(parsed.muted),
      hints: parsed.hints !== false,
      camGen: typeof parsed.camGen === "number" ? parsed.camGen : 0,
      camDist: typeof parsed.camDist === "number"
        ? clamp(parsed.camDist === 24 && (parsed.camFov === 48 || parsed.camFov == null) ? CAM_DEFAULT : parsed.camDist, CAM_MIN, CAM_MAX)
        : CAM_DEFAULT,
      camFov: typeof parsed.camFov === "number" ? clamp(parsed.camDist === 24 && parsed.camFov === 48 ? 46 : parsed.camFov, 28, 70) : 46,
      camZoom: typeof parsed.camZoom === "number" ? clamp(parsed.camZoom, 0.35, 1.8) : 1,
      camPull: Boolean(parsed.camPull),
      autoHide: parsed.autoHide !== false,
      watchNave: Boolean(parsed.watchNave),
      lookId: typeof parsed.lookId === "string" ? parsed.lookId : "",
      lookUntil: typeof parsed.lookUntil === "number" ? parsed.lookUntil : 0,
      seenHelp: parsed.seenHelp && typeof parsed.seenHelp === "object" ? parsed.seenHelp : {},
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
