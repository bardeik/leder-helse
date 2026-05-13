const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");

const projectRoot = process.cwd();
const standaloneDir = path.join(projectRoot, ".next", "standalone");
const standaloneEntry = path.join(standaloneDir, "server.js");
const sourceStaticDir = path.join(projectRoot, ".next", "static");
const targetStaticDir = path.join(standaloneDir, ".next", "static");
const sourcePublicDir = path.join(projectRoot, "public");
const targetPublicDir = path.join(standaloneDir, "public");
const builtAppDir = path.join(projectRoot, ".next", "server", "app");
const publicPort = Number(process.env.PORT ?? 3000);
const publicHost = process.env.HOSTNAME ?? "0.0.0.0";
const internalPort = Number(process.env.INTERNAL_PORT ?? publicPort + 1);
const internalHost = "127.0.0.1";

function hashInlineContent(content) {
  return `'sha256-${crypto.createHash("sha256").update(content).digest("base64")}'`;
}

function collectInlineHashes() {
  if (!fs.existsSync(builtAppDir)) {
    console.error("[start] Missing built app HTML for CSP hash generation.");
    console.error("[start] Run `npm run build` first, then run `npm run start` again.");
    process.exit(1);
  }

  const scriptHashes = new Set();
  const styleHashes = new Set();

  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
        continue;
      }

      if (!entry.isFile() || !entry.name.endsWith(".html")) {
        continue;
      }

      const html = fs.readFileSync(fullPath, "utf8");
      for (const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script(?:\s[^>]*)?>/gi)) {
        if (match[1]) {
          scriptHashes.add(hashInlineContent(match[1]));
        }
      }
      for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style(?:\s[^>]*)?>/gi)) {
        if (match[1]) {
          styleHashes.add(hashInlineContent(match[1]));
        }
      }
      for (const match of html.matchAll(/ style="([^"]+)"/g)) {
        if (match[1]) {
          styleHashes.add(hashInlineContent(match[1]));
        }
      }
    }
  };

  visit(builtAppDir);

  return {
    scripts: [...scriptHashes].sort(),
    styles: [...styleHashes].sort()
  };
}

function createProductionHeaders() {
  const inlineHashes = collectInlineHashes();
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' ${inlineHashes.scripts.join(" ")}`,
    `style-src 'self' 'unsafe-hashes' ${inlineHashes.styles.join(" ")}`,
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join("; ");

  return {
    "content-security-policy": contentSecurityPolicy,
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "cross-origin-opener-policy": "same-origin",
    "cross-origin-resource-policy": "same-origin",
    "x-frame-options": "DENY",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=()"
  };
}

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
  env: {
    ...process.env,
    PORT: String(internalPort),
    HOSTNAME: internalHost
  }
});

const productionHeaders = createProductionHeaders();
const proxy = http.createServer((request, response) => {
  const upstream = http.request(
    {
      hostname: internalHost,
      port: internalPort,
      method: request.method,
      path: request.url,
      headers: {
        ...request.headers,
        host: `${internalHost}:${internalPort}`
      }
    },
    (upstreamResponse) => {
      for (const [name, value] of Object.entries(upstreamResponse.headers)) {
        if (value !== undefined) {
          response.setHeader(name, value);
        }
      }

      for (const [name, value] of Object.entries(productionHeaders)) {
        response.setHeader(name, value);
      }

      response.writeHead(upstreamResponse.statusCode ?? 502);
      upstreamResponse.pipe(response);
    }
  );

  upstream.on("error", (error) => {
    response.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    response.end(`Proxy error: ${error.message}`);
  });

  request.pipe(upstream);
});

proxy.listen(publicPort, publicHost);

const forwardSignal = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));

child.on("exit", (code, signal) => {
  proxy.close();
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
