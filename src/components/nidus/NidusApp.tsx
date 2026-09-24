import { useEffect, useState, useSyncExternalStore } from "react";
import {
  Factory,
  FlaskConical,
  Hammer,
  HelpCircle,
  Pickaxe,
  Swords,
  Zap,
  Flame,
  Brain,
} from "lucide-react";
import { cn, fmt, fmtTime } from "@/lib/utils";
import { useNidus } from "@/lib/nidus/store";
import {
  CASTES,
  FRAMES,
  JOBS,
  RAIDS,
  ROOMS,
  TECH,
  ZONES,
  berthCap,
  sparkCap,
  expandCost,
  oreCap,
  partsCap,
  nextGoal,
  printCost,
  raidNeed,
  raidUnlocked,
  rates,
  rankCost,
  throneCap,
  totalSwarm,
  zoneCost,
} from "@/lib/nidus/content";
import { advise } from "@/lib/nidus/advisor";
import { markCost, markName, raidCutPayout, weaponMods } from "@/lib/nidus/fleet";
import { chime, resumeAudio, setAmbiance, unlockAudio, type ChimeKind } from "@/lib/nidus/audio";
import { act } from "@/lib/nidus/feedback";
import { registerNidusPwa } from "@/lib/nidus/pwa";
import { SAVE_KEY } from "@/lib/nidus/save";
import { BOOT_IDLE, runBoot, type BootState } from "@/lib/nidus/boot";
import {
  chargeStarve,
  firstWhisper,
  framePost,
  gloss,
  hiveStage,
  mindPostLine,
  packed,
  POSTS,
  raidLockWhy,
  roomLockWhy,
  sparkBanked,
  type GuideId,
} from "@/lib/nidus/guide";
import { cookUnlocked, hiveTitle, MARK_MAX, moltCost, mindTalent, RANK_MAX, SALVAGE_COOK, casteXpNeed, postBoostPct, autoHoldBerths, callNeed, OFFICER_CAP, techUnlocked } from "@/lib/nidus/progress";
import { ChromeBound, StationMount } from "./StationMount";
import { SettingsPanel, type RitePane } from "./SettingsPanel";
import { SovereignHall } from "./SovereignHall";
import { initBilling, getShop } from "@/lib/nidus/billing";
import { GoalDock, GuideSheet, LeftRail, StatusChip, Whisper, muteToggle, useDensity, useIdleChrome, useSyncPrefs, useViewport } from "./HiveChrome";
import { cycleDensity, getPrefs, getSpinPaused, helpSeen, lookAtRoom, subscribeSpin } from "@/lib/nidus/view";
import type { Caste, Rarity, Tab } from "@/lib/nidus/types";

const rarityColor: Record<Rarity, string> = {
  iron: "text-muted",
  bone: "text-bone",
  gold: "text-gilt",
  relic: "text-venom",
};

function tap(run: () => void, kind: ChimeKind) {
  return act(() => useNidus.getState(), run, kind, chime);
}

function pulse(on: boolean) {
  return on ? "nidus-pulse" : "";
}

function shortLock(why: string) {
  return why.replace(/^NEED\s+/, "");
}

function peekHive(): { started: boolean; name: string } {
  if (typeof window === "undefined") return { started: false, name: "" };
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return { started: false, name: "" };
    const p = JSON.parse(raw) as { started?: boolean; hiveName?: string; ore?: number; printed?: number };
    const started = Boolean(p.started) || (typeof p.ore === "number" && p.ore > 0) || Boolean(p.printed);
    return { started, name: p.hiveName || "NAVE-1" };
  } catch {
    return { started: false, name: "" };
  }
}

export function NidusApp() {
  const hydrate = useNidus((s) => s.hydrate);
  const tick = useNidus((s) => s.tick);
  const saveNow = useNidus((s) => s.saveNow);
  const start = useNidus((s) => s.start);
  const started = useNidus((s) => s.started);
  const waking = useNidus((s) => s.waking);
  const showBrief = useNidus((s) => s.showBrief);
  const gift = useNidus((s) => s.pendingGift);
  const [boot, setBoot] = useState<BootState>(BOOT_IDLE);
  const [held, setHeld] = useState({ started: false, name: "" });
  const [session, setSession] = useState(false);

  useEffect(() => {
    setHeld(peekHive());
    hydrate();
    registerNidusPwa();
    void initBilling().then((confirmed) => {
      if (confirmed) useNidus.getState().keepOwnedHeroes(getShop().owned);
    });
    let cancelled = false;
    void runBoot((next) => {
      if (!cancelled) setBoot(next);
    });
    const failsafe = window.setTimeout(() => {
      if (!cancelled) setBoot({ pct: 100, ready: true, label: "READY" });
    }, 14000);
    const onVis = () => {
      resumeAudio();
      if (document.visibilityState === "hidden") saveNow();
      else tick(Date.now());
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", saveNow);
    const lockMove = (e: TouchEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (el.closest("[data-scroll], .nidus-sheet, textarea, input")) return;
      e.preventDefault();
    };
    document.addEventListener("touchmove", lockMove, { passive: false });
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      acc += t - last;
      last = t;
      if (acc >= 250) {
        tick(Date.now());
        acc = 0;
        const st = useNidus.getState();
        setAmbiance(st.waking ? "wake" : Date.now() < st.surgeUntil ? "surge" : st.raid ? "raid" : "idle");
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      window.clearTimeout(failsafe);
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", saveNow);
      document.removeEventListener("touchmove", lockMove);
    };
  }, [hydrate, tick, saveNow]);

  useEffect(() => {
    if (boot.ready && held.started) {
      if (!started) start();
      setSession(true);
    }
  }, [boot.ready, held.started, started, start]);

  if (!boot.ready || !session) {
    return (
      <TitleScreen
        boot={boot}
        returning={held.started}
        hiveName={held.name}
        onWake={() => {
          unlockAudio();
          chime("wake");
          if (!started) start();
          setSession(true);
        }}
      />
    );
  }

  return (
    <LiveHive waking={Boolean(waking)} gift={Boolean(gift)} showBrief={showBrief} />
  );
}

function TitleScreen({
  boot,
  onWake,
  returning,
  hiveName,
}: {
  boot: BootState;
  onWake: () => void;
  returning: boolean;
  hiveName: string;
}) {
  const canWake = boot.ready;
  const [ask, setAsk] = useState(false);
  return (
    <div className="relative flex h-dvh w-full flex-col items-center justify-end overflow-hidden bg-void">
      <img src="/nidus/title.jpg" alt="" className="absolute inset-0 h-full w-full object-cover object-[center_28%]" crossOrigin="anonymous" />
      <div className="absolute inset-0 bg-gradient-to-b from-void/40 via-void/20 to-void" />
      <button
        type="button"
        className="absolute right-3 top-[max(0.8rem,env(safe-area-inset-top))] z-20 flex h-11 w-11 flex-col items-center justify-center border border-gilt/40 bg-nave/70 text-gilt"
        title="This screen."
        onClick={() => setAsk((v) => !v)}
      >
        <HelpCircle className="size-4" />
        <span className="font-display text-[0.42rem] tracking-[0.14em]">?</span>
      </button>
      {ask && (
        <div className="absolute inset-x-8 top-16 z-30">
          <GuideSheet screen="wake" onClose={() => setAsk(false)} className="relative" />
        </div>
      )}
      <div className="relative z-10 flex w-full flex-col items-center gap-2 px-6 pb-10 pt-8">
        <p className="font-display text-[0.65rem] tracking-[0.55em] text-gilt">{returning ? hiveName : "HIVE MIND"}</p>
        <h1 className="font-display text-5xl font-black tracking-[0.28em] text-bone">NIDUS</h1>
        <p className="font-display text-[0.7rem] tracking-[0.32em] text-gilt">THE NAVE</p>
        <p className="max-w-[18rem] text-center text-sm tracking-[0.18em] text-muted">
          {returning ? "THE NAVE HELD. YOU NEVER LEFT." : "LIGHTBRINGER. NIGHTQUEEN. UNYIELDING."}
        </p>
        <p className="font-display text-[0.58rem] tracking-[0.22em] text-gilt-dim">LOCAL SAVE · THIS DEVICE</p>
        <div className="mt-3 w-full max-w-xs">
          <div className="mb-1 flex items-center justify-between font-display text-[0.6rem] tracking-[0.28em] text-gilt">
            <span>{returning ? "RETURNING" : boot.label}</span>
            <span className="tabular-nums">{boot.pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden border border-gilt/40 bg-iron" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={boot.pct} aria-label="Loading">
            <div className="h-full bg-gilt motion-safe:transition-[width] motion-safe:duration-200" style={{ width: `${boot.pct}%` }} />
          </div>
        </div>
        <button type="button" disabled={!canWake} onClick={onWake} className={cn("mt-3 min-h-11 min-w-40 border border-gilt/50 bg-void/60 px-10 py-2 font-display text-sm tracking-[0.35em] text-gilt disabled:border-iron disabled:text-muted", canWake && "nidus-pulse")}>
          {canWake ? (returning ? "RETURN" : "WAKE") : "…"}
        </button>
      </div>
    </div>
  );
}

function LiveHive({ waking, gift, showBrief }: { waking: boolean; gift: boolean; showBrief: boolean }) {
  const tab = useNidus((s) => s.tab);
  const setTab = useNidus((s) => s.setTab);
  const [riteOpen, setRiteOpen] = useState(false);
  const [riteStart, setRiteStart] = useState<RitePane>("view");
  const [court, setCourt] = useState(false);
  const [guide, setGuide] = useState<GuideId | null>(null);
  const [whisper, setWhisper] = useState<string | null>(null);
  const [muted, setMuted] = useState(() => getPrefs().muted);
  const prefs = useSyncPrefs();
  const spinPaused = useSyncExternalStore(subscribeSpin, getSpinPaused, getSpinPaused);
  const locked = waking || gift;
  const { collapsed, bump, showChrome, toggleHide } = useIdleChrome(locked || riteOpen || court || Boolean(guide));
  const whispered = useState(() => new Set<string>())[0];
  const s = useNidus();
  const goal = (() => {
    try {
      return nextGoal(s);
    } catch {
      return "GROW THE SWARM";
    }
  })();
  const stage = hiveStage(s);
  const tip = (() => {
    try {
      return advise(s);
    } catch {
      return { chip: "GROW THE SWARM", why: "Idle is the engine.", verb: "IDLE" };
    }
  })();
  const density = useDensity();
  const vp = useViewport();
  const watchChrome = collapsed;
  const buildPct = (() => {
    const id = s.queuedRoom;
    if (!id) return undefined;
    const spec = ROOMS.find((r) => r.id === id);
    const st = s.rooms[id];
    if (!spec || !st || spec.work <= 0) return undefined;
    return Math.min(99, Math.floor((st.progress / spec.work) * 100));
  })();

  useEffect(() => {
    if (!prefs.hints) return;
    if (whispered.has(tab)) return;
    whispered.add(tab);
    if (!helpSeen(tab)) setWhisper(firstWhisper(tab));
  }, [tab, prefs.hints, whispered]);

  useEffect(() => {
    const on = () => unlockAudio();
    window.addEventListener("pointerdown", on, { once: true });
    return () => window.removeEventListener("pointerdown", on);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
      if (e.code === "Digit1") setTab("hull");
      if (e.code === "Digit2") setTab("forge");
      if (e.code === "Digit3") setTab("lab");
      if (e.code === "Digit4") setTab("raid");
      if (e.code === "Digit5") setTab("minds");
      if (e.code === "KeyS") {
        tap(() => useNidus.getState().surge(), "surge");
      }
      if (e.code === "KeyP") {
        tap(() => useNidus.getState().print(), "print");
      }
      if (e.code === "KeyC") {
        const st = useNidus.getState();
        if (st.pendingGift) {
          tap(() => st.claimIdle(), "wake");
        }
      }
      if (e.code === "KeyW") {
        const st = useNidus.getState();
        if (st.raid) st.watchWell(!st.raid.watching);
      }
      if (e.code === "KeyH") toggleHide();
      if (e.code === "KeyU") cycleDensity();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleHide, setTab]);

  const openRitePane = (pane: RitePane) => {
    setCourt(false);
    setRiteStart(pane);
    setRiteOpen(true);
  };

  return (
    <ChromeBound>
    <div
      className={cn("nidus-root relative h-dvh w-full overflow-hidden bg-void text-bone", vp.landscape && "nidus-land")}
      data-density={density === "watch" ? "compact" : density}
      style={{ ["--nidus-ui-scale" as string]: String(prefs.uiScale) }}
    >
      <StationMount />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/12 via-transparent to-void/8" />
      <div className="nidus-vignette pointer-events-none absolute inset-0" />
      {!court && <LeftRail
        muted={muted}
        spinPaused={spinPaused}
        collapsed={collapsed}
        helpPulse={!helpSeen(tab)}
        density={density}
        onHelp={() => {
          setGuide((g) => (g ? null : helpSeen("flow") ? tab : "flow"));
        }}
        onRitePane={openRitePane}
        onStay={bump}
        onMute={() => muteToggle(muted, setMuted)}
        onCollapse={toggleHide}
        onCourt={() => {
          setRiteOpen(false);
          setCourt(true);
        }}
      />}
      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        <ResourceBar compact />
        {tab !== "raid" && (
          <div className="px-3">
            <GoalDock goal={goal} stage={stage} collapsed={collapsed} onExpand={showChrome} verb={s.queuedRoom ? "BUILD" : tip.verb} why={tip.why} pct={buildPct} />
          </div>
        )}
        {tab === "raid" && (
          <p className="pointer-events-none px-3 pt-1 text-center font-display text-[0.58rem] tracking-[0.18em] text-gilt">
            {s.raid ? (s.raid.watching ? "WATCHING · BOOST ON THE RAIL" : "WATCH OR LEAVE") : goal}
          </p>
        )}
        <div className="min-h-0 flex-1" />
        {tab !== "raid" && (
          <div data-chrome data-scroll className={cn("nidus-sheet", watchChrome && "nidus-sheet-hide")}>
            <p className="px-2 pt-1 text-center text-[0.62rem] tracking-[0.06em] text-muted">{tip.why}</p>
            <main className="min-h-0">
              <ActiveTab verb={tip.verb} compact />
            </main>
          </div>
        )}
        {tab === "raid" && <RaidRail />}
        <TabBar
          tab={tab}
          setTab={(id) => {
            showChrome();
            setTab(id);
          }}
        />
      </div>
      {whisper && prefs.hints && <Whisper text={whisper} onDone={() => setWhisper(null)} />}
      {guide && <GuideSheet screen={guide} onClose={() => setGuide(null)} />}
      {riteOpen && (
        <div
          className="pointer-events-auto absolute inset-x-2 bottom-[3.5rem] z-40 max-h-[42dvh] overflow-y-auto"
          data-chrome
        >
          <SettingsPanel start={riteStart} onClose={() => setRiteOpen(false)} />
        </div>
      )}
      {court && (
        <div className="pointer-events-auto absolute inset-x-2 bottom-[3.5rem] top-[max(4.6rem,calc(env(safe-area-inset-top)+4rem))] z-50 flex flex-col justify-end">
          <SovereignHall onClose={() => setCourt(false)} />
        </div>
      )}
      {waking && <WakeOverlay />}
      {gift && !waking && <GiftOverlay />}
      {showBrief && !waking && !gift && <BriefOverlay />}
    </div>
    </ChromeBound>
  );
}

function ResourceBar({ compact }: { compact: boolean }) {
  const ore = useNidus((s) => s.ore);
  const parts = useNidus((s) => s.parts);
  const spark = useNidus((s) => s.spark);
  const echo = useNidus((s) => s.echo);
  const credits = useNidus((s) => s.credits);
  const hiveRank = useNidus((s) => s.hiveRank);
  const waking = useNidus((s) => s.waking);
  const lastSaveAt = useNidus((s) => s.lastSaveAt);
  const gift = useNidus((s) => s.pendingGift);
  const claim = useNidus((s) => s.claimIdle);
  const s = useNidus();
  const r = rates(s, Date.now());
  const fresh = Date.now() - lastSaveAt < 6000;
  const [open, setOpen] = useState<string | null>(null);
  const starve = chargeStarve(s);
  const kiln = s.kilnOn !== false;
  const oreNet = kiln ? r.orePerSec - (r.oreSpendPerSec ?? 0) : r.orePerSec;
  return (
    <header className="pointer-events-auto px-3 pt-[max(0.45rem,env(safe-area-inset-top))]" data-chrome>
      <div className={cn("flex items-center justify-between gap-1.5 border border-border bg-nave/80 px-2 backdrop-blur-sm", compact ? "py-1" : "py-1.5")}>
        <button type="button" className="nidus-rank text-left" title="Hive rank" onClick={() => setOpen(open === "RANK" ? null : "RANK")}>
          <p className="text-[0.55rem] tracking-[0.18em] text-muted">RANK</p>
          <p className="font-display text-xs tabular-nums text-gilt">{hiveTitle(hiveRank)}</p>
        </button>
        <Chip label="CUT" value={fmt(credits ?? 0)} sub={`${fmt((r.creditsPerSec ?? 0) * 60)}/m`} cap={Math.max(80, (credits ?? 0) + 40)} cur={credits ?? 0} venom onTap={setOpen} />
        <Chip label="ORE" value={fmt(ore)} sub={`${fmt(oreNet * 60)}/m`} cap={oreCap(s)} cur={ore} onTap={setOpen} />
        <Chip label="PARTS" value={fmt(parts)} sub={kiln ? `${fmt(r.partsPerSec * 60)}/m` : "KILN OFF"} cap={partsCap(s)} cur={parts} onTap={setOpen} />
        <Chip label="SPARK" value={waking ? "CALL" : sparkBanked(s) ? "BANK" : `${Math.floor(spark)}`} sub={`${(r.sparkPerSec - (r.sparkDrain ?? 0)) >= 0 ? "+" : ""}${fmt((r.sparkPerSec - (r.sparkDrain ?? 0)) * 60)}/m`} cap={sparkCap(s)} cur={spark} venom starve={starve} onTap={setOpen} />
        {echo > 0 && (
          <button type="button" className="text-left" onClick={() => setOpen(open === "ECHO" ? null : "ECHO")}>
            <p className="text-[0.55rem] tracking-[0.18em] text-muted">ECHO</p>
            <p className="font-display text-xs tabular-nums text-gilt">{echo}</p>
          </button>
        )}
        {gift && (
          <button
            type="button"
            className="nidus-pulse min-w-[3.2rem] text-left"
            title="Idle cut waiting"
            onClick={() => {
              tap(() => claim(), "wake");
            }}
          >
            <p className="text-[0.55rem] tracking-[0.18em] text-gilt">CLAIM</p>
            <p className="font-display text-[0.62rem] tabular-nums text-bone">{fmt(gift.ore)}</p>
          </button>
        )}
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", fresh ? "bg-venom" : "bg-iron")} title={fresh ? "held" : "autosave"} />
        <button type="button" className="text-left" title="No cloud" onClick={() => setOpen(open === "LOCAL" ? null : "LOCAL")}>
          <p className="text-[0.5rem] tracking-[0.16em] text-muted">SAVE</p>
          <p className="font-display text-[0.58rem] tracking-[0.12em] text-gilt">LOCAL</p>
        </button>
      </div>
      {open && <p className="px-1 pt-1 text-center text-[0.65rem] text-gilt">{gloss(open)}</p>}
    </header>
  );
}

function Chip({
  label, value, sub, cap, cur, venom, starve, onTap,
}: { label: string; value: string; sub?: string; cap: number; cur: number; venom?: boolean; starve?: boolean; onTap: (k: string | null) => void }) {
  return (
    <button type="button" className={cn("min-w-[2.4rem] shrink-0 text-left", starve && "nidus-pulse", cur / cap > 0.92 && "nidus-cap")} title={gloss(label) || `${label}`} onClick={() => onTap(label)}>
      <p className="text-[0.48rem] tracking-[0.14em] text-muted">{label}</p>
      <p className={cn("font-display text-[0.7rem] tabular-nums", venom ? "text-venom" : "text-bone")}>{value}</p>
      {sub && <p className="text-[0.48rem] tabular-nums text-gilt-dim">{sub}</p>}
      <div className="mt-0.5 h-0.5 w-10 bg-iron">
        <div className={cn("h-0.5", venom ? "bg-venom" : "bg-gilt")} style={{ width: `${Math.min(100, (cur / cap) * 100)}%` }} />
      </div>
    </button>
  );
}

function RaidRail() {
  const raidNode = useNidus((s) => s.raid?.node ?? null);
  const watching = useNidus((s) => Boolean(s.raid?.watching));
  const boostUntil = useNidus((s) => s.raid?.boostUntil ?? 0);
  const raidHp = useNidus((s) => s.raid?.hp ?? 0);
  const raidHpMax = useNidus((s) => s.raid?.hpMax ?? 1);
  const raidHull = useNidus((s) => s.raid?.hull ?? 0);
  const raidHullMax = useNidus((s) => s.raid?.hullMax ?? 1);
  const beat = useNidus((s) => s.raid?.beat ?? "");
  const send = useNidus((s) => s.launchRaid);
  const watchWell = useNidus((s) => s.watchWell);
  const boostWell = useNidus((s) => s.boostWell);
  const strikers = useNidus((s) => s.swarm.striker);
  const s = useNidus();
  const boosted = Date.now() < boostUntil;
  const unlocked = (() => {
    try {
      return RAIDS.filter((n) => raidUnlocked(s, n.id));
    } catch {
      return [];
    }
  })();
  return (
    <aside data-chrome className="pointer-events-auto absolute bottom-12 right-2 top-[max(5.6rem,calc(env(safe-area-inset-top)+4.8rem))] z-30 flex w-[6.6rem] flex-col gap-1 overflow-y-auto">
      {raidNode && (
        <div className="nidus-card p-1.5">
          <p className="font-display text-[0.48rem] tracking-[0.14em] text-venom">{beat || "DUEL"}</p>
          <div className="my-1 h-0.5 bg-iron"><div className="h-0.5 bg-blood-bright" style={{ width: `${Math.min(100, (raidHp / Math.max(1, raidHpMax)) * 100)}%` }} /></div>
          <div className="mb-1 h-0.5 bg-iron"><div className="h-0.5 bg-gilt" style={{ width: `${Math.min(100, (raidHull / Math.max(1, raidHullMax)) * 100)}%` }} /></div>
          <button type="button" className={cn("nidus-cut mb-1 min-h-9 w-full font-display text-[0.52rem] tracking-[0.12em]", watching && "nidus-cut-venom")} onClick={() => watchWell(!watching)}>
            {watching ? "WATCHING" : "WATCH"}
          </button>
          <button type="button" disabled={boosted || s.spark < 6} title="Spend 6 SPARK. 20s command." className={cn("nidus-cut min-h-8 w-full font-display text-[0.48rem] tracking-[0.12em]", boosted && "nidus-cut-gilt")} onClick={() => tap(() => boostWell(), "surge")}>
            {boosted ? "FIRE" : "BOOST"}
          </button>
        </div>
      )}
      {unlocked.length === 0 && !raidNode && (
        <p className="nidus-card p-1.5 text-center font-display text-[0.45rem] leading-tight tracking-[0.08em] text-muted">HANGAR + BOTH GUNS TO DUEL</p>
      )}
      {unlocked.map((node) => {
        const need = raidNeed(s, node.id);
        const times = s.raidCount?.[node.id] ?? 0;
        const cut = raidCutPayout(s, node.id);
        const open = !raidNode && strikers >= need;
        return (
          <button
            key={node.id}
            type="button"
            disabled={!open}
            title={node.blurb}
            onClick={() => tap(() => send(node.id), "raid")}
            className={cn("nidus-cut min-h-9 w-full px-1 text-left font-display text-[0.48rem] tracking-[0.1em]", open && "nidus-cut-gilt")}
          >
            <span className="block truncate">{node.label}</span>
            <span className="tabular-nums text-gilt">{cut}c{times ? ` ·×${times}` : ""}</span>
          </button>
        );
      })}
    </aside>
  );
}

function TabBar({ tab, setTab }: { tab: Tab; setTab: (id: Tab) => void }) {
  const waking = useNidus((s) => s.waking);
  const raiding = useNidus((s) => Boolean(s.raid));
  const verb = useNidus((s) => advise(s).verb);
  const gift = useNidus((s) => Boolean(s.pendingGift));
  const researching = useNidus((s) => Boolean(s.activeTech));
  const tabs: { id: Tab; label: string }[] = [
    { id: "hull", label: "HULL" },
    { id: "forge", label: "FORGE" },
    { id: "lab", label: "LAB" },
    { id: "raid", label: "RAID" },
    { id: "minds", label: "MINDS" },
  ];
  return (
    <nav data-chrome className="pointer-events-auto relative z-30 flex gap-1 bg-transparent px-2 pb-[max(0.28rem,env(safe-area-inset-bottom))] pt-0.5">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTab(t.id)}
          className={cn(
            "nidus-cut relative flex h-7 min-h-7 min-w-0 flex-1 items-center justify-center font-display text-[0.46rem] tracking-[0.1em]",
            tab === t.id ? "nidus-cut-on" : "text-muted",
            pulse(
              (t.id === "forge" && verb === "PRINT") ||
                (t.id === "raid" && (verb === "RAID" || verb === "BOOST")) ||
                (t.id === "minds" && (verb === "WAKE" || verb === "SEAT")) ||
                (t.id === "lab" && (verb === "RITE" || researching)) ||
                (t.id === "hull" && (verb === "BUILD" || verb === "SURGE" || verb === "CLAIM")),
            ),
          )}
          aria-current={tab === t.id ? "page" : undefined}
        >
          {t.label}
          {t.id === "minds" && (waking || verb === "WAKE" || verb === "SEAT") && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-venom" />}
          {t.id === "raid" && raiding && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-gilt" />}
          {t.id === "forge" && verb === "PRINT" && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-gilt" />}
          {t.id === "lab" && researching && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-venom" />}
          {t.id === "hull" && (gift || verb === "BUILD") && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-gilt" />}
        </button>
      ))}
    </nav>
  );
}

function ActiveTab({ verb, compact }: { verb: string; compact: boolean }) {
  const tab = useNidus((s) => s.tab);
  if (tab === "forge") return <ForgeTab verb={verb} compact={compact} />;
  if (tab === "lab") return <LabTab compact={compact} />;
  if (tab === "raid") return <RaidTab verb={verb} compact={compact} />;
  if (tab === "minds") return <MindsTab compact={compact} />;
  return <HullTab verb={verb} compact={compact} />;
}

function HullTab({ verb, compact }: { verb: string; compact: boolean }) {
  const surge = useNidus((s) => s.surge);
  const surgeUntil = useNidus((s) => s.surgeUntil);
  const rooms = useNidus((s) => s.rooms);
  const queued = useNidus((s) => s.queuedRoom);
  const queue = useNidus((s) => s.queue);
  const doMolt = useNidus((s) => s.doMolt);
  const echo = useNidus((s) => s.echo);
  const moltLayer = useNidus((s) => s.moltLayer);
  const tech = useNidus((s) => s.tech);
  const slag = useNidus((s) => s.slag);
  const slagAt = useNidus((s) => s.slagAt);
  const scripts = useNidus((s) => s.scripts);
  const toggleScripts = useNidus((s) => s.toggleScripts);
  const mercy = useNidus((s) => s.mercySurge);
  const zoneUp = useNidus((s) => s.zoneUp);
  const zoneRank = useNidus((s) => s.zoneRank);
  const now = Date.now();
  const surging = now < surgeUntil;
  const slagReady = now >= slagAt;
  const s = useNidus();
  const full = packed(s);
  const nextRoom = ROOMS.find((r) => r.id !== "foundry" && !rooms[r.id]?.built && !roomLockWhy(s, r.id));
  const [why, setWhy] = useState<string | null>(null);

  return (
    <div className="pointer-events-none flex flex-col justify-end gap-1 p-2">
      {s.orders?.length > 0 && !compact && (
        <div className="pointer-events-auto nidus-strip">
          {s.orders.map((o) => (
            <div key={o.id} className="nidus-card min-w-32 px-1.5 py-1">
              <p className="font-display text-[0.55rem] tracking-[0.14em] text-gilt">{o.label}</p>
              <p className="text-[0.6rem] text-muted">{o.hint}</p>
              <div className="mt-0.5 h-0.5 bg-iron">
                <div className="h-0.5 bg-venom" style={{ width: `${Math.min(100, (o.have / o.need) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="pointer-events-auto flex flex-col gap-2">
        {ZONES.map((z) => {
          const rows = ROOMS.filter((r) => r.zone === z.id && (r.id === "foundry" || rooms[r.id]?.built || queued === r.id || !roomLockWhy(s, r.id) || r.id === nextRoom?.id));
          if (rows.length === 0) return null;
          const zr = zoneRank?.[z.id] ?? 0;
          const zc = zoneCost(s, z.id);
          return (
            <div key={z.id} className="nidus-card px-1.5 py-1">
              <div className="mb-0.5 flex items-center justify-between gap-1">
                <p className="font-display text-[0.52rem] tracking-[0.18em] text-gilt">{z.label} · R{zr}</p>
                <button
                  type="button"
                  disabled={zr >= RANK_MAX || (s.credits ?? 0) < zc}
                  title={`${z.hint} ${zc} CUT`}
                  onClick={() => {
                    tap(() => zoneUp(z.id), "snap");
                  }}
                  className="nidus-cut min-h-7 px-1.5 font-display text-[0.48rem] tracking-[0.12em] text-gilt disabled:opacity-40"
                >
                  ZONE {zc}c
                </button>
              </div>
              <div className="flex gap-0.5 overflow-x-auto">
                {rows.map((r) => {
                  const st = rooms[r.id] ?? { built: false, progress: 0, rank: 0, rankWork: 0 };
                  const lock = roomLockWhy(s, r.id);
                  const ranking = s.rankingRoom === r.id;
                  const work = Math.max(1, r.work);
                  const raisePct = Math.min(100, Math.floor((st.progress / work) * 100));
                  const rk = rankCost(s, r.id);
                  const rankPct = rk ? Math.min(100, Math.floor(((st.rankWork ?? 0) / rk.work) * 100)) : 100;
                  const bar = st.built ? (ranking ? rankPct : 100) : raisePct;
                  const tag = st.built ? (ranking ? `R${st.rank}` : `R${st.rank}`) : queued === r.id ? `${raisePct}` : lock ? "—" : "↑";
                  return (
                    <button
                      key={r.id}
                      type="button"
                      disabled={Boolean(lock) || ((st.rank ?? 0) >= RANK_MAX && st.built)}
                      title={lock || `${r.label} · ${r.bonus}${rk ? ` · ${rk.credits}c` : ""}`}
                      onClick={() => {
                        lookAtRoom(r.id);
                        setWhy(`${r.label} · ${r.bonus}`);
                        tap(() => queue(r.id), "snap");
                      }}
                      className={cn("nidus-vbar nidus-cut shrink-0", st.built && "nidus-cut-on", lock && "opacity-40", pulse(nextRoom?.id === r.id && verb === "BUILD"))}
                    >
                      <span className="font-display text-[0.42rem] tabular-nums text-gilt">{tag}</span>
                      <div className="nidus-vbar-track">
                        <div className={cn("nidus-vbar-fill", st.built ? "bg-gilt" : "bg-venom")} style={{ height: `${bar}%` }} />
                      </div>
                      <span className="w-full truncate text-center font-display text-[0.4rem] leading-tight tracking-[0.06em]">{r.label.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        {why && !compact && <p className="px-1 text-center text-[0.65rem] text-gilt">{why}</p>}
      </div>
      <div className="pointer-events-auto nidus-actions">
        <button
          type="button"
          disabled={surging || s.spark < 8}
          onClick={() => {
            tap(() => surge(), "surge");
          }}
          className={cn("nidus-cut min-h-9 flex-1 font-display text-[0.62rem] tracking-[0.24em]", surging ? "nidus-cut-venom" : "nidus-cut-on", pulse(verb === "SURGE" || (mercy && !surging)))}
          title={s.spark < 8 ? "Need 8 SPARK." : mercy && !surging ? "Spend 8 SPARK. Longer sprint." : "Spend 8 SPARK. Swarm sprints ~30s."}
        >
          <span className="inline-flex items-center justify-center gap-1"><Zap className="size-3.5" />{surging ? "SURGING" : mercy ? "MERCY" : "SURGE"}</span>
        </button>
        <button
          type="button"
          disabled={!slagReady}
          title="Spare ore and a lick of spark. Packed ore cooks to parts."
          onClick={() => {
            tap(() => slag(), "print");
          }}
          className={cn("nidus-cut nidus-iconbtn", slagReady ? "nidus-cut-gilt" : "text-muted")}
        >
          <Flame className="size-3.5" />
          <span className="font-display text-[0.42rem] tracking-[0.12em]">SLAG</span>
        </button>
        <button
          type="button"
          title="Hive mind stamps, raises, rites, and raids."
          onClick={() => toggleScripts()}
          className={cn("nidus-cut nidus-iconbtn", scripts ? "nidus-cut-venom" : "text-muted")}
        >
          <Brain className="size-3.5" />
          <span className="font-display text-[0.42rem] tracking-[0.12em]">{scripts ? "MIND" : "HIVE"}</span>
        </button>
        {tech.moltlock?.done && echo >= moltCost(s) && (
          <button type="button" onClick={() => doMolt()} className="nidus-cut nidus-iconbtn text-gilt">
            <span className="font-display text-[0.7rem] leading-none">{moltCost(s)}</span>
            <span className="font-display text-[0.42rem] tracking-[0.12em]">MOLT</span>
          </button>
        )}
      </div>
      <p className="pointer-events-none text-center text-[0.58rem] tracking-[0.16em] text-muted">
        {totalSwarm(s)}/{berthCap(s)}
        {full ? " PACKED" : autoHoldBerths(s) > 0 ? " · AUTO HOLDS 2" : " BERTHS"} · {s.minds.filter((m) => m.alive).length} MINDS · L{moltLayer}
      </p>
      {nextRoom && (
        <p className="pointer-events-none text-center font-display text-[0.55rem] tracking-[0.18em] text-gilt">
          NEXT GROWS · {nextRoom.label} · {nextRoom.bonus}
        </p>
      )}
    </div>
  );
}

function ForgeTab({ verb, compact }: { verb: string; compact: boolean }) {
  const printCaste = useNidus((s) => s.printCaste);
  const setPrintCaste = useNidus((s) => s.setPrintCaste);
  const print = useNidus((s) => s.print);
  const autoPrint = useNidus((s) => s.autoPrint);
  const toggleAuto = useNidus((s) => s.toggleAuto);
  const swarm = useNidus((s) => s.swarm);
  const markHull = useNidus((s) => s.markHull);
  const expandPop = useNidus((s) => s.expandPop);
  const hullMark = useNidus((s) => s.hullMark);
  const sell = useNidus((s) => s.sell);
  const autoSell = useNidus((s) => s.autoSell);
  const toggleAutoSell = useNidus((s) => s.toggleAutoSell);
  const kilnOn = useNidus((s) => s.kilnOn !== false);
  const toggleKiln = useNidus((s) => s.toggleKiln);
  const s = useNidus();
  const cost = printCost(s);
  const cap = berthCap(s);
  const pop = expandCost(s);
  const mk = markCost(hullMark[printCaste] ?? 0);
  const full = packed(s);
  const jammed = totalSwarm(s) >= cap;
  const icons: Record<Caste, typeof Pickaxe> = { miner: Pickaxe, fab: Factory, builder: Hammer, lab: FlaskConical, striker: Swords };
  return (
    <div className="pointer-events-auto flex flex-col justify-end gap-2 p-2" data-chrome>
      <div className="nidus-card p-2">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="font-display text-[0.65rem] tracking-[0.24em] text-gilt">SWARM</p>
          <p className={cn("font-display text-[0.58rem] tabular-nums tracking-[0.14em]", full ? "text-blood-bright" : "text-muted")}>
            {totalSwarm(s)}/{cap}
            {s.printFocus && s.printFocus.n >= 3 ? ` · FOCUS ×${s.printFocus.n}` : ""}
          </p>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {CASTES.map((c) => {
            const Icon = icons[c.id];
            const on = printCaste === c.id;
            const mk = hullMark[c.id] ?? 0;
            return (
              <button key={c.id} type="button" title={`${c.verb} caste. Same caste stacks FOCUS.`} onClick={() => setPrintCaste(c.id)} className={cn("nidus-cut flex flex-col items-center justify-center gap-0.5", compact ? "min-h-12" : "min-h-16", on && "nidus-cut-on")}>
                <Icon className="size-3.5 text-gilt" />
                <span className="font-display text-[0.52rem] tracking-[0.12em]">{c.label}</span>
                <span className="font-display text-base tabular-nums leading-none">{swarm[c.id]}</span>
                {!compact && <span className="font-display text-[0.48rem] tracking-[0.1em] text-muted">{markName(mk)}</span>}
                <div className="mt-0.5 h-0.5 w-8 bg-iron">
                  <div className="h-0.5 bg-gilt" style={{ width: `${Math.min(100, ((s.casteXp?.[c.id] ?? 0) / Math.max(1, casteXpNeed(s.casteLevel[c.id] ?? 0))) * 100)}%` }} />
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-1.5 flex gap-1.5">
          <button
            type="button"
            disabled={(s.credits ?? 0) < pop.credits}
            title="Buys berths with CUT."
            onClick={() => {
              tap(() => expandPop(), "snap");
            }}
            className={cn("nidus-cut min-h-11 flex-1 font-display text-[0.6rem] tracking-[0.12em] disabled:opacity-40", pulse(full))}
          >
            EXPAND +{pop.add} · {pop.credits}c
          </button>
          <button
            type="button"
            disabled={(hullMark[printCaste] ?? 0) >= MARK_MAX || (s.credits ?? 0) < mk.credits}
            title={`Rank ${CASTES.find((c) => c.id === printCaste)?.label}. ${mk.credits} CUT.`}
            onClick={() => markHull(printCaste)}
            className="nidus-cut min-h-11 px-2 font-display text-[0.6rem] tracking-[0.12em] text-bone disabled:opacity-40"
          >
            MARK {mk.credits}c
          </button>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-1">
          <button type="button" className="nidus-cut min-h-9 font-display text-[0.5rem] tracking-[0.12em]" onClick={() => tap(() => sell("ore", Math.max(8, s.ore * 0.2)), "cook")}>
            SELL ORE
          </button>
          <button type="button" className="nidus-cut min-h-9 font-display text-[0.5rem] tracking-[0.12em]" onClick={() => tap(() => sell("parts", Math.max(6, s.parts * 0.2)), "cook")}>
            SELL BOTS
          </button>
          <button type="button" className={cn("nidus-cut min-h-9 font-display text-[0.5rem] tracking-[0.1em]", autoSell !== false ? "nidus-cut-venom" : "text-muted")} onClick={toggleAutoSell}>
            SELL {autoSell !== false ? "ON" : "OFF"}
          </button>
          <button type="button" title="ON drinks ore into parts. OFF banks ore." className={cn("nidus-cut min-h-9 font-display text-[0.5rem] tracking-[0.1em]", kilnOn ? "nidus-cut-gilt" : "text-muted")} onClick={toggleKiln}>
            KILN {kilnOn ? "ON" : "OFF"}
          </button>
        </div>
      </div>
      <div className="nidus-actions">
        <button type="button" title={jammed ? "Packed. Stamp still feeds SPARK and caste XP." : `${cost.ore} ore · ${cost.parts} parts.`} onClick={() => tap(() => print(), "print")} className={cn("nidus-cut nidus-cut-on min-h-11 flex-1 font-display tracking-[0.28em]", pulse(verb === "PRINT" || jammed))}>
          <span className="block text-[0.8rem]">{jammed ? "PRINT SPARK" : "PRINT"}</span>
          <span className="block font-sans text-[0.55rem] tabular-nums tracking-[0.08em] text-bone/80">{cost.ore}o · {cost.parts}p</span>
        </button>
        <button type="button" title="Stamp while you are gone." onClick={toggleAuto} className={cn("nidus-cut nidus-iconbtn", autoPrint ? "nidus-cut-venom" : "text-muted", pulse(verb === "AUTO" && !autoPrint))}>
          <span className="font-display text-[0.7rem] leading-none">{autoPrint ? "ON" : "OFF"}</span>
          <span className="font-display text-[0.42rem] tracking-[0.12em]">AUTO</span>
        </button>
      </div>
    </div>
  );
}

function LabTab({ compact }: { compact: boolean }) {
  const lab = useNidus((s) => Boolean(s.rooms.lab?.built));
  const tech = useNidus((s) => s.tech);
  const active = useNidus((s) => s.activeTech);
  const research = useNidus((s) => s.research);
  const rows = TECH.filter((t) => {
    const st = tech[t.id] ?? { done: false, progress: 0 };
    if (st.done) return false;
    if (t.id === active) return true;
    try {
      return techUnlocked(useNidus.getState(), t.id).ok;
    } catch {
      return false;
    }
  }).slice(0, 8);
  const locked = TECH.filter((t) => {
    const st = tech[t.id] ?? { done: false, progress: 0 };
    if (st.done) return false;
    if (rows.some((r) => r.id === t.id)) return false;
    return true;
  }).slice(0, 4);
  const doneN = TECH.filter((t) => tech[t.id]?.done).length;
  return (
    <div className={cn("pointer-events-auto overflow-y-auto p-2", compact ? "max-h-[32dvh]" : "max-h-[40dvh]")} data-chrome>
      <p className="mb-1 text-center font-display text-[0.58rem] tracking-[0.18em] text-gilt">
        {lab ? (active ? `COOKING ${TECH.find((t) => t.id === active)?.label ?? "RITE"}` : "PICK A RITE") : "RAISE THE LAB MODULE ON HULL"}
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {rows.map((t) => {
          const st = tech[t.id] ?? { done: false, progress: 0 };
          const work = Math.max(1, t.work || 1);
          const pct = Math.min(100, Math.floor((st.progress / work) * 100));
          return (
            <button
              key={t.id}
              type="button"
              disabled={!lab}
              title={t.blurb}
              onClick={() => {
                try {
                  tap(() => research(t.id), "snap");
                } catch {
                  /* rite optional */
                }
              }}
              className={cn("nidus-cut px-2 py-1.5 text-left", active === t.id ? "nidus-cut-venom" : "text-bone")}
            >
              <p className="font-display text-[0.52rem] tracking-[0.12em]">{t.label}</p>
              <p className="truncate text-[0.55rem] text-muted">{t.blurb}</p>
              <p className="text-[0.55rem] tabular-nums text-gilt-dim">{pct}% · T{t.tier}</p>
            </button>
          );
        })}
        {locked.map((t) => (
          <div key={t.id} className="nidus-cut px-2 py-1.5 text-left opacity-40">
            <p className="font-display text-[0.52rem] tracking-[0.12em]">{t.label}</p>
            <p className="truncate text-[0.55rem] text-muted">NESTED</p>
          </div>
        ))}
      </div>
      {doneN > 0 && (
        <p className="mt-1 text-center font-display text-[0.48rem] tracking-[0.14em] text-muted">{doneN} RITES INLAID</p>
      )}
    </div>
  );
}

function RaidTab({ verb, compact }: { verb: string; compact: boolean }) {
  const raidNode = useNidus((s) => s.raid?.node ?? null);
  const raidEnds = useNidus((s) => s.raid?.endsAt ?? 0);
  const raidHp = useNidus((s) => s.raid?.hp ?? 0);
  const raidHpMax = useNidus((s) => s.raid?.hpMax ?? 1);
  const raidHull = useNidus((s) => s.raid?.hull ?? 0);
  const raidHullMax = useNidus((s) => s.raid?.hullMax ?? 1);
  const watching = useNidus((s) => Boolean(s.raid?.watching));
  const boostUntil = useNidus((s) => s.raid?.boostUntil ?? 0);
  const beat = useNidus((s) => s.raid?.beat ?? "");
  const send = useNidus((s) => s.launchRaid);
  const watchWell = useNidus((s) => s.watchWell);
  const boostWell = useNidus((s) => s.boostWell);
  const markHull = useNidus((s) => s.markHull);
  const strikers = useNidus((s) => s.swarm.striker);
  const mark = useNidus((s) => s.hullMark.striker);
  const cleared = useNidus((s) => s.raidCleared);
  const s = useNidus();
  const cost = markCost(mark);
  const boosted = Date.now() < boostUntil;
  const unlocked = RAIDS.filter((n) => raidUnlocked(s, n.id));
  const lockedTease = RAIDS.filter((n) => !raidUnlocked(s, n.id)).slice(0, 2);
  const shownRaids = [...unlocked, ...lockedTease];
  const nestedWrecks = RAIDS.length - shownRaids.length;
  const guns = weaponMods(s);
  return (
    <div className={cn("pointer-events-auto flex flex-col justify-end gap-1.5 overflow-y-auto p-2", compact ? "max-h-[32dvh]" : "max-h-[40dvh]")} data-chrome>
      <div className="nidus-card flex items-center justify-between px-2 py-1.5">
        <div>
          <p className="font-display text-[0.58rem] tracking-[0.18em] text-gilt">{markName(mark)}</p>
          <p className="text-[0.62rem] tabular-nums text-muted">{strikers} HULLS</p>
          <p className="text-[0.52rem] tabular-nums text-muted">
            {guns.railR ? `RAIL R${guns.railR - 1} PIERCE` : "RAIL —"}
            {" · "}
            {guns.canR ? `CANNON R${guns.canR - 1} VOLUME` : "CANNON —"}
          </p>
        </div>
        <button type="button" disabled={mark >= MARK_MAX || (s.credits ?? 0) < cost.credits} title={`Bigger strikers. ${cost.credits} CUT.`} onClick={() => markHull("striker")} className="nidus-cut min-h-10 px-2 font-display text-[0.6rem] tracking-[0.14em] text-gilt disabled:text-muted">
          MARK {cost.credits}c
        </button>
      </div>
      {raidNode && (
        <div className="nidus-card relative min-h-[7.2rem] overflow-hidden p-0">
          <img src={RAIDS.find((r) => r.id === raidNode)?.image} alt="" className="nidus-card-art" crossOrigin="anonymous" />
          <div className="nidus-card-veil" />
          <div className="relative z-10 flex h-full flex-col justify-end p-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="font-display text-[0.65rem] tracking-[0.24em] text-venom">{beat || "DUEL"} · SHIP vs SHIP</p>
              <StatusChip kind="well">{fmtTime(Math.max(0, (raidEnds - Date.now()) / 1000))}</StatusChip>
            </div>
            <p className="mb-0.5 flex justify-between font-display text-[0.48rem] tracking-[0.14em] text-muted">
              <span>PIRATE</span>
              <span>BOTS</span>
            </p>
            <div className="mb-1 h-1 bg-iron">
              <div className="h-1 bg-blood-bright" style={{ width: `${Math.min(100, (raidHp / Math.max(1, raidHpMax)) * 100)}%` }} />
            </div>
            <div className="mb-1.5 h-1 bg-iron">
              <div className="h-1 bg-gilt" style={{ width: `${Math.min(100, (raidHull / Math.max(1, raidHullMax)) * 100)}%` }} />
            </div>
            <div className="nidus-actions">
              <button type="button" title={watching ? "Leave — fleet still fights at 18% bonus." : "Watching cuts 18% faster."} className={cn("nidus-cut min-h-11 flex-1 font-display text-[0.7rem] tracking-[0.16em]", watching ? "nidus-cut-venom" : "", pulse(verb === "RAID" && !watching))} onClick={() => watchWell(!watching)}>
                {watching ? "WATCHING" : "WATCH"}
              </button>
              <button type="button" disabled={boosted || s.spark < 6} title="Spend 6 SPARK. 20s command." className={cn("nidus-cut min-h-9 flex-1 font-display text-[0.62rem] tracking-[0.16em]", boosted ? "nidus-cut-gilt" : "text-gilt", pulse(verb === "BOOST"))} onClick={() => tap(() => boostWell(), "surge")}>
                {boosted ? "COMMAND" : "BOOST"}
              </button>
            </div>
          </div>
        </div>
      )}
      {Object.values(s.salvage ?? {}).some((n) => n > 0) && (
        <div className="nidus-card px-2 py-1">
          <p className="mb-1 text-center font-display text-[0.55rem] tracking-[0.12em] text-gilt">
            {(["ice", "plate", "bone", "rose", "core"] as const).filter((k) => (s.salvage?.[k] ?? 0) > 0).map((k) => `${k.toUpperCase()} ${s.salvage?.[k]}`).join(" · ")}
          </p>
          <div className="flex flex-wrap gap-1">
            {(["ice", "plate", "bone", "rose", "core"] as const).map((k) => {
              const spec = SALVAGE_COOK[k];
              const open = cookUnlocked(s, k);
              return (
                <button
                  key={k}
                  type="button"
                  disabled={!open}
                  title={spec.line}
                  onClick={() => {
                    tap(() => useNidus.getState().cook(k), "cook");
                  }}
                  className={cn("nidus-cut min-h-9 px-2 font-display text-[0.52rem] tracking-[0.12em]", open ? "nidus-cut-gilt nidus-pulse" : "text-iron")}
                >
                  {spec.label} {k.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {!raidNode && shownRaids.map((node) => {
        const why = raidLockWhy(s, node.id);
        const open = !why;
        const done = cleared.includes(node.id);
        const need = raidNeed(s, node.id);
        const times = s.raidCount?.[node.id] ?? 0;
        const firstIce = node.id === "ice" && !done;
        const wait = firstIce ? node.seconds * 0.78 : node.seconds;
        const chipKind = open ? (firstIce ? "open" : done ? "lit" : "next") : "lock";
        const chip = open ? (firstIce ? "FIRST" : done ? (times > 0 ? `FARM ×${times}` : "AGAIN") : "OPEN") : shortLock(why);
        return (
          <button key={node.id} type="button" disabled={!open || Boolean(raidNode) || strikers < need} title={why || node.blurb} onClick={() => tap(() => send(node.id), "raid")} className={cn("nidus-card relative w-full overflow-hidden text-left", compact ? "min-h-[3.6rem]" : "min-h-[4.4rem]", !open && "nidus-card-lock", pulse(open && verb === "RAID" && node.id === "ice" && !raidNode))}>
            <img src={node.image} alt="" className="nidus-card-art" crossOrigin="anonymous" />
            <div className="nidus-card-veil" />
            <div className="relative z-10 flex h-full items-end justify-between gap-2 p-2">
              <div className="min-w-0">
                <p className="font-display text-sm tracking-[0.16em]">{node.label}</p>
                {open && (
                  <p className="text-[0.62rem] tabular-nums text-muted">
                    {need} {markName(mark)} · {fmtTime(wait)}
                  </p>
                )}
              </div>
              <StatusChip kind={chipKind}>{chip}</StatusChip>
            </div>
          </button>
        );
      })}
      {!raidNode && nestedWrecks > 0 && (
        <p className="text-center font-display text-[0.5rem] tracking-[0.14em] text-muted">+{nestedWrecks} WRECKS NESTED</p>
      )}
    </div>
  );
}

function MindsTab({ compact }: { compact: boolean }) {
  const minds = useNidus((s) => s.minds);
  const selected = useNidus((s) => s.selectedMind);
  const selectMind = useNidus((s) => s.selectMind);
  const setJob = useNidus((s) => s.setJob);
  const seat = useNidus((s) => s.seat);
  const melt = useNidus((s) => s.melt);
  const waking = useNidus((s) => s.waking);
  const spark = useNidus((s) => s.spark);
  const s = useNidus();
  const live = minds.filter((m) => m.alive);
  const mind = live.find((m) => m.id === selected) ?? live[0];
  const icons: Record<(typeof JOBS)[number]["id"], typeof Pickaxe> = {
    mine: Pickaxe,
    forge: Factory,
    build: Hammer,
    lab: FlaskConical,
    raid: Swords,
  };

  if (waking) {
    return (
      <div className="pointer-events-auto p-2" data-chrome>
        <p className="text-center font-display text-[0.65rem] tracking-[0.24em] text-gilt">A BODY ANSWERS</p>
      </div>
    );
  }

  if (!mind) {
    const need = callNeed(s);
    const ready = spark >= need && Boolean(s.rooms.solar?.built);
    return (
      <div className="pointer-events-auto flex items-end justify-center p-4">
        <div className="nidus-card w-full max-w-sm p-3 text-center">
          <p className="font-display text-[0.7rem] tracking-[0.2em] text-gilt">CALL AN OFFICER</p>
          <p className="mt-1 text-[0.8rem] text-bone">SPARK buys one body. TAKE or PASS. Not a dump.</p>
          <div className="mt-2 h-1.5 bg-iron">
            <div className="h-1.5 bg-venom" style={{ width: `${Math.min(100, (spark / Math.max(1, need)) * 100)}%` }} />
          </div>
          <p className="mt-1 text-[0.65rem] tabular-nums text-muted">{Math.floor(spark)} / {need}</p>
          <button
            type="button"
            disabled={!ready}
            className={cn("nidus-cut mt-2 min-h-11 w-full font-display tracking-[0.2em]", ready && "nidus-cut-on nidus-pulse")}
            onClick={() => {
              tap(() => useNidus.getState().callOfficer(), "wake");
            }}
          >
            CALL {need}
          </button>
        </div>
      </div>
    );
  }

  const spec = FRAMES[mind.frame];
  const post = POSTS[mind.job];
  const born = framePost(mind.frame);
  return (
    <div className="pointer-events-auto flex flex-col justify-end gap-1.5 p-2" data-chrome>
      <div className="nidus-card relative overflow-hidden">
        <img src={mind.portrait} alt="" className={cn("w-full object-cover object-top", compact ? "h-20" : "h-28")} crossOrigin="anonymous" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void to-transparent p-2">
          <div className="mb-0.5 flex items-center gap-1.5">
            <StatusChip kind={mind.seated ? "next" : "open"}>{mind.seated ? "SEATED" : "PACING"}</StatusChip>
            {mind.wounded && <StatusChip kind="lock">WOUND</StatusChip>}
          </div>
          <h2 className={cn("font-display leading-none", compact ? "text-xl" : "text-2xl")}>{mind.name}</h2>
          <p className={cn("font-display text-[0.65rem] tracking-[0.16em]", rarityColor[mind.rarity])}>
            {spec.label} · {born.label} → {post.label}
          </p>
          <p className="font-display text-[0.58rem] tracking-[0.1em] text-gilt">{mindPostLine(mind)}</p>
          {mindTalent(mind.level) && (
            <p className="font-display text-[0.55rem] tracking-[0.14em] text-venom">{mindTalent(mind.level)?.label}</p>
          )}
        </div>
      </div>
      <div className="nidus-strip">
        {live.map((m) => (
          <button key={m.id} type="button" title={`${m.name} · ${POSTS[m.job].label}`} onClick={() => selectMind(m.id)} className={cn("h-12 w-10 shrink-0 overflow-hidden", m.id === mind.id ? "nidus-card-on nidus-card" : "nidus-card")}>
            <img src={m.portrait} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
          </button>
        ))}
        {Array.from({ length: Math.max(0, Math.min(OFFICER_CAP, throneCap(s)) - live.length) }).map((_, i) => (
          <div key={i} className="nidus-card h-12 w-10 shrink-0 opacity-40" />
        ))}
      </div>
      {live.length < OFFICER_CAP && (
        <button
          type="button"
          disabled={spark < callNeed(s)}
          className="nidus-cut min-h-9 w-full font-display text-[0.58rem] tracking-[0.16em] disabled:opacity-40"
          onClick={() => {
            tap(() => useNidus.getState().callOfficer(), "wake");
          }}
        >
          CALL {callNeed(s)} SPARK
        </button>
      )}
      <div className="grid grid-cols-5 gap-1">
        {JOBS.map((j) => {
          const Icon = icons[j.id];
          return (
            <button
              key={j.id}
              type="button"
              title={POSTS[j.id].does}
              onClick={() => setJob(mind.id, j.id)}
              className={cn("nidus-cut flex min-h-11 flex-col items-center justify-center", mind.job === j.id ? "nidus-cut-on" : "text-muted")}
            >
              <Icon className="size-3.5" />
              <span className="font-display text-[0.52rem] tracking-[0.1em]">{POSTS[j.id].label}</span>
            </button>
          );
        })}
      </div>
      <div className="nidus-actions">
        <button type="button" title={mind.seated ? "Half post while pacing." : `SEAT for +${postBoostPct({ ...mind, seated: true })}% ${post.label}.`} className={cn("nidus-cut min-h-11 flex-1 font-display text-[0.62rem] tracking-[0.12em]", mind.seated && "nidus-cut-venom", !mind.seated && "nidus-pulse")} onClick={() => tap(() => seat(mind.id), "seat")}>
          {mind.seated ? "UNSEAT" : `SEAT +${postBoostPct({ ...mind, seated: true })}%`}
        </button>
        <button
          type="button"
          disabled={!mind.wounded || s.spark < (s.tech.flesh2?.done ? 2 : s.tech.mindheal?.done ? 3 : 5)}
          title="Spend SPARK. Clears the wound."
          className="nidus-cut nidus-iconbtn text-venom disabled:opacity-40"
          onClick={() => {
            tap(() => useNidus.getState().heal(mind.id), "wake");
          }}
        >
          <span className="font-display text-[0.42rem] tracking-[0.12em]">HEAL</span>
        </button>
        <button
          type="button"
          disabled={s.echo < 3}
          title="Spend 3 Echo to rank them."
          className="nidus-cut nidus-iconbtn text-gilt disabled:opacity-40"
          onClick={() => useNidus.getState().promote(mind.id)}
        >
          <span className="font-display text-[0.42rem] tracking-[0.12em]">MARK</span>
        </button>
        <button type="button" className="nidus-cut nidus-iconbtn text-blood-bright" onClick={() => melt(mind.id)}>
          <span className="font-display text-[0.42rem] tracking-[0.12em]">UNMAKE</span>
        </button>
      </div>
    </div>
  );
}

function WakeOverlay() {
  const waking = useNidus((s) => s.waking);
  const pick = useNidus((s) => s.pickWake);
  const pass = useNidus((s) => s.passOfficer);
  const paid = useNidus((s) => s.callPaid ?? 0);
  if (!waking?.[0]) return null;
  const c = waking[0];
  const post = framePost(c.frame);
  const top = (Object.entries(c.stats) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
  return (
    <div className="pointer-events-auto absolute inset-x-0 top-0 bottom-16 z-40 flex flex-col items-center justify-end bg-void/92 p-4" data-chrome>
      <p className="mb-1 text-center font-display text-[0.7rem] tracking-[0.24em] text-gilt">A BODY ANSWERS</p>
      <p className="mb-2 text-center text-[0.7rem] text-muted">TAKE her or PASS. PASS returns 30% SPARK.</p>
      <div className="nidus-card w-full max-w-xs overflow-hidden bg-nave">
        <img src={c.portrait} alt="" className="h-40 w-full object-cover object-top" crossOrigin="anonymous" />
        <div className="p-2">
          <p className="font-display text-[0.7rem] tracking-[0.16em] text-gilt">{post.label}</p>
          <p className={cn("font-display text-[0.58rem] tracking-[0.12em]", rarityColor[c.rarity])}>{FRAMES[c.frame]?.label ?? c.frame}</p>
          <p className="font-display text-lg leading-tight">{c.name}</p>
          <p className="text-[0.7rem] text-bone">{post.does}</p>
          <p className="text-[0.6rem] tabular-nums text-muted">{top?.[0].toUpperCase()} {top?.[1]}</p>
        </div>
      </div>
      <div className="mt-2 flex w-full max-w-xs gap-2">
        <button type="button" className="nidus-cut nidus-cut-on min-h-11 flex-1 font-display tracking-[0.2em]" onClick={() => tap(() => pick(0), "wake")}>
          TAKE
        </button>
        <button type="button" className="nidus-cut min-h-11 flex-1 font-display tracking-[0.2em] text-muted" onClick={() => tap(() => pass(), "snap")}>
          PASS · +{Math.floor(paid * 0.3)}
        </button>
      </div>
    </div>
  );
}

function GiftOverlay() {
  const gift = useNidus((s) => s.pendingGift);
  const claim = useNidus((s) => s.claimIdle);
  const streak = useNidus((s) => s.returnStreak);
  const mercy = useNidus((s) => s.mercySurge);
  useEffect(() => {
    lookAtRoom("prow");
  }, []);
  if (!gift) return null;
  return (
    <div className="pointer-events-auto absolute inset-x-0 top-0 bottom-16 z-40 flex items-end justify-center bg-void/80 p-4" data-chrome>
      <div className="nidus-panel w-full max-w-sm p-3 nidus-pulse">
        <p className="font-display text-[0.65rem] tracking-[0.28em] text-gilt">THE HIVE HELD · {fmtTime(gift.seconds)}</p>
        {streak > 1 && (
          <p className="mt-1 font-display text-[0.58rem] tracking-[0.16em] text-venom">STREAK {streak} · RICHER CUT</p>
        )}
        <p className="mt-1 font-display text-lg tabular-nums text-bone">
          {fmt(gift.ore)} ORE · {fmt(gift.parts)} PARTS · +{gift.spark} SPARK
        </p>
        {mercy && <p className="mt-1 text-[0.62rem] text-muted">CLAIM banks a mercy SURGE and a lick of SPARK.</p>}
        <button type="button" className="nidus-cut nidus-cut-on mt-3 min-h-11 w-full font-display tracking-[0.28em] text-bone" onClick={() => tap(() => claim(), "claim")}>
          CLAIM
        </button>
      </div>
    </div>
  );
}

function BriefOverlay() {
  const card = useNidus((s) => s.briefing[0]);
  const dismiss = useNidus((s) => s.dismissBrief);
  useEffect(() => {
    const t = window.setTimeout(() => dismiss(), 3200);
    return () => window.clearTimeout(t);
  }, [card?.id, dismiss]);
  if (!card) return null;
  return (
    <button type="button" data-chrome className="nidus-panel absolute inset-x-0 top-20 z-20 mx-auto w-[min(92%,22rem)] p-2.5 text-left" onClick={() => dismiss()}>
      {card.portrait && <img src={card.portrait} alt="" className="mb-1.5 h-12 w-9 object-cover" crossOrigin="anonymous" />}
      <p className="font-display text-[0.6rem] tracking-[0.24em] text-gilt">{card.stamp}</p>
      <p className="font-display text-base">{card.headline}</p>
      <p className="text-[0.8rem] text-muted">{card.line}</p>
    </button>
  );
}
