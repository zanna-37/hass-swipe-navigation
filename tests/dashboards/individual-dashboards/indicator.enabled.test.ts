import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test("indicator: shows and highlights active dot", async ({ page }) => {
  const dashboardPath = "/indicator-enabled";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(/\/0$/);

  const haAppLayout = page.locator("[id='view']");
  await SwipeHelper.swipeLeft(haAppLayout);

  // Indicator should exist within keep-alive time
  const indicator = page.locator("#hsn-slide-indicator");
  await expect(indicator).toBeVisible();

  const dots = indicator.locator("span.hsn-dot");
  await expect(dots).toHaveCountGreaterThan(0);

  // Active dot should have transform scale(1.15)
  const activeHasScale = await page.evaluate(() => {
    const el = document.getElementById("hsn-slide-indicator");
    if (!el) return false;
    const dots = Array.from(el.children) as HTMLSpanElement[];
    return dots.some(dot => (dot.style.transform || "").includes("scale(1.15)"));
  });
  expect(activeHasScale).toBeTruthy();
});
