import type { GameState } from "./types";
import type { ChimeKind } from "./audio";

const WATCH = [
  "ore", "parts", "spark", "credits", "echo", "printed", "hiveRank", "moltLayer", "surgeUntil", "slagAt",
  "queuedRoom", "rankingRoom", "activeTech", "berthExtra", "callPaid", "waking", "pendingGift",
  "swarm", "hullMark", "zoneRank", "salvage", "raid", "minds",
] as const;

export function fingerprint(s: GameState): string {
  const o = s as unknown as Record<string, unknown>;
  return JSON.stringify(WATCH.map((k) => o[k] ?? null));
}

export type ActEvent = { kind: ChimeKind | "deny"; ok: boolean };

// Runs a store action and reports whether it actually changed the hive.
export function act(get: () => GameState, run: () => void, kind: ChimeKind, sound: (k: ChimeKind | "deny") => void): boolean {
  const before = fingerprint(get());
  run();
  const ok = fingerprint(get()) !== before;
  sound(ok ? kind : "deny");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<ActEvent>("nidus:act", { detail: { kind: ok ? kind : "deny", ok } }));
  }
  return ok;
}
