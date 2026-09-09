import type { BriefCard, Caste, GameState, Order, RaidId, RoomId, SalvageId, ZoneId } from "./types";
import {
  RAIDS,
  ROOMS,
  TECH,
  berthCap,
  candidateToMind,
  chargeCap,
  expandCost,
  offlineCapSec,
  oreCap,
  partsCap,
  printCost,
  raidNeed,
  raidUnlocked,
  rates,
  rollCandidates,
  rollOrders,
  sellYield,
  throneCap,
  totalSwarm,
  zoneCost,
} from "./content";
import { nextBuild, nextRaid, nextRite, pickPrintCaste } from "./advisor";
import { casteXpNeed, computeHiveRank, cookUnlocked, moltCost, RANK_MAX, roomUnlocked, SALVAGE_COOK, techUnlocked, autoHoldBerths, canWakeMinds, callNeed, OFFICER_CAP } from "./progress";
import { freshRaidBars, markUp, raidCutPayout, tickBattle } from "./fleet";
import { rand } from "./rng";

function cloneState<T>(s: T): T {
  return JSON.parse(JSON.stringify(s, (_k, v) => (typeof v === "function" ? undefined : v))) as T;
}

/** Fill rooms/tech/CUT fields so a live hive never throws after a content expand. */
export function ensureHive(s: GameState): GameState {
  if (!s.rooms || typeof s.rooms !== "object") s.rooms = {} as GameState["rooms"];
  for (const spec of ROOMS) {
    const room = s.rooms[spec.id];
    if (!room || typeof room !== "object") {
      s.rooms[spec.id] = {
        built: spec.id === "foundry",
        progress: spec.id === "foundry" ? spec.work : 0,
        rank: spec.id === "foundry" ? 1 : 0,
        rankWork: 0,
      };
    } else {
      if (typeof room.built !== "boolean") room.built = Boolean(room.built);
      if (typeof room.progress !== "number" || Number.isNaN(room.progress)) room.progress = 0;
      if (typeof room.rank !== "number" || Number.isNaN(room.rank)) room.rank = room.built ? 1 : 0;
      if (typeof room.rankWork !== "number" || Number.isNaN(room.rankWork)) room.rankWork = 0;
      room.rank = Math.max(0, Math.min(RANK_MAX, room.rank));
    }
  }
  if (!s.tech || typeof s.tech !== "object") s.tech = {} as GameState["tech"];
  for (const spec of TECH) {
    const t = s.tech[spec.id];
    if (!t || typeof t !== "object") s.tech[spec.id] = { done: false, progress: 0 };
    else {
      if (typeof t.done !== "boolean") t.done = Boolean(t.done);
      if (typeof t.progress !== "number" || Number.isNaN(t.progress)) t.progress = 0;
    }
  }
  if (typeof s.credits !== "number" || Number.isNaN(s.credits)) s.credits = 0;
  if (typeof s.autoSell !== "boolean") s.autoSell = true;
  if (!s.zoneRank) s.zoneRank = { spine: 0, hold: 0, nave: 0, fleet: 0, crypt: 0 };
  else {
    for (const id of ["spine", "hold", "nave", "fleet", "crypt"] as const) {
      if (typeof s.zoneRank[id] !== "number" || Number.isNaN(s.zoneRank[id])) s.zoneRank[id] = 0;
      s.zoneRank[id] = Math.max(0, Math.min(RANK_MAX, s.zoneRank[id]));
    }
  }
  if (s.queuedRoom && !s.rooms[s.queuedRoom]) s.queuedRoom = null;
  if (s.rankingRoom && !s.rooms[s.rankingRoom]) s.rankingRoom = null;
  if (s.activeTech && !s.tech[s.activeTech]) s.activeTech = null;
  if (s.tab !== "hull" && s.tab !== "forge" && s.tab !== "lab" && s.tab !== "raid" && s.tab !== "minds") s.tab = "hull";
  if (!s.casteLevel) s.casteLevel = { miner: 0, fab: 0, builder: 0, lab: 0, striker: 0 };
  if (!s.hullMark) s.hullMark = { miner: 0, fab: 0, builder: 0, lab: 0, striker: 0 };
  if (typeof s.callPaid !== "number" || Number.isNaN(s.callPaid)) s.callPaid = 0;
  return s;
}

function pushBrief(s: GameState, card: Omit<BriefCard, "id">) {
  s.briefing = [{ id: `b-${s.rng}-${s.briefing.length}`, ...card }, ...s.briefing].slice(0, 8);
}

function pushLog(s: GameState, line: string) {
  s.log = [{ t: Date.now(), line }, ...(s.log ?? [])].slice(0, 24);
}

function credit(s: GameState, kind: Order["kind"], target = "any", n = 1) {
  if (!s.orders) s.orders = [];
  for (const o of s.orders) {
    if (o.have >= o.need) continue;
    if (o.kind !== kind) continue;
    if (o.target !== "any" && o.target !== target) continue;
    o.have += n;
    if (o.have >= o.need) {
      s.ore += o.reward.ore;
      s.parts += o.reward.parts;
      s.spark += o.reward.spark;
      s.echo += o.reward.echo ?? 0;
      pushBrief(s, { kind: "order", headline: o.label, line: "Cut paid.", stamp: "DONE" });
      pushLog(s, `${o.label} paid.`);
    }
  }
  s.orders = s.orders.filter((o) => o.have < o.need);
  const rolled = rollOrders(s);
  s.orders = rolled.orders;
  s.rng = rolled.rng;
}

function grantCasteXp(s: GameState, caste: Caste, n = 1) {
  if (!s.casteXp) s.casteXp = { miner: 0, fab: 0, builder: 0, lab: 0, striker: 0 };
  if (!s.casteLevel) s.casteLevel = { miner: 0, fab: 0, builder: 0, lab: 0, striker: 0 };
  if (typeof s.casteLevel[caste] !== "number") s.casteLevel[caste] = 0;
  s.casteXp[caste] = (s.casteXp[caste] ?? 0) + n;
  let guard = 0;
  while (guard++ < 8 && s.casteXp[caste] >= casteXpNeed(s.casteLevel[caste])) {
    s.casteXp[caste] -= casteXpNeed(s.casteLevel[caste]);
    s.casteLevel[caste] += 1;
    pushBrief(s, { kind: "build", headline: caste.toUpperCase(), line: `Caste marked L${s.casteLevel[caste]}.`, stamp: `L${s.casteLevel[caste]}` });
    pushLog(s, `${caste} L${s.casteLevel[caste]}.`);
  }
}

function noteFocus(s: GameState, caste: Caste) {
  if (!s.printFocus) s.printFocus = { caste, n: 0 };
  if (s.printFocus.caste === caste) s.printFocus.n += 1;
  else s.printFocus = { caste, n: 1 };
  const extra = s.printFocus.n >= 8 ? 2 : s.printFocus.n >= 3 ? 1 : 0;
  grantCasteXp(s, caste, 1 + extra);
}

function clampRes(s: GameState) {
  s.ore = Math.max(0, Math.min(s.ore, oreCap(s)));
  s.parts = Math.max(0, Math.min(s.parts, partsCap(s)));
  s.charge = Math.max(0, Math.min(s.charge, chargeCap(s)));
  s.credits = Math.max(0, s.credits ?? 0);
}

/** Sim pipeline (architecture): res → rooms → rites → spark → print → scripts → battle → clamp. View never writes this. */
export function applyTick(s: GameState, now: number): GameState {
  const next: GameState = ensureHive(cloneState(s));
  const raw = (now - next.lastTick) / 1000;
  const dt = Math.min(Math.max(0, raw), offlineCapSec(next));
  if (dt <= 0) {
    next.lastTick = now;
    return next;
  }
  const away = dt > 30;
  const r = rates(next, now);
  const oreGain = r.orePerSec * dt;
  const partsGain = r.partsPerSec * dt;
  const oreSpentOnParts = partsGain * 2;
  next.ore += oreGain - oreSpentOnParts;
  next.parts += partsGain;
  next.credits = (next.credits ?? 0) + (r.creditsPerSec ?? 0) * dt;
  next.charge += (r.chargeGen - r.chargeDrain) * dt;
  next.hiveAge += dt;
  if (next.surgeUntil > 0 && now >= next.surgeUntil) next.surgeUntil = 0;
  if (away) {
    const generous = next.hiveAge < 8 * 3600 ? 0.7 : 0.62;
    let oreCut = Math.max(2, Math.floor(oreGain * generous));
    let partsCut = Math.max(1, Math.floor(partsGain * generous));
    let sparkCut = Math.max(2, Math.floor(r.sparkPerSec * dt * 0.68));
    if (dt > 1800) {
      if (now - (next.lastReturnAt || 0) < 86_400_000) next.returnStreak = (next.returnStreak || 0) + 1;
      else next.returnStreak = 1;
      next.lastReturnAt = now;
      const streak = Math.min(5, Math.max(0, (next.returnStreak || 1) - 1));
      const mul = 1 + streak * 0.08;
      oreCut = Math.floor(oreCut * mul);
      partsCut = Math.floor(partsCut * mul);
      sparkCut = Math.floor(sparkCut * mul);
    }
    next.pendingGift = {
      ore: oreCut,
      parts: partsCut,
      spark: sparkCut,
      credits: Math.max(1, Math.floor(oreCut * 0.2 + partsCut * 0.35)),
      seconds: Math.floor(dt),
    };
    next.mercySurge = true;
  }

  if (next.queuedRoom) {
    const spec = ROOMS.find((x) => x.id === next.queuedRoom);
    if (!spec || spec.work <= 0) {
      next.queuedRoom = nextBuild(next);
    } else {
      let room = next.rooms[next.queuedRoom];
      if (!room) {
        room = { built: false, progress: 0, rank: 0, rankWork: 0 };
        next.rooms[next.queuedRoom] = room;
      }
      const needParts = Math.max(0, spec.parts - room.progress * (spec.parts / spec.work));
      const partDrain = Math.min(next.parts, (spec.parts / spec.work) * r.buildPerSec * dt);
      if (needParts <= 0.2 || next.parts > 0) {
        room.progress += r.buildPerSec * dt;
        next.parts -= partDrain * 0.35;
        if (room.progress >= spec.work) {
          room.progress = spec.work;
          room.built = true;
          pushBrief(next, {
            kind: "build",
            headline: spec.label,
            line: "Node snapped to the nave.",
            stamp: "RAISED",
          });
          next.queuedRoom = nextBuild(next);
          credit(next, "build", spec.id);
          pushLog(next, `${spec.label} lit.`);
        }
      }
    }
  }

  if (next.rankingRoom) {
    const spec = ROOMS.find((x) => x.id === next.rankingRoom);
    const room = next.rankingRoom ? next.rooms[next.rankingRoom] : null;
    if (spec && room && room.built && (room.rank ?? 0) < RANK_MAX) {
      const workNeed = Math.max(12, Math.ceil(spec.work * 0.42 * ((room.rank ?? 0) + 1)));
      const credNeed = Math.max(0.4, 1.6 * ((room.rank ?? 0) + 1) * dt);
      room.rankWork = room.rankWork ?? 0;
      if ((next.credits ?? 0) >= credNeed) {
        room.rankWork += r.buildPerSec * dt;
        next.credits = Math.max(0, (next.credits ?? 0) - credNeed);
      }
      if (room.rankWork >= workNeed) {
        room.rank = (room.rank ?? 0) + 1;
        room.rankWork = 0;
        next.ore += 4 + room.rank * 2;
        next.parts += 2 + room.rank;
        pushBrief(next, { kind: "build", headline: spec.label, line: `Rank ${room.rank} inlaid.`, stamp: `R${room.rank}` });
        pushLog(next, `${spec.label} rank ${room.rank}.`);
        next.rankingRoom = null;
      }
    } else {
      next.rankingRoom = null;
    }
  }

  if (next.activeTech) {
    const spec = TECH.find((t) => t.id === next.activeTech);
    if (spec && next.tech[spec.id] && !next.tech[spec.id].done) {
      next.tech[spec.id].progress += r.labPerSec * dt;
      if (next.tech[spec.id].progress >= spec.work) {
        next.tech[spec.id].progress = spec.work;
        next.tech[spec.id].done = true;
        if (spec.id === "teeth") next.casteLevel.miner += 1;
        if (spec.id === "heat") next.casteLevel.fab += 1;
        if (spec.id === "hands") next.casteLevel.builder += 1;
        if (spec.id === "wick") next.casteLevel.lab += 1;
        if (spec.id === "claws") next.casteLevel.striker += 1;
        if (spec.id === "orevein") next.casteLevel.miner += 1;
        if (spec.id === "partmill") next.casteLevel.fab += 1;
        if (spec.id === "ribcage") next.casteLevel.builder += 1;
        if (spec.id === "glassmind") next.casteLevel.lab += 1;
        if (spec.id === "stingplus") next.casteLevel.striker += 1;
        pushBrief(next, { kind: "build", headline: spec.label, line: "Inlaid in gold.", stamp: "KNOWN" });
        next.activeTech = TECH.find((t) => !next.tech[t.id].done && techUnlocked(next, t.id).ok)?.id ?? null;
      }
    }
  }

  if (!next.waking) {
    next.spark += r.sparkPerSec * dt;
  }

  if (next.autoPrint) {
    if (next.scripts) next.printCaste = pickPrintCaste(next);
    const hold = autoHoldBerths(next);
    let guard = 0;
    while (guard++ < 40 && totalSwarm(next) < berthCap(next) - hold) {
      const cost = printCost(next);
      if (next.ore < cost.ore || next.parts < cost.parts) break;
      next.ore -= cost.ore;
      next.parts -= cost.parts;
      next.swarm[next.printCaste] += 1;
      next.printed += 1;
      noteFocus(next, next.printCaste);
      if (next.tech.printfocus?.done && totalSwarm(next) < berthCap(next) - hold) {
        next.swarm[next.printCaste] += 1;
        noteFocus(next, next.printCaste);
      }
      if (next.tech.stamp2?.done && totalSwarm(next) < berthCap(next) - hold) {
        next.swarm[next.printCaste] += 1;
        noteFocus(next, next.printCaste);
      }
      credit(next, "print", next.printCaste);
    }
  }

  if ((next.scripts || next.autoBuild) && !next.queuedRoom) {
    const id = nextBuild(next);
    if (id) next.queuedRoom = id;
  }
  if ((next.scripts || next.autoRite) && next.rooms.lab.built && !next.activeTech) {
    const id = nextRite(next);
    if (id) next.activeTech = id;
  }

  if (next.raid) {
    tickBattle(next, dt, now);
    if (next.raid.hp <= 0 || next.raid.hull <= 0 || now >= next.raid.endsAt) {
      resolveRaid(next, now);
    }
  } else if (next.scripts || next.autoRaid) {
    const id = nextRaid(next);
    if (id) {
      const launched = sendRaid(next, id, now);
      next.raid = launched.raid;
      next.rng = launched.rng;
      next.swarm = launched.swarm;
    }
  }

  if (next.ore < 2 && next.parts > 6) {
    const n = Math.min(next.parts - 4, dt * 0.55);
    next.parts -= n;
    next.ore += n * 0.58;
    next.credits = (next.credits ?? 0) + n * 0.18;
  }
  if (next.autoSell !== false) {
    const oc = oreCap(next);
    const pc = partsCap(next);
    if (next.ore > oc * 0.9) {
      const dump = next.ore - oc * 0.78;
      next.ore -= dump;
      next.credits = (next.credits ?? 0) + sellYield("ore", dump, next);
    }
    if (next.parts > pc * 0.9) {
      const dump = next.parts - pc * 0.78;
      next.parts -= dump;
      next.credits = (next.credits ?? 0) + sellYield("parts", dump, next);
    }
  }

  clampRes(next);
  if (away && next.briefing.length) next.showBrief = true;
  next.lastTick = now;
  next.hiveRank = computeHiveRank(next);

  if (!next.orders) next.orders = [];
  if (next.orders.length < 3) {
    const rolled = rollOrders(next);
    next.orders = rolled.orders;
    next.rng = rolled.rng;
  }

  if (!next.eventUntil) next.eventUntil = now + 70000;
  if (now >= next.eventUntil) {
    const gap = next.tech.pulsar?.done ? 52000 : 85000;
    const roll = rand(next.rng);
    next.rng = roll.seed;
    const kinds = ["PULSAR", "GROAN", "TIDE", "WHISPER", "FURNACE", "ROSE", "ECLIPSE"] as const;
    const kind = kinds[Math.floor(roll.n * kinds.length)] ?? "PULSAR";
    next.eventKind = kind;
    next.eventUntil = now + gap;
    if (kind === "PULSAR") {
      next.charge += 16 + (next.rooms.solar.rank ?? 0) * 5;
      pushLog(next, "Pulsar cone drinks the spine.");
    } else if (kind === "GROAN") {
      next.parts += 10 + next.swarm.builder;
      pushLog(next, "Hull groans. Spare parts shake loose.");
    } else if (kind === "TIDE") {
      next.surgeUntil = Math.max(next.surgeUntil, now + 16000);
      pushLog(next, "Blood tide. Short surge.");
    } else if (kind === "FURNACE") {
      next.ore += 12 + Math.floor(next.swarm.miner * 0.2);
      pushLog(next, "The prow coughs slag.");
    } else if (kind === "ROSE") {
      next.spark += 8;
      if (next.salvage) next.salvage.rose = (next.salvage.rose ?? 0) + (next.tech.salvage2?.done ? 1 : 0);
      pushLog(next, "A rose opens in the cloister.");
    } else if (kind === "ECLIPSE") {
      next.echo += 1;
      next.charge = Math.max(8, next.charge - 6);
      pushLog(next, "The pulsar hides. Echo beads.");
    } else {
      next.spark += 6;
      pushLog(next, "A whisper in the nerve.");
    }
    pushBrief(next, { kind: "event", headline: kind, line: next.log[0]?.line ?? "The nave speaks.", stamp: "EVENT" });
    if (away) next.showBrief = true;
  }

  return next;
}

function resolveRaid(s: GameState, now: number) {
  const run = s.raid;
  if (!run) return;
  const node = RAIDS.find((r) => r.id === run.node);
  if (!node) {
    s.raid = null;
    return;
  }
  const hpFrac = run.hpMax > 0 ? run.hp / run.hpMax : 1;
  const hullFrac = run.hullMax > 0 ? run.hull / run.hullMax : 1;
  const power =
    run.strikers * (s.tech.claws.done ? 1.4 : 1) * (1 + s.moltLayer * 0.2) +
    (s.rooms.gundeck.built ? 4 : 0) +
    (s.rooms.railgun?.built ? 3 : 0) +
    (s.rooms.cannon?.built ? 2 : 0);
  const need = node.need;
  const ratio = power / Math.max(1, need);
  const roll = rand(s.rng);
  s.rng = roll.seed;
  const win = run.hp <= 0 || (run.hull > 0 && (hpFrac < hullFrac || ratio + roll.n * 0.35 > 0.85));
  const lossFrac = win
    ? (s.tech.raidkeep?.done ? 0.02 : s.tech.raidreturn?.done ? 0.04 : 0.08) + roll.n * 0.08
    : 0.28 + roll.n * 0.22;
  const dead = Math.max(0, Math.floor(run.strikers * lossFrac));
  const mind = s.minds.find((m) => m.id === run.mindId);
  if (win) {
    s.ore += 40 + need * 18;
    s.parts += 16 + need * 8;
    s.echo += node.id === "sister" || node.id === "gate" || node.salvage === "core" ? 3 : 1;
    if (s.rooms.crypt?.built) s.echo += 1;
    if (s.tech.echogold?.done) s.echo += 1;
    const extra = (s.tech.salvage?.done ? 2 : 1) + (s.tech.salvage2?.done ? 1 : 0);
    if (!s.salvage) s.salvage = { ice: 0, plate: 0, rose: 0, bone: 0, core: 0 };
    s.salvage[node.salvage] = (s.salvage[node.salvage] ?? 0) + extra;
    const cut = raidCutPayout(s, node.id);
    s.credits = (s.credits ?? 0) + cut;
    if (!s.raidCount) s.raidCount = {};
    s.raidCount[node.id] = (s.raidCount[node.id] ?? 0) + 1;
    if (!s.raidCleared.includes(node.id)) s.raidCleared.push(node.id);
    credit(s, "raid", node.id);
    pushLog(s, `${node.label} taken. +${cut} CUT · ${node.salvage}.`);
    pushBrief(s, {
      kind: "raid",
      headline: node.label,
      line: mind ? mind.line : "Wreck is ours.",
      portrait: mind?.portrait,
      stamp: "WON",
    });
    if (mind) {
      const xpGain = 40 * (s.tech.framexp?.done ? 1.35 : 1) * (s.tech.mindxp2?.done ? 1.25 : 1) * (s.rooms.choir?.built ? 1.2 : 1);
      mind.xp += xpGain;
      const need = 70 + mind.level * 18;
      if (mind.xp > need) {
        mind.level += 1;
        mind.xp = 0;
      }
    }
    if (roll.n > 0.82 && mind) mind.wounded = true;
  } else {
    pushBrief(s, {
      kind: "raid",
      headline: node.label,
      line: "Bloodied. We pull back.",
      portrait: mind?.portrait,
      stamp: "BLOODIED",
    });
    if (mind) {
      const death = rand(s.rng);
      s.rng = death.seed;
      if (death.n > 0.7) {
        mind.alive = false;
        mind.seated = false;
        s.echo += s.tech.echogold?.done ? 6 : s.tech.echoyield?.done ? 4 : 2;
        if (s.rooms.crypt?.built) s.echo += 1;
        pushBrief(s, {
          kind: "death",
          headline: mind.name,
          line: "Pew goes dark.",
          portrait: mind.portrait,
          stamp: "FALLEN",
        });
      } else mind.wounded = true;
    }
  }
  s.swarm.striker = Math.max(0, s.swarm.striker - dead);
  s.raid = null;
  s.showBrief = true;
  s.lastTick = now;
}

export function tryPrint(s: GameState): GameState {
  const next = cloneState(s);
  const cost = printCost(next);
  if (next.ore < cost.ore || next.parts < cost.parts) return next;
  if (totalSwarm(next) >= berthCap(next)) {
    next.ore -= cost.ore * 0.4;
    next.parts -= cost.parts * 0.4;
    next.spark += 0.55;
    noteFocus(next, next.printCaste);
    credit(next, "print", next.printCaste);
    pushLog(next, "Packed stamp. Spark, no body.");
    clampRes(next);
    return next;
  }
  next.ore -= cost.ore;
  next.parts -= cost.parts;
  next.swarm[next.printCaste] += 1;
  next.printed += 1;
  noteFocus(next, next.printCaste);
  credit(next, "print", next.printCaste);
  if (next.tech.printfocus?.done && totalSwarm(next) < berthCap(next)) {
    next.swarm[next.printCaste] += 1;
    noteFocus(next, next.printCaste);
  }
  if (next.tech.stamp2?.done && totalSwarm(next) < berthCap(next)) {
    next.swarm[next.printCaste] += 1;
    noteFocus(next, next.printCaste);
  }
  return next;
}

export function queueRoom(s: GameState, id: RoomId): GameState {
  const next = ensureHive(cloneState(s));
  const spec = ROOMS.find((r) => r.id === id);
  if (!spec) return next;
  if (!next.rooms[id]) next.rooms[id] = { built: false, progress: 0, rank: 0, rankWork: 0 };
  const room = next.rooms[id];
  if (room.built) {
    if ((room.rank ?? 0) >= RANK_MAX) return next;
    next.rankingRoom = id;
    return next;
  }
  if (!roomUnlocked(next, id).ok) return next;
  next.queuedRoom = id;
  return next;
}

export function chooseWake(s: GameState, index: number): GameState {
  const next = cloneState(s);
  if (!next.waking || !next.waking[index]) return next;
  const made = candidateToMind(next.waking[index], next.rng);
  next.rng = made.seed;
  const seatedCount = next.minds.filter((m) => m.alive && m.seated).length;
  const knowsSeat = next.minds.some((m) => m.seated);
  made.mind.seated = knowsSeat && seatedCount < throneCap(next);
  next.minds.push(made.mind);
  next.selectedMind = made.mind.id;
  next.waking = null;
  next.callPaid = 0;
  next.tab = "minds";
  credit(next, "wake", made.mind.frame);
  pushBrief(next, {
    kind: "wake",
    headline: made.mind.name,
    line: made.mind.line,
    portrait: made.mind.portrait,
    stamp: made.mind.frame.toUpperCase(),
  });
  return next;
}

export function startCall(s: GameState): GameState {
  const next = cloneState(s);
  if (next.waking) return next;
  if (next.minds.filter((m) => m.alive).length >= OFFICER_CAP) return next;
  if (!canWakeMinds(next)) return next;
  const need = callNeed(next);
  if (next.spark < need) return next;
  next.spark -= need;
  next.callPaid = need;
  const rolled = rollCandidates(next);
  next.waking = [rolled.waking[0]];
  next.rng = rolled.rng;
  next.tab = "minds";
  pushBrief(next, { kind: "wake", headline: "A BODY ANSWERS", line: "TAKE or PASS. PASS returns a third of the SPARK." });
  return next;
}

export function passCall(s: GameState): GameState {
  const next = cloneState(s);
  if (!next.waking) return next;
  next.spark += Math.floor((next.callPaid || 0) * 0.3);
  next.callPaid = 0;
  next.waking = null;
  pushLog(next, "Passed. SPARK drips back.");
  return next;
}

export function assignJob(s: GameState, mindId: string, job: GameState["minds"][0]["job"]): GameState {
  const next = cloneState(s);
  const m = next.minds.find((x) => x.id === mindId);
  if (m && m.alive) m.job = job;
  return next;
}

export function toggleSeat(s: GameState, mindId: string): GameState {
  const next = cloneState(s);
  const m = next.minds.find((x) => x.id === mindId);
  if (!m || !m.alive) return next;
  if (m.seated) m.seated = false;
  else if (next.minds.filter((x) => x.alive && x.seated).length < throneCap(next)) m.seated = true;
  return next;
}

export function unmake(s: GameState, mindId: string): GameState {
  const next = cloneState(s);
  const m = next.minds.find((x) => x.id === mindId);
  if (!m || !m.alive) return next;
  m.alive = false;
  m.seated = false;
  next.echo += m.rarity === "gold" || m.rarity === "relic" ? 4 : 2;
  pushBrief(next, {
    kind: "death",
    headline: m.name,
    line: "Melted for Echo.",
    portrait: m.portrait,
    stamp: "UNMADE",
  });
  if (next.selectedMind === mindId) next.selectedMind = next.minds.find((x) => x.alive)?.id ?? null;
  return next;
}

export function sendRaid(s: GameState, node: RaidId, now: number): GameState {
  const next = cloneState(s);
  if (next.raid) return next;
  try {
    const spec = RAIDS.find((r) => r.id === node);
    if (!spec || !raidUnlocked(next, node)) return next;
    const need = raidNeed(next, node);
    if (next.swarm.striker < need) return next;
  const captain = next.minds.find((m) => m.alive && m.job === "raid") ?? null;
  const bars = freshRaidBars(next, node, need);
  const firstIce = node === "ice" && !next.raidCleared.includes("ice");
  const wait = spec.seconds * (firstIce ? 0.78 : 1);
  next.raid = {
    node,
    startedAt: now,
    endsAt: now + wait * 1000,
    strikers: need,
    mindId: captain?.id ?? null,
    ...bars,
    watching: false,
    boostUntil: 0,
    beat: "ORBIT",
  };
    return next;
  } catch {
    return s;
  }
}

export function watchRaid(s: GameState, on: boolean): GameState {
  const next = cloneState(s);
  if (next.raid) next.raid.watching = on;
  if (on) next.tab = "raid";
  return next;
}

export function boostRaid(s: GameState, now: number): GameState {
  const next = cloneState(s);
  if (!next.raid) return next;
  if (now < next.raid.boostUntil) return next;
  if (next.charge < 8) return next;
  next.charge -= 8;
  next.raid.boostUntil = now + 20000;
  next.raid.beat = "COMMAND";
  return next;
}

export function upMark(s: GameState, caste: GameState["printCaste"]): GameState {
  const next = cloneState(s);
  const before = next.hullMark[caste];
  markUp(next, caste);
  if (next.hullMark[caste] !== before) credit(next, "mark", caste);
  return next;
}

export function startSurge(s: GameState, now: number): GameState {
  const next = cloneState(s);
  if (now < next.surgeUntil) return next;
  const mercy = next.mercySurge;
  const dur = next.tech.longsurge?.done ? 58000 : next.tech.surgeplus.done ? 45000 : 32000;
  next.surgeUntil = now + Math.round(dur * (mercy ? 1.35 : 1));
  next.mercySurge = false;
  credit(next, "surge");
  return next;
}

export function molt(s: GameState): GameState {
  const next = cloneState(s);
  if (!next.rooms.reliquary.built || !next.tech.moltlock.done) return next;
  const cost = moltCost(next);
  if (next.echo < cost) return next;
  next.echo -= cost;
  next.moltLayer += 1;
  for (const m of next.minds) {
    if (m.alive) {
      m.level += 1;
      m.wounded = false;
    }
  }
  pushBrief(next, { kind: "molt", headline: "MOLT", line: "A new layer of nerve.", stamp: `LAYER ${next.moltLayer}` });
  next.showBrief = true;
  next.hiveRank = computeHiveRank(next);
  return next;
}

export function setTech(s: GameState, id: (typeof TECH)[number]["id"]): GameState {
  const next = cloneState(s);
  if (!next.rooms.lab?.built) return next;
  if (!next.tech[id]) next.tech[id] = { done: false, progress: 0 };
  if (next.tech[id].done) return next;
  try {
    if (!techUnlocked(next, id).ok) return next;
  } catch {
    return next;
  }
  next.activeTech = id;
  return next;
}

export function claimGift(s: GameState): GameState {
  const next = cloneState(s);
  if (!next.pendingGift) return next;
  next.ore += next.pendingGift.ore;
  next.parts += next.pendingGift.parts;
  next.spark += next.pendingGift.spark;
  next.credits = (next.credits ?? 0) + (next.pendingGift.credits ?? 0);
  next.charge += chargeCap(next) * 0.18;
  next.mercySurge = true;
  next.pendingGift = null;
  clampRes(next);
  return next;
}

export function tapSlag(s: GameState, now: number): GameState {
  const next = cloneState(s);
  if (now < next.slagAt) return next;
  next.slagAt = now + (next.tech.slagvein?.done ? 3800 : next.tech.slagplus?.done ? 4800 : 6000);
  next.ore += 6 + Math.floor(next.swarm.miner * 0.18) + (next.tech.slagplus?.done ? 4 : 0) + (next.tech.slagvein?.done ? 5 : 0);
  next.spark += next.tech.slagplus?.done ? 1.4 : 0.8;
  const cap = oreCap(next);
  if (next.ore > cap * 0.9) {
    const cook = Math.min(12, next.ore - cap * 0.82);
    next.ore -= cook;
    next.parts += cook * 0.45;
  }
  credit(next, "slag");
  clampRes(next);
  return next;
}

export function expandBerth(s: GameState): GameState {
  const next = ensureHive(cloneState(s));
  const cost = expandCost(next);
  if ((next.credits ?? 0) < cost.credits) return next;
  next.credits -= cost.credits;
  next.berthExtra = (next.berthExtra ?? 0) + cost.add;
  credit(next, "expand");
  pushLog(next, `Berths +${cost.add}. Cap ${berthCap(next)}.`);
  pushBrief(next, { kind: "build", headline: "BERTHS", line: `Pop cap ${berthCap(next)}.`, stamp: "OPEN" });
  return next;
}

export function sellStock(s: GameState, kind: "ore" | "parts", n: number): GameState {
  const next = cloneState(s);
  const have = kind === "ore" ? next.ore : next.parts;
  const take = Math.min(have, Math.max(0, n));
  if (take <= 0) return next;
  if (kind === "ore") next.ore -= take;
  else next.parts -= take;
  next.credits = (next.credits ?? 0) + sellYield(kind, take, next);
  pushLog(next, `Sold ${Math.floor(take)} ${kind} for CUT.`);
  return next;
}

export function raiseZone(s: GameState, id: ZoneId): GameState {
  const next = ensureHive(cloneState(s));
  if (!next.zoneRank) next.zoneRank = { spine: 0, hold: 0, nave: 0, fleet: 0, crypt: 0 };
  const n = next.zoneRank[id] ?? 0;
  if (n >= 5) return next;
  const cost = zoneCost(next, id);
  if ((next.credits ?? 0) < cost) return next;
  next.credits -= cost;
  next.zoneRank[id] = n + 1;
  pushBrief(next, { kind: "build", headline: id.toUpperCase(), line: `Zone rank ${n + 1}.`, stamp: `Z${n + 1}` });
  return next;
}

export function healMind(s: GameState, mindId: string): GameState {
  const next = cloneState(s);
  const m = next.minds.find((x) => x.id === mindId);
  if (!m || !m.alive || !m.wounded) return next;
  const cost = next.tech.flesh2?.done ? 2 : next.tech.mindheal?.done ? 4 : 8;
  if (next.charge < cost) return next;
  next.charge -= cost;
  m.wounded = false;
  pushLog(next, `${m.name} stitched.`);
  return next;
}

export function promoteMind(s: GameState, mindId: string): GameState {
  const next = cloneState(s);
  const m = next.minds.find((x) => x.id === mindId);
  if (!m || !m.alive) return next;
  if (next.echo < 3) return next;
  next.echo -= 3;
  m.level += 1;
  m.xp = 0;
  pushLog(next, `${m.name} marked L${m.level}.`);
  return next;
}

export function cookSalvage(s: GameState, id: SalvageId): GameState {
  const next = cloneState(s);
  if (!next.salvage) next.salvage = { ice: 0, plate: 0, rose: 0, bone: 0, core: 0 };
  const spec = SALVAGE_COOK[id];
  if (!spec || !cookUnlocked(next, id)) return next;
  if ((next.salvage[id] ?? 0) < spec.need) return next;
  next.salvage[id] -= spec.need;
  const rich = next.tech.salvage2?.done ? 1.35 : 1;
  if (spec.ore) next.ore += Math.round(spec.ore * rich);
  if (spec.parts) next.parts += Math.round(spec.parts * rich);
  if (spec.spark) next.spark += Math.round(spec.spark * rich);
  if (spec.echo) next.echo += spec.echo + (next.tech.echogold?.done ? 1 : 0);
  if (spec.charge) next.charge += Math.round(spec.charge * rich);
  pushLog(next, `${spec.label} ${id}.`);
  pushBrief(next, { kind: "loot", headline: spec.label, line: spec.line, stamp: id.toUpperCase() });
  clampRes(next);
  return next;
}
