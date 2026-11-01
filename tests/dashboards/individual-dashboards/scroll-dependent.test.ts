import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test.describe.configure({ mode: "serial" });

test("should swipe horizontally on vertically scrollable .ha-scrollbar", async ({ page }) => {
  const dashboardPath = "/scroll-dependent";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const mdCard = page.locator("hui-markdown-card");
  const verticallyScrollableStates = page.locator("hui-entities-card").nth(0).locator("#states");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // Sanity: swipe on markdown navigates
  await SwipeHelper.swipeLeft(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeRight(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/0");

  // Vertically-scrollable entities card: swipe is allowed
  await SwipeHelper.swipeLeft(verticallyScrollableStates);
  await expect(page).toHaveURL(dashboardPath + "/1");
  // Reset to /0 so the verticallyScrollableStates locator resolves again
  await SwipeHelper.swipeRight(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeRight(verticallyScrollableStates);
  await expect(page).toHaveURL(dashboardPath + "/1");

  let matches = 0;
  const regexp = /.*Ignoring touch on (?:horizontally|vertically) scrollable "div[^"]*".*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(0);
});

test("should allow horizontal/vertical swipe on non-scrollable .ha-scrollbar", async ({ page }) => {
  const dashboardPath = "/scroll-dependent";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const mdCard = page.locator("hui-markdown-card");
  const nonScrollableStates = page.locator("hui-entities-card").nth(1).locator("#states");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // Non-scrollable entities card: horizontal swipe should go through
  await SwipeHelper.swipeLeft(nonScrollableStates);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeRight(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/0");

  // Non-scrollable entities card: vertical swipe must reach the movement
  // classification (logged as "Swipe ignored, vertical movement.") instead of
  // being blocked upfront as "vertically scrollable".
  await SwipeHelper.swipeDown(nonScrollableStates);
  await expect(page).toHaveURL(dashboardPath + "/0");

  let blockedMatches = 0;
  const blockedRegexp = /.*Ignoring touch on (?:horizontally|vertically) scrollable "div[^"]*".*/;
  for (const log of consoleLogs) {
    if (blockedRegexp.test(log)) { blockedMatches++; }
  }
  expect(blockedMatches).toBe(0);

  let verticalMatches = 0;
  const verticalRegexp = /.*Swipe ignored, vertical movement\..*/;
  for (const log of consoleLogs) {
    if (verticalRegexp.test(log)) { verticalMatches++; }
  }
  expect(verticalMatches).toBe(1);
});

test("should block horizontal swipe on horizontally scrollable .ha-scrollbar", async ({ page }) => {
  const dashboardPath = "/scroll-dependent";
  // The entities-card header wraps its chips onto new lines on wide viewports and only
  // scrolls horizontally on narrow ones, so every project runs this test at phone width.
  await page.setViewportSize({ width: 400, height: 800 });
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const mdCard = page.locator("hui-markdown-card");
  const chipSet = page.locator("hui-entities-card").nth(2).locator("ha-chip-set");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // Sanity: swipe on markdown navigates
  await SwipeHelper.swipeLeft(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeRight(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/0");

  // The header chip-set holds more chips than fit in one row. A single long-named chip
  // would not do: chips are capped at the container width and truncate their label.
  await chipSet.scrollIntoViewIfNeeded();
  await SwipeHelper.swipeLeft(chipSet);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeRight(chipSet);
  await expect(page).toHaveURL(dashboardPath + "/0");

  let matches = 0;
  const regexp = /.*Ignoring touch on horizontally scrollable "ha-chip-set[^"]*".*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(2);
});
