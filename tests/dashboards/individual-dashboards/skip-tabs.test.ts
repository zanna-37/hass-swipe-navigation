import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test("should skip 0 and 3", async ({ page }) => {
  const dashboardPath = "/skip-tabs";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const haAppLayout = page.locator("ha-app-layout");

  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/2");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/2");
  await SwipeHelper.swipeRight(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeRight(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/2");
  await page.goto(dashboardPath + "/3");
  await expect(page).toHaveURL(dashboardPath + "/3");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/1");
});
