import { defaultState } from "./content";
import type { GameState } from "./types";

const KEY = "nidus.save.v1";
const BAK = "nidus.save.v1.bak";
const SAVE_VERSION = 1;

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
  if (!merged.lastSaveAt) merged.lastSaveAt = 0;
  if (!merged.slagAt) merged.slagAt = 0;
  if (typeof merged.autoBuild !== "boolean") merged.autoBuild = false;
  if (typeof merged.autoRaid !== "boolean") merged.autoRaid = false;
  if (typeof merged.autoRite !== "boolean") merged.autoRite = false;
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
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as GameState;
    return migrate(parsed);
  } catch {
    try {
      const bak = localStorage.getItem(BAK);
      if (bak) return migrate(JSON.parse(bak) as GameState);
    } catch {
      /* fall through */
    }
    return defaultState();
  }
}

export function writeSave(state: GameState) {
  if (typeof window === "undefined") return;
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
  try {
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed || typeof parsed !== "object") return null;
    return migrate(parsed);
  } catch {
    return null;
  }
}

export function wipeSave() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(BAK);
}

const SLOT = (i: number) => `nidus.slot.${i}`;

export function writeSlot(i: number, state: GameState) {
  if (typeof window === "undefined") return false;
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

