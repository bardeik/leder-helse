import { expect, test } from "@playwright/test";
import * as http from "node:http";
import { spawn, type ChildProcess } from "node:child_process";

test.setTimeout(120_000);

async function getStatusCode(url: string): Promise<number | undefined> {
  return await new Promise((resolve) => {
    const request = http.get(url, (response) => {
      response.resume();
      resolve(response.statusCode);
    });

    request.on("error", () => resolve(undefined));
    request.setTimeout(2_000, () => {
      request.destroy();
      resolve(undefined);
    });
  });
}

async function waitForServer(url: string) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 60_000) {
    const statusCode = await getStatusCode(url);
    if (statusCode && statusCode >= 200 && statusCode < 500) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for production server at ${url}.`);
}

async function stopServer(child: ChildProcess | undefined) {
  if (!child || child.killed) {
    return;
  }

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      if (!child.killed) {
        child.kill();
      }
      resolve();
    }, 5_000);

    child.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });

    child.kill();
  });
}

test("serves hardened production headers and loads without CSP console violations", async ({
  browser,
  request
}, testInfo) => {
  let productionServer: ChildProcess | undefined;
  let productionLogs = "";
  const productionPort = 3101 + testInfo.workerIndex;
  const productionBaseUrl = `http://127.0.0.1:${productionPort}`;

  try {
    productionServer = spawn(process.execPath, ["scripts/start-standalone.cjs"], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: String(productionPort),
        HOSTNAME: "127.0.0.1",
        NODE_ENV: "production"
      },
      stdio: ["ignore", "pipe", "pipe"]
    });

    productionServer.stdout?.on("data", (chunk) => {
      productionLogs += chunk.toString();
    });
    productionServer.stderr?.on("data", (chunk) => {
      productionLogs += chunk.toString();
    });

    await waitForServer(`${productionBaseUrl}/`);

    const response = await request.get(`${productionBaseUrl}/`);
    expect(response.ok()).toBeTruthy();

    const headers = response.headers();
    const csp = headers["content-security-policy"];

    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self'");
    expect(csp).not.toContain("'unsafe-inline'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(headers["strict-transport-security"]).toBe("max-age=31536000; includeSubDomains");
    expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
    expect(headers["cross-origin-resource-policy"]).toBe("same-origin");

    const page = await browser.newPage();
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.goto(`${productionBaseUrl}/`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Denne uken" })).toBeVisible();

    await page.goto(`${productionBaseUrl}/log`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Logg i dag" })).toBeVisible();
    const sleepInput = page.getByLabel("Sovntimer (valgfritt)");
    await sleepInput.click();
    await sleepInput.fill("4,5");
    await sleepInput.blur();
    await expect(page.getByText("Endringer lagret")).toBeVisible();

    await page.goto(`${productionBaseUrl}/settings`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Innstillinger" })).toBeVisible();

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  } catch (error) {
    const details = productionLogs.trim();
    if (details && error instanceof Error) {
      error.message = `${error.message}\n\n${details}`;
    }
    throw error;
  } finally {
    await stopServer(productionServer);
  }
});
