import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test.describe.configure({ mode: "serial" });

test("shouldn't change, overflowing heading card badges swiped", async ({ page }) => {
  const dashboardPath = "/one-heading-badges";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const mdCard = page.locator("hui-markdown-card");
  const overflowingBadges = page.locator("hui-heading-card").nth(0).locator(".badges");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // Sanity: swipe on markdown navigates
  await SwipeHelper.swipeLeft(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeRight(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/0");

  await SwipeHelper.swipeLeft(overflowingBadges);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeRight(overflowingBadges);
  await expect(page).toHaveURL(dashboardPath + "/0");

  let matches = 0;
  const regexp = /.*Ignoring touch on horizontally scrollable "div\.badges[^"]*" scoped to "hui-heading-card"\..*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(2);
});

test("should change, non-overflowing heading card badges swiped", async ({ page }) => {
  const dashboardPath = "/one-heading-badges";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const fittingBadges = page.locator("hui-heading-card").nth(1).locator(".badges");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // A single badge never overflows, so the swipe is not scroll-blocked
  await SwipeHelper.swipeLeft(fittingBadges);
  await expect(page).toHaveURL(dashboardPath + "/1");

  let matches = 0;
  const regexp = /.*Ignoring touch on (?:horizontally|vertically) scrollable "div\.badges[^"]*".*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(0);
});

test("should allow vertical swipe on overflowing heading card badges", async ({ page }) => {
  const dashboardPath = "/one-heading-badges";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const overflowingBadges = page.locator("hui-heading-card").nth(0).locator(".badges");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // The badges row never wraps, so it doesn't overflow vertically: the swipe
  // must reach the movement classification instead of being blocked upfront.
  await SwipeHelper.swipeDown(overflowingBadges);
  await expect(page).toHaveURL(dashboardPath + "/0");

  let blockedMatches = 0;
  const blockedRegexp = /.*Ignoring touch on vertically scrollable "div\.badges[^"]*".*/;
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
