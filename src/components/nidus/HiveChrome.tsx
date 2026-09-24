import { useEffect, useState } from "react";
import {
  Aperture,
  Crown,
  BookOpen,
  ChevronUp,
  Eye,
  EyeOff,
  HelpCircle,
  LifeBuoy,
  Pause,
  RotateCw,
  Save,
  Settings2,
  Volume2,
  VolumeX,
  Scaling,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RitePane } from "./SettingsPanel";
import { GUIDES, type GuideId } from "@/lib/nidus/guide";
import {
  applyCamPreset,
  CAM_PRESETS,
  cycleDensity,
  DENSITY_LABEL,
  getPrefs,
  helpSeen,
  markHelp,
  patchPrefs,
  resolveDensity,
  subscribeSpin,
  toggleSpinPaused,
  type CamPresetId,
  type DensityResolved,
  type HelpId,
} from "@/lib/nidus/view";
import { syncAudioGains } from "@/lib/nidus/audio";

export function RailBtn({
  label,
  title,
  on,
  pulse,
  onClick,
  children,
}: {
  label: string;
  title: string;
  on?: boolean;
  pulse?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      data-chrome
      title={title}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "nidus-cut nidus-railbtn flex flex-col items-center justify-center text-bone",
        on ? "nidus-cut-on" : "",
        pulse && "nidus-pulse",
      )}
    >
      {children}
      <span className="mt-px max-w-full px-0.5 text-center font-display text-[0.48rem] leading-none tracking-[0.06em]">{label}</span>
    </button>
  );
}

export function StatusChip({
  kind = "open",
  children,
}: {
  kind?: "lit" | "next" | "lock" | "well" | "open";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "nidus-chip",
        kind === "lit" && "nidus-chip-lit",
        kind === "next" && "nidus-chip-next",
        kind === "lock" && "nidus-chip-lock",
        kind === "well" && "nidus-chip-well",
        kind === "open" && "nidus-chip-open",
      )}
    >
      {children}
    </span>
  );
}

export function LeftRail({
  muted,
  spinPaused,
  collapsed,
  helpPulse,
  density,
  onHelp,
  onRitePane,
  onMute,
  onCollapse,
  onStay: _onStay,
  onCourt,
}: {
  muted: boolean;
  spinPaused: boolean;
  collapsed: boolean;
  helpPulse: boolean;
  density: DensityResolved;
  onHelp: () => void;
  onRitePane: (pane: RitePane) => void;
  onMute: () => void;
  onCollapse: () => void;
  onStay: () => void;
  onCourt: () => void;
}) {
  const [fly, setFly] = useState<null | "view" | "rite">(null);
  const prefs = useSyncPrefs();
  const presetOn = (id: CamPresetId) => {
    const p = CAM_PRESETS[id];
    return Math.abs(prefs.camDist - p.camDist) < 0.6 && Math.abs(prefs.camFov - p.camFov) < 1.5;
  };
  const openFly = (id: "view" | "rite") => {
    setFly((cur) => (cur === id ? null : id));
  };

  return (
    <nav
      data-chrome
      className="nidus-rail pointer-events-auto absolute left-2 top-[max(5.6rem,calc(env(safe-area-inset-top)+4.8rem))] z-40 flex flex-row items-start gap-1 overflow-visible"
    >
      <div className="flex flex-col gap-1">
        <RailBtn
          label="COURT"
          title="Sovereigns. Try any hero free."
          onClick={() => {
            setFly(null);
            onCourt();
          }}
        >
          <Crown className="size-3 text-gilt" />
        </RailBtn>
        <RailBtn
          label="HELP"
          title="This screen — what the buttons do."
          pulse={helpPulse}
          onClick={() => {
            setFly(null);
            onHelp();
          }}
        >
          <HelpCircle className="size-3" />
        </RailBtn>
        <RailBtn
          label="VIEW"
          title="Camera shots. CLOSE to VOID."
          on={fly === "view"}
          onClick={() => openFly("view")}
        >
          <Aperture className="size-3" />
        </RailBtn>
        <RailBtn
          label="SETTINGS"
          title="Settings — size, sound, save."
          on={fly === "rite"}
          onClick={() => openFly("rite")}
        >
          <Settings2 className="size-3" />
        </RailBtn>
        <RailBtn
          label={collapsed ? "SHOW" : "HIDE"}
          title="Fold the bottom sheet. Rail stays. SHOW brings it back."
          on={collapsed}
          onClick={() => {
            setFly(null);
            onCollapse();
          }}
        >
          {collapsed ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
        </RailBtn>
      </div>
      {fly === "view" && (
        <div className="flex flex-col gap-1" role="menu" aria-label="View shots">
          {(Object.keys(CAM_PRESETS) as CamPresetId[]).map((id) => {
            const p = CAM_PRESETS[id];
            return (
              <RailBtn
                key={id}
                label={p.label}
                title={p.why}
                on={presetOn(id)}
                onClick={() => applyCamPreset(id)}
              >
                <Aperture className="size-3" />
              </RailBtn>
            );
          })}
        </div>
      )}
      {fly === "rite" && (
        <div className="flex flex-col gap-1" role="menu" aria-label="Settings">
          <RailBtn
            label="SIZE"
            title={`Chrome size. Now ${DENSITY_LABEL[prefs.density]}.`}
            on={density !== "compact"}
            onClick={() => cycleDensity()}
          >
            <Scaling className="size-3" />
          </RailBtn>
          <RailBtn
            label={spinPaused ? "HOLD" : "SPIN"}
            title="Idle orbit. HOLD freezes the nave."
            on={spinPaused}
            onClick={() => toggleSpinPaused()}
          >
            {spinPaused ? <Pause className="size-3" /> : <RotateCw className="size-3" />}
          </RailBtn>
          <RailBtn
            label={muted ? "MUTE" : "SOUND"}
            title="Mute the anthem and the hive."
            on={muted}
            onClick={() => onMute()}
          >
            {muted ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />}
          </RailBtn>
          <RailBtn
            label="CODEX"
            title="Dictionary. Not a lecture."
            onClick={() => onRitePane("codex")}
          >
            <BookOpen className="size-3" />
          </RailBtn>
          <RailBtn
            label="SAVE"
            title="Local pews, export, import."
            onClick={() => onRitePane("save")}
          >
            <Save className="size-3" />
          </RailBtn>
          <RailBtn
            label="FAQ"
            title="Answers, fault report, support."
            onClick={() => onRitePane("help")}
          >
            <LifeBuoy className="size-3" />
          </RailBtn>
        </div>
      )}
    </nav>
  );
}

export function GuideSheet({ screen, onClose, className }: { screen: GuideId; onClose: () => void; className?: string }) {
  const g = GUIDES[screen] ?? GUIDES.hull;
  useEffect(() => {
    markHelp(screen as HelpId);
  }, [screen]);
  return (
    <div
      className={cn(
        "nidus-panel pointer-events-auto max-h-[38dvh] overflow-y-auto p-3",
        className ??
          "absolute left-14 top-[max(5.6rem,calc(env(safe-area-inset-top)+4.8rem))] z-40 w-[min(19rem,calc(100vw-4.2rem))]",
      )}
      data-chrome
    >
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="font-display text-sm tracking-[0.28em] text-gilt">{g.title}</p>
        <button type="button" className="font-display text-[0.65rem] tracking-[0.18em] text-muted" onClick={onClose}>
          GOT IT
        </button>
      </div>
      <p className="mb-2 text-[0.75rem] text-bone">{g.blurb}</p>
      <ul className="flex flex-col gap-1">
        {g.verbs.map((v) => (
          <li key={v.id} className="flex items-baseline gap-2 border-b border-border/60 pb-1">
            <StatusChip kind="open">{v.label}</StatusChip>
            <span className="text-[0.75rem] text-bone">{v.line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Whisper({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 4200);
    return () => window.clearTimeout(t);
  }, [text, onDone]);
  if (!text) return null;
  return (
    <p className="pointer-events-none absolute inset-x-14 top-[max(4.2rem,calc(env(safe-area-inset-top)+3.2rem))] z-30 border border-gilt/30 bg-nave/80 px-2 py-1 text-center text-[0.7rem] tracking-[0.08em] text-gilt nidus-whisper">
      {text}
    </p>
  );
}

export function GoalDock({
  goal,
  stage,
  collapsed,
  onExpand,
  verb,
  why,
  pct,
}: {
  goal: string;
  stage: { n: number; of: number; name: string };
  collapsed: boolean;
  onExpand: () => void;
  verb?: string;
  why?: string;
  pct?: number;
}) {
  return (
    <button
      type="button"
      data-chrome
      onClick={onExpand}
      className={cn(
        "nidus-card pointer-events-auto ml-9 mr-2 flex max-w-[24rem] items-center gap-2 px-2 py-1",
        collapsed && "mb-1",
      )}
      aria-label={verb ? `${goal}. ${verb}` : goal}
      title={why || goal}
    >
      <span className="font-display text-[0.62rem] tabular-nums tracking-[0.16em] text-gilt">
        {stage.n}/{stage.of} {stage.name}
      </span>
      <span className="min-w-0 flex-1 text-center font-display text-[0.7rem] tracking-[0.14em] text-gilt">{goal}</span>
      {typeof pct === "number" && pct > 0 && pct < 100 && (
        <span className="font-display text-[0.62rem] tabular-nums text-venom">{pct}%</span>
      )}
      {verb && <StatusChip kind="open">{verb}</StatusChip>}
      {collapsed && <ChevronUp className="size-3 shrink-0 text-muted" />}
    </button>
  );
}

export function useIdleChrome(_locked: boolean) {
  const [collapsed, setCollapsed] = useState(false);
  const [poke, setPoke] = useState(0);
  const prefs = useSyncPrefs();
  const bump = () => setPoke((n) => n + 1);
  const showChrome = () => {
    setCollapsed(false);
    const p = getPrefs();
    patchPrefs({ watchNave: false, density: p.density === "watch" ? "compact" : p.density });
    setPoke((n) => n + 1);
  };
  const toggleHide = () => {
    const next = !collapsed;
    const p = getPrefs();
    setCollapsed(next);
    patchPrefs({
      watchNave: next,
      ...(collapsed && p.density === "watch" ? { density: "compact" as const } : {}),
    });
    setPoke((n) => n + 1);
  };
  useEffect(() => {
    if (!prefs.autoHide || collapsed) return;
    const t = window.setTimeout(() => {
      setCollapsed(true);
      patchPrefs({ watchNave: true });
      if (!helpSeen("idle") && prefs.hints) markHelp("idle");
    }, 8000);
    return () => window.clearTimeout(t);
  }, [poke, prefs.autoHide, prefs.hints, collapsed]);
  return { collapsed, setCollapsed, bump, showChrome, toggleHide, autoHide: prefs.autoHide };
}

export function useSyncPrefs() {
  const [, setN] = useState(0);
  useEffect(() => {
    return subscribeSpin(() => setN((n) => n + 1));
  }, []);
  return getPrefs();
}

export function useViewport() {
  const [v, setV] = useState({ w: 390, h: 844, landscape: false });
  useEffect(() => {
    const on = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setV({ w, h, landscape: w > h });
    };
    on();
    window.addEventListener("resize", on);
    window.addEventListener("orientationchange", on);
    return () => {
      window.removeEventListener("resize", on);
      window.removeEventListener("orientationchange", on);
    };
  }, []);
  return v;
}

export function useDensity(): DensityResolved {
  const prefs = useSyncPrefs();
  const vp = useViewport();
  return resolveDensity(prefs, vp.w, vp.h, vp.landscape);
}

export function muteToggle(muted: boolean, setMutedUi: (v: boolean) => void) {
  setMutedUi(!muted);
  patchPrefs({ muted: !muted });
  syncAudioGains();
}
