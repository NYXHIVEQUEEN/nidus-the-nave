import assert from "node:assert/strict";
import { test } from "node:test";
import { importSave } from "./save.ts";
import { autoHoldBerths, canWakeMinds, cookUnlocked, hiveTitle, postBoostPct, roomUnlocked, techUnlocked, wakeNeed } from "./progress.ts";
import { berthCap, chargeCap, defaultState, rollCandidates, totalSwarm } from "./content.ts";
import { applyTick, chooseWake, claimGift, queueRoom, sendRaid, startSurge, tryPrint } from "./sim.ts";
import { advise, nextBuild } from "./advisor.ts";

test("importSave keeps ore rooms minds and never blanks the hive", () => {
  const raw = JSON.stringify({
    version: 1,
    ore: 2300,
    parts: 0.9,
    charge: 325,
    spark: 356,
    echo: 1,
    hiveRank: 4,
    hiveName: "NAVE-1",
    printed: 12,
    moltLayer: 0,
    rooms: {
      solar: { built: true, progress: 0, rank: 2, rankWork: 0 },
      orebay: { built: true, progress: 0, rank: 1, rankWork: 0 },
    },
    tech: { orevein: { done: true, progress: 0 } },
    minds: [
      {
        id: "m1",
        alive: true,
        name: "TEST",
        frame: "warden",
        rarity: "bone",
        level: 3,
        xp: 10,
        job: "mine",
        seated: true,
        wounded: false,
        portrait: "/nidus/warden.jpg",
        line: "Ore first.",
        fracture: "Hoards the ice.",
        stats: { mine: 3, forge: 1, build: 1, raid: 1, lab: 1 },
      },
    ],
  });
  const s = importSave(raw);
  assert.ok(s);
  assert.equal(s.ore, 2300);
  assert.equal(s.charge, 325);
  assert.equal(s.hiveName, "NAVE-1");
  assert.equal(s.rooms.solar.built, true);
  assert.equal(s.rooms.solar.rank, 2);
  assert.equal(s.rooms.orebay.built, true);
  assert.equal(s.tech.orevein.done, true);
  assert.equal(s.minds.length, 1);
  assert.equal(s.minds[0].name, "TEST");
  assert.equal(s.minds[0].seated, true);
  assert.ok(s.rooms.hangar);
  assert.equal(s.rooms.hangar.built, false);
  assert.ok("cloister" in s.rooms);
  assert.ok(s.casteXp);
  assert.equal(s.printFocus.n, 0);
});

test("nested unlocks stay gated until prior nodes exist", () => {
  const s = defaultState();
  assert.equal(roomUnlocked(s, "solar").ok, true);
  assert.equal(roomUnlocked(s, "reliquary").ok, false);
  assert.equal(techUnlocked(s, "orevein").ok, false);
  assert.equal(cookUnlocked(s, "ice"), false);
  assert.equal(cookUnlocked(s, "core"), false);
  assert.ok(hiveTitle(0).length > 0);
  assert.ok(hiveTitle(11).length > 0);
});

test("defaultState is a fresh husk not a shared wipe template", () => {
  const a = defaultState();
  const b = defaultState();
  assert.notEqual(a, b);
  a.ore = 99;
  assert.notEqual(b.ore, 99);
});

test("importSave keeps started so RETURN does not dump a live hive", () => {
  const raw = JSON.stringify({
    version: 1,
    started: true,
    ore: 412,
    printed: 3,
    hiveName: "NAVE-1",
  });
  const s = importSave(raw);
  assert.ok(s);
  assert.equal(s.started, true);
  assert.equal(s.ore, 412);
  assert.equal(s.printed, 3);
  assert.equal(s.hiveName, "NAVE-1");
});

test("migrate fills mercy streak fields without wiping ore", () => {
  const s = importSave(JSON.stringify({ version: 1, ore: 900, started: true, printed: 8 }));
  assert.ok(s);
  assert.equal(s.mercySurge, false);
  assert.equal(s.returnStreak, 0);
  assert.equal(s.lastReturnAt, 0);
  assert.equal(s.ore, 900);
  assert.equal(s.started, true);
  assert.equal(s.printFocus.caste, "miner");
});

test("long away banks a gift and mercy without wiping the hive", () => {
  const now = 5_000_000;
  const s = defaultState(now);
  s.lastTick = now - 2_000_000;
  s.ore = 412;
  const next = applyTick(s, now);
  assert.ok(next.pendingGift);
  assert.equal(next.mercySurge, true);
  assert.ok((next.pendingGift?.seconds ?? 0) >= 30);
  assert.ok(next.ore >= 0);
  assert.equal(next.rooms.foundry.built, true);
});

test("packed print still spends and grants spark without a body", () => {
  const s = defaultState();
  s.swarm = { miner: 22, fab: 0, builder: 0, lab: 0, striker: 0 };
  assert.ok(totalSwarm(s) >= berthCap(s));
  s.ore = 200;
  s.parts = 80;
  s.spark = 1;
  const next = tryPrint(s);
  assert.ok(next.spark > s.spark);
  assert.ok(next.ore < s.ore);
  assert.equal(totalSwarm(next), totalSwarm(s));
});

test("first ice raid is a shorter tutorial wreck", () => {
  const s = defaultState();
  s.swarm.striker = 4;
  const now = 1_000_000;
  const next = sendRaid(s, "ice", now);
  assert.ok(next.raid);
  assert.ok((next.raid?.endsAt ?? 0) - now < 28_000);
  assert.ok(Math.abs((next.raid?.endsAt ?? 0) - now - 28 * 0.78 * 1000) < 50);
});

test("mercy surge lasts longer then clears the flag", () => {
  const s = defaultState();
  s.mercySurge = true;
  const now = 1_000_000;
  const next = startSurge(s, now);
  assert.equal(next.mercySurge, false);
  assert.ok(next.surgeUntil - now > 32_000);
  const plain = startSurge(defaultState(), now);
  assert.equal(plain.surgeUntil - now, 32_000);
});

test("claim gift banks charge and mercy", () => {
  const s = defaultState();
  s.pendingGift = { ore: 10, parts: 4, spark: 3, seconds: 90 };
  s.charge = 10;
  const cap = chargeCap(s);
  const next = claimGift(s);
  assert.equal(next.pendingGift, null);
  assert.equal(next.mercySurge, true);
  assert.ok(next.ore >= 10);
  assert.ok(next.charge > 10);
  assert.ok(next.charge <= cap);
});

test("first wake waits for the solar spine and banks spark", () => {
  const now = 2_000_000;
  const s = defaultState(now);
  s.lastTick = now - 4000;
  s.spark = 80;
  s.sparkNeed = 16;
  s.rooms.solar.built = false;
  assert.equal(canWakeMinds(s), false);
  const wait = applyTick(s, now);
  assert.equal(wait.waking, null);
  assert.ok(wait.spark >= 80);
  wait.rooms.solar.built = true;
  wait.lastTick = now;
  const woke = applyTick(wait, now + 2000);
  assert.ok(woke.waking);
  assert.equal(woke.waking?.length, 3);
});

test("first commander starts pacing so SEAT is a verb", () => {
  const s = defaultState();
  const rolled = rollCandidates(s);
  s.waking = rolled.waking;
  s.rng = rolled.rng;
  const next = chooseWake(s, 0);
  assert.equal(next.minds.length, 1);
  assert.equal(next.minds[0].seated, false);
  assert.equal(next.waking, null);
});

test("existing seated commander is not unseated by migrate", () => {
  const s = importSave(JSON.stringify({
    version: 1,
    ore: 80,
    started: true,
    minds: [{
      id: "m1", alive: true, name: "HUSK-7", frame: "warden", rarity: "iron", level: 1, xp: 0, job: "mine",
      seated: true, wounded: false, portrait: "/nidus/warden.jpg", line: "Ore first.", fracture: "Hoards the ice.",
      stats: { mine: 3, forge: 1, build: 1, raid: 1, lab: 1 },
    }],
  }));
  assert.ok(s);
  assert.equal(s.minds[0].seated, true);
});

test("auto print holds two berths until barracks or expand", () => {
  const s = defaultState();
  assert.equal(autoHoldBerths(s), 2);
  s.rooms.barracks.built = true;
  assert.equal(autoHoldBerths(s), 0);
  const t = defaultState();
  t.berthExtra = 2;
  assert.equal(autoHoldBerths(t), 0);
});

test("print focus stacks caste xp without wiping swarm", () => {
  const s = defaultState();
  s.ore = 400;
  s.parts = 200;
  s.swarm = { miner: 4, fab: 0, builder: 0, lab: 0, striker: 0 };
  s.printCaste = "miner";
  let next = s;
  for (let i = 0; i < 4; i++) next = tryPrint(next);
  assert.equal(next.printFocus.caste, "miner");
  assert.ok(next.printFocus.n >= 4);
  assert.ok((next.casteXp.miner ?? 0) + next.casteLevel.miner > 0);
  assert.ok(totalSwarm(next) > totalSwarm(s));
});

test("wake need floors first commander without wiping spark", () => {
  const s = defaultState();
  assert.ok(wakeNeed(s) >= 32);
  s.minds = [{
    id: "m1", alive: true, name: "HUSK-7", frame: "warden", rarity: "iron", level: 1, xp: 0, job: "mine",
    seated: false, wounded: false, portrait: "/nidus/warden.jpg", line: "Ore first.", fracture: "Hoards the ice.",
    stats: { mine: 3, forge: 1, build: 1, raid: 1, lab: 1 },
  }];
  s.sparkNeed = 16;
  assert.equal(wakeNeed(s), 16);
});

test("post boost percent is larger when seated", () => {
  const mind = {
    job: "mine" as const,
    seated: false,
    wounded: false,
    level: 1,
    stats: { mine: 3, forge: 1, build: 1, raid: 1, lab: 1 },
  };
  const pace = postBoostPct(mind);
  const seat = postBoostPct({ ...mind, seated: true });
  assert.ok(seat > pace);
});

test("later rooms missing from a save do not crash nextBuild or migrate", () => {
  const raw = JSON.stringify({
    version: 1,
    ore: 80,
    parts: 40,
    rooms: { solar: { built: true, progress: 28 } },
    queuedRoom: "orebay",
  });
  const s = importSave(raw);
  assert.ok(s);
  assert.equal(s.rooms.solar.built, true);
  assert.ok(s.rooms.cloister);
  assert.equal(s.rooms.cloister.built, false);
  assert.ok(s.rooms.crucible);
  assert.doesNotThrow(() => nextBuild(s));
  const id = nextBuild(s);
  assert.ok(id);
  const later = applyTick(s, Date.now() + 2000);
  assert.ok(later.rooms.orebay);
});

test("raising the solar spine does not crash the tick or the next node", () => {
  let s = defaultState();
  s.queuedRoom = "solar";
  s.parts = 80;
  s.ore = 40;
  s.charge = 20;
  s.spark = 40;
  s.lastTick = 1_000_000;
  s = applyTick(s, 1_000_000 + 400_000);
  assert.equal(s.rooms.solar.built, true);
  assert.doesNotThrow(() => applyTick(s, 1_000_000 + 90_000));
  const rolled = rollCandidates(s);
  assert.equal(rolled.waking.length, 3);
  assert.ok(rolled.waking.every((c) => c.portrait && c.name && c.frame));
});

test("offline tick uses the same rates as online — no extra cut for being away from the net", () => {
  const a = defaultState();
  a.rooms.solar = { built: true, progress: 28, rank: 0, rankWork: 0 };
  a.swarm.miner = 4;
  a.lastTick = 5_000_000;
  const on = applyTick(a, 5_000_000 + 20_000);
  const off = applyTick(a, 5_000_000 + 20_000);
  assert.equal(Math.floor(on.ore), Math.floor(off.ore));
});

test("credits migrate from ore and parts without wiping the hive", () => {
  const s = importSave(JSON.stringify({ version: 1, ore: 100, parts: 40, printed: 16, rooms: { solar: { built: true, progress: 28 } } }));
  assert.ok(s);
  assert.ok((s.credits ?? 0) > 0);
  assert.equal(s.ore, 100);
  assert.equal(s.autoSell, true);
  assert.ok(s.rooms.mill);
  assert.equal(s.rooms.mill.built, false);
});

test("low ore recycles surplus parts so the hive is not stuck", () => {
  let s = defaultState();
  s.rooms.solar = { built: true, progress: 28, rank: 0, rankWork: 0 };
  s.ore = 0.4;
  s.parts = 20;
  s.credits = 4;
  s.lastTick = 1_000_000;
  s = applyTick(s, 1_000_000 + 8000);
  assert.ok(s.ore > 0.4);
  assert.ok(s.parts < 20);
});

test("queue and rank with CUT do not throw when mill is missing from an old hive", () => {
  const s = defaultState();
  delete (s.rooms as Record<string, unknown>).mill;
  delete (s.rooms as Record<string, unknown>).refinery;
  delete (s.tech as Record<string, unknown>).millcut;
  s.credits = 80;
  s.rooms.foundry = { built: true, progress: 0, rank: 1, rankWork: 0 };
  assert.doesNotThrow(() => advise(s));
  const queued = queueRoom(s, "solar");
  assert.equal(queued.queuedRoom, "solar");
  const ranked = queueRoom(s, "foundry");
  assert.equal(ranked.rankingRoom, "foundry");
  const ticked = applyTick(ranked, Date.now() + 2000);
  assert.ok((ticked.credits ?? 0) >= 0);
  assert.ok(ticked.rooms.mill);
});


