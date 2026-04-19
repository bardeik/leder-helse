import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const routes = ["/", "/log", "/check-in", "/settings"];
const errors = [];

const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();

  page.on("pageerror", (error) => {
    errors.push({ type: "pageerror", route: page.url(), message: error.message });
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push({ type: "console.error", route: page.url(), message: msg.text() });
    }
  });

  for (const route of routes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
  }
} catch (error) {
  console.error("BROWSER_SMOKE_FAILED");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await browser.close();
}

if (errors.length > 0) {
  console.error("BROWSER_ERRORS_DETECTED");
  console.error(JSON.stringify(errors, null, 2));
  process.exit(1);
}

console.log("NO_BROWSER_ERRORS_DETECTED");
