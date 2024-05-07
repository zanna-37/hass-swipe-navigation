import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test("should skip subview", async ({ page }) => {
  const dashboardPath = "/subview-skip";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const haAppLayout = page.locator("div[id='view']");

  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/2");
  await SwipeHelper.swipeRight(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/0");
});
