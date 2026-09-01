import assert from "node:assert/strict";
import { test } from "node:test";
import { importSave } from "./save.ts";
import { cookUnlocked, hiveTitle, roomUnlocked, techUnlocked } from "./progress.ts";
import { berthCap, chargeCap, defaultState, totalSwarm } from "./content.ts";
import { applyTick, claimGift, sendRaid, startSurge, tryPrint } from "./sim.ts";

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
  assert.ok(s.rooms.hangar);
  assert.equal(s.rooms.hangar.built, false);
  assert.ok("cloister" in s.rooms);
  assert.ok(s.casteXp);
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
