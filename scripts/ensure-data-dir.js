#!/usr/bin/env node
/**
 * Ensures data/ exists before Next.js starts (Hostinger / production).
 */
const fs = require("fs");
const path = require("path");

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true, mode: 0o750 });
  console.log("[ensure-data] Created data directory:", dataDir);
}

const keep = path.join(dataDir, ".gitkeep");
if (!fs.existsSync(keep)) {
  fs.writeFileSync(keep, "");
}

const dbPath = path.join(dataDir, "db.json");
if (fs.existsSync(dbPath)) {
  console.log("[ensure-data] Database found:", dbPath);
} else {
  console.log("[ensure-data] No db.json yet — will be created on first request.");
}
