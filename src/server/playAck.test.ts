import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { handleAck, parseItems, resetAckCache, serviceJwt, type AckEnv } from "./playAck";

const TOKEN = "abcdefghijklmnop.AO-J1Oz_test-token";
const HOST = "https://nidus.example";

async function testKey() {
  const pair = (await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"],
  )) as CryptoKeyPair;
  const der = Buffer.from(await crypto.subtle.exportKey("pkcs8", pair.privateKey)).toString("base64");
  // Stored the way hosts usually keep it: one line with literal \n.
  const pem = `-----BEGIN PRIVATE KEY-----\\n${der.match(/.{1,64}/g)!.join("\\n")}\\n-----END PRIVATE KEY-----\\n`;
  return { pem, pub: pair.publicKey };
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${HOST}/api/ack`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: HOST, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

type Call = { url: string; method: string; body?: string };

function fakeGoogle(purchase: { purchaseState: number; acknowledgementState: number }, calls: Call[]) {
  return (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, method: init?.method ?? "GET", body: init?.body ? String(init.body) : undefined });
    if (url.startsWith("https://oauth2.googleapis.com/token")) return Response.json({ access_token: "ya29.test", expires_in: 3600 });
    if (url.endsWith(":acknowledge")) return new Response(null, { status: 204 });
    if (url.includes("/purchases/products/")) return Response.json(purchase);
    return new Response("nope", { status: 404 });
  }) as typeof fetch;
}

beforeEach(() => resetAckCache());

test("ack input: only known products and sane tokens pass", () => {
  assert.deepEqual(parseItems({ items: [{ sku: "hero_vesper", token: TOKEN }] }), [{ sku: "hero_vesper", token: TOKEN }]);
  assert.equal(parseItems({ items: [{ sku: "hero_fake", token: TOKEN }] }), null, "unknown product");
  assert.equal(parseItems({ items: [{ sku: "boost_x2", token: "../../etc" }] }), null, "path characters");
  assert.equal(parseItems({ items: [] }), null, "empty");
  assert.equal(parseItems({ items: Array.from({ length: 26 }, () => ({ sku: "boost_x2", token: TOKEN })) }), null, "too many");
  assert.equal(parseItems(null), null);
});

test("ack endpoint stays off and closed without the Queen's key", async () => {
  assert.equal((await handleAck(post({ items: [{ sku: "boost_x2", token: TOKEN }] }), {})).status, 503, "off by default");
  const env: AckEnv = { PLAY_SA_EMAIL: "x@y.iam.gserviceaccount.com", PLAY_SA_KEY: "k" };
  assert.equal((await handleAck(new Request(`${HOST}/api/ack`), env)).status, 405, "GET refused");
  assert.equal((await handleAck(post({ items: [] }, { origin: "https://evil.example" }), env)).status, 403, "other sites refused");
  assert.equal((await handleAck(post("{not json"), env)).status, 400, "bad json");
  assert.equal((await handleAck(post({ items: [{ sku: "hero_fake", token: TOKEN }] }), env)).status, 400, "bad item");
  assert.equal((await handleAck(post("x".repeat(70_000)), env)).status, 413, "too big");
});

test("ack endpoint signs in with a verifiable key and acknowledges a new purchase", async () => {
  const { pem, pub } = await testKey();
  const jwt = await serviceJwt("svc@nidus.iam.gserviceaccount.com", pem, 1_700_000_000);
  const [h, c, s] = jwt.split(".");
  const sig = Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  assert.ok(await crypto.subtle.verify("RSASSA-PKCS1-v1_5", pub, sig, new TextEncoder().encode(`${h}.${c}`)), "signature verifies");
  const claims = JSON.parse(Buffer.from(c, "base64url").toString());
  assert.equal(claims.scope, "https://www.googleapis.com/auth/androidpublisher");
  assert.equal(claims.exp - claims.iat, 3600);

  const calls: Call[] = [];
  const env = { PLAY_SA_EMAIL: "svc@nidus.iam.gserviceaccount.com", PLAY_SA_KEY: pem };
  const res = await handleAck(post({ items: [{ sku: "sovereign_all", token: TOKEN }] }), env, fakeGoogle({ purchaseState: 0, acknowledgementState: 0 }, calls));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { results: [{ sku: "sovereign_all", ok: true }] });
  const ack = calls.find((x) => x.url.endsWith(":acknowledge"));
  assert.ok(ack, "acknowledge was called");
  assert.equal(ack.method, "POST");
  assert.ok(ack.url.includes("/applications/com.nyxhivequeen.nidus/purchases/products/sovereign_all/tokens/"), ack.url);
  assert.equal(res.headers.get("cache-control"), "no-store");
});

test("ack endpoint skips already-confirmed and pending purchases", async () => {
  const { pem } = await testKey();
  const env = { PLAY_SA_EMAIL: "svc@nidus.iam.gserviceaccount.com", PLAY_SA_KEY: pem };
  const done: Call[] = [];
  const r1 = await handleAck(post({ items: [{ sku: "boost_x2", token: TOKEN }] }), env, fakeGoogle({ purchaseState: 0, acknowledgementState: 1 }, done));
  assert.deepEqual(await r1.json(), { results: [{ sku: "boost_x2", ok: true }] });
  assert.equal(done.filter((x) => x.url.endsWith(":acknowledge")).length, 0, "no second acknowledge");
  const pending: Call[] = [];
  const r2 = await handleAck(post({ items: [{ sku: "boost_x2", token: TOKEN }] }), env, fakeGoogle({ purchaseState: 2, acknowledgementState: 0 }, pending));
  assert.deepEqual(await r2.json(), { results: [{ sku: "boost_x2", ok: false }] });
  assert.equal(pending.filter((x) => x.url.endsWith(":acknowledge")).length, 0, "pending is not confirmed");
});
