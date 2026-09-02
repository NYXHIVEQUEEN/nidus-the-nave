import { useEffect, useState } from "react";
import {
  Aperture,
  BookOpen,
  ChevronUp,
  Eye,
  EyeOff,
  FlaskConical,
  HelpCircle,
  Pause,
  RotateCw,
  Save,
  Settings2,
  SlidersHorizontal,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GUIDES, firstWhisper, type GuideId } from "@/lib/nidus/guide";
import {
  applyCamPreset,
  CAM_PRESETS,
  getPrefs,
  helpSeen,
  markHelp,
  patchPrefs,
  subscribeSpin,
  toggleSpinPaused,
  type CamPresetId,
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
        "nidus-cut flex h-11 w-11 flex-col items-center justify-center text-bone",
        on ? "nidus-cut-on" : "",
        pulse && "nidus-pulse",
      )}
    >
      {children}
      <span className="mt-0.5 font-display text-[0.42rem] tracking-[0.14em]">{label}</span>
    </button>
  );
}

export function StatusChip({
  kind,
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
  onHelp,
  onRitePane,
  onMute,
  onCollapse,
  onStay,
}: {
  muted: boolean;
  spinPaused: boolean;
  collapsed: boolean;
  helpPulse: boolean;
  onHelp: () => void;
  onRitePane: (pane: "opt" | "view" | "codex" | "save") => void;
  onMute: () => void;
  onCollapse: () => void;
  onStay: () => void;
}) {
  const [fly, setFly] = useState<null | "view" | "rite">(null);
  const prefs = useSyncPrefs();
  const presetOn = (id: CamPresetId) => {
    const p = CAM_PRESETS[id];
    return Math.abs(prefs.camDist - p.camDist) < 0.6 && Math.abs(prefs.camFov - p.camFov) < 1.5;
  };
  const openFly = (id: "view" | "rite") => {
    onStay();
    setFly((cur) => (cur === id ? null : id));
  };

  return (
    <nav
      data-chrome
      className="nidus-rail pointer-events-auto absolute left-2 top-[max(3.6rem,calc(env(safe-area-inset-top)+2.8rem))] z-20 flex flex-col gap-1 overflow-visible"
    >
      <RailBtn label="?" title="This screen — verbs only." pulse={helpPulse} onClick={onHelp}>
        <HelpCircle className="size-3.5" />
      </RailBtn>
      <div className="relative">
        <RailBtn
          label="VIEW"
          title="Shots. Nested — CLOSE to VOID."
          on={fly === "view"}
          onClick={() => openFly("view")}
        >
          <Aperture className="size-3.5" />
        </RailBtn>
        {fly === "view" && (
          <div className="nidus-fly" role="menu" aria-label="View shots">
            {(Object.keys(CAM_PRESETS) as CamPresetId[]).map((id) => {
              const p = CAM_PRESETS[id];
              return (
                <RailBtn
                  key={id}
                  label={p.label}
                  title={p.why}
                  on={presetOn(id)}
                  onClick={() => {
                    applyCamPreset(id);
                    setFly(null);
                  }}
                >
                  <Aperture className="size-3.5" />
                </RailBtn>
              );
            })}
            <RailBtn
              label="LENS"
              title="Distance, field, pinch."
              onClick={() => {
                setFly(null);
                onRitePane("view");
              }}
            >
              <SlidersHorizontal className="size-3.5" />
            </RailBtn>
          </div>
        )}
      </div>
      <div className="relative">
        <RailBtn
          label="RITE"
          title="Lab, pews, music. Nested."
          on={fly === "rite"}
          onClick={() => openFly("rite")}
        >
          <Settings2 className="size-3.5" />
        </RailBtn>
        {fly === "rite" && (
          <div className="nidus-fly" role="menu" aria-label="Rite panes">
            <RailBtn
              label="LAB"
              title="Rites and hive mind."
              onClick={() => {
                setFly(null);
                onRitePane("opt");
              }}
            >
              <FlaskConical className="size-3.5" />
            </RailBtn>
            <RailBtn
              label="CODEX"
              title="Dictionary. Not a lecture."
              onClick={() => {
                setFly(null);
                onRitePane("codex");
              }}
            >
              <BookOpen className="size-3.5" />
            </RailBtn>
            <RailBtn
              label="SAVE"
              title="Pews, export, import."
              onClick={() => {
                setFly(null);
                onRitePane("save");
              }}
            >
              <Save className="size-3.5" />
            </RailBtn>
          </div>
        )}
      </div>
      <RailBtn
        label={spinPaused ? "HOLD" : "SPIN"}
        title="Idle orbit. HOLD freezes the nave."
        on={spinPaused}
        onClick={() => toggleSpinPaused()}
      >
        {spinPaused ? <Pause className="size-3.5" /> : <RotateCw className="size-3.5" />}
      </RailBtn>
      <RailBtn
        label={muted ? "MUTE" : "SONG"}
        title="Mute the anthem and the hive."
        on={muted}
        onClick={() => {
          setFly(null);
          onMute();
        }}
      >
        {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
      </RailBtn>
      <RailBtn
        label={collapsed ? "SHOW" : "HIDE"}
        title="Fold chrome. Watch the nave."
        on={collapsed}
        onClick={() => {
          setFly(null);
          onCollapse();
        }}
      >
        {collapsed ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
      </RailBtn>
    </nav>
  );
}

export function GuideSheet({ screen, onClose, className }: { screen: GuideId; onClose: () => void; className?: string }) {
  const g = GUIDES[screen];
  useEffect(() => {
    markHelp(screen as HelpId);
  }, [screen]);
  return (
    <div
      className={cn(
        "nidus-panel pointer-events-auto max-h-[42dvh] overflow-y-auto p-3",
        className ??
          "absolute left-14 top-[max(3.6rem,calc(env(safe-area-inset-top)+2.8rem))] z-40 w-[min(19rem,calc(100vw-4.2rem))]",
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
            <StatusChip>{v.label}</StatusChip>
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
    <p className="pointer-events-none absolute inset-x-14 top-[max(4.6rem,calc(env(safe-area-inset-top)+3.6rem))] z-30 border border-gilt/30 bg-nave/80 px-2 py-1 text-center text-[0.7rem] tracking-[0.08em] text-gilt nidus-whisper">
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
}: {
  goal: string;
  stage: { n: number; of: number; name: string };
  collapsed: boolean;
  onExpand: () => void;
  verb?: string;
}) {
  return (
    <button
      type="button"
      data-chrome
      onClick={onExpand}
      className={cn(
        "nidus-card pointer-events-auto mx-auto flex max-w-[22rem] items-center gap-2 px-2 py-1",
        collapsed && "mb-1",
      )}
      aria-label={verb ? `${goal}. ${verb}` : goal}
    >
      <span className="font-display text-[0.58rem] tabular-nums tracking-[0.16em] text-gilt">
        {stage.n}/{stage.of} {stage.name}
      </span>
      <span className="min-w-0 flex-1 truncate text-center font-display text-[0.65rem] tracking-[0.18em] text-gilt">{goal}</span>
      {verb && <StatusChip kind="open">{verb}</StatusChip>}
      {collapsed && <ChevronUp className="size-3 shrink-0 text-muted" />}
    </button>
  );
}

export function useIdleChrome(locked: boolean) {
  const [collapsed, setCollapsed] = useState(false);
  const [poke, setPoke] = useState(0);
  const prefs = useSyncPrefs();
  const bump = () => {
    setCollapsed(false);
    patchPrefs({ watchNave: false });
    setPoke((n) => n + 1);
  };
  useEffect(() => {
    if (locked || !prefs.autoHide) {
      setCollapsed(false);
      patchPrefs({ watchNave: false });
      return;
    }
    const t = window.setTimeout(() => {
      setCollapsed(true);
      patchPrefs({ watchNave: true });
      if (!helpSeen("idle") && prefs.hints) markHelp("idle");
    }, 8000);
    return () => window.clearTimeout(t);
  }, [poke, locked, prefs.autoHide, prefs.hints]);
  return { collapsed, setCollapsed, bump, autoHide: prefs.autoHide };
}

export function useSyncPrefs() {
  const [, setN] = useState(0);
  useEffect(() => {
    return subscribeSpin(() => setN((n) => n + 1));
  }, []);
  return getPrefs();
}

export function firstLook(id: GuideId, hints: boolean): string | null {
  if (!hints || helpSeen(id as HelpId)) return null;
  return firstWhisper(id);
}

export function muteToggle(muted: boolean, setMutedUi: (v: boolean) => void) {
  setMutedUi(!muted);
  patchPrefs({ muted: !muted });
  syncAudioGains();
}
