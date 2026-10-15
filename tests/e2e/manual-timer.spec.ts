import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }, testInfo) => {
  await page.addInitScript(
    (locale) => localStorage.setItem("leader-health-language", locale),
    testInfo.title.includes("English") ? "en" : "no"
  );
});

test("opens from the menu and adjusts defaults in the requested increments", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Åpne meny" }).click();
  await page.getByRole("menuitem", { name: "Manuell tidtaking" }).click();
  await expect(page.getByRole("heading", { name: "Manuell tidtaking" })).toBeVisible();
  await expect(page.getByLabel("Aktivitet (sekunder)", { exact: true })).toHaveValue("40");
  await expect(page.getByLabel("Pause (sekunder)", { exact: true })).toHaveValue("20");
  await expect(page.getByLabel("Runder", { exact: true })).toHaveValue("6");
  await page.getByRole("button", { name: "Øk aktivitet (sekunder)", exact: true }).click();
  await expect(page.getByLabel("Aktivitet (sekunder)", { exact: true })).toHaveValue("50");
  await page.getByRole("button", { name: "Senk pause (sekunder)", exact: true }).click();
  await expect(page.getByLabel("Pause (sekunder)", { exact: true })).toHaveValue("10");
  await page.getByRole("button", { name: "Øk runder", exact: true }).click();
  await expect(page.getByLabel("Runder", { exact: true })).toHaveValue("7");
  await page.reload();
  await expect(page.getByLabel("Runder", { exact: true })).toHaveValue("7");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath("manual-timer.png"), fullPage: true });
});

test("runs activity and rest, holds, resumes and completes without a final rest", async ({ page }) => {
  await page.goto("/manual-timer", { waitUntil: "networkidle" });
  await page.getByLabel("Aktivitet (sekunder)", { exact: true }).fill("10");
  await page.getByLabel("Aktivitet (sekunder)", { exact: true }).blur();
  await page.getByLabel("Pause (sekunder)", { exact: true }).fill("10");
  await page.getByLabel("Pause (sekunder)", { exact: true }).blur();
  await page.getByLabel("Runder", { exact: true }).fill("2");
  await page.getByLabel("Runder", { exact: true }).blur();
  await page.clock.install();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByLabel("Runder", { exact: true })).toBeDisabled();
  await page.clock.runFor(3000);
  await expect(page.getByRole("status").filter({ hasText: /^Aktivitet$/ })).toBeVisible();
  await page.clock.runFor(10000);
  await expect(page.getByRole("status").filter({ hasText: /^Pause$/ })).toBeVisible();
  await expect(page.locator(".manual-timer-progress dd").first()).toHaveText("1");
  await page.getByRole("button", { name: "Sett på vent" }).click();
  const remaining = await page.getByLabel("sekunder", { exact: true }).textContent();
  await page.clock.runFor(5000);
  await expect(page.getByLabel("sekunder", { exact: true })).toHaveText(remaining!);
  await page.getByRole("button", { name: "Fortsett", exact: true }).click();
  await page.clock.runFor(20000);
  await expect(page.getByRole("status").filter({ hasText: /^Fullført$/ })).toBeVisible();
  await expect(page.locator(".manual-timer-progress dd").last()).toHaveText("0");
  await page.getByRole("button", { name: "Nullstill", exact: true }).click();
  await expect(page.getByLabel("Runder", { exact: true })).toBeEnabled();
});

test("supports English and blocks invalid input", async ({ page }) => {
  await page.goto("/manual-timer", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Manual timer" })).toBeVisible();
  await page.getByLabel("Rounds", { exact: true }).fill("0");
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeDisabled();
  await expect(page.getByRole("alert").filter({ hasText: "Use whole numbers" })).toBeVisible();
  await page.getByLabel("Rounds", { exact: true }).fill("1");
  await page.getByLabel("Rounds", { exact: true }).blur();
  await expect(page.getByRole("button", { name: "Start", exact: true })).toBeEnabled();
});
