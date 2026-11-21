import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test("history graph chart blocks swipes but surrounding chrome navigates", async ({ page }) => {
  const dashboardPath = "/one-history-graph";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const chart = page.locator("hui-history-graph-card ha-chart-base .chart.touch-scrub");
  const cardHeader = page.locator("hui-history-graph-card .card-header");
  const mdCard = page.locator("hui-markdown-card");
  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  await expect(chart).toBeVisible();

  await SwipeHelper.swipeLeft(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeRight(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/0");

  // Only the chart is a gesture surface: the card's header keeps navigating
  await SwipeHelper.swipeLeft(cardHeader);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeRight(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/0");

  await SwipeHelper.swipeLeft(chart);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeRight(chart);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const regexp = /Ignoring touch on "[^"]*", matching scoped exception "ha-chart-base >> \.chart\.touch-scrub"/;
  const matches = consoleLogs.filter((log) => regexp.test(log)).length;
  expect(matches).toBe(2);
});
