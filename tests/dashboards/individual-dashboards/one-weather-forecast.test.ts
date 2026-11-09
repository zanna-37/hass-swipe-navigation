import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test.describe.configure({ mode: "serial" });

test("shouldn't change, overflowing weather forecast strip swiped", async ({ page }) => {
  const dashboardPath = "/one-weather-forecast";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const mdCard = page.locator("hui-markdown-card");
  const overflowingForecast = page.locator("hui-weather-forecast-card").nth(0).locator(".forecast");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // Sanity: swipe on markdown navigates
  await SwipeHelper.swipeLeft(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeRight(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/0");

  await SwipeHelper.swipeLeft(overflowingForecast);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeRight(overflowingForecast);
  await expect(page).toHaveURL(dashboardPath + "/0");

  let matches = 0;
  const regexp = /.*Ignoring touch on horizontally scrollable "div\.forecast[^"]*" scoped to "hui-weather-forecast-card"\..*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(2);
});

test("should change, current weather of the overflowing card swiped", async ({ page }) => {
  const dashboardPath = "/one-weather-forecast";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const currentWeather = page.locator("hui-weather-forecast-card").nth(0).locator(".content");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // Only the forecast strip scrolls: the rest of the card keeps navigating
  await SwipeHelper.swipeLeft(currentWeather);
  await expect(page).toHaveURL(dashboardPath + "/1");

  let matches = 0;
  const regexp = /.*Ignoring touch on (?:horizontally|vertically) scrollable "div\.forecast[^"]*".*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(0);
});

test("should change, fitting weather forecast strip swiped", async ({ page }) => {
  const dashboardPath = "/one-weather-forecast";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const fittingForecast = page.locator("hui-weather-forecast-card").nth(1).locator(".forecast");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // A strip that fits doesn't scroll, so the swipe is not scroll-blocked
  await SwipeHelper.swipeLeft(fittingForecast);
  await expect(page).toHaveURL(dashboardPath + "/1");

  let matches = 0;
  const regexp = /.*Ignoring touch on (?:horizontally|vertically) scrollable "div\.forecast[^"]*".*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(0);
});
