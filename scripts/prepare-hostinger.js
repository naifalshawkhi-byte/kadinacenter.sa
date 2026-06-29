#!/usr/bin/env node
/**
 * Prepares hostinger-upload/ folder + hostinger-upload.zip for Hostinger.
 *
 * CRITICAL: package.json MUST be at the ZIP ROOT (not inside a subfolder).
 * Do NOT zip the folder itself — use the generated hostinger-upload.zip.
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const root = path.join(__dirname, "..");
const outDir = path.join(root, "hostinger-upload");
const outZip = path.join(root, "hostinger-upload.zip");

const INCLUDE_ROOT_FILES = [
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "next.config.mjs",
  "tsconfig.json",
  "postcss.config.mjs",
  "eslint.config.mjs",
  "next-env.d.ts",
];

const INCLUDE_SCRIPTS = new Set([
  "ensure-data-dir.js",
  "start-prod.js",
  "fix-permissions.js",
]);

function rmDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function copyProject(out) {
  for (const name of INCLUDE_ROOT_FILES) {
    const src = path.join(root, name);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(out, name));
  }

  for (const dirName of ["src", "public", "data", "scripts"]) {
    const srcDir = path.join(root, dirName);
    if (!fs.existsSync(srcDir)) continue;
    const dest = path.join(out, dirName);
    fs.cpSync(srcDir, dest, { recursive: true });

    if (dirName === "scripts") {
      for (const f of fs.readdirSync(dest)) {
        if (!INCLUDE_SCRIPTS.has(f)) {
          fs.rmSync(path.join(dest, f), { recursive: true, force: true });
        }
      }
    }
    if (dirName === "data") {
      for (const f of fs.readdirSync(dest)) {
        if (f !== "db.json" && f !== ".gitkeep") {
          fs.rmSync(path.join(dest, f), { recursive: true, force: true });
        }
      }
    }
  }

  if (!fs.existsSync(path.join(out, "public"))) {
    fs.mkdirSync(path.join(out, "public"), { recursive: true });
    fs.writeFileSync(path.join(out, "public", ".gitkeep"), "");
  }
}

function createZipFromFolder(folder, zipPath) {
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);

  // Compress contents OF the folder (not the folder itself) → package.json at zip root
  const isWin = process.platform === "win32";
  if (isWin) {
    const ps = `
      Set-Location -LiteralPath '${folder.replace(/'/g, "''")}'
      $items = Get-ChildItem -Force | Where-Object { $_.Name -ne 'README-UPLOAD.txt' -or $true }
      Compress-Archive -Path * -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force
    `;
    execSync(`powershell -NoProfile -Command "${ps.replace(/"/g, '\\"').replace(/\n/g, '; ')}"`, {
      stdio: "inherit",
    });
  } else {
    execSync(`tar -a -cf "${zipPath}" -C "${folder}" .`, { stdio: "inherit" });
  }
}

function verifyZipStructure(folder) {
  const required = ["package.json", "package-lock.json", "next.config.mjs", "src/app"];
  const missing = required.filter((p) => !fs.existsSync(path.join(folder, p)));
  if (missing.length) {
    console.error("Missing required paths:", missing.join(", "));
    process.exit(1);
  }
  const pkg = JSON.parse(fs.readFileSync(path.join(folder, "package.json"), "utf-8"));
  if (!pkg.dependencies?.next) {
    console.error("package.json must include next dependency");
    process.exit(1);
  }
}

function main() {
  console.log("\n=== Hostinger Upload Package ===\n");

  rmDir(outDir);
  fs.mkdirSync(outDir, { recursive: true });
  copyProject(outDir);

  const hasDb = fs.existsSync(path.join(outDir, "data", "db.json"));
  if (!hasDb) {
    fs.mkdirSync(path.join(outDir, "data"), { recursive: true });
    fs.writeFileSync(path.join(outDir, "data", ".gitkeep"), "");
  }

  fs.writeFileSync(
    path.join(outDir, "README-UPLOAD.txt"),
    `DO NOT upload this folder as a zip manually.
Use the file hostinger-upload.zip from the project root.
That zip has package.json at the ROOT level (required by Hostinger).
`,
    "utf-8"
  );

  verifyZipStructure(outDir);

  const secret = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(
    path.join(root, "HOSTINGER-ENV.txt"),
    `# Hostinger Environment Variables

AUTH_SECRET=${secret}
NEXT_PUBLIC_APP_URL=https://YOUR-DOMAIN.com
NODE_ENV=production

# hPanel Build Settings:
#   Framework: Next.js (or Other → output .next)
#   Node.js: 20
#   Install: npm ci
#   Build:   npm run build
#   Start:   npm run start:hostinger
`,
    "utf-8"
  );

  createZipFromFolder(outDir, outZip);

  const sizeMb = (fs.statSync(outZip).size / 1024 / 1024).toFixed(2);
  console.log("✓ Folder: hostinger-upload/");
  console.log(`✓ ZIP:    hostinger-upload.zip (${sizeMb} MB)`);
  console.log("✓ HOSTINGER-ENV.txt updated\n");
  console.log("ZIP root must contain package.json directly.");
  console.log("Upload ONLY: hostinger-upload.zip\n");
  console.log("WRONG: zip the hostinger-upload folder → Hostinger rejects it");
  console.log("WRONG: zip .hostinger-staging folder\n");
}

main();
