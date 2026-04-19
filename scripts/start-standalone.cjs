const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const projectRoot = process.cwd();
const standaloneDir = path.join(projectRoot, ".next", "standalone");
const standaloneEntry = path.join(standaloneDir, "server.js");
const sourceStaticDir = path.join(projectRoot, ".next", "static");
const targetStaticDir = path.join(standaloneDir, ".next", "static");
const sourcePublicDir = path.join(projectRoot, "public");
const targetPublicDir = path.join(standaloneDir, "public");

function ensureJunction(targetPath, sourcePath) {
  if (fs.existsSync(targetPath)) {
    return;
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.symlinkSync(sourcePath, targetPath, "junction");
}

if (!fs.existsSync(standaloneEntry)) {
  console.error("[start] Missing .next/standalone/server.js");
  console.error("[start] Run `npm run build` first, then run `npm run start` again.");
  process.exit(1);
}

if (!fs.existsSync(sourceStaticDir)) {
  console.error("[start] Missing .next/static assets.");
  console.error("[start] Run `npm run build` first, then run `npm run start` again.");
  process.exit(1);
}

ensureJunction(targetStaticDir, sourceStaticDir);
ensureJunction(targetPublicDir, sourcePublicDir);

const child = spawn(process.execPath, ["server.js"], {
  cwd: standaloneDir,
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
