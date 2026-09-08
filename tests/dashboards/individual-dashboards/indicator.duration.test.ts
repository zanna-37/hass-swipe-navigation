import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

// Verifies indicator is removed after indicator_duration

test("indicator: removed after duration", async ({ page }) => {
  const dashboardPath = "/indicator-duration-default"; // for setting indicator_duration=1500

  await page.goto(dashboardPath);
  await expect(page).toHaveURL(/\/0$/);
  const haAppLayout = page.locator("[id='view']");

  await SwipeHelper.swipeLeft(haAppLayout);
  const indicator = page.locator("#hsn-slide-indicator");
  await expect(indicator).toBeVisible();

  await page.waitForTimeout(1520);
  await expect(indicator).toHaveCount(0);
});
