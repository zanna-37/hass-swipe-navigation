import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test("scrollbar swipe behavior depends on overflow", async ({ page, isMobile }) => {

  const dashboardPath = "/one-scrollbar";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const scrollbarContainer = page.locator("ha-chip-set");
  const mdCard = page.locator("hui-markdown-card");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // Sanity: swipe on markdown navigates
  await SwipeHelper.swipeLeft(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeRight(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/0");

  if (isMobile) {
    // On mobile the chip-set have a scrollbar, swipe should be blocked
    await SwipeHelper.swipeLeft(scrollbarContainer);
    await expect(page).toHaveURL(dashboardPath + "/0");
    await SwipeHelper.swipeRight(scrollbarContainer);
    await expect(page).toHaveURL(dashboardPath + "/0");

    let matches = 0;
    const regexp = /.*Ignoring touch on scrollable "ha-chip-set".*/;
    for (const log of consoleLogs) {
      if (regexp.test(log)) { matches++; }
    }
    expect(matches).toBe(2);
  } else {
    // On desktop the chip-set wraps without scrollbar, swipe should go through
    await SwipeHelper.swipeLeft(scrollbarContainer);
    await expect(page).toHaveURL(dashboardPath + "/1");
    await SwipeHelper.swipeRight(mdCard);
    await expect(page).toHaveURL(dashboardPath + "/0");

    let matches = 0;
    const regexp = /.*Ignoring touch on (?:scrollable )?"ha-chip-set".*/;
    for (const log of consoleLogs) {
      if (regexp.test(log)) { matches++; }
    }
    expect(matches).toBe(0);
  }
});
