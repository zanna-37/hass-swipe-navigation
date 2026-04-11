import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test.describe.configure({ mode: "serial" });

test("should block swipe on scrollable .ha-scrollbar", async ({ page }) => {
  const dashboardPath = "/scroll-dependent";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const mdCard = page.locator("hui-markdown-card");
  const scrollableStates = page.locator("hui-entities-card").nth(0).locator("#states");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // Sanity: swipe on markdown navigates
  await SwipeHelper.swipeLeft(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeRight(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/0");

  // Scrollable entities card: swipe should be blocked
  await SwipeHelper.swipeLeft(scrollableStates);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeRight(scrollableStates);
  await expect(page).toHaveURL(dashboardPath + "/0");

  let matches = 0;
  const regexp = /.*Ignoring touch on scrollable "div".*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(2);
});

test("should allow swipe on non-scrollable .ha-scrollbar", async ({ page }) => {
  const dashboardPath = "/scroll-dependent";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const mdCard = page.locator("hui-markdown-card");
  const nonScrollableStates = page.locator("hui-entities-card").nth(1).locator("#states");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // Non-scrollable entities card: swipe should go through
  await SwipeHelper.swipeLeft(nonScrollableStates);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeRight(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/0");

  let matches = 0;
  const regexp = /.*Ignoring touch on (?:scrollable )?"div".*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(0);
});
