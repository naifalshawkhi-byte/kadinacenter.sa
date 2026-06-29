#!/usr/bin/env node
/** Production start — reads PORT from Hostinger environment */
const { spawn } = require("child_process");

const port = process.env.PORT || "3000";
const child = spawn("npx", ["next", "start", "-p", port], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => process.exit(code ?? 1));
