import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test("shouldn't change, skip-all", async ({ page }) => {
  const dashboardPath = "/skip-all";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const haAppLayout = page.locator("ha-app-layout");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeRight(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/0");

  let matches = 0;
  const regexp = /.*no viable tabs found for swiping.*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(2);
});
