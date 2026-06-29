#!/usr/bin/env node
/**
 * Fixes read permissions on Linux (Hostinger) before next build.
 * Runs automatically via npm prebuild.
 */
const { execSync } = require("child_process");

if (process.platform === "win32") {
  process.exit(0);
}

const dirs = ["src", "data", "scripts", "public"];
for (const dir of dirs) {
  try {
    execSync(`chmod -R u+rwX,go+rX "${dir}" 2>/dev/null || true`, { stdio: "ignore", shell: true });
  } catch {
    /* ignore */
  }
}
