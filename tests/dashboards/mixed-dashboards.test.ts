import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../helpers/touchHelpers";

test.skip("should update config", async ({ page }) => {
  // TODO solve this
  test.fail(true, "Bug https://github.com/zanna-37/hass-swipe-navigation/issues/12");

  // Use default config
  await page.goto("/default-values");
  await expect(page).toHaveURL("/default-values/0");

  // Change page
  await page.getByText(/No wrap/).click();

  // Test if the config is updated
  const dashboardPath = "/no-wrap";

  await expect(page).toHaveURL(dashboardPath + "/0");

  const haAppLayout = page.locator("ha-app-layout");

  await SwipeHelper.swipeRight(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/0");

  // TODO test if the console prints "Configuration read"
});
