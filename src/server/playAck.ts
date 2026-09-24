// Google Play refunds and revokes any purchase that is not acknowledged within three days.
// Digital Goods API v2 has no in-app acknowledge, so this tiny endpoint does it with the
// Play Developer API. It keeps nothing: no log of tokens, no database, no cookies.
// OFF until the Queen sets PLAY_SA_EMAIL and PLAY_SA_KEY on the host (store/PRODUCTS.md).
import { BUNDLE_SKU, SOVEREIGNS, heroSku } from "../lib/nidus/heroes";
import { BOOST_SKU } from "../lib/nidus/boost";

export type AckEnv = { PLAY_PACKAGE?: string; PLAY_SA_EMAIL?: string; PLAY_SA_KEY?: string };
export type AckItem = { sku: string; token: string };
type Fetch = typeof fetch;

const SKUS = new Set([BUNDLE_SKU, BOOST_SKU, ...SOVEREIGNS.map((h) => heroSku(h.id))]);
const TOKEN = /^[A-Za-z0-9._-]{16,2048}$/;
const PACKAGE = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/;
const MAX_ITEMS = 25;
const MAX_BODY = 64_000;
const SCOPE = "https://www.googleapis.com/auth/androidpublisher";
const OAUTH = "https://oauth2.googleapis.com/token";
const API = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications";

export function parseItems(raw: unknown): AckItem[] | null {
  if (!raw || typeof raw !== "object") return null;
  const items = (raw as { items?: unknown }).items;
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) return null;
  const out: AckItem[] = [];
  for (const it of items) {
    if (!it || typeof it !== "object") return null;
    const { sku, token } = it as { sku?: unknown; token?: unknown };
    if (typeof sku !== "string" || !SKUS.has(sku)) return null;
    if (typeof token !== "string" || !TOKEN.test(token)) return null;
    out.push({ sku, token });
  }
  return out;
}

function b64url(data: ArrayBuffer | Uint8Array | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signingKey(pem: string): Promise<CryptoKey> {
  // Hosts often store the key with literal "\n"; accept both.
  const body = pem
    .replace(/\\n/g, "\n")
    .replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const der = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
}

export async function serviceJwt(email: string, pem: string, now = Math.floor(Date.now() / 1000)): Promise<string> {
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({ iss: email, scope: SCOPE, aud: OAUTH, iat: now, exp: now + 3600 }));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", await signingKey(pem), new TextEncoder().encode(`${head}.${claims}`));
  return `${head}.${claims}.${b64url(sig)}`;
}

let cached: { token: string; until: number; who: string } | null = null;

async function accessToken(email: string, pem: string, f: Fetch): Promise<string> {
  const now = Date.now();
  if (cached && cached.who === email && now < cached.until) return cached.token;
  const res = await f(OAUTH, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: await serviceJwt(email, pem) }),
  });
  if (!res.ok) throw new Error("oauth");
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error("oauth");
  cached = { token: data.access_token, until: now + Math.max(60, (data.expires_in ?? 3600) - 120) * 1000, who: email };
  return data.access_token;
}

// true when Play now holds the purchase as acknowledged (or it already was).
async function ackOne(pkg: string, item: AckItem, bearer: string, f: Fetch): Promise<boolean> {
  const url = `${API}/${encodeURIComponent(pkg)}/purchases/products/${encodeURIComponent(item.sku)}/tokens/${encodeURIComponent(item.token)}`;
  const auth = { authorization: `Bearer ${bearer}` };
  const got = await f(url, { headers: auth });
  if (!got.ok) return false;
  const p = (await got.json()) as { purchaseState?: number; acknowledgementState?: number };
  if (p.purchaseState !== 0) return false; // cancelled or still pending: nothing to confirm yet
  if (p.acknowledgementState === 1) return true;
  const ack = await f(`${url}:acknowledge`, { method: "POST", headers: { ...auth, "content-type": "application/json" }, body: "{}" });
  return ack.ok;
}

function reply(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", "x-content-type-options": "nosniff" },
  });
}

export async function handleAck(req: Request, env: AckEnv, f: Fetch = fetch): Promise<Response> {
  if (req.method !== "POST") return reply(405, { error: "method" });
  const email = env.PLAY_SA_EMAIL?.trim();
  const pem = env.PLAY_SA_KEY?.trim();
  const pkg = env.PLAY_PACKAGE?.trim() || "com.nyxhivequeen.nidus";
  if (!email || !pem || !PACKAGE.test(pkg)) return reply(503, { error: "off" });
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(req.url).host) return reply(403, { error: "origin" });
    } catch {
      return reply(403, { error: "origin" });
    }
  }
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) return reply(415, { error: "type" });
  const size = Number(req.headers.get("content-length") ?? "0");
  if (size > MAX_BODY) return reply(413, { error: "size" });
  const text = await req.text();
  if (text.length > MAX_BODY) return reply(413, { error: "size" });
  let items: AckItem[] | null = null;
  try {
    items = parseItems(JSON.parse(text));
  } catch {
    items = null;
  }
  if (!items) return reply(400, { error: "items" });
  let bearer: string;
  try {
    bearer = await accessToken(email, pem, f);
  } catch {
    return reply(502, { error: "google" });
  }
  const results = await Promise.all(
    items.map(async (it) => {
      try {
        return { sku: it.sku, ok: await ackOne(pkg, it, bearer, f) };
      } catch {
        return { sku: it.sku, ok: false };
      }
    }),
  );
  return reply(200, { results });
}

export function resetAckCache() {
  cached = null;
}
