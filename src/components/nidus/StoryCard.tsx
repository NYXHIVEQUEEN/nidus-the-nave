import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNidus } from "@/lib/nidus/store";
import { STORY, STORY_DONE, WELCOME, storyBeat } from "@/lib/nidus/story";
import { chime, unlockAudio } from "@/lib/nidus/audio";

const REDUCE = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function clock(sec: number) {
  const s = Math.max(0, Math.ceil(sec));
  return s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : `${s}s`;
}

// Narration types itself out a few letters at a time; a tap finishes it.
function useTyped(text: string) {
  const [n, setN] = useState(REDUCE ? text.length : 0);
  useEffect(() => {
    if (REDUCE) {
      setN(text.length);
      return;
    }
    setN(0);
    const id = window.setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          window.clearInterval(id);
          return v;
        }
        return v + 2;
      });
    }, 34);
    return () => window.clearInterval(id);
  }, [text]);
  return { shown: text.slice(0, n), full: n >= text.length, finish: () => setN(text.length) };
}

/** The Queen's thank-you, once, on a brand-new hive. */
export function StoryWelcome() {
  const ack = useNidus((s) => s.storyAck);
  const skip = useNidus((s) => s.storySkip);
  const show = useNidus((s) => s.storyStep === 0 && !s.storyQuiet && !s.waking);
  if (!show) return null;
  return (
    <div className="pointer-events-auto absolute inset-0 z-[45] flex items-center justify-center bg-void/75 p-5 backdrop-blur-[2px]" data-chrome>
      <div className="nidus-card nidus-story-in w-full max-w-sm px-5 py-6 text-center">
        <img src="/nidus/studio-logo.webp" alt="Nytheria Nyx" className="mx-auto mb-3 h-24 w-24 object-contain" />
        <p className="font-display text-[0.8rem] tracking-[0.34em] text-gilt">{WELCOME.title}</p>
        <div className="mt-3 flex flex-col gap-2 text-[0.82rem] leading-relaxed text-bone/90">
          {WELCOME.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
        <p className="mt-4 font-display text-[0.72rem] tracking-[0.3em] text-blood-bright">— {WELCOME.sign}</p>
        <button
          type="button"
          className="nidus-cut nidus-cut-on nidus-pulse mt-5 min-h-12 w-full font-display text-sm tracking-[0.3em]"
          onClick={() => {
            unlockAudio();
            chime("wake");
            ack();
          }}
        >
          BEGIN
        </button>
        <button type="button" className="mt-3 min-h-9 font-display text-[0.58rem] tracking-[0.22em] text-muted underline-offset-4 hover:underline" onClick={skip}>
          SKIP THE STORY · I KNOW THE NAVE
        </button>
      </div>
    </div>
  );
}

/** One story beat at a time: what happened, what to do next, and how close it is. */
export function StoryCard({ hidden }: { hidden: boolean }) {
  const s = useNidus();
  const ack = useNidus((x) => x.storyAck);
  const skip = useNidus((x) => x.storySkip);
  const setTab = useNidus((x) => x.setTab);
  const step = s.storyStep;
  const beat = storyBeat(s);
  const [open, setOpen] = useState(true);
  const [earned, setEarned] = useState<string | null>(null);
  const prev = useRef(step);
  const typed = useTyped(beat?.line ?? "");

  useEffect(() => {
    if (step === prev.current) return;
    const done = STORY[prev.current];
    prev.current = step;
    setOpen(true);
    if (done?.rewardLabel) {
      setEarned(done.rewardLabel);
      chime("claim");
    } else if (step > 1) chime("snap");
    const t = window.setTimeout(() => setEarned(null), 7000);
    return () => window.clearTimeout(t);
  }, [step]);

  // Fold to a slim strip once the line has been read, so the nave stays in view.
  useEffect(() => {
    if (!open || !typed.full || beat?.ack) return;
    const t = window.setTimeout(() => setOpen(false), 9000);
    return () => window.clearTimeout(t);
  }, [open, typed.full, beat?.ack, step]);

  if (s.storyQuiet || step >= STORY_DONE || !beat) return null;
  if (beat.id === "welcome" || hidden) return null;

  const meter = beat.meter?.(s, Date.now()) ?? null;
  const pct = meter ? Math.min(100, Math.round((meter.have / Math.max(1, meter.need)) * 100)) : null;
  const away = s.tab !== beat.tab;

  if (!open) {
    return (
      <button
        type="button"
        data-chrome
        onClick={() => setOpen(true)}
        className="nidus-card pointer-events-auto ml-9 mr-2 mt-1 flex max-w-[24rem] items-center gap-2 px-2 py-1 text-left"
        aria-label={`${beat.title}. ${beat.task}`}
      >
        <span className="font-display text-[0.6rem] tracking-[0.18em] text-blood-bright">{beat.numeral}</span>
        <span className="min-w-0 flex-1 truncate font-display text-[0.6rem] tracking-[0.14em] text-bone">{beat.task}</span>
        {pct !== null && <span className="font-display text-[0.6rem] tabular-nums text-venom">{pct}%</span>}
        <ChevronDown className="size-3 shrink-0 text-muted" />
      </button>
    );
  }

  return (
    <div data-chrome className="nidus-card nidus-story-in pointer-events-auto ml-9 mr-2 mt-1 max-w-[24rem] px-3 py-2" onClick={typed.finish}>
      <div className="flex items-center gap-2">
        <span className="font-display text-[0.62rem] tracking-[0.2em] text-blood-bright">{beat.numeral}</span>
        <p className="min-w-0 flex-1 font-display text-[0.72rem] tracking-[0.22em] text-gilt">{beat.title}</p>
        {!beat.ack && (
          <button type="button" className="-m-1 p-1 text-muted" aria-label="Fold the story" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>
            <ChevronUp className="size-3.5" />
          </button>
        )}
      </div>
      {earned && (
        <p className="nidus-story-in mt-1 inline-block border border-venom/50 bg-venom/10 px-1.5 py-0.5 font-display text-[0.55rem] tracking-[0.16em] text-venom">EARNED · {earned}</p>
      )}
      <p className="mt-1 min-h-[2.4em] text-[0.74rem] leading-snug text-bone/90">
        {typed.shown}
        {!typed.full && <span className="nidus-caret">▍</span>}
      </p>
      {beat.ack ? (
        <button
          type="button"
          className="nidus-cut nidus-cut-on mt-2 min-h-10 w-full font-display text-[0.7rem] tracking-[0.26em]"
          onClick={(e) => {
            e.stopPropagation();
            chime("claim");
            ack();
          }}
        >
          {beat.task}
        </button>
      ) : (
        <>
          <div className="mt-1.5 flex items-center gap-2">
            <p className="min-w-0 flex-1 font-display text-[0.62rem] tracking-[0.14em] text-gilt">▸ {beat.task}</p>
            {away && (
              <button
                type="button"
                className="nidus-cut nidus-cut-on nidus-pulse min-h-8 px-3 font-display text-[0.58rem] tracking-[0.2em]"
                onClick={(e) => {
                  e.stopPropagation();
                  setTab(beat.tab);
                }}
              >
                GO
              </button>
            )}
          </div>
          {meter && pct !== null && (
            <div className="mt-1.5">
              <div className="h-1 w-full overflow-hidden bg-iron">
                <div className="h-full bg-venom motion-safe:transition-[width] motion-safe:duration-300" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-0.5 flex justify-between font-display text-[0.52rem] tabular-nums tracking-[0.14em] text-muted">
                <span>{meter.unit === "%" ? `${pct}%` : `${Math.floor(meter.have)} / ${meter.need} ${meter.unit}`}</span>
                <span className={cn(meter.eta === 0 && "text-venom")}>{meter.eta === 0 ? "READY" : meter.eta !== null ? `≈ ${clock(meter.eta)}` : ""}</span>
              </p>
            </div>
          )}
          <button
            type="button"
            className="mt-1 font-display text-[0.5rem] tracking-[0.2em] text-muted/70"
            onClick={(e) => {
              e.stopPropagation();
              skip();
            }}
          >
            HIDE THE STORY
          </button>
        </>
      )}
    </div>
  );
}
