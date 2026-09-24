import { useState } from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { APP_VERSION } from "@/lib/nidus/support";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  const [copied, setCopied] = useState(false);
  const report = `NIDUS ${APP_VERSION} crash\n${error?.message ?? "unknown"}\n${navigator.userAgent}`;
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-void px-6 text-center text-bone">
      <p className="font-display text-[0.7rem] tracking-[0.28em] text-gilt">NIDUS</p>
      <h1 className="font-display text-xl tracking-[0.2em] text-blood-bright">THE NAVE STUMBLED</h1>
      <p className="max-w-md text-sm break-words text-muted">{error?.message || "Something broke."}</p>
      <p className="max-w-md text-sm text-bone/90">Your hive is saved on this device. Reload to return.</p>
      <div className="flex gap-2">
        <button
          type="button"
          className="min-h-11 border border-gilt px-5 font-display text-xs tracking-[0.2em] text-gilt"
          onClick={() => window.location.reload()}
        >
          RELOAD
        </button>
        <button
          type="button"
          className="min-h-11 border border-border px-5 font-display text-xs tracking-[0.2em]"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(report);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "COPIED" : "COPY REPORT"}
        </button>
      </div>
    </main>
  );
}
