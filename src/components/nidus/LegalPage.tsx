import type { ReactNode } from "react";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-dvh bg-void px-5 py-10 text-bone">
      <div className="mx-auto max-w-xl">
        <p className="font-display text-[0.7rem] tracking-[0.28em] text-gilt">NIDUS</p>
        <h1 className="mt-2 font-display text-2xl tracking-[0.18em] text-gilt">{title}</h1>
        <div className="mt-6 space-y-4 text-[0.95rem] leading-relaxed text-bone/90">{children}</div>
        <a href="/" className="mt-10 inline-block min-h-11 border border-gilt/50 px-6 py-2 font-display text-sm tracking-[0.28em] text-gilt">
          RETURN TO THE NAVE
        </a>
        <p className="mt-8 text-[0.7rem] tracking-[0.12em] text-muted">Nytheria Nyx · NYX HIVEQUEEN · 2026</p>
      </div>
    </main>
  );
}
