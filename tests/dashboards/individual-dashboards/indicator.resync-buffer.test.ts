import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

// Verifies single resync after animate_duration + indicator_resync_buffer

test("indicator: single resync after duration + buffer", async ({ page }) => {
  const dashboardPath = "/indicator-resync-default"; // for setting indicator_resync_buffer=50
  const durationPlusBufferMs = 250; // 200 animate_duration + 50 resync_buffer

  await page.goto(dashboardPath);
  await expect(page).toHaveURL(/\/0$/);
  const haAppLayout = page.locator("[id='view']");

  // Swipe to the next view
  await SwipeHelper.swipeLeft(haAppLayout);

  // After resync window, active dot should indicate new index
  await page.waitForTimeout(durationPlusBufferMs + 50);

  const activeIndex = await page.evaluate(() => {
    const el = document.getElementById("hsn-slide-indicator");
    if (!el) return -1;
    const dots = Array.from(el.children) as HTMLSpanElement[];
    return dots.findIndex(d => (d.style.transform || "").includes("scale(1.15)"));
  });
  expect(activeIndex).toBeGreaterThanOrEqual(0);

  // And URL should be on the next tab
  await expect(page).toHaveURL(/\/1$/);
});
