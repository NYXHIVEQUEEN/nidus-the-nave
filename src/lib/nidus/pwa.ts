type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

let deferred: InstallPrompt | null = null;
let installedNow = false;

// Chrome, Edge and Android fire this once the page is installable; keep it for the INSTALL HOME button.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as InstallPrompt;
  });
  window.addEventListener("appinstalled", () => {
    installedNow = true;
    deferred = null;
  });
}

export type InstallWay = "installed" | "prompt" | "ios" | "menu";

export function installWay(): InstallWay {
  if (typeof window === "undefined") return "menu";
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone || installedNow) return "installed";
  if (deferred) return "prompt";
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return ios ? "ios" : "menu";
}

export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const e = deferred;
  deferred = null;
  await e.prompt();
  return (await e.userChoice).outcome === "accepted";
}

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
