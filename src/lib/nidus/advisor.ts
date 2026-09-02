import type { Caste, GameState, RaidId, RoomId } from "./types";
import { RAIDS, ROOMS, TECH, berthCap, printCost, raidNeed, raidUnlocked, totalSwarm } from "./content";
import { roomUnlocked, techUnlocked } from "./progress";

export type Advice = { chip: string; why: string; verb: string };

export function advise(s: GameState): Advice {
  if (s.waking) return { chip: "PICK A MIND", why: "Three bodies. One stays. She waits for a SEAT.", verb: "WAKE" };
  if (s.pendingGift) return { chip: "CLAIM THE CUT", why: "Idle haul waiting.", verb: "CLAIM" };
  if (s.minds.some((m) => m.alive) && !s.minds.some((m) => m.alive && m.seated))
    return { chip: "SEAT YOUR COMMANDER", why: "Pacing is half. SEAT for the full post.", verb: "SEAT" };
  if (s.mercySurge && Date.now() >= s.surgeUntil && s.charge >= 8)
    return { chip: "MERCY SURGE", why: "Comeback scream. Lasts longer.", verb: "SURGE" };
  if (s.charge < 8) return { chip: "RAISE THE SOLAR SPINE", why: "Charge is starving the swarm.", verb: "BUILD" };
  if (!s.rooms.solar.built) return { chip: "RAISE THE SOLAR SPINE", why: "No spine, no blood. SPARK banks until it lights.", verb: "BUILD" };
  if (s.raid) {
    if (!s.raid.watching) return { chip: "WATCH OR BOOST", why: "Fleet is in the well. You can leave; it still fights.", verb: "RAID" };
    return { chip: "COMMAND THE WELL", why: "BOOST spends charge. Leave and it auto-resolves.", verb: "BOOST" };
  }
  if (s.swarm.striker >= 2 && !s.raidCleared.includes("ice"))
    return { chip: "RAID THE ICE RING", why: "First wreck. Easy meat.", verb: "RAID" };
  if (totalSwarm(s) >= berthCap(s) - 1)
    return { chip: "OPEN BERTHS", why: "Swarm is packed. Expand pop or raise barracks.", verb: "EXPAND" };
  if (totalSwarm(s) < berthCap(s) - 1 && s.ore > printCost(s).ore * 2)
    return { chip: `PRINT ${s.printCaste.toUpperCase()}`, why: "Berths empty. Stamp them.", verb: "PRINT" };
  if (!s.rooms.lab.built) return { chip: "RAISE THE LAB", why: "Rites lock behind glass.", verb: "BUILD" };
  if (s.rooms.lab.built && !s.activeTech && !s.tech.cheapprint.done)
    return { chip: "START CHEAP PRINT", why: "First rite. Cheaper stamps.", verb: "RITE" };
  if (!s.autoPrint) return { chip: "FLIP AUTO PRINT", why: "The hive should stamp while you sleep.", verb: "AUTO" };
  if (!s.rooms.hangar.built) return { chip: "RAISE THE HANGAR", why: "Fleet needs a mouth.", verb: "BUILD" };
  const nextRoom = ROOMS.find((r) => r.id !== "foundry" && !s.rooms[r.id].built && roomUnlocked(s, r.id).ok);
  if (nextRoom && s.parts >= nextRoom.parts * 0.35) return { chip: `RAISE ${nextRoom.label}`, why: "Next node on the nave.", verb: "BUILD" };
  const openRaid = RAIDS.find((r) => raidUnlocked(s, r.id) && !s.raidCleared.includes(r.id) && s.swarm.striker >= raidNeed(s, r.id));
  if (openRaid) return { chip: `RAID ${openRaid.label}`, why: "Strikers are ready.", verb: "RAID" };
  return { chip: "GROW THE SWARM", why: "Idle is the engine. Leave if you want.", verb: "IDLE" };
}

export function pickPrintCaste(s: GameState): Caste {
  if (s.charge < 12 || !s.rooms.solar.built) return "miner";
  if (s.parts < 8 && s.ore > 20) return "fab";
  if (s.queuedRoom && s.swarm.builder < 4) return "builder";
  const next = RAIDS.find((r) => raidUnlocked(s, r.id) && !s.raidCleared.includes(r.id));
  if (next && s.swarm.striker < next.need) return "striker";
  if (s.minds.filter((m) => m.alive).length < 2 && s.rooms.lab.built) return "lab";
  if (s.ore < 15) return "miner";
  return s.printCaste;
}

export function nextBuild(s: GameState): RoomId | null {
  const row = ROOMS.find((r) => r.id !== "foundry" && !s.rooms[r.id]?.built && roomUnlocked(s, r.id).ok);
  return row?.id ?? null;
}

export function nextRite(s: GameState) {
  return TECH.find((t) => !s.tech[t.id]?.done && techUnlocked(s, t.id).ok)?.id ?? null;
}

export function nextRaid(s: GameState): RaidId | null {
  const row = RAIDS.find((r) => raidUnlocked(s, r.id) && s.swarm.striker >= raidNeed(s, r.id));
  return row?.id ?? null;
}
