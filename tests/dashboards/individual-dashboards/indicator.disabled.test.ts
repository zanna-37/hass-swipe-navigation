import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

// Indicator disabled: indicator: false
// Verifies: indicator element never appears

test("indicator: disabled does not render", async ({ page }) => {
  const dashboardPath = "/indicator-disabled";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(/\/0$/);

  const haAppLayout = page.locator("[id='view']");
  await SwipeHelper.swipeLeft(haAppLayout);

  await expect(page.locator("#hsn-slide-indicator")).toHaveCount(0);
});
