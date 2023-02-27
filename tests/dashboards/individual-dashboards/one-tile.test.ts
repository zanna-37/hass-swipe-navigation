import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

// Annotate entire file as serial
test.describe.configure({ mode: "serial" });

test("shouldn't change, tile slider swiped", async ({ page }) => {
  const dashboardPath = "/one-tile";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const slider = page.locator("#slider");
  const mdCard = page.locator("hui-markdown-card");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  const sliderBox = await slider.boundingBox();
  if (sliderBox == null) { throw new Error("element doesn't have a bounding box"); }

  await SwipeHelper.swipeRight(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeLeft(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/0");

  await SwipeHelper.swipeLeft(slider);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeRight(slider);
  await expect(page).toHaveURL(dashboardPath + "/0");


  let matches = 0;
  const regexp = /.*Ignoring touch on "div".*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(2);
});
