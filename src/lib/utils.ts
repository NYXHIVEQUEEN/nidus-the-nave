import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `${(n / 1000).toFixed(1)}K`;
  if (abs >= 1000) return `${(n / 1000).toFixed(1)}K`;
  if (abs >= 10) return n.toFixed(0);
  if (abs >= 1) return n.toFixed(1);
  return n.toFixed(1);
}

export function fmtTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  if (m > 0) return `${m}m ${r.toString().padStart(2, "0")}s`;
  return `${r}s`;
}
