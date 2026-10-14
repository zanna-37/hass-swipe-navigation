import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test("should ignore swipes starting within the edge margin", async ({ page }) => {
  const dashboardPath = "/edge-margin";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const haAppLayout = page.locator("[id='view']");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // Swipes starting away from the edges still navigate.
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/1");

  const viewport = page.viewportSize();
  if (viewport == null) { throw new Error("page doesn't have a viewport"); }
  const y = viewport.height / 2;

  // Starting at the left edge: ignored.
  await SwipeHelper.swipe(10, viewport.width * 0.9, y, y, haAppLayout);
  await page.waitForTimeout(500);
  await expect(page).toHaveURL(dashboardPath + "/1");

  // Starting at the right edge: ignored.
  await SwipeHelper.swipe(viewport.width - 10, viewport.width * 0.1, y, y, haAppLayout);
  await page.waitForTimeout(500);
  await expect(page).toHaveURL(dashboardPath + "/1");

  // Starting just inside the margin: navigates.
  await SwipeHelper.swipe(40, viewport.width * 0.9, y, y, haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/0");

  let matches = 0;
  const regexp = /.*within 30px of the screen edge.*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(2);
});
