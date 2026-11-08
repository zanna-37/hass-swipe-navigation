import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test("light hue scrubber blocks swipes but surrounding chrome navigates", async ({ page }) => {
  const dashboardPath = "/one-scrubber";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const scrubber = page.locator("ha-control-scrubber");
  const mdCard = page.locator("hui-markdown-card");
  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  await expect(scrubber).toBeVisible();

  await SwipeHelper.swipeRight(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeLeft(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/0");

  await SwipeHelper.swipeLeft(scrubber);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeRight(scrubber);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const matches = consoleLogs.filter((log) => /Ignoring touch on ".*"/.test(log)).length;
  expect(matches).toBe(2);
});
