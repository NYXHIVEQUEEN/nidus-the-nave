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

const SLOW_MS = 2800;

function cacheable(path) {
  return (
    path.startsWith("/nidus/") ||
    path.startsWith("/fonts/") ||
    path.startsWith("/icons/") ||
    path.startsWith("/assets/") ||
    KEEP.includes(path)
  );
}

async function fromCache(req) {
  const hit = await caches.match(req);
  if (hit) return hit;
  if (req.mode === "navigate") return caches.match("/");
  return undefined;
}

// Network first. If the network is slow and a copy is cached, use the copy; with no copy, keep waiting
// for the network instead of failing (first visits on slow phones).
async function serve(req, url) {
  const net = fetch(req).then((res) => {
    if (res.ok && cacheable(url.pathname)) {
      const copy = res.clone();
      caches.open(SHELL).then((c) => c.put(req, copy)).catch(() => {});
    }
    return res;
  });
  net.catch(() => {});
  let timer;
  const slow = new Promise((resolve) => {
    timer = setTimeout(() => resolve("slow"), SLOW_MS);
  });
  try {
    const first = await Promise.race([net, slow]);
    if (first !== "slow" && first.ok) return first;
    const hit = await fromCache(req);
    if (hit) return hit;
    return first === "slow" ? await net : first;
  } catch {
    const hit = await fromCache(req);
    if (hit) return hit;
    return new Response("NIDUS", { status: 504, headers: { "content-type": "text/plain" } });
  } finally {
    clearTimeout(timer);
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (req.headers.has("range")) return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  event.respondWith(serve(req, url));
});
