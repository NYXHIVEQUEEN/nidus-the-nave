import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

// Static hosts have no router: give each page its own index.html so deep links and reloads work.
const dist = "dist";
const shell = join(dist, "index.html");
for (const route of ["privacy", "terms", "support"]) {
  mkdirSync(join(dist, route), { recursive: true });
  copyFileSync(shell, join(dist, route, "index.html"));
}
copyFileSync(shell, join(dist, "404.html"));
console.log("static routes: privacy, terms, support, 404");

// Old preview-platform files in public/ are not part of the game; keep them off the live site.
rmSync(join(dist, "__grok"), { recursive: true, force: true });

// One offline cache per build: the new worker drops the old cache, so phones never hoard stale builds.
const sw = join(dist, "sw.js");
const stamp = createHash("sha256").update(readFileSync(shell)).digest("hex").slice(0, 10);
const src = readFileSync(sw, "utf8");
if (!src.includes('"nidus-shell-v3"')) throw new Error("sw.js cache name not found; update tools/static-routes.mjs");
writeFileSync(sw, src.replace('"nidus-shell-v3"', `"nidus-shell-${stamp}"`));
console.log(`service worker cache: nidus-shell-${stamp}`);
