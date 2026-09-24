import { BUNDLE_SKU, SOVEREIGNS, heroSku } from "./heroes";
import { storageSealed } from "./save";
import { BOOST_SKU } from "./boost";
import { ACK_URL } from "./support";

const PLAY = "https://play.google.com/billing";
// Windows: the same product IDs, sold as Microsoft Store durable add-ons (their Product ID = our SKU).
const MICROSOFT = "https://store.microsoft.com/billing";
export type StoreName = "google" | "microsoft";
let method = PLAY;
const CACHE = "nidus.owned.v1";
const ACKED = "nidus.acked.v1";

type ItemDetails = { itemId: string; title?: string; price: { currency: string; value: string } };
type PurchaseDetails = { itemId: string; purchaseToken: string };
type DigitalGoods = {
  getDetails(ids: string[]): Promise<ItemDetails[]>;
  listPurchases(): Promise<PurchaseDetails[]>;
};
type WithGoods = Window & { getDigitalGoodsService?: (provider: string) => Promise<DigitalGoods> };

export type Shop = {
  mode: "loading" | "play" | "web";
  owned: ReadonlySet<string>;
  boost: boolean;
  ready: boolean;
  prices: Record<string, string>;
  busy: string | null;
  note: string;
  inApp: boolean;
  store: StoreName | null;
};

export const ALL_SKUS = [BUNDLE_SKU, BOOST_SKU, ...SOVEREIGNS.map((h) => heroSku(h.id))];

export function ownedFrom(skus: readonly string[]): Set<string> {
  if (skus.includes(BUNDLE_SKU)) return new Set(SOVEREIGNS.map((h) => h.id));
  const ids = new Set<string>();
  for (const sku of skus) {
    const hero = SOVEREIGNS.find((h) => heroSku(h.id) === sku);
    if (hero) ids.add(hero.id);
  }
  return ids;
}

export function formatPrice(p: { currency: string; value: string }): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: p.currency }).format(Number(p.value));
  } catch {
    return `${p.value} ${p.currency}`;
  }
}

let shop: Shop = { mode: "loading", owned: new Set(), boost: false, ready: false, prices: {}, busy: null, note: "", inApp: false, store: null };

const APP_REFERRER = "android-app://com.nyxhivequeen.nidus";
const APP_FLAG = "nidus.twa";

// The Play app opens NIDUS with this referrer; remember it for reloads in the same session.
function inAndroidApp(): boolean {
  try {
    if (document.referrer.startsWith(APP_REFERRER)) {
      sessionStorage.setItem(APP_FLAG, "1");
      return true;
    }
    return sessionStorage.getItem(APP_FLAG) === "1";
  } catch {
    return false;
  }
}

const NEEDS_CHROME = "PURCHASES NEED GOOGLE CHROME ON THIS PHONE. INSTALL OR UPDATE CHROME, THEN REOPEN NIDUS. HEROES YOU OWN RETURN THEN.";
let service: DigitalGoods | null = null;
const listeners = new Set<() => void>();

function emit(patch: Partial<Shop>) {
  shop = { ...shop, ...patch };
  for (const l of listeners) l();
}

export function subscribeShop(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const getShop = () => shop;

function readCache(): string[] {
  try {
    const raw = localStorage.getItem(CACHE);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeCache(skus: string[]) {
  if (storageSealed()) return;
  try {
    localStorage.setItem(CACHE, JSON.stringify(skus));
  } catch {
    /* storage blocked */
  }
}

// Same-origin only, so the CSP and the privacy page both stay true.
export function ackTarget(url: string): string | null {
  return url.startsWith("/") && !url.startsWith("//") ? url : null;
}

const ackKey = (p: PurchaseDetails) => `${p.itemId}:${p.purchaseToken.slice(-24)}`;
const inflight = new Set<string>();

function readAcked(): Set<string> {
  try {
    const list = JSON.parse(localStorage.getItem(ACKED) ?? "[]") as unknown;
    return new Set(Array.isArray(list) ? list.filter((x): x is string => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

// Google refunds unconfirmed purchases after three days. Retried every launch until the server says done.
async function confirmPurchases(list: PurchaseDetails[]): Promise<void> {
  const target = ackTarget(ACK_URL);
  if (!target || method !== PLAY) return;
  const done = readAcked();
  const todo = list.filter((p) => p.purchaseToken && !done.has(ackKey(p)) && !inflight.has(ackKey(p))).slice(0, 25);
  if (!todo.length) return;
  for (const p of todo) inflight.add(ackKey(p));
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(target, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: todo.map((p) => ({ sku: p.itemId, token: p.purchaseToken })) }),
      credentials: "omit",
      cache: "no-store",
      signal: ctrl.signal,
    });
    if (!res.ok) return;
    const data = (await res.json()) as { results?: { ok?: unknown }[] };
    todo.forEach((p, i) => {
      if (data.results?.[i]?.ok === true) done.add(ackKey(p));
    });
    if (!storageSealed()) localStorage.setItem(ACKED, JSON.stringify([...done].slice(-60)));
  } catch {
    /* offline or off: next launch tries again */
  } finally {
    window.clearTimeout(timer);
    for (const p of todo) inflight.delete(ackKey(p));
  }
}

async function syncPurchases(): Promise<boolean> {
  if (!service) return false;
  try {
    const list = await service.listPurchases();
    void confirmPurchases(list);
    const skus = list.map((p) => p.itemId);
    writeCache(skus);
    emit({ owned: ownedFrom(skus), boost: skus.includes(BOOST_SKU), ready: true });
    return true;
  } catch {
    const cached = readCache();
    emit({ owned: ownedFrom(cached), boost: cached.includes(BOOST_SKU), ready: true, note: "OFFLINE. SHOWING YOUR LAST KNOWN PURCHASES." });
    return false;
  }
}

let started: Promise<boolean> | null = null;

// Resolves true when Google Play confirmed what the player owns.
export function initBilling(): Promise<boolean> {
  if (started) return started;
  started = (async () => {
    const w = typeof window === "undefined" ? null : (window as WithGoods);
    const inApp = w ? inAndroidApp() : false;
    // In the Play app without billing (another browser runs it), keep last known purchases and say why.
    const noBilling = () => {
      const cached = inApp ? readCache() : [];
      emit({ mode: "web", inApp, owned: ownedFrom(cached), boost: cached.includes(BOOST_SKU), ready: true, note: inApp ? NEEDS_CHROME : "" });
      return false;
    };
    if (!w?.getDigitalGoodsService || typeof PaymentRequest === "undefined") return noBilling();
    // Google Play inside the Android app, the Microsoft Store inside the Windows app; neither on the open web.
    for (const [url, store] of [
      [PLAY, "google"],
      [MICROSOFT, "microsoft"],
    ] as const) {
      try {
        const svc = await w.getDigitalGoodsService(url);
        const details = await svc.getDetails(ALL_SKUS).catch(() => [] as ItemDetails[]);
        // Edge can expose the Microsoft service outside a Store install; only trust it when the Store answers.
        if (store === "microsoft" && details.length === 0) continue;
        service = svc;
        method = url;
        emit({ mode: "play", store, prices: Object.fromEntries(details.map((d) => [d.itemId, formatPrice(d.price)])) });
        break;
      } catch {
        service = null;
      }
    }
    if (!service) return noBilling();
    return syncPurchases();
  })();
  return started;
}

export async function buy(sku: string): Promise<boolean> {
  if (!service || shop.busy) return false;
  emit({ busy: sku, note: "" });
  try {
    const request = new PaymentRequest([{ supportedMethods: method, data: { sku } }], {
      total: { label: "Total", amount: { currency: "USD", value: "0" } },
    });
    const response = await request.show();
    const token = (response.details as { purchaseToken?: unknown } | null)?.purchaseToken;
    await response.complete("success");
    if (typeof token === "string") void confirmPurchases([{ itemId: sku, purchaseToken: token }]);
    await syncPurchases();
    return true;
  } catch (e) {
    const cancelled = e instanceof DOMException && e.name === "AbortError";
    emit({ note: cancelled ? "" : "PURCHASE DID NOT GO THROUGH. YOU WERE NOT CHARGED." });
    return false;
  } finally {
    emit({ busy: null });
  }
}

export async function restore(): Promise<boolean> {
  if (!service) return false;
  emit({ busy: "restore", note: "" });
  const ok = await syncPurchases();
  emit({ busy: null, note: ok ? "PURCHASES RESTORED." : shop.note });
  return ok;
}
