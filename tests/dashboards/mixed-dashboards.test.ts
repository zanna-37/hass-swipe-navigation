import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../helpers/touchHelpers";

test("should update config", async ({ page, isMobile }) => {
  test.skip(isMobile ?? false, 'Sidebar is hidden on mobile, can\'t click easily');

  // Use default config
  await page.goto("/default-values");
  await expect(page).toHaveURL("/default-values/0");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // Change page
  await page.getByText(/No wrap/).click();

  // Test if the config is updated
  const dashboardPath = "/no-wrap";

  await expect(page).toHaveURL(dashboardPath + "/0");

  const haAppLayout = page.locator("[id='view']");

  await SwipeHelper.swipeRight(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/0");

  let matches = 0;
  const regexp = /.*New configuration loaded.*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(1);
});
