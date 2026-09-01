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
  berthCap,
  chargeCap,
  expandCost,
  oreCap,
  partsCap,
  nextGoal,
  printCost,
  raidNeed,
  rates,
  throneCap,
  totalSwarm,
} from "@/lib/nidus/content";
import { advise } from "@/lib/nidus/advisor";
import { markCost, markName } from "@/lib/nidus/fleet";
import { chime, resumeAudio, setAmbiance, unlockAudio } from "@/lib/nidus/audio";
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
  sparkHot,
  type GuideId,
} from "@/lib/nidus/guide";
import { cookUnlocked, hiveTitle, MARK_MAX, moltCost, mindTalent, RANK_MAX, SALVAGE_COOK } from "@/lib/nidus/progress";
import { StationMount } from "./StationMount";
import { SettingsPanel } from "./SettingsPanel";
import { GoalDock, GuideSheet, LeftRail, Whisper, muteToggle, useIdleChrome, useSyncPrefs } from "./HiveChrome";
import { getPrefs, getSpinPaused, helpSeen, lookAtRoom, patchPrefs, subscribeSpin } from "@/lib/nidus/view";
import type { Caste, Rarity } from "@/lib/nidus/types";

const rarityColor: Record<Rarity, string> = {
  iron: "text-muted",
  bone: "text-bone",
  gold: "text-gilt",
  relic: "text-venom",
};

function pulse(on: boolean) {
  return on ? "nidus-pulse" : "";
}

function peekHive(): { started: boolean; name: string } {
  if (typeof window === "undefined") return { started: false, name: "" };
  try {
    const raw = localStorage.getItem("nidus.save.v1");
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
  const peek = peekHive();
  const [session, setSession] = useState(peek.started);

  useEffect(() => {
    hydrate();
    let cancelled = false;
    void runBoot((next) => {
      if (!cancelled) setBoot(next);
    });
    const onVis = () => {
      resumeAudio();
      if (document.visibilityState === "hidden") saveNow();
      else tick(Date.now());
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pagehide", saveNow);
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
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pagehide", saveNow);
    };
  }, [hydrate, tick, saveNow]);

  useEffect(() => {
    if (boot.ready && peek.started) {
      if (!started) start();
      setSession(true);
    }
  }, [boot.ready, peek.started, started, start]);

  if (!boot.ready || !session) {
    return (
      <TitleScreen
        boot={boot}
        returning={peek.started}
        hiveName={peek.name}
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
      <img src="/nidus/title.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" crossOrigin="anonymous" />
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
        <p className="max-w-[16rem] text-center text-sm tracking-[0.18em] text-muted">
          {returning ? "THE NAVE HELD. YOU NEVER LEFT." : "LIGHTBRINGER. NIGHTQUEEN. UNYIELDING."}
        </p>
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
  const [riteStart, setRiteStart] = useState<"opt" | "view" | "codex" | "save">("view");
  const [guide, setGuide] = useState<GuideId | null>(null);
  const [whisper, setWhisper] = useState<string | null>(null);
  const [muted, setMuted] = useState(() => getPrefs().muted);
  const prefs = useSyncPrefs();
  const spinPaused = useSyncExternalStore(subscribeSpin, getSpinPaused, getSpinPaused);
  const locked = waking || gift;
  const { collapsed, setCollapsed, bump } = useIdleChrome(locked || riteOpen || Boolean(guide));
  const whispered = useState(() => new Set<string>())[0];
  const s = useNidus();
  const goal = nextGoal(s);
  const stage = hiveStage(s);
  const tip = advise(s);

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

  const openView = () => {
    bump();
    setRiteStart("view");
    setRiteOpen(true);
  };
  const openRite = () => {
    bump();
    setRiteStart("opt");
    setRiteOpen(true);
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-void text-bone">
      <StationMount />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/55 via-transparent to-void/80" />
      <LeftRail
        muted={muted}
        spinPaused={spinPaused}
        collapsed={collapsed}
        helpPulse={!helpSeen(tab)}
        onHelp={() => {
          bump();
          setGuide((g) => (g ? null : tab));
        }}
        onView={openView}
        onRite={openRite}
        onMute={() => muteToggle(muted, setMuted)}
        onCollapse={() => {
          if (collapsed) bump();
          else {
            setCollapsed(true);
            patchPrefs({ watchNave: true });
          }
        }}
      />
      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        <ResourceBar compact={collapsed} />
        <div className="min-h-0 flex-1" />
        <div className="px-3 pb-1">
          <GoalDock goal={goal} stage={stage} collapsed={collapsed} onExpand={bump} />
        </div>
        <div data-chrome className={cn("nidus-sheet", collapsed && "nidus-sheet-hide")}>
          <main className="min-h-0">
            <ActiveTab verb={tip.verb} />
          </main>
        </div>
        <TabBar
          tab={tab}
          setTab={(id) => {
            bump();
            setTab(id);
          }}
        />
      </div>
      {whisper && prefs.hints && <Whisper text={whisper} onDone={() => setWhisper(null)} />}
      {guide && <GuideSheet screen={guide} onClose={() => setGuide(null)} />}
      {riteOpen && (
        <div className="pointer-events-auto absolute inset-x-3 bottom-16 z-30" data-chrome>
          <SettingsPanel start={riteStart} onClose={() => setRiteOpen(false)} />
        </div>
      )}
      {waking && <WakeOverlay />}
      {gift && !waking && <GiftOverlay />}
      {showBrief && !waking && !gift && <BriefOverlay />}
    </div>
  );
}

function ResourceBar({ compact }: { compact: boolean }) {
  const ore = useNidus((s) => s.ore);
  const parts = useNidus((s) => s.parts);
  const charge = useNidus((s) => s.charge);
  const spark = useNidus((s) => s.spark);
  const sparkNeed = useNidus((s) => s.sparkNeed);
  const echo = useNidus((s) => s.echo);
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
  const hot = sparkHot(s);
  return (
    <header className="pointer-events-auto px-3 pt-[max(0.45rem,env(safe-area-inset-top))]" data-chrome>
      <div className={cn("flex items-center justify-between gap-1.5 border border-border bg-nave/80 px-2 backdrop-blur-sm", compact ? "py-1" : "py-1.5")}>
        <button type="button" className="nidus-rank text-left" title="Hive rank" onClick={() => setOpen(open === "RANK" ? null : "RANK")}>
          <p className="text-[0.55rem] tracking-[0.18em] text-muted">RANK</p>
          <p className="font-display text-xs tabular-nums text-gilt">{hiveTitle(hiveRank)}</p>
        </button>
        <Chip label="ORE" value={fmt(ore)} sub={compact ? undefined : `${fmt(r.orePerSec * 60)}/m`} cap={oreCap(s)} cur={ore} onTap={setOpen} />
        <Chip label="PARTS" value={fmt(parts)} sub={compact ? undefined : `${fmt(r.partsPerSec * 60)}/m`} cap={partsCap(s)} cur={parts} onTap={setOpen} />
        <Chip label="CHARGE" value={fmt(charge)} cap={chargeCap(s)} cur={charge} venom starve={starve} onTap={setOpen} />
        <button type="button" className={cn("min-w-[4rem] text-left", hot && "nidus-spark")} onClick={() => setOpen(open === "SPARK" ? null : "SPARK")}>
          <p className="text-[0.55rem] tracking-[0.18em] text-muted">SPARK</p>
          <p className="font-display text-xs tabular-nums text-venom">{waking ? "WOKE" : `${Math.floor(spark)}`}</p>
          <div className="mt-0.5 h-0.5 w-full bg-iron">
            <div className="h-0.5 bg-venom" style={{ width: `${Math.min(100, (spark / sparkNeed) * 100)}%` }} />
          </div>
        </button>
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
              claim();
              chime("wake");
            }}
          >
            <p className="text-[0.55rem] tracking-[0.18em] text-gilt">CLAIM</p>
            <p className="font-display text-[0.62rem] tabular-nums text-bone">{fmt(gift.ore)}</p>
          </button>
        )}
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", fresh ? "bg-venom" : "bg-iron")} title="autosave" />
      </div>
      {open && <p className="px-1 pt-1 text-center text-[0.65rem] text-gilt">{gloss(open)}</p>}
    </header>
  );
}

function Chip({
  label, value, sub, cap, cur, venom, starve, onTap,
}: { label: string; value: string; sub?: string; cap: number; cur: number; venom?: boolean; starve?: boolean; onTap: (k: string | null) => void }) {
  return (
    <button type="button" className={cn("min-w-0 text-left", starve && "nidus-pulse")} onClick={() => onTap(label)}>
      <p className="text-[0.55rem] tracking-[0.18em] text-muted">{label}</p>
      <p className={cn("font-display text-xs tabular-nums", venom ? "text-venom" : "text-bone")}>{value}</p>
      {sub && <p className="text-[0.55rem] tabular-nums text-gilt-dim">{sub}</p>}
      <div className="mt-0.5 h-0.5 w-10 bg-iron">
        <div className={cn("h-0.5", venom ? "bg-venom" : "bg-gilt")} style={{ width: `${Math.min(100, (cur / cap) * 100)}%` }} />
      </div>
    </button>
  );
}

function TabBar({ tab, setTab }: { tab: "hull" | "forge" | "raid" | "minds"; setTab: (id: "hull" | "forge" | "raid" | "minds") => void }) {
  const waking = useNidus((s) => s.waking);
  const raiding = useNidus((s) => Boolean(s.raid));
  const verb = useNidus((s) => advise(s).verb);
  const tabs = [
    { id: "hull" as const, label: "HULL" },
    { id: "forge" as const, label: "FORGE" },
    { id: "raid" as const, label: "RAID" },
    { id: "minds" as const, label: "MINDS" },
  ];
  return (
    <nav data-chrome className="pointer-events-auto grid grid-cols-4 gap-1 border-t border-border bg-nave/95 px-2 pb-[max(0.45rem,env(safe-area-inset-bottom))] pt-1.5">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTab(t.id)}
          className={cn(
            "nidus-cut relative min-h-11 font-display text-[0.7rem] tracking-[0.22em]",
            tab === t.id ? "nidus-cut-on" : "text-muted",
            pulse((t.id === "forge" && verb === "PRINT") || (t.id === "raid" && (verb === "RAID" || verb === "BOOST")) || (t.id === "minds" && verb === "WAKE")),
          )}
        >
          {t.label}
          {t.id === "minds" && waking && <span className="absolute right-2 top-1 h-1.5 w-1.5 rounded-full bg-venom" />}
          {t.id === "raid" && raiding && <span className="absolute right-2 top-1 h-1.5 w-1.5 rounded-full bg-gilt" />}
        </button>
      ))}
    </nav>
  );
}

function ActiveTab({ verb }: { verb: string }) {
  const tab = useNidus((s) => s.tab);
  if (tab === "forge") return <ForgeTab verb={verb} />;
  if (tab === "raid") return <RaidTab verb={verb} />;
  if (tab === "minds") return <MindsTab />;
  return <HullTab verb={verb} />;
}

function HullTab({ verb }: { verb: string }) {
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
  const now = Date.now();
  const surging = now < surgeUntil;
  const slagReady = now >= slagAt;
  const s = useNidus();
  const full = packed(s);
  const nextRoom = ROOMS.find((r) => r.id !== "foundry" && !rooms[r.id].built && !roomLockWhy(s, r.id));
  const [why, setWhy] = useState<string | null>(null);
  const strip = ROOMS.filter((r) => {
    if (r.id === "foundry") return true;
    const st = rooms[r.id];
    if (st?.built || queued === r.id) return true;
    return !roomLockWhy(s, r.id);
  });
  const tease = ROOMS.find((r) => !strip.some((x) => x.id === r.id) && Boolean(roomLockWhy(s, r.id)));
  const shown = tease ? [...strip, tease] : strip;
  const nested = ROOMS.length - shown.length;

  return (
    <div className="pointer-events-none flex flex-col justify-end gap-1.5 p-2">
      {s.orders?.length > 0 && (
        <div className="pointer-events-auto flex gap-1.5 overflow-x-auto">
          {s.orders.map((o) => (
            <div key={o.id} className="min-w-32 shrink-0 border border-gilt/30 bg-nave/80 px-1.5 py-1">
              <p className="font-display text-[0.55rem] tracking-[0.14em] text-gilt">{o.label}</p>
              <p className="text-[0.6rem] text-muted">{o.hint}</p>
              <div className="mt-0.5 h-0.5 bg-iron">
                <div className="h-0.5 bg-venom" style={{ width: `${Math.min(100, (o.have / o.need) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="pointer-events-auto overflow-x-auto">
        <div className="flex gap-1.5">
          {shown.map((r) => {
            const st = rooms[r.id];
            const lock = roomLockWhy(s, r.id);
            const ranking = s.rankingRoom === r.id;
            return (
              <button
                key={r.id}
                type="button"
                disabled={Boolean(lock) || ((st.rank ?? 0) >= RANK_MAX && st.built)}
                title={lock || r.bonus}
                onClick={() => {
                  lookAtRoom(r.id);
                  setWhy(`${r.label} · ${r.bonus}`);
                  queue(r.id);
                  chime("snap");
                }}
                className={cn(
                  "nidus-cut min-w-[4.6rem] shrink-0 px-1.5 py-1.5 text-left",
                  st.built ? "nidus-cut-gilt" : queued === r.id ? "text-venom" : lock ? "text-iron" : "text-bone",
                  pulse(nextRoom?.id === r.id && verb === "BUILD"),
                )}
              >
                <p className="font-display text-[0.58rem] tracking-[0.14em]">{r.label}</p>
                <p className="text-[0.58rem] tabular-nums text-muted">
                  {st.built
                    ? ranking
                      ? `R${st.rank ?? 0}…`
                      : `R${st.rank ?? 0}`
                    : lock
                      ? lock
                      : `${Math.floor((st.progress / r.work) * 100)}%`}
                </p>
                <p className="max-w-[6.4rem] truncate text-[0.5rem] tracking-[0.04em] text-gilt-dim">{r.bonus}</p>
              </button>
            );
          })}
          {nested > 0 && (
            <p className="self-center px-1 font-display text-[0.5rem] tracking-[0.14em] text-muted">+{nested} NESTS</p>
          )}
        </div>
        {why && <p className="px-1 pt-1 text-center text-[0.65rem] text-gilt">{why}</p>}
      </div>
      <div className="pointer-events-auto flex gap-1.5">
        <button
          type="button"
          disabled={surging}
          onClick={() => {
            surge();
            chime("surge");
          }}
          className={cn("nidus-cut min-h-11 flex-1 font-display text-[0.75rem] tracking-[0.32em]", surging ? "nidus-cut-venom" : "nidus-cut-on", pulse(verb === "SURGE"))}
        >
          <span className="inline-flex items-center justify-center gap-1"><Zap className="size-3.5" />{surging ? "SURGING" : "SURGE"}</span>
        </button>
        <button
          type="button"
          disabled={!slagReady}
          title="Spare ore and a lick of spark. Seven second cool."
          onClick={() => {
            slag();
            chime("print");
          }}
          className={cn("nidus-cut min-h-11 px-3 font-display text-[0.7rem] tracking-[0.16em]", slagReady ? "nidus-cut-gilt" : "text-muted")}
        >
          <span className="inline-flex items-center gap-1"><Flame className="size-3.5" />SLAG</span>
        </button>
        <button
          type="button"
          title="Hive mind stamps, raises, rites, and raids."
          onClick={() => toggleScripts()}
          className={cn("nidus-cut min-h-11 px-3 font-display text-[0.7rem] tracking-[0.14em]", scripts ? "nidus-cut-venom" : "text-muted")}
        >
          <span className="inline-flex items-center gap-1"><Brain className="size-3.5" />{scripts ? "MIND" : "HIVE"}</span>
        </button>
        {tech.moltlock.done && echo >= moltCost(s) && (
          <button type="button" onClick={() => doMolt()} className="min-h-11 border border-gilt px-3 font-display text-[0.7rem] tracking-[0.2em] text-gilt">
            MOLT {moltCost(s)}E
          </button>
        )}
      </div>
      <p className="pointer-events-none text-center text-[0.58rem] tracking-[0.16em] text-muted">
        {totalSwarm(s)}/{berthCap(s)}
        {full ? " PACKED" : " BERTHS"} · {s.minds.filter((m) => m.alive).length} MINDS · L{moltLayer}
      </p>
      {nextRoom && (
        <p className="pointer-events-none text-center font-display text-[0.55rem] tracking-[0.18em] text-gilt">
          NEXT GROWS · {nextRoom.label} · {nextRoom.bonus}
        </p>
      )}
    </div>
  );
}

function ForgeTab({ verb }: { verb: string }) {
  const printCaste = useNidus((s) => s.printCaste);
  const setPrintCaste = useNidus((s) => s.setPrintCaste);
  const print = useNidus((s) => s.print);
  const autoPrint = useNidus((s) => s.autoPrint);
  const toggleAuto = useNidus((s) => s.toggleAuto);
  const swarm = useNidus((s) => s.swarm);
  const markHull = useNidus((s) => s.markHull);
  const expandPop = useNidus((s) => s.expandPop);
  const hullMark = useNidus((s) => s.hullMark);
  const s = useNidus();
  const cost = printCost(s);
  const cap = berthCap(s);
  const pop = expandCost(s);
  const full = packed(s);
  const icons: Record<Caste, typeof Pickaxe> = { miner: Pickaxe, fab: Factory, builder: Hammer, lab: FlaskConical, striker: Swords };
  return (
    <div className="pointer-events-auto flex flex-col justify-end gap-2 p-2" data-chrome>
      <div className="border border-border bg-nave/90 p-2 backdrop-blur-sm">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="font-display text-[0.65rem] tracking-[0.24em] text-gilt">SWARM</p>
          <p className={cn("font-display text-[0.58rem] tabular-nums tracking-[0.14em]", full ? "text-blood-bright" : "text-muted")}>
            {totalSwarm(s)}/{cap}
          </p>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {CASTES.map((c) => {
            const Icon = icons[c.id];
            const on = printCaste === c.id;
            const mk = hullMark[c.id] ?? 0;
            return (
              <button key={c.id} type="button" onClick={() => setPrintCaste(c.id)} className={cn("nidus-cut flex min-h-14 flex-col items-center justify-center gap-0.5", on ? "nidus-cut-on" : "")}>
                <Icon className="size-3.5 text-gilt" />
                <span className="font-display text-[0.52rem] tracking-[0.12em]">{c.label}</span>
                <span className="font-display text-base tabular-nums leading-none">{swarm[c.id]}</span>
                <span className="text-[0.5rem] text-muted">{markName(mk)}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-center text-[0.65rem] tabular-nums text-muted">
          {cost.ore}o · {cost.parts}p
        </p>
        <div className="mt-1.5 flex gap-1.5">
          <button
            type="button"
            disabled={s.ore < pop.ore || s.parts < pop.parts}
            title="Buys berths. Packed swarm stops printing."
            onClick={() => {
              expandPop();
              chime("snap");
            }}
            className={cn("nidus-cut min-h-11 flex-1 font-display text-[0.6rem] tracking-[0.12em] disabled:opacity-40", pulse(full))}
          >
            EXPAND +{pop.add}
          </button>
          <button
            type="button"
            disabled={(hullMark[printCaste] ?? 0) >= MARK_MAX}
            title={`Rank ${CASTES.find((c) => c.id === printCaste)?.label}. ${markCost(hullMark[printCaste] ?? 0).parts} parts.`}
            onClick={() => markHull(printCaste)}
            className="nidus-cut min-h-11 px-2 font-display text-[0.6rem] tracking-[0.12em] text-bone disabled:opacity-40"
          >
            MARK {markCost(hullMark[printCaste] ?? 0).parts}p
          </button>
        </div>
      </div>
      <div className="flex gap-1.5">
        <button type="button" onClick={() => { print(); chime("print"); }} className={cn("nidus-cut nidus-cut-on min-h-11 flex-1 font-display text-[0.8rem] tracking-[0.32em]", pulse(verb === "PRINT"))}>
          PRINT
        </button>
        <button type="button" title="Stamp while you are gone." onClick={toggleAuto} className={cn("nidus-cut min-h-11 px-3 font-display text-[0.7rem] tracking-[0.16em]", autoPrint ? "nidus-cut-venom" : "text-muted", pulse(verb === "AUTO" && !autoPrint))}>
          AUTO
        </button>
      </div>
    </div>
  );
}

function RaidTab({ verb }: { verb: string }) {
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
  return (
    <div className="pointer-events-auto flex max-h-[46dvh] flex-col justify-end gap-1.5 overflow-y-auto p-2" data-chrome>
      <div className="flex items-center justify-between border border-border bg-nave/90 px-2 py-1.5">
        <div>
          <p className="font-display text-[0.58rem] tracking-[0.18em] text-gilt">{markName(mark)}</p>
          <p className="text-[0.62rem] tabular-nums text-muted">{strikers} HULLS</p>
        </div>
        <button type="button" disabled={mark >= MARK_MAX || s.ore < cost.ore || s.parts < cost.parts} title={`Bigger strikers. ${cost.parts} parts.`} onClick={() => markHull("striker")} className="min-h-10 border border-gilt px-2 font-display text-[0.6rem] tracking-[0.14em] text-gilt disabled:border-iron disabled:text-muted">
          MARK {cost.parts}p
        </button>
      </div>
      {raidNode && (
        <div className="border border-venom bg-nave/90 p-2">
          <p className="font-display text-[0.65rem] tracking-[0.24em] text-venom">{beat || "ORBIT"} · {RAIDS.find((r) => r.id === raidNode)?.label}</p>
          <p className="mb-1 text-[0.62rem] tabular-nums text-muted">{fmtTime(Math.max(0, (raidEnds - Date.now()) / 1000))}</p>
          <div className="mb-1 h-1 bg-iron">
            <div className="h-1 bg-blood-bright" style={{ width: `${Math.min(100, (raidHp / Math.max(1, raidHpMax)) * 100)}%` }} />
          </div>
          <div className="mb-1.5 h-1 bg-iron">
            <div className="h-1 bg-gilt" style={{ width: `${Math.min(100, (raidHull / Math.max(1, raidHullMax)) * 100)}%` }} />
          </div>
          <div className="flex gap-1.5">
            <button type="button" className={cn("min-h-11 flex-1 font-display text-[0.7rem] tracking-[0.16em]", watching ? "bg-venom text-void" : "border border-border text-bone", pulse(verb === "RAID" && !watching))} onClick={() => watchWell(!watching)}>
              {watching ? "WATCHING" : "WATCH"}
            </button>
            <button type="button" disabled={boosted || s.charge < 8} className={cn("min-h-11 flex-1 font-display text-[0.7rem] tracking-[0.16em]", boosted ? "bg-gilt text-void" : "border border-gilt text-gilt", pulse(verb === "BOOST"))} onClick={() => { boostWell(); chime("surge"); }}>
              {boosted ? "COMMAND" : "BOOST"}
            </button>
          </div>
        </div>
      )}
      {Object.values(s.salvage ?? {}).some((n) => n > 0) && (
        <div className="border border-border bg-nave/80 px-2 py-1">
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
                  onClick={() => useNidus.getState().cook(k)}
                  className={cn("nidus-cut min-h-9 px-2 font-display text-[0.52rem] tracking-[0.12em]", open ? "nidus-cut-gilt" : "text-iron")}
                >
                  {spec.label} {k.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {RAIDS.map((node) => {
        const why = raidLockWhy(s, node.id);
        const open = !why;
        const done = cleared.includes(node.id);
        const need = raidNeed(s, node.id);
        const times = s.raidCount?.[node.id] ?? 0;
        return (
          <button key={node.id} type="button" disabled={!open || Boolean(raidNode) || strikers < need} title={why || node.blurb} onClick={() => { send(node.id); chime("raid"); }} className={cn("relative min-h-[4.2rem] overflow-hidden border text-left", open ? "border-border" : "border-iron opacity-55", pulse(open && verb === "RAID" && node.id === "ice" && !raidNode))}>
            <img src={node.image} alt="" className="absolute inset-0 h-full w-full object-cover" crossOrigin="anonymous" />
            <div className="absolute inset-0 bg-gradient-to-r from-void via-void/70 to-void/20" />
            <div className="relative z-10 flex h-full flex-col justify-end p-2">
              <p className="font-display text-sm tracking-[0.16em]">{node.label}</p>
              <p className="text-[0.62rem] tabular-nums text-muted">
                {open ? `${need} ${markName(mark)} · ${fmtTime(node.seconds)}` : why}
                {done ? (times > 1 ? ` · ×${times}` : " · CLEARED") : ""}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function MindsTab() {
  const minds = useNidus((s) => s.minds);
  const selected = useNidus((s) => s.selectedMind);
  const selectMind = useNidus((s) => s.selectMind);
  const setJob = useNidus((s) => s.setJob);
  const seat = useNidus((s) => s.seat);
  const melt = useNidus((s) => s.melt);
  const waking = useNidus((s) => s.waking);
  const spark = useNidus((s) => s.spark);
  const sparkNeed = useNidus((s) => s.sparkNeed);
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
        <p className="mb-1 text-center font-display text-[0.65rem] tracking-[0.24em] text-gilt">PICK A COMMANDER</p>
      </div>
    );
  }

  if (!mind) {
    const pct = Math.min(100, (spark / Math.max(1, sparkNeed)) * 100);
    return (
      <div className="pointer-events-none flex items-end justify-center p-4">
        <div className="nidus-cut w-full max-w-sm bg-nave/85 p-3 text-center">
          <p className="font-display text-[0.7rem] tracking-[0.2em] text-gilt">NO COMMANDER YET</p>
          <p className="mt-1 text-[0.8rem] text-bone">SPARK fills while the swarm works. Full bar. Three bodies. One stays.</p>
          <div className="mt-2 h-1.5 bg-iron">
            <div className="h-1.5 bg-venom" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-[0.65rem] tabular-nums text-muted">{Math.floor(spark)} / {sparkNeed}</p>
        </div>
      </div>
    );
  }

  const spec = FRAMES[mind.frame];
  const post = POSTS[mind.job];
  const born = framePost(mind.frame);
  return (
    <div className="pointer-events-auto flex flex-col justify-end gap-1.5 p-2" data-chrome>
      <div className="relative overflow-hidden border border-gilt/30 bg-nave/90">
        <img src={mind.portrait} alt="" className="h-36 w-full object-cover object-top" crossOrigin="anonymous" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void to-transparent p-2">
          <p className="font-display text-[0.55rem] tracking-[0.22em] text-gilt">COMMANDER</p>
          <h2 className="font-display text-2xl leading-none">{mind.name}</h2>
          <p className={cn("font-display text-[0.65rem] tracking-[0.16em]", rarityColor[mind.rarity])}>
            {spec.label} · BORN {born.label} · NOW {post.label}
          </p>
          <p className="text-[0.75rem] text-bone">{mindPostLine(mind)}</p>
          {mindTalent(mind.level) && (
            <p className="font-display text-[0.55rem] tracking-[0.14em] text-venom">{mindTalent(mind.level)?.label}</p>
          )}
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto">
        {live.map((m) => (
          <button key={m.id} type="button" title={`${m.name} · ${POSTS[m.job].label}`} onClick={() => selectMind(m.id)} className={cn("h-12 w-10 shrink-0 overflow-hidden border", m.id === mind.id ? "border-gilt" : "border-border")}>
            <img src={m.portrait} alt="" className="h-full w-full object-cover" crossOrigin="anonymous" />
          </button>
        ))}
        {Array.from({ length: Math.max(0, throneCap(s) - live.length) }).map((_, i) => (
          <div key={i} className="h-12 w-10 shrink-0 border border-dashed border-iron" />
        ))}
      </div>
      <p className="text-center text-[0.65rem] text-muted">POST — seated multiplies that rate. {mind.fracture}</p>
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
      <div className="flex gap-1.5">
        <button type="button" className="nidus-cut min-h-11 flex-1 font-display text-[0.62rem] tracking-[0.12em]" onClick={() => seat(mind.id)}>
          {mind.seated ? "UNSEAT · HALF" : "SEAT · FULL"}
        </button>
        <button
          type="button"
          disabled={!mind.wounded || s.charge < (s.tech.flesh2?.done ? 2 : s.tech.mindheal?.done ? 4 : 8)}
          title="Charge mends a wound."
          className="nidus-cut min-h-11 px-2 font-display text-[0.62rem] tracking-[0.12em] text-venom disabled:opacity-40"
          onClick={() => {
            useNidus.getState().heal(mind.id);
            chime("wake");
          }}
        >
          HEAL
        </button>
        <button
          type="button"
          disabled={s.echo < 3}
          title="Spend 3 Echo to rank them."
          className="nidus-cut min-h-11 px-2 font-display text-[0.62rem] tracking-[0.12em] text-gilt disabled:opacity-40"
          onClick={() => useNidus.getState().promote(mind.id)}
        >
          MARK
        </button>
        <button type="button" className="nidus-cut min-h-11 px-2 font-display text-[0.62rem] tracking-[0.12em] text-blood-bright" onClick={() => melt(mind.id)}>
          UNMAKE
        </button>
      </div>
    </div>
  );
}

function WakeOverlay() {
  const waking = useNidus((s) => s.waking);
  const pick = useNidus((s) => s.pickWake);
  if (!waking) return null;
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end bg-void/80 p-3" data-chrome>
      <p className="mb-1 text-center font-display text-[0.7rem] tracking-[0.24em] text-gilt">THREE COMMANDERS. ONE POST.</p>
      <p className="mb-2 text-center text-[0.7rem] text-muted">Pick the job you need. The rest ash.</p>
      <div className="grid grid-cols-3 gap-2">
        {waking.map((c, i) => {
          const post = framePost(c.frame);
          const top = (Object.entries(c.stats) as [string, number][]).sort((a, b) => b[1] - a[1])[0];
          return (
            <button key={c.name + i} type="button" onClick={() => { pick(i); chime("wake"); }} className="nidus-cut overflow-hidden bg-nave text-left">
              <img src={c.portrait} alt="" className="h-28 w-full object-cover object-top" crossOrigin="anonymous" />
              <div className="p-1.5">
                <p className="font-display text-[0.7rem] tracking-[0.16em] text-gilt">{post.label}</p>
                <p className={cn("font-display text-[0.58rem] tracking-[0.12em]", rarityColor[c.rarity])}>{FRAMES[c.frame].label}</p>
                <p className="font-display text-sm leading-tight">{c.name}</p>
                <p className="text-[0.7rem] text-bone">{post.does}</p>
                <p className="text-[0.6rem] tabular-nums text-muted">{top?.[0].toUpperCase()} {top?.[1]}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GiftOverlay() {
  const gift = useNidus((s) => s.pendingGift);
  const claim = useNidus((s) => s.claimIdle);
  useEffect(() => {
    lookAtRoom("prow");
  }, []);
  if (!gift) return null;
  return (
    <div className="absolute inset-0 z-30 flex items-end justify-center bg-void/55 p-4" data-chrome>
      <div className="w-full max-w-sm border border-gilt bg-nave/95 p-3 nidus-pulse">
        <p className="font-display text-[0.65rem] tracking-[0.28em] text-gilt">THE HIVE HELD · {fmtTime(gift.seconds)}</p>
        <p className="mt-1 font-display text-lg tabular-nums text-bone">
          {fmt(gift.ore)} ORE · {fmt(gift.parts)} PARTS · +{gift.spark} SPARK
        </p>
        <button type="button" className="nidus-cut nidus-cut-on mt-3 min-h-11 w-full font-display tracking-[0.28em] text-bone" onClick={() => { claim(); chime("wake"); }}>
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
    <button type="button" data-chrome className="absolute inset-x-0 top-20 z-20 mx-auto w-[min(92%,22rem)] border border-border bg-nave/95 p-2.5 text-left" onClick={() => dismiss()}>
      {card.portrait && <img src={card.portrait} alt="" className="mb-1.5 h-12 w-9 object-cover" crossOrigin="anonymous" />}
      <p className="font-display text-[0.6rem] tracking-[0.24em] text-gilt">{card.stamp}</p>
      <p className="font-display text-base">{card.headline}</p>
      <p className="text-[0.8rem] text-muted">{card.line}</p>
    </button>
  );
}
