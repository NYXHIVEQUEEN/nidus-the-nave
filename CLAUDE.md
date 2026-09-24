Read, in order, before any change:

1. `AGENTS.project.md` — the owner's team, safety, and release rules. Highest priority.
2. `AGENTS.nidus.md` — game guardrails, locked art/product, known failures.
3. `AGENTS.md` — the Grok App Builder sandbox template. Its `/workspace`, port, and
   `startup.sh` rules apply only inside the Grok sandbox.

Checks before calling work done: `npx tsc --noEmit`, `npx tsx --test src/lib/nidus/persist.test.ts`,
and a browser pass at 390×844 that never clears localStorage. The 8 failing
`scripts/grok-pwa*` tests belong to the Grok platform and are not ours to edit.
