import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test("shouldn't change, scrollbar swiped", async ({ page, isMobile }) => {
  test.skip((!isMobile) ?? false, "The scrollbar is only visible on mobile");

  const dashboardPath = "/one-scrollbar";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const scrollbarContainer = page.locator("hui-buttons-header-footer > * > div");
  const mdCard = page.locator("hui-markdown-card");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  await SwipeHelper.swipeLeft(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeRight(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/0");

  await SwipeHelper.swipeLeft(scrollbarContainer);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeRight(scrollbarContainer);
  await expect(page).toHaveURL(dashboardPath + "/0");

  let matches = 0;
  const regexp = /.*Ignoring touch on "div".*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(2);
});
