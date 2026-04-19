const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const standaloneEntry = path.join(process.cwd(), ".next", "standalone", "server.js");

if (!fs.existsSync(standaloneEntry)) {
  console.error("[start] Missing .next/standalone/server.js");
  console.error("[start] Run `npm run build` first, then run `npm run start` again.");
  process.exit(1);
}

const child = spawn(process.execPath, [standaloneEntry], {
  stdio: "inherit",
  env: process.env
});

const forwardSignal = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
