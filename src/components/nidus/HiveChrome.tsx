import { useEffect, useState } from "react";
import {
  Aperture,
  ChevronUp,
  Eye,
  EyeOff,
  HelpCircle,
  Pause,
  RotateCw,
  Settings2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GUIDES, firstWhisper, type GuideId } from "@/lib/nidus/guide";
import {
  getPrefs,
  helpSeen,
  markHelp,
  patchPrefs,
  subscribeSpin,
  toggleSpinPaused,
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

export function LeftRail({
  muted,
  spinPaused,
  collapsed,
  helpPulse,
  onHelp,
  onView,
  onRite,
  onMute,
  onCollapse,
}: {
  muted: boolean;
  spinPaused: boolean;
  collapsed: boolean;
  helpPulse: boolean;
  onHelp: () => void;
  onView: () => void;
  onRite: () => void;
  onMute: () => void;
  onCollapse: () => void;
}) {
  return (
    <nav
      data-chrome
      className="pointer-events-auto absolute left-2 top-[max(3.6rem,calc(env(safe-area-inset-top)+2.8rem))] z-20 flex flex-col gap-1"
    >
      <RailBtn label="?" title="This screen — verbs only." pulse={helpPulse} onClick={onHelp}>
        <HelpCircle className="size-3.5" />
      </RailBtn>
      <RailBtn label="VIEW" title="Distance, field, shots." onClick={onView}>
        <Aperture className="size-3.5" />
      </RailBtn>
      <RailBtn label="RITE" title="Lab, save pews, music." onClick={onRite}>
        <Settings2 className="size-3.5" />
      </RailBtn>
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
        onClick={onMute}
      >
        {muted ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
      </RailBtn>
      <RailBtn
        label={collapsed ? "SHOW" : "HIDE"}
        title="Fold chrome. Watch the nave."
        on={collapsed}
        onClick={onCollapse}
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
    <div className={cn("pointer-events-auto max-h-[56dvh] overflow-y-auto border border-gilt/40 bg-nave/95 p-3 shadow-[0_0_24px_#0c0a09]", className ?? "absolute inset-x-12 bottom-16 z-40")} data-chrome>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="font-display text-sm tracking-[0.28em] text-gilt">{g.title}</p>
        <button type="button" className="font-display text-[0.65rem] tracking-[0.18em] text-muted" onClick={onClose}>
          GOT IT
        </button>
      </div>
      <p className="mb-2 text-[0.75rem] text-bone">{g.blurb}</p>
      <ul className="flex flex-col gap-1.5">
        {g.verbs.map((v) => (
          <li key={v.id} className="flex items-baseline gap-2 border-b border-border/60 pb-1">
            <span className="w-16 shrink-0 font-display text-[0.62rem] tracking-[0.16em] text-gilt">{v.label}</span>
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
}: {
  goal: string;
  stage: { n: number; of: number; name: string };
  collapsed: boolean;
  onExpand: () => void;
}) {
  return (
    <button
      type="button"
      data-chrome
      onClick={onExpand}
      className={cn(
        "pointer-events-auto mx-auto flex max-w-[22rem] items-center gap-2 border border-gilt/35 bg-nave/80 px-2 py-1",
        collapsed && "mb-1",
      )}
    >
      <span className="font-display text-[0.58rem] tabular-nums tracking-[0.16em] text-gilt">
        {stage.n}/{stage.of} {stage.name}
      </span>
      <span className="min-w-0 flex-1 truncate text-center font-display text-[0.65rem] tracking-[0.18em] text-gilt">{goal}</span>
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
