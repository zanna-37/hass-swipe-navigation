import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test("shouldn't change, no swipe on subview", async ({ page }) => {
  const dashboardPath = "/subview-noswipe"
  await page.goto(dashboardPath + "/1");
  await expect(page).toHaveURL(dashboardPath + "/1");

  const haAppLayout = page.locator("[id='view']");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/1");

  await SwipeHelper.swipeRight(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/1");

  let matches = 0;
  const regexp = /.*Ignoring touch: Swipe navigation on subviews is disabled in the config.*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(2);
});
