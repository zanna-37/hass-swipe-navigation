import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test("should preserve URL, using defaults", async ({ page }) => {
  const urlParams = "?thishouldbe=preserved#hashtopreserve";

  const dashboardPath = "/default-values";
  await page.goto(dashboardPath + "/0" + urlParams);
  await expect(page).toHaveURL(dashboardPath + "/0" + urlParams);

  const haAppLayout = page.locator("[id='view']");

  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/1" + urlParams);
});
