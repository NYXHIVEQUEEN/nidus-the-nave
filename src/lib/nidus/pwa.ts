export function registerNidusPwa() {
  if (typeof window === "undefined") return;
  watchLink();
  if (!("serviceWorker" in navigator)) return;
  if (!window.isSecureContext) return;
  if (import.meta.env.DEV) return;
  const register = () => navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  // The hive mounts after the load event has usually fired, so listening for it alone never registers.
  if (document.readyState === "complete") void register();
  else window.addEventListener("load", () => void register(), { once: true });
}

/** Try the net, never block the hive. Offline uses the same local save and tick. */
function watchLink() {
  const probe = () => {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => ctrl.abort(), 2500);
    fetch("/", { method: "HEAD", cache: "no-store", signal: ctrl.signal })
      .catch(() => {})
      .finally(() => window.clearTimeout(t));
  };
  window.addEventListener("online", probe);
  window.addEventListener("offline", () => {});
  if (navigator.onLine) probe();
}
