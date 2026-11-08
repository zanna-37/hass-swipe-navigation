import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

// A swipe whose end never reaches the dashboard, because a card stopped `touchend` from
// bubbling or the browser cancelled the touch, must not leak into the next gesture.
test("shouldn't change, tap after an interrupted swipe", async ({ page }) => {
  const dashboardPath = "/default-values-with-logger";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const haAppLayout = page.locator("[id='view']");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // Swallowed touchend
  await SwipeHelper.swipeLeft(haAppLayout, null, "none");
  await SwipeHelper.tap(haAppLayout);
  await page.waitForTimeout(500);
  await expect(page).toHaveURL(dashboardPath + "/0");

  // Cancelled by the browser
  await SwipeHelper.swipeLeft(haAppLayout, null, "touchcancel");
  await SwipeHelper.tap(haAppLayout);
  await page.waitForTimeout(500);
  await expect(page).toHaveURL(dashboardPath + "/0");
  expect(consoleLogs.filter((log) => /cancelled by the browser/.test(log))).toHaveLength(1);

  // A regular swipe still navigates afterwards
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/1");
});
