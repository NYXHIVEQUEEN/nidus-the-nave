import { CASTES, FRAMES, RAIDS, defaultState } from "./content";
import { SOVEREIGNS } from "./heroes";
import type { GameState } from "./types";

export const SAVE_KEY = "nidus.save.v3";
const KEY = SAVE_KEY;
const BAK = "nidus.save.v3.bak";
export const PRE_IMPORT_KEY = "nidus.save.v3.preimport";
const SAVE_VERSION = 3;
const IMPORT_MAX_BYTES = 2_000_000;

let sealed = false;

export function storageSealed() {
  return sealed;
}

const HIVE_MARKS = ["rooms", "ore", "minds", "hiveRank", "printed", "swarm"] as const;

export function looksLikeHive(raw: unknown): raw is GameState {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const o = raw as Record<string, unknown>;
  if (o.rooms !== undefined && (typeof o.rooms !== "object" || o.rooms === null || Array.isArray(o.rooms))) return false;
  if (o.minds !== undefined && !Array.isArray(o.minds)) return false;
  return HIVE_MARKS.filter((k) => o[k] !== undefined).length >= 2;
}

function migrate(raw: GameState): GameState {
  const base = defaultState();
  const merged = {
    ...base,
    ...raw,
    swarm: { ...base.swarm, ...raw.swarm },
    rooms: { ...base.rooms, ...raw.rooms },
    tech: { ...base.tech, ...raw.tech },
    casteLevel: { ...base.casteLevel, ...raw.casteLevel },
    hullMark: { ...base.hullMark, ...raw.hullMark },
    casteXp: { ...base.casteXp, ...(raw as GameState).casteXp },
  };
  merged.version = SAVE_VERSION;
  if (typeof merged.hiveRank !== "number") merged.hiveRank = 0;
  for (const spec of Object.keys(base.rooms) as (keyof typeof base.rooms)[]) {
    const room = merged.rooms[spec];
    if (!room || typeof room !== "object") {
      merged.rooms[spec] = { ...base.rooms[spec] };
    } else {
      if (typeof room.built !== "boolean") room.built = Boolean(room.built);
      if (typeof room.progress !== "number" || Number.isNaN(room.progress)) room.progress = 0;
      if (typeof room.rank !== "number" || Number.isNaN(room.rank)) room.rank = room.built ? 1 : 0;
      if (typeof room.rankWork !== "number" || Number.isNaN(room.rankWork)) room.rankWork = 0;
    }
  }
  for (const spec of Object.keys(base.tech) as (keyof typeof base.tech)[]) {
    const t = merged.tech[spec];
    if (!t || typeof t !== "object") merged.tech[spec] = { done: false, progress: 0 };
    else {
      if (typeof t.done !== "boolean") t.done = Boolean(t.done);
      if (typeof t.progress !== "number" || Number.isNaN(t.progress)) t.progress = 0;
    }
  }
  if (!merged.casteXp) merged.casteXp = { miner: 0, fab: 0, builder: 0, lab: 0, striker: 0 };
  if (!merged.pendingGift) merged.pendingGift = null;
  if (typeof merged.mercySurge !== "boolean") merged.mercySurge = false;
  if (typeof merged.returnStreak !== "number") merged.returnStreak = 0;
  if (typeof merged.lastReturnAt !== "number") merged.lastReturnAt = 0;
  if (!merged.printFocus || typeof merged.printFocus.n !== "number") {
    merged.printFocus = { caste: merged.printCaste || "miner", n: 0 };
  }
  if (typeof merged.credits !== "number" || Number.isNaN(merged.credits)) {
    merged.credits = Math.floor((merged.ore ?? 0) * 0.22 + (merged.parts ?? 0) * 0.55 + 12);
  }
  if (typeof merged.autoSell !== "boolean") merged.autoSell = true;
  if (!merged.zoneRank) merged.zoneRank = { spine: 0, hold: 0, nave: 0, fleet: 0, crypt: 0 };
  else {
    merged.zoneRank = { ...{ spine: 0, hold: 0, nave: 0, fleet: 0, crypt: 0 }, ...merged.zoneRank };
  }
  if (typeof merged.lastSnapAt !== "number") merged.lastSnapAt = 0;
  if (typeof merged.snapIndex !== "number") merged.snapIndex = 0;
  if (!merged.lastSaveAt) merged.lastSaveAt = 0;
  if (!merged.slagAt) merged.slagAt = 0;
  if (typeof merged.autoBuild !== "boolean") merged.autoBuild = false;
  if (typeof merged.autoRaid !== "boolean") merged.autoRaid = false;
  if (typeof merged.autoRite !== "boolean") merged.autoRite = false;
  if (typeof merged.kilnOn !== "boolean") merged.kilnOn = true;
  if (typeof merged.scripts !== "boolean") merged.scripts = false;
  if (!merged.hiveName) merged.hiveName = "NAVE-1";
  if (!merged.orders) merged.orders = [];
  if (!merged.salvage) merged.salvage = { ice: 0, plate: 0, rose: 0, bone: 0, core: 0 };
  if (!merged.raidCount) merged.raidCount = {};
  if (typeof merged.berthExtra !== "number") merged.berthExtra = 0;
  if (typeof merged.eventUntil !== "number") merged.eventUntil = 0;
  if (!merged.eventKind) merged.eventKind = "";
  if (!merged.log) merged.log = [];
  if (!merged.rankingRoom) merged.rankingRoom = null;
  if (merged.queuedRoom && !merged.rooms[merged.queuedRoom]) merged.queuedRoom = null;
  if (merged.rankingRoom && !merged.rooms[merged.rankingRoom]) merged.rankingRoom = null;
  if (merged.activeTech && !merged.tech[merged.activeTech]) merged.activeTech = null;
  if (typeof merged.callPaid !== "number" || Number.isNaN(merged.callPaid)) merged.callPaid = 0;
  merged.sovereigns = Array.isArray(merged.sovereigns) ? merged.sovereigns.filter((x) => typeof x === "string").slice(0, 3) : [];
  if (!merged.trial || typeof merged.trial.id !== "string" || typeof merged.trial.until !== "number") merged.trial = null;
  merged.trialsUsed = Array.isArray(merged.trialsUsed) ? merged.trialsUsed.filter((x) => typeof x === "string") : [];
  merged.boost2x = merged.boost2x === true;
  for (const id of Object.keys(merged.rooms) as (keyof typeof merged.rooms)[]) {
    const room = merged.rooms[id];
    if (typeof room.rank !== "number") room.rank = room.built ? 1 : 0;
    if (typeof room.rankWork !== "number") room.rankWork = 0;
  }
  if (merged.raid) {
    const r = merged.raid;
    merged.raid = {
      ...r,
      watching: r.watching ?? false,
      boostUntil: r.boostUntil ?? 0,
      beat: r.beat ?? "",
      hp: r.hp ?? 40,
      hpMax: r.hpMax ?? 40,
      hull: r.hull ?? 40,
      hullMax: r.hullMax ?? 40,
    };
  }
  return harden(merged, base);
}

// Imported and stored saves are untrusted: force every field back into its expected shape.
const MAX = 1e15;
const PORTRAIT = /^\/nidus\/(heroes\/)?[a-z0-9-]+\.(jpg|webp)$/;
const JOBS = ["mine", "forge", "build", "lab", "raid"] as const;
const RARITIES = ["iron", "bone", "gold", "relic"] as const;
const TABS = ["hull", "forge", "lab", "raid", "minds"] as const;

type Loose = Record<string, unknown>;
const isObj = (v: unknown): v is Loose => typeof v === "object" && v !== null && !Array.isArray(v);
const num = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(MAX, Math.max(0, v)) : d);
const str = (v: unknown, d: string, max: number) => (typeof v === "string" ? v.slice(0, max) : d);
const oneOf = <T extends string>(v: unknown, list: readonly T[], d: T): T => (list.includes(v as T) ? (v as T) : d);
const portrait = (v: unknown, d: string) => (typeof v === "string" && PORTRAIT.test(v) ? v : d);

function numRecord<K extends string>(v: unknown, base: Record<K, number>): Record<K, number> {
  const src = isObj(v) ? v : {};
  const out = {} as Record<K, number>;
  for (const k of Object.keys(base) as K[]) out[k] = num(src[k], base[k]);
  return out;
}

function frameOf(v: unknown): keyof typeof FRAMES | null {
  return typeof v === "string" && Object.prototype.hasOwnProperty.call(FRAMES, v) ? (v as keyof typeof FRAMES) : null;
}

function cleanCandidate(v: unknown) {
  if (!isObj(v)) return null;
  const frame = frameOf(v.frame);
  if (!frame) return null;
  const stats = numRecord(v.stats, { mine: 0, forge: 0, build: 0, raid: 0, lab: 0 });
  return {
    name: str(v.name, "MIND", 24),
    frame,
    portrait: portrait(v.portrait, FRAMES[frame].portraits[0]),
    line: str(v.line, "", 160),
    rarity: oneOf(v.rarity, RARITIES, FRAMES[frame].rarity),
    stats,
    fracture: str(v.fracture, "", 120),
  };
}

export function harden(m: GameState, base: GameState): GameState {
  const o = m as unknown as Loose;
  const b = base as unknown as Loose;
  for (const k of Object.keys(b)) {
    const bv = b[k];
    if (typeof bv === "number") o[k] = num(o[k], bv);
    else if (typeof bv === "boolean") o[k] = typeof o[k] === "boolean" ? o[k] : bv;
  }
  for (const k of Object.keys(o)) if (!(k in b)) delete o[k];
  m.hiveName = str(m.hiveName, "NAVE-1", 16) || "NAVE-1";
  m.eventKind = str(m.eventKind, "", 24);
  m.tab = oneOf(m.tab, TABS, "hull");
  const casteIds = CASTES.map((c) => c.id);
  m.printCaste = oneOf(m.printCaste, casteIds, "miner");
  m.swarm = numRecord(m.swarm, base.swarm);
  m.casteLevel = numRecord(m.casteLevel, base.casteLevel);
  m.casteXp = numRecord(m.casteXp, base.casteXp);
  m.hullMark = numRecord(m.hullMark, base.hullMark);
  m.salvage = numRecord(m.salvage, base.salvage);
  m.zoneRank = numRecord(m.zoneRank, base.zoneRank);
  const rooms = {} as GameState["rooms"];
  for (const id of Object.keys(base.rooms) as (keyof GameState["rooms"])[]) {
    const r = isObj(m.rooms?.[id]) ? (m.rooms[id] as unknown as Loose) : {};
    rooms[id] = { built: r.built === true, progress: num(r.progress, 0), rank: Math.min(99, num(r.rank, 0)), rankWork: num(r.rankWork, 0) };
  }
  m.rooms = rooms;
  const tech = {} as GameState["tech"];
  for (const id of Object.keys(base.tech) as (keyof GameState["tech"])[]) {
    const t = isObj(m.tech?.[id]) ? (m.tech[id] as unknown as Loose) : {};
    tech[id] = { done: t.done === true, progress: num(t.progress, 0) };
  }
  m.tech = tech;
  const raidIds = RAIDS.map((r) => r.id);
  m.raidCleared = Array.isArray(m.raidCleared) ? m.raidCleared.filter((id) => raidIds.includes(id)) : [];
  const count: GameState["raidCount"] = {};
  for (const id of raidIds) if (isObj(m.raidCount) && typeof m.raidCount[id] === "number") count[id] = num(m.raidCount[id], 0);
  m.raidCount = count;
  if (m.raid && (!isObj(m.raid) || !raidIds.includes(m.raid.node))) m.raid = null;
  if (m.raid) {
    const r = m.raid as unknown as Loose;
    m.raid = {
      node: m.raid.node,
      startedAt: num(r.startedAt, 0),
      endsAt: num(r.endsAt, 0),
      strikers: num(r.strikers, 0),
      mindId: typeof r.mindId === "string" ? r.mindId.slice(0, 64) : null,
      hp: num(r.hp, 40),
      hpMax: Math.max(1, num(r.hpMax, 40)),
      hull: num(r.hull, 40),
      hullMax: Math.max(1, num(r.hullMax, 40)),
      watching: r.watching === true,
      boostUntil: num(r.boostUntil, 0),
      beat: str(r.beat, "", 40),
    };
  }
  m.minds = (Array.isArray(m.minds) ? m.minds : [])
    .slice(0, 64)
    .map((v) => {
      const c = cleanCandidate(v);
      if (!c) return null;
      const x = v as unknown as Loose;
      return {
        ...c,
        id: str(x.id, `m${Math.random().toString(36).slice(2, 8)}`, 64),
        job: oneOf(x.job, JOBS, FRAMES[c.frame].job),
        seated: x.seated === true,
        xp: num(x.xp, 0),
        level: Math.min(999, num(x.level, 1)),
        wounded: x.wounded === true,
        alive: x.alive !== false,
      };
    })
    .filter((x): x is GameState["minds"][number] => x !== null);
  if (m.waking !== null) {
    const w = Array.isArray(m.waking) ? m.waking.slice(0, 3).map(cleanCandidate).filter((x): x is NonNullable<ReturnType<typeof cleanCandidate>> => x !== null) : [];
    m.waking = w.length ? w : null;
  }
  m.selectedMind = typeof m.selectedMind === "string" ? m.selectedMind.slice(0, 64) : null;
  if (m.pendingGift !== null) {
    const g: Loose = isObj(m.pendingGift) ? m.pendingGift : {};
    m.pendingGift = isObj(m.pendingGift)
      ? { ore: num(g.ore, 0), parts: num(g.parts, 0), spark: num(g.spark, 0), seconds: num(g.seconds, 0), credits: num(g.credits, 0) }
      : null;
  }
  m.printFocus = isObj(m.printFocus)
    ? { caste: oneOf(m.printFocus.caste, casteIds, m.printCaste), n: num(m.printFocus.n, 0) }
    : { caste: m.printCaste, n: 0 };
  m.orders = (Array.isArray(m.orders) ? m.orders : [])
    .filter(isObj)
    .slice(0, 10)
    .map((x) => {
      const r: Loose = isObj(x.reward) ? x.reward : {};
      return {
        ...(x as unknown as GameState["orders"][number]),
        id: str(x.id, "o", 64),
        label: str(x.label, "", 40),
        hint: str(x.hint, "", 80),
        target: str(x.target, "", 40),
        need: Math.max(1, num(x.need, 1)),
        have: num(x.have, 0),
        reward: { ore: num(r.ore, 0), parts: num(r.parts, 0), spark: num(r.spark, 0), echo: num(r.echo, 0) },
      };
    });
  m.log = (Array.isArray(m.log) ? m.log : []).filter(isObj).slice(-60).map((x) => ({ t: num(x.t, 0), line: str(x.line, "", 200) }));
  m.briefing = (Array.isArray(m.briefing) ? m.briefing : [])
    .filter(isObj)
    .slice(0, 12)
    .map((x) => ({
      ...(x as unknown as GameState["briefing"][number]),
      id: str(x.id, "b", 64),
      headline: str(x.headline, "", 80),
      line: str(x.line, "", 200),
      portrait: x.portrait === undefined ? undefined : portrait(x.portrait, "/nidus/warden.jpg"),
      stamp: x.stamp === undefined ? undefined : str(x.stamp, "", 40),
    }));
  const heroIds = SOVEREIGNS.map((h) => h.id);
  m.sovereigns = m.sovereigns.filter((id) => heroIds.includes(id));
  m.trialsUsed = m.trialsUsed.filter((id) => heroIds.includes(id)).slice(0, heroIds.length);
  if (m.trial && !heroIds.includes(m.trial.id)) m.trial = null;
  if (m.trial) m.trial = { id: m.trial.id, until: num(m.trial.until, 0) };
  return m;
}

export function loadSave(): GameState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(BAK);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as GameState;
    if (!looksLikeHive(parsed)) throw new Error("not a hive");
    return migrate(parsed);
  } catch {
    try {
      const bak = localStorage.getItem(BAK);
      if (bak) {
        const parsed = JSON.parse(bak) as unknown;
        if (looksLikeHive(parsed)) return migrate(parsed);
      }
    } catch {
      /* fall through */
    }
    return defaultState();
  }
}

export function writeSave(state: GameState) {
  if (typeof window === "undefined" || sealed) return;
  try {
    const payload = JSON.stringify({ ...state, version: SAVE_VERSION, lastSaveAt: Date.now() });
    const prev = localStorage.getItem(KEY);
    if (prev) localStorage.setItem(BAK, prev);
    localStorage.setItem(KEY, payload);
  } catch {
    /* private mode */
  }
}

export function requestPersist() {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return;
  void navigator.storage.persist();
}

export function exportSave(state: GameState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "nidus-hive.json";
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Safari and Firefox read the blob after click returns; revoking at once can cancel the file.
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function importSave(raw: string): GameState | null {
  if (typeof raw !== "string" || raw.length > IMPORT_MAX_BYTES) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!looksLikeHive(parsed)) return null;
    return migrate(parsed);
  } catch {
    return null;
  }
}

export function stashPreImport(state: GameState) {
  if (typeof window === "undefined" || sealed) return;
  try {
    localStorage.setItem(PRE_IMPORT_KEY, JSON.stringify(state));
  } catch {
    /* quota or private mode */
  }
}

export function wipeSave() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(BAK);
  localStorage.removeItem(PRE_IMPORT_KEY);
  localStorage.removeItem("nidus.save.v2");
  localStorage.removeItem("nidus.save.v2.bak");
  localStorage.removeItem("nidus.save.v1");
  for (let i = 0; i < 3; i++) {
    localStorage.removeItem(`nidus.slot.v2.${i}`);
    localStorage.removeItem(`nidus.slot.v3.${i}`);
    localStorage.removeItem(`nidus.auto.v3.${i}`);
  }
}

const SLOT = (i: number) => `nidus.slot.v3.${i}`;
const AUTO = (i: number) => `nidus.auto.v3.${i}`;

// Rolling safety copies. Never the player's STASH pews.
export function writeAutoSnap(i: number, state: GameState) {
  if (typeof window === "undefined" || sealed) return;
  try {
    localStorage.setItem(AUTO(i % 3), JSON.stringify({ ...state, lastSaveAt: Date.now() }));
  } catch {
    /* quota */
  }
}

export function writeSlot(i: number, state: GameState) {
  if (typeof window === "undefined" || sealed) return false;
  try {
    localStorage.setItem(SLOT(i), JSON.stringify({ ...state, lastSaveAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

export function readSlot(i: number): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SLOT(i));
    if (!raw) return null;
    return migrate(JSON.parse(raw) as GameState);
  } catch {
    return null;
  }
}

export function slotStamp(i: number): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SLOT(i));
    if (!raw) return null;
    const p = JSON.parse(raw) as GameState;
    return p.hiveName || "HIVE";
  } catch {
    return null;
  }
}

export function nidusKeys(store: Pick<Storage, "length" | "key">): string[] {
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const k = store.key(i);
    if (k && k.startsWith("nidus.")) keys.push(k);
  }
  return keys;
}

// Removes everything NIDUS keeps on this device: hives, backups, slots, prefs, purchases cache, offline files.
export async function eraseAllData(): Promise<void> {
  if (typeof window === "undefined") return;
  sealed = true;
  for (const store of [localStorage, sessionStorage]) {
    try {
      for (const k of nidusKeys(store)) store.removeItem(k);
    } catch {
      /* storage blocked */
    }
  }
  try {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n.startsWith("nidus-")).map((n) => caches.delete(n)));
  } catch {
    /* no cache api */
  }
}
