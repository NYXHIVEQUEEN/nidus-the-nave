import { BUNDLE_SKU, SOVEREIGNS, heroSku } from "./heroes";
import { storageSealed } from "./save";
import { BOOST_SKU } from "./boost";

const PLAY = "https://play.google.com/billing";
const CACHE = "nidus.owned.v1";

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

let shop: Shop = { mode: "loading", owned: new Set(), boost: false, ready: false, prices: {}, busy: null, note: "" };
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

async function syncPurchases(): Promise<boolean> {
  if (!service) return false;
  try {
    const skus = (await service.listPurchases()).map((p) => p.itemId);
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
    if (!w?.getDigitalGoodsService || typeof PaymentRequest === "undefined") {
      emit({ mode: "web", owned: new Set(), boost: false, ready: true });
      return false;
    }
    try {
      service = await w.getDigitalGoodsService(PLAY);
    } catch {
      emit({ mode: "web", owned: new Set(), boost: false, ready: true });
      return false;
    }
    emit({ mode: "play" });
    try {
      const details = await service.getDetails(ALL_SKUS);
      emit({ prices: Object.fromEntries(details.map((d) => [d.itemId, formatPrice(d.price)])) });
    } catch {
      /* fall back to list prices */
    }
    return syncPurchases();
  })();
  return started;
}

export async function buy(sku: string): Promise<boolean> {
  if (!service || shop.busy) return false;
  emit({ busy: sku, note: "" });
  try {
    const request = new PaymentRequest([{ supportedMethods: PLAY, data: { sku } }], {
      total: { label: "Total", amount: { currency: "USD", value: "0" } },
    });
    const response = await request.show();
    await response.complete("success");
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
