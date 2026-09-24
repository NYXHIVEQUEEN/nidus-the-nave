import { create } from "zustand";
import type { Caste, Job, RaidId, RoomId, SalvageId, Tab, TechId, ZoneId } from "./types";
import { defaultState } from "./content";
import {
  applyTick,
  assignJob,
  boostRaid,
  chooseWake,
  startCall,
  passCall,
  claimGift,
  molt,
  promoteMind,
  queueRoom,
  sendRaid,
  setTech,
  startSurge,
  tapSlag,
  toggleSeat,
  tryPrint,
  unmake,
  upMark,
  watchRaid,
  expandBerth,
  healMind,
  cookSalvage,
  sellStock,
  raiseZone,
} from "./sim";
import { exportSave, importSave, loadSave, readSlot, requestPersist, stashPreImport, wipeSave, writeAutoSnap, writeSave, writeSlot } from "./save";
import type { GameState } from "./types";
import { enthrone, keepOwned, startTrial, unthrone } from "./heroes";

type Store = GameState & {
  hydrate: () => void;
  tick: (now: number) => void;
  start: () => void;
  setTab: (tab: Tab) => void;
  setPrintCaste: (c: Caste) => void;
  toggleAuto: () => void;
  print: () => void;
  queue: (id: RoomId) => void;
  pickWake: (i: number) => void;
  callOfficer: () => void;
  passOfficer: () => void;
  selectMind: (id: string) => void;
  setJob: (id: string, job: Job) => void;
  seat: (id: string) => void;
  melt: (id: string) => void;
  launchRaid: (id: RaidId) => void;
  surge: () => void;
  doMolt: () => void;
  research: (id: TechId) => void;
  dismissBrief: () => void;
  saveNow: () => void;
  download: () => void;
  importHive: (raw: string) => boolean;
  claimIdle: () => void;
  slag: () => void;
  resetHive: () => void;
  toggleScripts: () => void;
  toggleAutoBuild: () => void;
  toggleAutoRaid: () => void;
  toggleAutoRite: () => void;
  toggleKiln: () => void;
  watchWell: (on: boolean) => void;
  boostWell: () => void;
  markHull: (c: Caste) => void;
  stashSlot: (i: number) => void;
  loadSlot: (i: number) => boolean;
  renameHive: (name: string) => void;
  expandPop: () => void;
  heal: (id: string) => void;
  promote: (id: string) => void;
  cook: (id: SalvageId) => void;
  sell: (kind: "ore" | "parts", n: number) => void;
  toggleAutoSell: () => void;
  zoneUp: (id: ZoneId) => void;
  enthroneHero: (id: string, owned: ReadonlySet<string>) => void;
  unthroneHero: (id: string) => void;
  tryHero: (id: string) => void;
  keepOwnedHeroes: (owned: ReadonlySet<string>) => void;
  setBoost: (on: boolean) => void;
};

let lastWrite = 0;

function pickGame(s: Store): GameState {
  const game = { ...(s as unknown as Record<string, unknown>) };
  for (const key of Object.keys(game)) {
    if (typeof game[key] === "function") delete game[key];
  }
  return game as unknown as GameState;
}

export const useNidus = create<Store>((set, get) => ({
  ...defaultState(),
  hydrate: () => {
    requestPersist();
    try {
      const loaded = loadSave();
      const ticked = applyTick(loaded, Date.now());
      set(ticked);
    } catch {
      set(loadSave());
    }
  },
  tick: (now) => {
    try {
      const live = get();
      const tab = live.tab;
      const selectedMind = live.selectedMind;
      const next = applyTick(pickGame(live), now);
      next.tab = tab;
      next.selectedMind = selectedMind;
      if (!live.started) {
        set(next);
        return;
      }
      if (now - (next.lastSnapAt || 0) > 120_000) {
        const i = (next.snapIndex ?? 0) % 3;
        writeAutoSnap(i, next);
        next.snapIndex = i + 1;
        next.lastSnapAt = now;
      }
      set(next);
      if (now - lastWrite > 4000) {
        lastWrite = now;
        writeSave(next);
      }
    } catch {
      const s = pickGame(get());
      s.lastTick = now;
      if (s.started) writeSave(s);
    }
  },
  start: () => {
    set({ started: true, lastTick: Date.now() });
    lastWrite = Date.now();
    writeSave({ ...pickGame(get()), started: true, lastTick: Date.now() });
  },
  setTab: (tab) => set({ tab }),
  setPrintCaste: (printCaste) => set({ printCaste }),
  toggleAuto: () => {
    set({ autoPrint: !get().autoPrint });
    writeSave(pickGame(get()));
  },
  print: () => {
    set(tryPrint(get()));
    writeSave(pickGame(get()));
    lastWrite = Date.now();
  },
  queue: (id) => {
    try {
      set(queueRoom(pickGame(get()), id));
      writeSave(pickGame(get()));
      lastWrite = Date.now();
    } catch {
      writeSave(pickGame(get()));
    }
  },
  pickWake: (i) => {
    set(chooseWake(get(), i));
    writeSave(pickGame(get()));
    lastWrite = Date.now();
  },
  callOfficer: () => {
    set(startCall(pickGame(get())));
    writeSave(pickGame(get()));
    lastWrite = Date.now();
  },
  passOfficer: () => {
    set(passCall(pickGame(get())));
    writeSave(pickGame(get()));
    lastWrite = Date.now();
  },
  selectMind: (selectedMind) => set({ selectedMind }),
  setJob: (id, job) => {
    set(assignJob(get(), id, job));
    writeSave(pickGame(get()));
  },
  seat: (id) => {
    set(toggleSeat(get(), id));
    writeSave(pickGame(get()));
  },
  melt: (id) => {
    set(unmake(get(), id));
    writeSave(pickGame(get()));
    lastWrite = Date.now();
  },
  launchRaid: (id) => {
    try {
      set(sendRaid(pickGame(get()), id, Date.now()));
      writeSave(pickGame(get()));
      lastWrite = Date.now();
    } catch {
      writeSave(pickGame(get()));
    }
  },
  surge: () => {
    set(startSurge(get(), Date.now()));
    writeSave(pickGame(get()));
    lastWrite = Date.now();
  },
  doMolt: () => {
    set(molt(get()));
    writeSave(pickGame(get()));
    lastWrite = Date.now();
  },
  research: (id) => {
    try {
      set(setTech(pickGame(get()), id));
      writeSave(pickGame(get()));
      lastWrite = Date.now();
    } catch {
      writeSave(pickGame(get()));
    }
  },
  dismissBrief: () => set({ showBrief: false }),
  saveNow: () => {
    const g = { ...pickGame(get()), lastSaveAt: Date.now() };
    set({ lastSaveAt: g.lastSaveAt });
    writeSave(g);
    lastWrite = Date.now();
  },
  download: () => exportSave(pickGame(get())),
  importHive: (raw) => {
    const loaded = importSave(raw);
    if (!loaded) return false;
    if (get().started) stashPreImport(pickGame(get()));
    set({ ...loaded, started: true });
    writeSave({ ...loaded, started: true, lastSaveAt: Date.now() });
    return true;
  },
  claimIdle: () => {
    set(claimGift(get()));
    writeSave(pickGame(get()));
  },
  slag: () => {
    set(tapSlag(get(), Date.now()));
    writeSave(pickGame(get()));
  },
  resetHive: () => {
    wipeSave();
    set({ ...defaultState(), started: true });
  },
  toggleScripts: () => {
    const on = !get().scripts;
    set({ scripts: on, autoPrint: on || get().autoPrint, autoRaid: on, autoRite: on });
    writeSave(pickGame(get()));
  },
  toggleAutoBuild: () => {
    set({ autoBuild: !get().autoBuild });
    writeSave(pickGame(get()));
  },
  toggleAutoRaid: () => {
    set({ autoRaid: !get().autoRaid });
    writeSave(pickGame(get()));
  },
  toggleAutoRite: () => {
    set({ autoRite: !get().autoRite });
    writeSave(pickGame(get()));
  },
  toggleKiln: () => {
    set({ kilnOn: get().kilnOn === false });
    writeSave(pickGame(get()));
  },
  watchWell: (on) => {
    set(watchRaid(get(), on));
    writeSave(pickGame(get()));
  },
  boostWell: () => {
    set(boostRaid(get(), Date.now()));
    writeSave(pickGame(get()));
  },
  markHull: (c) => {
    try {
      set(upMark(pickGame(get()), c));
      writeSave(pickGame(get()));
    } catch {
      writeSave(pickGame(get()));
    }
  },
  stashSlot: (i) => {
    writeSlot(i, pickGame(get()));
  },
  loadSlot: (i) => {
    const loaded = readSlot(i);
    if (!loaded) return false;
    const ticked = applyTick(loaded, Date.now());
    set({ ...ticked, started: true });
    writeSave({ ...ticked, started: true, lastSaveAt: Date.now() });
    return true;
  },
  renameHive: (hiveName) => {
    set({ hiveName: hiveName.slice(0, 16) || "NAVE-1" });
    writeSave(pickGame(get()));
  },
  expandPop: () => {
    set(expandBerth(get()));
    writeSave(pickGame(get()));
    lastWrite = Date.now();
  },
  heal: (id) => {
    set(healMind(get(), id));
    writeSave(pickGame(get()));
  },
  promote: (id) => {
    set(promoteMind(get(), id));
    writeSave(pickGame(get()));
  },
  cook: (id) => {
    set(cookSalvage(get(), id));
    writeSave(pickGame(get()));
    lastWrite = Date.now();
  },
  sell: (kind, n) => {
    set(sellStock(get(), kind, n));
    writeSave(pickGame(get()));
    lastWrite = Date.now();
  },
  toggleAutoSell: () => {
    set({ autoSell: !get().autoSell });
    writeSave(pickGame(get()));
  },
  enthroneHero: (id, owned) => {
    set(enthrone(pickGame(get()), id, owned));
    writeSave(pickGame(get()));
  },
  unthroneHero: (id) => {
    set(unthrone(pickGame(get()), id));
    writeSave(pickGame(get()));
  },
  tryHero: (id) => {
    set(startTrial(pickGame(get()), id, Date.now()));
    writeSave(pickGame(get()));
  },
  setBoost: (on) => {
    if (get().boost2x === on) return;
    set({ boost2x: on });
    if (get().started) writeSave(pickGame(get()));
  },
  keepOwnedHeroes: (owned) => {
    const next = keepOwned(pickGame(get()), owned);
    if (next.sovereigns.length === get().sovereigns.length) return;
    set(next);
    writeSave(pickGame(get()));
  },
  zoneUp: (id) => {
    try {
      set(raiseZone(pickGame(get()), id));
      writeSave(pickGame(get()));
      lastWrite = Date.now();
    } catch {
      writeSave(pickGame(get()));
    }
  },
}));
