import { useEffect, useRef, useState } from "react";

const calm = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Eases a displayed number toward its target so counters roll instead of jump.
export function useRolling(target: number, ms = 420): number {
  const [shown, setShown] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    if (!Number.isFinite(target) || calm() || Math.abs(target - cur.current) < 1e-6) {
      cur.current = target;
      setShown(target);
      return;
    }
    const from = cur.current;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      cur.current = from + (target - from) * (1 - Math.pow(1 - k, 3));
      setShown(cur.current);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return shown;
}

// Returns a fresh gain amount when the value jumps up by a noticeable chunk.
export function useGain(value: number, share = 0.04, floor = 3): { amount: number; key: number } | null {
  const prev = useRef(value);
  const [gain, setGain] = useState<{ amount: number; key: number } | null>(null);
  useEffect(() => {
    const d = value - prev.current;
    prev.current = value;
    if (d >= Math.max(floor, Math.abs(value) * share)) setGain({ amount: d, key: performance.now() });
  }, [value, share, floor]);
  useEffect(() => {
    if (!gain) return;
    const t = window.setTimeout(() => setGain(null), 950);
    return () => window.clearTimeout(t);
  }, [gain]);
  return gain;
}
