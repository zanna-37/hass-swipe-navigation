import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test("shouldn't change, tabs swiped ", async ({ page }) => {
  const dashboardPath = "/default-values-with-logger";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const tabsContainer = page.locator("#tabsContainer");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  await SwipeHelper.swipeRight(tabsContainer);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeLeft(tabsContainer);
  await expect(page).toHaveURL(dashboardPath + "/0");

  let matches = 0;
  const regexp = new RegExp(".*Ignoring touch on \"app-header\".*");
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(2);
});
