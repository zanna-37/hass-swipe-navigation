import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test.describe.configure({ mode: "serial" });

test("shouldn't change, overflowing view header badges swiped", async ({ page }) => {
  const dashboardPath = "/one-badges-scroll";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  // The view header holds a markdown card too, so the control card is located inside a section
  const mdCard = page.locator("hui-section hui-markdown-card");
  const overflowingBadges = page.locator("hui-view-header .badges.scroll");

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
  const regexp = /.*Ignoring touch on horizontally scrollable "div\.badges[^"]*" scoped to "hui-view-header"\..*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(2);
});

test("should change, view header heading swiped", async ({ page }) => {
  const dashboardPath = "/one-badges-scroll";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const heading = page.locator("hui-view-header .heading");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // The heading shares the header layout with the badges, but only the badges row scrolls
  await SwipeHelper.swipeLeft(heading);
  await expect(page).toHaveURL(dashboardPath + "/1");

  let matches = 0;
  const regexp = /.*Ignoring touch on .*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(0);
});

test("should change, fitting view header badges swiped", async ({ page }) => {
  const dashboardPath = "/one-badges-scroll";
  await page.goto(dashboardPath + "/1");
  await expect(page).toHaveURL(dashboardPath + "/1");

  const fittingBadges = page.locator("hui-view-header .badges.scroll");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // A badges row that fits doesn't scroll, so the swipe is not scroll-blocked
  await SwipeHelper.swipeRight(fittingBadges);
  await expect(page).toHaveURL(dashboardPath + "/0");

  let matches = 0;
  const regexp = /.*Ignoring touch on .*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(0);
});
