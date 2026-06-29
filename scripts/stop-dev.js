const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

if (process.platform === "win32") {
  for (const port of [3000, 3001]) {
    try {
      const out = execSync(`netstat -ano | findstr :${port} | findstr LISTENING`, {
        encoding: "utf8",
      });
      const pids = new Set();
      for (const line of out.split("\n")) {
        const m = line.trim().match(/\s+(\d+)\s*$/);
        if (m) pids.add(m[1]);
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        } catch {}
      }
    } catch {}
  }
}

const lock = path.join(process.cwd(), ".next", "dev", "lock");
if (fs.existsSync(lock)) fs.unlinkSync(lock);

console.log("Dev server stopped.");
