import assert from "node:assert/strict";
import { test } from "node:test";
import { importSave } from "./save.ts";
import { cookUnlocked, hiveTitle, roomUnlocked, techUnlocked } from "./progress.ts";
import { defaultState } from "./content.ts";

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
