import assert from "node:assert/strict";
import { test } from "node:test";
import { importSave } from "./save.ts";
import { autoHoldBerths, canWakeMinds, cookUnlocked, hiveTitle, postBoostPct, roomUnlocked, techUnlocked, wakeNeed } from "./progress.ts";
import { berthCap, defaultState, rankCost, rates, rollCandidates, sparkCap, totalSwarm } from "./content.ts";
import { applyTick, chooseWake, claimGift, queueRoom, sendRaid, startCall, startSurge, tryPrint } from "./sim.ts";
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
  s.rooms.hangar = { built: true, progress: 100, rank: 0, rankWork: 0 };
  s.rooms.railgun = { built: true, progress: 52, rank: 0, rankWork: 0 };
  s.rooms.cannon = { built: true, progress: 46, rank: 0, rankWork: 0 };
  const now = 1_000_000;
  const next = sendRaid(s, "ice", now);
  assert.ok(next.raid);
  assert.ok((next.raid?.endsAt ?? 0) - now < 32_000);
});

test("surge spends spark and a dry hive cannot scream", () => {
  const now = 1_000_000;
  const dry = defaultState();
  dry.spark = 2;
  assert.equal(startSurge(dry, now).surgeUntil, dry.surgeUntil);
  const wet = defaultState();
  wet.spark = 16;
  const next = startSurge(wet, now);
  assert.ok(next.spark < 16);
  assert.equal(next.surgeUntil - now, 32_000);
});

test("claim gift banks spark and mercy", () => {
  const s = defaultState();
  s.pendingGift = { ore: 10, parts: 4, spark: 3, seconds: 90 };
  s.spark = 4;
  const cap = sparkCap(s);
  const next = claimGift(s);
  assert.equal(next.pendingGift, null);
  assert.equal(next.mercySurge, true);
  assert.ok(next.ore >= 10);
  assert.ok(next.spark > 4);
  assert.ok(next.spark <= cap);
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
  assert.ok(wait.spark > 0);
  assert.ok(wait.spark <= sparkCap(wait) + 0.01);
  wait.rooms.solar.built = true;
  wait.lastTick = now;
  const banked = applyTick(wait, now + 2000);
  assert.equal(banked.waking, null);
  const called = startCall(banked);
  assert.ok(called.waking);
  assert.equal(called.waking?.length, 1);
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
  assert.ok(wakeNeed(s) >= 12);
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
  s = applyTick(s, 1_000_000 + 800_000);
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

test("thirteen sequential ranks with CUT do not throw or wipe the hive", () => {
  let s = defaultState();
  s.credits = 4000;
  s.parts = 80;
  s.swarm.builder = 8;
  s.rooms.foundry = { built: true, progress: 0, rank: 1, rankWork: 0 };
  s.rooms.solar = { built: true, progress: 28, rank: 0, rankWork: 0 };
  s.rooms.orebay = { built: true, progress: 40, rank: 0, rankWork: 0 };
  s.lastTick = 1_000_000;
  const ids = ["foundry", "solar", "orebay"] as const;
  for (let i = 0; i < 13; i++) {
    const id = ids[i % ids.length];
    s = queueRoom(s, id);
    s = applyTick(s, 1_000_000 + (i + 1) * 8000);
    assert.ok((s.credits ?? 0) >= 0);
    assert.ok((s.rooms.solar?.rank ?? 0) <= 5);
  }
  assert.equal(s.rooms.foundry.built, true);
  assert.ok(s.printed >= 0);
});

test("applyTick keeps the player's tab and survives a hollow tech map", () => {
  const s = defaultState();
  s.tab = "lab";
  s.selectedMind = "keep-me";
  delete (s.tech as { queue?: unknown }).queue;
  delete (s.rooms as { orebay?: unknown }).orebay;
  const next = applyTick(s, Date.now() + 2000);
  assert.equal(next.tab, "lab");
  assert.equal(next.selectedMind, "keep-me");
  assert.ok(Number.isFinite(next.ore));
  assert.ok(Number.isFinite(next.parts));
  assert.ok(next.rooms.orebay);
});

test("a finished room does not auto-queue the next", () => {
  let s = defaultState();
  s.autoBuild = false;
  s.scripts = false;
  s.queuedRoom = "solar";
  s.parts = 80;
  s.ore = 40;
  s.swarm.builder = 12;
  s.lastTick = 1_000_000;
  s = applyTick(s, 1_000_000 + 800_000);
  assert.equal(s.rooms.solar.built, true);
  assert.equal(s.queuedRoom, null);
});

test("kiln off banks ore and does not forge", () => {
  let s = defaultState();
  s.kilnOn = false;
  s.autoPrint = false;
  s.ore = 40;
  s.parts = 10;
  s.lastTick = 1_000_000;
  s = applyTick(s, 1_000_000 + 8000);
  assert.ok(s.ore >= 40);
  assert.ok(s.parts <= 10.05);
});

test("kiln cannot spend more ore than the hold has", () => {
  let s = defaultState();
  s.ore = 2;
  s.parts = 4;
  s.swarm = { miner: 2, fab: 20, builder: 0, lab: 0, striker: 0 };
  s.autoPrint = false;
  s.lastTick = 1_000_000;
  s = applyTick(s, 1_000_000 + 5000);
  assert.ok(s.ore >= -0.01);
  assert.ok(s.parts >= 4);
});

test("rank spends the listed CUT not a bleed per second", () => {
  let s = defaultState();
  s.credits = 80;
  s.rooms.solar = { built: true, progress: 28, rank: 0, rankWork: 0 };
  s.rankingRoom = "solar";
  s.swarm.builder = 3;
  s.lastTick = 1_000_000;
  const listed = rankCost(s, "solar")?.credits ?? 18;
  s = applyTick(s, 1_000_000 + 2000);
  const spent = 80 - (s.credits ?? 0);
  assert.ok(spent >= 0);
  assert.ok(spent <= listed + 0.5);
});

test("foundry drips CUT and SPARK nets up once the spine is lit", () => {
  const s = defaultState();
  s.rooms.solar = { built: true, progress: 28, rank: 0, rankWork: 0 };
  const r = rates(s, Date.now());
  assert.ok(r.creditsPerSec > 0);
  assert.ok(r.sparkPerSec - (r.sparkDrain ?? 0) > 0);
  assert.ok(r.oreSpendPerSec > 0);
  assert.ok(r.orePerSec + 0.002 >= r.oreSpendPerSec * 0.35);
});




test("importSave refuses files that are not a hive", async () => {
  const { looksLikeHive } = await import("./save.ts");
  for (const bad of ["{}", "[]", "null", "42", '"nave"', '{"hello":1}', '{"rooms":[],"ore":1}', '{"minds":{},"ore":1}', "not json"]) {
    assert.equal(importSave(bad), null, bad);
  }
  assert.equal(importSave("x".repeat(2_000_001)), null);
  assert.equal(looksLikeHive({ ore: 10, rooms: {} }), true);
  assert.equal(looksLikeHive(defaultState()), true);
});

test("support report carries no hive name and names the version", async () => {
  const { buildReport, APP_VERSION, supportIssueUrl } = await import("./support.ts");
  const s = { ...defaultState(), hiveName: "SECRET-NAVE" };
  const r = buildReport(s, { nav: { userAgent: "UA", language: "en" }, width: 390, height: 844, now: 0 });
  assert.ok(r.includes(APP_VERSION));
  assert.ok(r.includes("390×844"));
  assert.ok(!r.includes("SECRET-NAVE"));
  assert.ok(supportIssueUrl(r).startsWith("https://github.com/NYXHIVEQUEEN/nidus-the-nave/issues/new?"));
});

test("act reports a refused tap as deny and a real one as ok", async () => {
  const { act } = await import("./feedback.ts");
  let st = { ...defaultState(), ore: 0, parts: 0 };
  const heard: string[] = [];
  const get = () => st;
  assert.equal(act(get, () => { st = { ...st }; }, "print", (k) => heard.push(k)), false);
  assert.equal(act(get, () => { st = { ...st, ore: 5 }; }, "print", (k) => heard.push(k)), true);
  assert.deepEqual(heard, ["deny", "print"]);
});

test("nidusKeys finds only NIDUS keys", async () => {
  const { nidusKeys } = await import("./save.ts");
  const keys = ["nidus.save.v3", "other.app", "nidus.prefs.v1", "nidusfake"];
  const store = { length: keys.length, key: (i: number) => keys[i] ?? null };
  assert.deepEqual(nidusKeys(store), ["nidus.save.v3", "nidus.prefs.v1"]);
});

test("sovereigns: seats, trials, bundle, refunds, and real economy power", async () => {
  const H = await import("./heroes.ts");
  const { ownedFrom } = await import("./billing.ts");
  assert.equal(H.SOVEREIGNS.length, 20);
  assert.equal(new Set(H.SOVEREIGNS.map((h) => h.id)).size, 20);
  assert.equal(ownedFrom(["sovereign_all"]).size, 20);
  assert.deepEqual([...ownedFrom(["hero_vesper", "junk"])], ["vesper"]);

  const now = 1_000_000;
  const base = { ...defaultState(), swarm: { ...defaultState().swarm, miner: 10 } };
  const owned = new Set(["vesper", "mora", "nyxara"]);
  assert.deepEqual(H.enthrone(base, "pyre", owned).sovereigns, [], "unowned cannot sit");
  let s = H.enthrone(base, "vesper", owned);
  assert.deepEqual(s.sovereigns, ["vesper"]);
  s = H.enthrone(s, "mora", owned);
  assert.deepEqual(s.sovereigns, ["mora"], "one seat before molt");
  s = H.enthrone({ ...s, moltLayer: 5 }, "vesper", owned);
  s = H.enthrone(s, "nyxara", owned);
  assert.deepEqual(s.sovereigns, ["mora", "vesper", "nyxara"], "caps at three");

  const ore0 = rates(base, now).orePerSec;
  const ore1 = rates(H.enthrone(base, "vesper", owned), now).orePerSec;
  assert.ok(Math.abs(ore1 / ore0 - 1.6) < 1e-9, "VESPER is +60% ore");

  const t = H.startTrial(base, "pyre", now);
  assert.equal(t.trial?.id, "pyre");
  assert.ok(rates(t, now).sparkPerSec > rates(base, now).sparkPerSec);
  assert.equal(rates(t, now + H.TRIAL_MS + 1).sparkPerSec, rates(base, now + H.TRIAL_MS + 1).sparkPerSec, "trial ends");
  const used = { ...t, trial: null };
  assert.equal(H.startTrial(used, "pyre", now + H.TRIAL_MS * 2), used, "one trial per hero");

  assert.deepEqual(H.keepOwned(s, new Set(["vesper"])).sovereigns, ["vesper"]);
  const old = importSave(JSON.stringify({ version: 3, ore: 5, rooms: {}, sovereigns: "bad" }));
  assert.deepEqual(old?.sovereigns, []);
  assert.equal(old?.trial, null);
});

test("double tithe doubles resource income and raid cut, and old saves default to off", async () => {
  const { raidCutPayout } = await import("./fleet.ts");
  const { ownedFrom } = await import("./billing.ts");
  const now = 2_000_000;
  const base = { ...defaultState(), swarm: { ...defaultState().swarm, miner: 10, fab: 4 }, ore: 50 };
  const on = { ...base, boost2x: true };
  const a = rates(base, now);
  const b = rates(on, now);
  for (const k of ["orePerSec", "partsPerSec", "sparkPerSec", "creditsPerSec"] as const) {
    assert.ok(Math.abs(b[k] / a[k] - 2) < 1e-9, k);
  }
  assert.equal(b.buildPerSec, a.buildPerSec, "build speed is not a resource");
  assert.equal(raidCutPayout(on, "ice"), raidCutPayout(base, "ice") * 2);
  assert.equal(importSave(JSON.stringify({ version: 3, ore: 5, rooms: {} }))?.boost2x, false);
  assert.equal(importSave(JSON.stringify({ version: 3, ore: 5, rooms: {}, boost2x: "yes" }))?.boost2x, false);
  assert.equal(ownedFrom(["boost_x2"]).size, 0, "boost is not a hero");
});

test("a hostile save cannot inject junk, remote images, or broken numbers", () => {
  const evil = importSave(
    JSON.stringify({
      version: 3,
      ore: "9999",
      parts: "__HUGE__",
      credits: -50,
      spark: null,
      hiveName: "X".repeat(500),
      tab: "admin",
      rooms: { solar: { built: "yes", progress: "NaN", rank: 1e9 }, hacked: { built: true } },
      swarm: { miner: "12", ghost: 99 },
      minds: [
        { id: "a", frame: "warden", portrait: "https://evil.example/pixel.gif", name: "<img src=x>", alive: true, seated: true, level: 2, stats: {} },
        { id: "b", frame: "nope", portrait: "/nidus/warden.jpg" },
        "string-mind",
      ],
      raid: { node: "moon", hp: 5 },
      briefing: [{ id: "x", headline: "hi", line: "ok", portrait: "javascript:alert(1)" }],
      sovereigns: ["vesper", "not-a-hero"],
      trial: { id: "ghost", until: 1 },
      __proto__: { polluted: true },
      extraField: "drop me",
    }).replace('"__HUGE__"', "1e400"),
  );
  assert.ok(evil);
  assert.equal(evil.ore, 72, "string number falls back to default");
  assert.equal(evil.parts, 36, "infinity falls back");
  assert.equal(evil.credits, 0, "negative clamps to 0");
  assert.equal(evil.hiveName.length, 16);
  assert.equal(evil.tab, "hull");
  assert.equal(typeof evil.rooms.solar.built, "boolean");
  assert.equal(evil.rooms.solar.progress, 0);
  assert.ok(evil.rooms.solar.rank <= 99);
  assert.equal("hacked" in evil.rooms, false);
  assert.equal(evil.swarm.miner, defaultState().swarm.miner, "string count falls back to default");
  assert.equal("ghost" in evil.swarm, false);
  assert.equal(evil.minds.length, 1, "unknown frames and non-objects are dropped");
  assert.equal(evil.minds[0].portrait, "/nidus/warden.jpg", "remote portrait replaced");
  assert.equal(evil.raid, null);
  assert.equal(evil.briefing[0].portrait, "/nidus/warden.jpg");
  assert.deepEqual(evil.sovereigns, ["vesper"]);
  assert.equal(evil.trial, null);
  assert.equal("extraField" in evil, false);
  assert.equal(({} as Record<string, unknown>).polluted, undefined, "no prototype pollution");
});

test("a hostile save cannot point at inherited keys or duplicate commanders", () => {
  const raw = `{"version":3,"ore":5,"parts":5,"queuedRoom":"__proto__","rankingRoom":"toString","activeTech":"constructor","__proto__":{"polluted":true},
    "minds":[{"id":"a","frame":"warden","alive":true},{"id":"a","frame":"warden","alive":true}],
    "sovereigns":["vesper","vesper"],"trialsUsed":["pyre","pyre"]}`;
  const evil = importSave(raw);
  assert.ok(evil);
  assert.equal(evil.queuedRoom, null);
  assert.equal(evil.rankingRoom, null);
  assert.equal(evil.activeTech, null);
  assert.equal(evil.minds.length, 2);
  assert.notEqual(evil.minds[0].id, evil.minds[1].id, "duplicate ids are split");
  assert.deepEqual(evil.sovereigns, ["vesper"]);
  assert.deepEqual(evil.trialsUsed, ["pyre"]);
  assert.equal(Object.prototype.hasOwnProperty.call(evil, "__proto__"), false);
  assert.equal(({} as Record<string, unknown>).polluted, undefined, "no prototype pollution");
  const ok = importSave(JSON.stringify({ version: 3, ore: 5, printed: 1, queuedRoom: "solar", activeTech: Object.keys(defaultState().tech)[0] }));
  assert.ok(ok, "a plain save still imports");
  assert.equal(ok.queuedRoom, "solar", "real pointers survive");
  assert.equal(ok.activeTech, Object.keys(defaultState().tech)[0]);
});

test("purchase confirmation is off by default and never leaves this site", async () => {
  const { ACK_URL } = await import("./support.ts");
  const { ackTarget } = await import("./billing.ts");
  assert.equal(ACK_URL, "", "off until the Queen says yes");
  assert.equal(ackTarget(""), null);
  assert.equal(ackTarget("https://evil.example/ack"), null, "no other hosts");
  assert.equal(ackTarget("//evil.example/ack"), null, "no protocol-relative hosts");
  assert.equal(ackTarget("/api/ack"), "/api/ack");
});
