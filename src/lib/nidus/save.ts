import { defaultState } from "./content";
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
  return merged;
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
  a.click();
  URL.revokeObjectURL(url);
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
