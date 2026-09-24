/* NIDUS: try the net, fall back to cache. Save stays in localStorage. */
const SHELL = "nidus-shell-v3";
const KEEP = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/apple-touch-icon.png",
  "/privacy",
  "/terms",
  "/support",
  "/fonts/barlow-400.woff2",
  "/fonts/barlow-600.woff2",
  "/fonts/barlow-700.woff2",
  "/fonts/cinzel-500.woff2",
  "/fonts/cinzel-700.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      await Promise.all(
        KEEP.map(async (url) => {
          try {
            const res = await fetch(url, { cache: "reload" });
            if (res.ok) await cache.put(url, res);
          } catch {
            /* first visit may be choppy */
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== SHELL).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

function tryNet(req, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetch(req, { signal: ctrl.signal }).finally(() => clearTimeout(t));
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    (async () => {
      try {
        const res = await tryNet(req, 2800);
        if (res && res.ok) {
          const copy = res.clone();
          const path = url.pathname;
          if (
            path.startsWith("/nidus/") ||
            path.startsWith("/fonts/") ||
            path.startsWith("/icons/") ||
            path.startsWith("/assets/") ||
            KEEP.includes(path)
          ) {
            caches.open(SHELL).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        }
      } catch {
        /* fall through */
      }
      const hit = await caches.match(req);
      if (hit) return hit;
      if (req.mode === "navigate") {
        const index = await caches.match("/");
        if (index) return index;
      }
      return new Response("NIDUS", { status: 504, headers: { "content-type": "text/plain" } });
    })(),
  );
});
