import { test, expect, Page } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

// Fails if Home Assistant drops the trailing slash, as the swipe would then prove nothing
async function expectRoutePath(page: Page, routePath: string) {
  const haPanelLovelace = page.locator("ha-panel-lovelace");
  await expect.poll(() => haPanelLovelace.evaluate((panel: HTMLElement & { route?: { path?: string } }) => panel.route?.path)).toBe(routePath);
}

test("should change, view addressed by index opened with a trailing slash", async ({ page }) => {
  const dashboardPath = "/default-values";
  await page.goto(dashboardPath + "/0/");
  await expectRoutePath(page, "/0/");
  await expect(page).toHaveURL(dashboardPath + "/0/");

  const haAppLayout = page.locator("[id='view']");

  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/1");
});

test("should change, view addressed by path opened with a trailing slash", async ({ page }) => {
  const dashboardPath = "/aa_tests";
  await page.goto(dashboardPath + "/home/");
  await expectRoutePath(page, "/home/");
  await expect(page).toHaveURL(dashboardPath + "/home/");

  const haAppLayout = page.locator("[id='view']");

  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/1");
});
