import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test("shouldn't wrap", async ({ page }) => {
  const dashboardPath = "/no-wrap";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const haAppLayout = page.locator("ha-app-layout");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  await SwipeHelper.swipeRight(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/2");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/3");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/3");
  await SwipeHelper.swipeRight(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/2");

  let matches = 0;
  const regexp = new RegExp(".*wrap is disabled.*");
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(2);
});
