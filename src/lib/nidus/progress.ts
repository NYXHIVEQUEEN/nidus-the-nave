import type { Caste, GameState, Mind, RoomId, SalvageId, TechId } from "./types";
import { ROOMS, TECH, totalSwarm } from "./content";

/** Room rank ceiling. Old hives at R3 can still climb. */
export const RANK_MAX = 5;
/** Hull-mark ceiling. Old hives at 4 can still climb. */
export const MARK_MAX = 6;

export const HIVE_TITLES = [
  "HUSK",
  "SPINE",
  "SWARM",
  "WELL",
  "GLASS",
  "NERVE",
  "FLEET",
  "MOLT",
  "ROSE",
  "GATE",
  "CROWN",
  "VOID",
] as const;

export type HiveTitle = (typeof HIVE_TITLES)[number];

export function casteXpNeed(level: number): number {
  return Math.round(8 * Math.pow(1.55, Math.max(0, level)));
}

export function mindTalent(level: number): { id: string; label: string } | null {
  if (level >= 8) return { id: "crown", label: "CROWN · unique post roar" };
  if (level >= 5) return { id: "wick", label: "WICK · wounds halve" };
  if (level >= 3) return { id: "post", label: "POST · seated extra" };
  return null;
}

export function mindTalentMult(mind: Pick<Mind, "level" | "seated" | "wounded">, seated: boolean): number {
  let m = 1;
  if (mind.level >= 3 && seated) m *= 1.12;
  if (mind.level >= 8) m *= 1.18;
  return m;
}

export function woundFactor(mind: Pick<Mind, "level" | "wounded">): number {
  if (!mind.wounded) return 1;
  return mind.level >= 5 ? 0.82 : 0.6;
}

export function roomUnlocked(s: GameState, id: RoomId): { ok: boolean; why: string } {
  const spec = ROOMS.find((r) => r.id === id);
  if (!spec) return { ok: false, why: "UNKNOWN" };
  const room = s.rooms[id];
  if (room?.built) return { ok: true, why: "" };
  if (spec.requires && !s.rooms[spec.requires]?.built) return { ok: false, why: `NEED ${spec.requires.toUpperCase()}` };
  if (spec.also && !s.rooms[spec.also]?.built) return { ok: false, why: `NEED ${spec.also.toUpperCase()}` };
  if (spec.needRank) {
    const r = s.rooms[spec.needRank.id];
    if (!r?.built || (r.rank ?? 0) < spec.needRank.rank) {
      return { ok: false, why: `NEED ${spec.needRank.id.toUpperCase()} R${spec.needRank.rank}` };
    }
  }
  if (spec.needMolt && s.moltLayer < spec.needMolt) return { ok: false, why: `NEED MOLT ${spec.needMolt}` };
  if (spec.needRaid && !s.raidCleared.includes(spec.needRaid)) return { ok: false, why: `NEED ${spec.needRaid.toUpperCase()}` };
  return { ok: true, why: "" };
}

export function techUnlocked(s: GameState, id: TechId): { ok: boolean; why: string } {
  const spec = TECH.find((t) => t.id === id);
  if (!spec) return { ok: false, why: "UNKNOWN" };
  if (!s.rooms.lab?.built) return { ok: false, why: "NEED LAB" };
  if (spec.needRoom && !s.rooms[spec.needRoom]?.built) return { ok: false, why: `NEED ${spec.needRoom.toUpperCase()}` };
  if (spec.requires && !s.tech[spec.requires]?.done) return { ok: false, why: `NEED ${spec.requires.toUpperCase()}` };
  if (spec.needMolt && s.moltLayer < spec.needMolt) return { ok: false, why: `NEED MOLT ${spec.needMolt}` };
  return { ok: true, why: "" };
}

export function computeHiveRank(s: GameState): number {
  const rooms = Object.values(s.rooms).filter((r) => r && r.built).length;
  const techs = Object.values(s.tech).filter((t) => t && t.done).length;
  const raids = s.raidCleared.length;
  const caste = Object.values(s.casteLevel).reduce((a, b) => a + b, 0);
  const minds = s.minds.filter((m) => m.alive).length;
  const score = rooms * 1.1 + techs * 0.7 + raids * 1.4 + s.moltLayer * 3.2 + caste * 0.45 + minds * 0.8;
  return Math.max(0, Math.min(11, Math.floor(score / 3.2)));
}

export function hiveTitle(rank: number): HiveTitle {
  return HIVE_TITLES[Math.max(0, Math.min(HIVE_TITLES.length - 1, rank))] ?? "HUSK";
}

export type Stage = { n: number; of: number; name: string; hint: string };

/** Twelve nested beats. A pip, not a campaign tree. */
export function hiveStage(s: GameState): Stage {
  if (!s.rooms.solar?.built) return { n: 1, of: 12, name: "SPINE", hint: "Raise Solar on the hull." };
  if (totalSwarm(s) < 16) return { n: 2, of: 12, name: "SWARM", hint: "PRINT on FORGE." };
  if (!s.autoPrint) return { n: 3, of: 12, name: "IDLE", hint: "Flip AUTO so it stamps while gone." };
  if (s.minds.some((m) => m.alive) && !s.minds.some((m) => m.alive && m.seated))
    return { n: 4, of: 12, name: "SEAT", hint: "SEAT her. Pacing is half the post." };
  if (!s.rooms.lab?.built) return { n: 5, of: 12, name: "GLASS", hint: "Raise the Lab." };
  if (s.minds.filter((m) => m.alive).length === 0) return { n: 6, of: 12, name: "MIND", hint: "CALL on MINDS. SPARK buys one body." };
  if (!s.rooms.nerve?.built) return { n: 7, of: 12, name: "NERVE", hint: "Raise Nerve. Seat a commander." };
  if (!s.rooms.hangar?.built) return { n: 8, of: 12, name: "FLEET", hint: "Raise Hangar. Then the teeth." };
  if (!s.rooms.railgun?.built || !s.rooms.cannon?.built)
    return { n: 8, of: 12, name: "TEETH", hint: "Mount RAILGUN and AUTOCANNON. Then duel." };
  if (!s.raidCleared.includes("ice")) return { n: 8, of: 12, name: "WELL", hint: "DUEL the cutter. Ship vs ship." };
  if (s.moltLayer < 1) return { n: 9, of: 12, name: "MOLT", hint: "Rite MOLT LOCK, then molt." };
  if (!s.raidCleared.includes("sister") && !s.raidCleared.includes("gate"))
    return { n: 10, of: 12, name: "ROSE", hint: "Take the sister-wreck or the Gate." };
  if (s.moltLayer < 2) return { n: 11, of: 12, name: "CROWN", hint: "Molt again. The nave thickens." };
  return { n: 12, of: 12, name: hiveTitle(computeHiveRank(s)), hint: "Grow. Leave. Claim the cut." };
}

export const SALVAGE_COOK: Record<
  SalvageId,
  { need: number; ore?: number; parts?: number; spark?: number; echo?: number; charge?: number; label: string; line: string }
> = {
  ice: { need: 2, ore: 42, label: "MELT", line: "Ice becomes ore." },
  plate: { need: 2, parts: 26, label: "STAMP", line: "Plate becomes parts." },
  bone: { need: 2, spark: 5, label: "BURN", line: "Bone feeds SPARK." },
  rose: { need: 1, spark: 16, label: "DRINK", line: "Rose fills SPARK." },
  core: { need: 1, echo: 2, label: "CRACK", line: "Core becomes Echo." },
};

export function cookUnlocked(s: GameState, id: SalvageId): boolean {
  if (id === "ice") return (s.salvage?.ice ?? 0) >= 2;
  if (id === "plate") return (s.salvage?.plate ?? 0) >= 2;
  if (id === "bone") return Boolean(s.rooms.gundeck?.built) && (s.salvage?.bone ?? 0) >= 2;
  if (id === "rose") return (s.raidCleared.includes("sister") || s.tech.rosekey?.done) && (s.salvage?.rose ?? 0) >= 1;
  if (id === "core") return s.moltLayer >= 1 && (s.salvage?.core ?? 0) >= 1;
  return false;
}

export function markBonus(s: GameState, caste: Caste): number {
  return 1 + (s.hullMark[caste] ?? 0) * 0.09;
}

export function rankBonus(s: GameState, id: RoomId, per = 0.08): number {
  return 1 + (s.rooms[id]?.rank ?? 0) * per;
}

export function moltCost(s: GameState): number {
  const cheap = s.tech.moltcheap?.done ? 0.72 : 1;
  const apse = s.rooms.apse?.built ? 0.85 : 1;
  const r = s.rooms.reliquary?.rank ?? 0;
  return Math.max(4, Math.round((6 + s.moltLayer * 4) * cheap * apse * (1 - r * 0.04)));
}

export function nextOpenRoom(s: GameState): RoomId | null {
  const row = ROOMS.find((r) => r.id !== "foundry" && !s.rooms[r.id]?.built && roomUnlocked(s, r.id).ok);
  return row?.id ?? null;
}

export function nextOpenTech(s: GameState): TechId | null {
  const row = TECH.find((t) => !s.tech[t.id]?.done && techUnlocked(s, t.id).ok);
  return row?.id ?? null;
}

/** First commander waits for the spine so WAKE is a beat, not a dump. */
export const FIRST_WAKE_SPARK = 12;
export const OFFICER_CAP = 5;

export function callNeed(s: GameState): number {
  const n = s.minds.filter((m) => m.alive).length;
  if (n === 0) return FIRST_WAKE_SPARK;
  return Math.round(14 * Math.pow(1.45, n));
}

export function canWakeMinds(s: GameState): boolean {
  if (s.minds.some((m) => m.alive)) return true;
  return Boolean(s.rooms.solar?.built);
}

export function wakeNeed(s: GameState): number {
  if (s.minds.some((m) => m.alive)) return s.sparkNeed;
  return Math.max(s.sparkNeed, FIRST_WAKE_SPARK);
}

/** AUTO leaves two berths free until Barracks or EXPAND, so packed is a choice. */
export function autoHoldBerths(s: GameState): number {
  if (s.rooms.barracks?.built || (s.berthExtra ?? 0) > 0) return 0;
  return 2;
}

export function postBoostPct(mind: Pick<Mind, "job" | "seated" | "wounded" | "level" | "stats">): number {
  const seated = mind.seated ? 1 : 0.55;
  const talent = (mind.level >= 3 && mind.seated ? 1.12 : 1) * (mind.level >= 8 ? 1.18 : 1);
  const wound = mind.wounded ? (mind.level >= 5 ? 0.82 : 0.6) : 1;
  const stat =
    mind.job === "mine"
      ? mind.stats.mine
      : mind.job === "forge"
        ? mind.stats.forge
        : mind.job === "build"
          ? mind.stats.build
          : mind.job === "lab"
            ? mind.stats.lab
            : mind.stats.raid;
  return Math.max(1, Math.round(24 * seated * stat * wound * talent));
}
