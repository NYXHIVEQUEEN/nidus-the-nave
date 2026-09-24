import { copyFileSync, mkdirSync } from "node:fs";
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
