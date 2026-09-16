import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const URL = "http://127.0.0.1:8080/";
const OUT = "/workspace/screenshots";

const browser = await chromium.launch({
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--ignore-gpu-blocklist"],
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  recordVideo: { dir: `${OUT}/gdl2-video`, size: { width: 390, height: 844 } },
});
const page = await context.newPage();
page.on("pageerror", (e) => console.log("PAGEERROR", e.message));

await page.addInitScript(() => {
  const now = Date.now();
  const raw = localStorage.getItem("nidus.save.v3");
  let s = {};
  try {
    s = raw ? JSON.parse(raw) : {};
  } catch {
    s = {};
  }
  s.version = 3;
  s.started = true;
  s.tab = "hull";
  s.lastTick = now;
  s.raid = null;
  s.pendingGift = null;
  s.showBrief = false;
  s.waking = null;
  s.swarm = { miner: 14, fab: 4, builder: 4, lab: 1, striker: 4, ...(s.swarm || {}) };
  s.rooms = s.rooms || {};
  for (const id of ["foundry", "solar", "orebay"]) {
    s.rooms[id] = { ...(s.rooms[id] || {}), built: true, progress: 40, rank: Math.max(1, s.rooms[id]?.rank || 1), rankWork: 0 };
  }
  localStorage.setItem("nidus.save.v3", JSON.stringify(s));
  const close = sessionStorage.getItem("gdl-close") === "1";
  localStorage.setItem(
    "nidus.prefs.v1",
    JSON.stringify({
      spinPaused: true,
      spinSpeed: 0.4,
      music: 0,
      sfx: 0,
      muted: true,
      hints: false,
      camGen: close ? 100 : 99,
      camDist: close ? 10 : 14,
      camFov: close ? 42 : 46,
      camZoom: 1,
      camPull: false,
      autoHide: false,
      watchNave: false,
      lookId: "",
      lookUntil: 0,
      seenHelp: { hull: true, forge: true, lab: true, raid: true, minds: true, view: true, wake: true, idle: true, flow: true },
      density: "compact",
      uiScale: 0.58,
      musicBed: "void",
      prefsGen: 8,
    }),
  );
});

await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(900);
for (const label of ["WAKE", "RETURN", "CONTINUE"]) {
  const btn = page.getByRole("button", { name: label });
  if (await btn.count()) {
    try {
      await btn.first().click({ timeout: 1500 });
    } catch {
      /* already in */
    }
  }
}
await page.waitForTimeout(2500);

const hullTab = page.getByRole("button", { name: /^HULL/i });
if (await hullTab.count()) await hullTab.first().click().catch(() => {});
await page.waitForTimeout(1800);

const canvasOn = await page.evaluate(() => {
  const c = document.querySelector("canvas");
  const img = document.querySelector('img[src*="interior"]');
  return {
    canvas: Boolean(c),
    cw: c?.width || 0,
    ch: c?.height || 0,
    vis: c ? getComputedStyle(c).visibility : "none",
    interior: Boolean(img),
    perf: globalThis.__nidusPerf || null,
  };
});
console.log("DOM", JSON.stringify(canvasOn));

await page.screenshot({ path: `${OUT}/gdl2-play.png`, type: "png" });

await page.addStyleTag({
  content: `[data-chrome], .nidus-sheet, nav, header, [data-tab], .nidus-whisper, .nidus-card { visibility: hidden !important; opacity: 0 !important; }`,
});
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/gdl2-still.png`, type: "png" });

await page.evaluate(() => sessionStorage.setItem("gdl-close", "1"));
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(900);
for (const label of ["WAKE", "RETURN", "CONTINUE"]) {
  const btn = page.getByRole("button", { name: label });
  if (await btn.count()) {
    try {
      await btn.first().click({ timeout: 1500 });
    } catch {
      /* */
    }
  }
}
await page.waitForTimeout(2800);
await page.addStyleTag({
  content: `[data-chrome], .nidus-sheet, nav, header, [data-tab], .nidus-whisper, .nidus-card { visibility: hidden !important; opacity: 0 !important; }`,
});
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/gdl2-close.png`, type: "png" });

const perf = await page.evaluate(() => globalThis.__nidusPerf || null);
writeFileSync(`${OUT}/gdl2-metrics.json`, JSON.stringify({ canvasOn, perf }, null, 2));
console.log("PERF", JSON.stringify(perf));

await page.waitForTimeout(4000);
await context.close();
await browser.close();
console.log("done");
