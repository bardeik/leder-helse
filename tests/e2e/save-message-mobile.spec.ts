import { expect, test, type Page } from "@playwright/test";

async function expectInVisibleViewport(page: Page, text: string) {
  const message = page.getByText(text, { exact: true });
  await expect(message).toBeVisible();

  const box = await message.boundingBox();
  expect(box).not.toBeNull();

  if (!box) {
    return;
  }

  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  if (!viewport) {
    return;
  }

  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
}

test("shows save message in visible viewport after scrolling on /log mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/log");

  await expect(page.getByRole("heading", { name: "Log today" })).toBeVisible();

  // Simulate the user being at the bottom of the page on a small screen.
  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" as ScrollBehavior });
  });

  const sleepInput = page.getByLabel("Sleep hours (optional)");
  await sleepInput.click();
  await sleepInput.fill("4,5");
  await sleepInput.blur();

  await expectInVisibleViewport(page, "Changes saved");
});

test("shows save message in visible viewport without scrolling on /log mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/log");

  await expect(page.getByRole("heading", { name: "Log today" })).toBeVisible();

  const sleepInput = page.getByLabel("Sleep hours (optional)");
  await sleepInput.click();
  await sleepInput.fill("5,0");
  await sleepInput.blur();

  await expectInVisibleViewport(page, "Changes saved");
});

test("shows save message in visible viewport after scrolling on /check-in mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/check-in");

  await expect(page.getByRole("heading", { name: "Weekly weigh-in" })).toBeVisible();

  await page.evaluate(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" as ScrollBehavior });
  });

  const weightInput = page.getByLabel("Weight (kg)");
  await weightInput.click();
  await weightInput.fill("78,2");
  await weightInput.blur();

  await expectInVisibleViewport(page, "Changes saved");
});
