import { test, expect, Locator } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test.describe.configure({ mode: "serial" });

const dashboardPath = "/stopped-pointer-events";

/**
 * Makes `target` stop the propagation of `eventName`, like a card that keeps the event to
 * itself would.
 */
async function stopPropagationOf(target: Locator, eventName: string) {
  await target.evaluate((element: Element, eventName: string) => {
    element.addEventListener(eventName, (event) => { event.stopPropagation(); });
  }, eventName);
}

test("should swipe from the control of an entities row", async ({ page }) => {
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const mdCard = page.locator("hui-markdown-card");
  // Home Assistant stops `touchend` at the slot that holds the control of the row, so the
  // events are dispatched on the control itself. The coordinates come from the markdown card,
  // which is wide enough for a swipe on every viewport.
  const rowControl = page.locator("hui-toggle-entity-row hui-generic-entity-row > *").first();

  await SwipeHelper.swipeLeft(rowControl, mdCard);
  await expect(page).toHaveURL(dashboardPath + "/1");
});

for (const eventName of ["touchstart", "touchmove", "touchend"]) {
  test(`should swipe on an element that stops ${eventName}`, async ({ page }) => {
    await page.goto(dashboardPath);
    await expect(page).toHaveURL(dashboardPath + "/0");

    const mdCard = page.locator("hui-markdown-card");
    await stopPropagationOf(mdCard, eventName);

    await SwipeHelper.swipeLeft(mdCard);
    await expect(page).toHaveURL(dashboardPath + "/1");
  });
}

for (const eventName of ["mousedown", "mousemove", "mouseup"]) {
  test(`should swipe with the mouse on an element that stops ${eventName}`, async ({ page }) => {
    await page.goto(dashboardPath);
    await expect(page).toHaveURL(dashboardPath + "/0");

    const mdCard = page.locator("hui-markdown-card");
    await stopPropagationOf(mdCard, eventName);

    await SwipeHelper.swipeLeftMouse(page, mdCard);
    await expect(page).toHaveURL(dashboardPath + "/1");
  });
}
