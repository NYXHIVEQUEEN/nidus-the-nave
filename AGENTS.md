# NIDUS: The Nave — agent guide

Read, in order, before any change:

1. `AGENTS.project.md` — the Hive Queen's team, safety, and release rules. Highest priority.
2. `AGENTS.nidus.md` — game guardrails, locked art and product, known failures.
3. `docs/hull/` — 3D hull craft notes and the GDL acceptance bar.

## Stack

Static web app: Vite + React 19 + TanStack Router (file routes in `src/routes/`) +
Tailwind v4 + zustand + three.js via @react-three/fiber. No server, no accounts,
no database. The build is plain files in `dist/` that any https host can serve,
and the same URL is wrapped as the Android app (Trusted Web Activity).

```
npm install
npm run dev        # http://localhost:8080
npm run typecheck
npm test           # save / economy / billing tests
npm run lint
npm run build      # dist/ + per-page copies for static hosts
```

## Done means

Typecheck clean, tests green, lint without errors, a browser pass at 390×844
that never clears localStorage, and a production build that renders.
