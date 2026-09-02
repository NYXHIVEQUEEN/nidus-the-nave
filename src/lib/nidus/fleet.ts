import type { Caste, GameState, RaidId } from "./types";
import { RAIDS } from "./content";
import { rand } from "./rng";

export const MARKS = ["DART", "STING", "CORVETTE", "FRIGATE", "RELIQUARY", "CROWN"] as const;

export function markName(n: number) {
  return MARKS[Math.max(0, Math.min(MARKS.length - 1, Math.floor(n)))];
}

export function markCost(n: number) {
  return { credits: 22 + n * 26 };
}

export function fleetPower(s: GameState) {
  const mark = 1 + (s.hullMark?.striker ?? 0) * (s.tech.stingplus?.done ? 0.36 : 0.28);
  const lvl = Math.pow(1.14, s.casteLevel.striker);
  const claws = s.tech.claws.done ? 1.4 : 1;
  const gun = s.rooms.gundeck.built ? 1.18 + (s.rooms.gundeck.rank ?? 0) * 0.06 : 1;
  const spire = s.rooms.spire?.built ? 1.12 : 1;
  const armory = s.rooms.armory?.built ? 1.14 + (s.rooms.armory.rank ?? 0) * 0.04 : 1;
  const sensor = s.rooms.sensor?.built && s.raid?.watching ? (s.tech.sensorwatch?.done ? 1.22 : 1.1) : 1;
  const armorRite = s.tech.armorteeth?.done ? 1.16 : 1;
  const molt = 1 + s.moltLayer * 0.22;
  let mind = 1;
  for (const m of s.minds) {
    if (!m.alive || m.job !== "raid") continue;
    const talent = (m.level >= 3 && m.seated ? 1.12 : 1) * (m.level >= 8 ? 1.18 : 1);
    const wound = m.wounded ? (m.level >= 5 ? 0.82 : 0.6) : 1;
    mind += (m.seated ? 0.3 : 0.15) * m.stats.raid * wound * talent;
  }
  const n = s.raid?.strikers ?? s.swarm.striker;
  return n * mark * lvl * claws * gun * spire * armory * sensor * armorRite * molt * mind;
}

export function nodeArmor(id: RaidId) {
  const node = RAIDS.find((r) => r.id === id);
  return (node?.need ?? 2) * 9;
}

export function freshRaidBars(s: GameState, id: RaidId, strikers: number) {
  const armor = nodeArmor(id);
  const hull = Math.max(12, strikers * (8 + (s.hullMark?.striker ?? 0) * 3));
  return { hp: armor, hpMax: armor, hull, hullMax: hull };
}

export function tickBattle(s: GameState, dt: number, now: number) {
  const run = s.raid;
  if (!run || dt <= 0) return;
  if (run.hpMax <= 0) {
    const bars = freshRaidBars(s, run.node, run.strikers);
    run.hp = bars.hp;
    run.hpMax = bars.hpMax;
    run.hull = bars.hull;
    run.hullMax = bars.hullMax;
  }
  const boosted = now < (run.boostUntil ?? 0);
  const watch = run.watching ? 1.18 : 1;
  const boost = boosted ? 1.7 : 1;
  const roll = rand(s.rng);
  s.rng = roll.seed;
  const sway = 0.82 + roll.n * 0.36;
  const firstIce = run.node === "ice" && !s.raidCleared.includes("ice");
  const atk = fleetPower(s) * 0.085 * watch * boost * sway * (firstIce ? 1.12 : 1);
  const def = nodeArmor(run.node) * (firstIce ? 0.018 : 0.034) * (boosted ? 0.88 : 1);
  run.hp = Math.max(0, run.hp - atk * dt);
  run.hull = Math.max(0, run.hull - def * dt);
  if (run.hp <= 0) run.beat = boosted ? "BREAK" : "CUT";
  else if (run.hull < run.hullMax * 0.35) run.beat = "BLEEDING";
  else if (boosted) run.beat = "COMMAND";
  else if (run.watching) run.beat = "HOLDING";
  else run.beat = "ORBIT";
}

export function markUp(s: GameState, caste: Caste): GameState {
  const n = s.hullMark[caste] ?? 0;
  if (n >= 6) return s;
  const cost = markCost(n);
  if ((s.credits ?? 0) < cost.credits) return s;
  s.credits -= cost.credits;
  s.hullMark[caste] = n + 1;
  return s;
}
