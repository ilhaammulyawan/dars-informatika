import fs from "node:fs";
import path from "node:path";

const clientDir = path.resolve("dist/client");
const serverAssetsDir = path.resolve("dist/server/assets");
const clientAssetsDir = path.join(clientDir, "assets");
const serverEntry = path.resolve("dist/server/server.js");
const workerEntry = path.join(clientDir, "_worker.js");
const wranglerFile = path.join(clientDir, "wrangler.json");

if (!fs.existsSync(clientDir)) {
  throw new Error("Cloudflare Pages output directory dist/client was not created.");
}

if (!fs.existsSync(serverEntry)) {
  throw new Error("TanStack Start SSR entry dist/server/server.js was not created.");
}

fs.copyFileSync(serverEntry, workerEntry);

if (fs.existsSync(serverAssetsDir)) {
  fs.mkdirSync(clientAssetsDir, { recursive: true });
  fs.cpSync(serverAssetsDir, clientAssetsDir, { recursive: true, force: false, errorOnExist: false });
}

if (fs.existsSync(wranglerFile)) {
  const config = JSON.parse(fs.readFileSync(wranglerFile, "utf8"));
  if (config.triggers && Object.keys(config.triggers).length === 0) {
    config.triggers = { crons: [] };
  }
  config.compatibility_flags = Array.from(new Set([...(config.compatibility_flags ?? []), "nodejs_compat"]));
  delete config.assets;
  fs.writeFileSync(wranglerFile, `${JSON.stringify(config, null, 2)}\n`);
}

console.log("Prepared Cloudflare Pages SSR output at dist/client/_worker.js");