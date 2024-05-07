import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test("should change, using defaults", async ({ page }) => {
  const dashboardPath = "/default-values";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const haAppLayout = page.locator("div[id='view']");

  await SwipeHelper.swipeRight(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/3");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/2");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/3");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/0");

  await page.goto(dashboardPath + "/4");
  await page.getByText("Subview content...", { exact: true }).waitFor();
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/0");

  await page.goto(dashboardPath + "/4");
  await page.getByText("Subview content...", { exact: true }).waitFor();
  await SwipeHelper.swipeRight(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/3");
});
