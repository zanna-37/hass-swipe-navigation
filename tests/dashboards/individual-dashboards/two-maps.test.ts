import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test("shouldn't change, map swiped", async ({ page }) => {
  const dashboardPath = "/two-maps";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const map = page.locator("#map");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  await SwipeHelper.swipeLeft(map);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeRight(map);
  await expect(page).toHaveURL(dashboardPath + "/0");

  let matches = 0;
  const regexp = new RegExp(".*Ignoring touch on \"hui-map-card\".*");
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(2);
});
