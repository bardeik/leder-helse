import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("leader-health-language", "no");
  });
});

async function setWeeklyWeight(page: Page, value: string) {
  const weight = page.getByLabel("Vekt (kg)");
  await weight.click();
  await weight.fill(value);
  await weight.blur();
  await expect(page.getByText("Endringer lagret")).toBeVisible();
}

async function goBackDays(page: Page, days: number) {
  const previousDayButton = page.getByRole("button", { name: "Forrige dag" });
  for (let i = 0; i < days; i += 1) {
    await previousDayButton.click();
  }
}

async function goForwardDays(page: Page, days: number) {
  const nextDayButton = page.getByRole("button", { name: "Neste dag" });
  for (let i = 0; i < days; i += 1) {
    await nextDayButton.click();
  }
}

async function setEnergy(page: Page, value: "1" | "2" | "3" | "4" | "5") {
  await page.getByRole("radio", { name: value, exact: true }).check();
  await expect(page.getByText("Endringer lagret")).toBeVisible();
}

async function expectEdgeLabelsInsideSparkline(card: ReturnType<Page["locator"]>) {
  const svg = card.locator("svg").first();
  await expect(svg).toBeVisible();

  const labels = svg.locator("text");
  const labelCount = await labels.count();
  expect(labelCount).toBeGreaterThanOrEqual(2);

  const firstLabel = labels.first();
  const lastLabel = labels.nth(labelCount - 1);

  const [svgBox, firstBox, lastBox] = await Promise.all([
    svg.boundingBox(),
    firstLabel.boundingBox(),
    lastLabel.boundingBox()
  ]);

  expect(svgBox).not.toBeNull();
  expect(firstBox).not.toBeNull();
  expect(lastBox).not.toBeNull();

  if (!svgBox || !firstBox || !lastBox) {
    return;
  }

  const tolerance = 0.5;
  expect(firstBox.x).toBeGreaterThanOrEqual(svgBox.x - tolerance);
  expect(firstBox.x + firstBox.width).toBeLessThanOrEqual(svgBox.x + svgBox.width + tolerance);
  expect(lastBox.x).toBeGreaterThanOrEqual(svgBox.x - tolerance);
  expect(lastBox.x + lastBox.width).toBeLessThanOrEqual(svgBox.x + svgBox.width + tolerance);
}

test("shows full trend labels on mobile without clipping in Oversikt", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/check-in");

  await setWeeklyWeight(page, "79,4");
  await page.getByRole("button", { name: "Forrige uke" }).click();
  await setWeeklyWeight(page, "80,1");
  await page.getByRole("button", { name: "Forrige uke" }).click();
  await setWeeklyWeight(page, "80,8");

  await page.goto("/log");
  await setEnergy(page, "5");
  await goBackDays(page, 7);
  await setEnergy(page, "2");
  await goForwardDays(page, 7);

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Vekttrend" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Energisnitt" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Netter med godkjent søvn" })).toBeVisible();

  const weightCard = page.locator("article.card", { has: page.getByRole("heading", { name: "Vekttrend" }) });
  const energyCard = page.locator("article.card", { has: page.getByRole("heading", { name: "Energisnitt" }) });
  const sleepCard = page.locator("article.card", {
    has: page.getByRole("heading", { name: "Netter med godkjent søvn" })
  });

  await expect(weightCard.locator("p.dashboard-metric-value")).toHaveText(/\d+[.,]\d\s+kg/);
  await expect(energyCard.locator("p.dashboard-metric-value")).toHaveText(/\d+[.,]\d\s+i snitt/);

  if (testInfo.project.name === "Mobile Chrome") {
    await expect(page.locator("section.grid.grid-3")).toHaveScreenshot("dashboard-trends-mobile.png", {
      maxDiffPixelRatio: 0.02
    });
  }

  await expectEdgeLabelsInsideSparkline(weightCard);
  await expectEdgeLabelsInsideSparkline(energyCard);
  await expectEdgeLabelsInsideSparkline(sleepCard);
});
