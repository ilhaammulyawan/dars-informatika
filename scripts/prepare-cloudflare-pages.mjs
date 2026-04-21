import fs from "node:fs";
import path from "node:path";

const clientDir = path.resolve("dist/client");
const serverAssetsDir = path.resolve("dist/server/assets");
const clientAssetsDir = path.join(clientDir, "assets");
const serverEntry = path.resolve("dist/server/server.js");
const copiedServerEntry = path.join(clientDir, "_server.js");
const workerEntry = path.join(clientDir, "_worker.js");
const wranglerFile = path.join(clientDir, "wrangler.json");

if (!fs.existsSync(clientDir)) {
  throw new Error("Cloudflare Pages output directory dist/client was not created.");
}

if (!fs.existsSync(serverEntry)) {
  throw new Error("TanStack Start SSR entry dist/server/server.js was not created.");
}

fs.copyFileSync(serverEntry, copiedServerEntry);

fs.writeFileSync(
  workerEntry,
  `import server from "./_server.js";

const assetPathPattern = /\\.[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const isAssetRequest = url.pathname.startsWith("/assets/") || assetPathPattern.test(url.pathname);

    if (isAssetRequest && env?.ASSETS) {
      const assetResponse = await env.ASSETS.fetch(request);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
    }

    return server.fetch(request, env, ctx);
  },
};
`,
);

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