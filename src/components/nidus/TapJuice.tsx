import { useEffect, useRef, useState } from "react";
import type { ActEvent } from "@/lib/nidus/feedback";

type Burst = { id: number; x: number; y: number; hue: string };

const HUE: Record<string, string> = {
  surge: "#1faf5b",
  raid: "#c45a4a",
  claim: "#e4c98f",
  seat: "#e4c98f",
  wake: "#e4c98f",
};

// Sparks where a tap landed and paid off; a shake on the button when it did not.
export function TapJuice() {
  const last = useRef<{ x: number; y: number; el: HTMLElement | null }>({ x: 0, y: 0, el: null });
  const [bursts, setBursts] = useState<Burst[]>([]);
  const seq = useRef(0);

  useEffect(() => {
    const down = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest("button") ?? null;
      last.current = { x: e.clientX, y: e.clientY, el };
    };
    const onAct = (e: Event) => {
      const { kind, ok } = (e as CustomEvent<ActEvent>).detail;
      const { x, y, el } = last.current;
      if (!ok) {
        if (el) {
          el.classList.remove("nidus-deny");
          void el.offsetWidth;
          el.classList.add("nidus-deny");
        }
        navigator.vibrate?.(18);
        return;
      }
      navigator.vibrate?.(6);
      const id = ++seq.current;
      setBursts((b) => [...b.slice(-5), { id, x, y, hue: HUE[kind] ?? "#c4a574" }]);
      window.setTimeout(() => setBursts((b) => b.filter((p) => p.id !== id)), 700);
    };
    window.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("nidus:act", onAct);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("nidus:act", onAct);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden>
      {bursts.map((b) => (
        <span key={b.id} className="nidus-burst" style={{ left: b.x, top: b.y, ["--burst" as string]: b.hue }}>
          {Array.from({ length: 9 }, (_, i) => (
            <i key={i} style={{ ["--a" as string]: `${i * 40 + (b.id % 7) * 5}deg` }} />
          ))}
        </span>
      ))}
    </div>
  );
}
