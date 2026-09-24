import type { GameState } from "./types";

export const APP_VERSION = "1.0.0";

// Empty until the owner picks a public inbox. The UI falls back to GitHub issues.
export const SUPPORT_EMAIL = "";
export const SUPPORT_ISSUES = "https://github.com/NYXHIVEQUEEN/nidus-the-nave/issues/new";

export const FAQ: { q: string; a: string }[] = [
  {
    q: "MY HIVE IS GONE",
    a: "The hive lives on this device only. A new phone, a new browser, private mode, or clearing site data starts fresh. If you EXPORTed or STASHed, open SETTINGS → SAVE → IMPORT or LOAD. Export before you switch glass.",
  },
  {
    q: "NO SOUND",
    a: "Phones block audio until you touch the nave. Tap WAKE or anywhere on the hull. Check SOUND under SETTINGS and MUSIC / SFX in TUNE. iPhone silent switch mutes it too.",
  },
  {
    q: "IT RUNS HOT OR SLOW",
    a: "SETTINGS → SIZE until it reads WATCH folds chrome. Lower SPIN or HOLD the orbit. Close other tabs. The 3D pauses itself when you leave the app.",
  },
  {
    q: "DID I EARN WHILE AWAY",
    a: "Yes, up to the offline cap. Come back and CLAIM the gift. Long gaps bank a mercy SURGE.",
  },
  {
    q: "IMPORT SAID NO",
    a: "Only a file made by EXPORT or COPY JSON is a hive. Your live hive is kept safe before any import, so a bad file cannot burn it.",
  },
  {
    q: "INSTALL TO HOME",
    a: "SETTINGS → SAVE → INSTALL HOME. On iPhone: Share → Add to Home Screen.",
  },
];

type ReportNav = {
  userAgent?: string;
  language?: string;
};

export function buildReport(
  s: Pick<GameState, "version" | "hiveRank" | "rooms" | "minds" | "printed" | "moltLayer" | "started">,
  env: { nav?: ReportNav; width?: number; height?: number; standalone?: boolean; now?: number } = {},
): string {
  const built = Object.values(s.rooms ?? {}).filter((r) => r?.built).length;
  const minds = Array.isArray(s.minds) ? s.minds.filter((m) => m?.alive).length : 0;
  return [
    `NIDUS ${APP_VERSION} · save v${s.version ?? "?"}`,
    `hive: rank ${s.hiveRank ?? 0} · rooms ${built} · minds ${minds} · printed ${s.printed ?? 0} · molt ${s.moltLayer ?? 0} · ${s.started ? "live" : "title"}`,
    `glass: ${env.width ?? "?"}×${env.height ?? "?"} · ${env.standalone ? "installed" : "browser"} · ${env.nav?.language ?? "?"}`,
    `agent: ${env.nav?.userAgent ?? "?"}`,
    `at: ${new Date(env.now ?? Date.now()).toISOString()}`,
  ].join("\n");
}

export function supportMailto(report: string): string {
  const subject = encodeURIComponent(`NIDUS ${APP_VERSION} support`);
  const body = encodeURIComponent(`What happened:\n\n\nWhat you expected:\n\n\n---\n${report}`);
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
}

export function supportIssueUrl(report: string): string {
  const title = encodeURIComponent("Bug: ");
  const body = encodeURIComponent(`What happened:\n\nWhat you expected:\n\n---\n\`\`\`\n${report}\n\`\`\``);
  return `${SUPPORT_ISSUES}?title=${title}&body=${body}`;
}
