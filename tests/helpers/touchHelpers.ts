import { JSHandle, Locator, Page } from "@playwright/test";

export class SwipeHelper {
  // Settle before dispatching a swipe:
  // - Wait for the view to actually have rendered children (proxy for "HA
  //   has loaded the dashboard's lovelace config and the dashboard is
  //   visible"). Without this the first swipe can land before swipe-nav has
  //   even read the config.
  // - Sleep a beat so MutationObservers in swipe-navigation have run (which
  //   is when it attaches its pointer listeners) and any in-flight view
  //   animation (fade/flip/swipe transition) has finished.
  private static async waitForReady(target: Locator) {
    const page = target.page();
    await page.locator("[id='view'] > *").first().waitFor({ state: "attached", timeout: 10000 });
    await page.waitForTimeout(500);
  }

  private static async getTouchEventInit(x: number, y: number, touchId: number, element: Locator) {
    const touchEvent = await element.evaluateHandle(
      (element: Element, [x, y, touchId]: number[]) => {
        const touchObj = new Touch({
          identifier: touchId,
          target: element,
          clientX: x,
          clientY: y,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0,
        });

        const touchEvent: TouchEventInit = {
          cancelable: true,
          bubbles: true,
          composed: true,
          touches: [touchObj],
          targetTouches: [],//[touchObj],
          changedTouches: [touchObj],
        };

        return touchEvent;
      },
      [x, y, touchId]
    );

    return touchEvent;
  }

  static async swipe(startX: number, endX: number, startY: number, endY: number, element: Locator) {
    const touchId = Date.now();
    const steps = Math.max(
      3,
      (Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))) / 20
    );

    // Generate events
    const events: [string, JSHandle][] = [];
    events.push(["touchstart", await this.getTouchEventInit(startX, startY, touchId, element)]);
    for (let progressPct = 0; progressPct <= 1; progressPct += (1 / steps)) {
      events.push([
        "touchmove",
        await this.getTouchEventInit(startX + ((endX - startX) * progressPct), startY + ((endY - startY) * progressPct), touchId, element)
      ]);
    }
    events.push(["touchend", await this.getTouchEventInit(endX, endY, touchId, element)]);

    // Dispatch events
    const swipeDuration = 500;
    const gracePeriod = 200;
    const swipeStartTimestamp = Date.now();
    for (const [i, [eventName, eventInit]] of events.entries()) {
      await element.dispatchEvent(eventName, eventInit);

      const progressPct = i / events.length;
      const expectedTimestamp = swipeStartTimestamp + (swipeDuration * progressPct) - gracePeriod;
      if (Date.now() < expectedTimestamp) {
        await new Promise(r => setTimeout(r, expectedTimestamp - Date.now()));  // sleep
      }
    }
  }

  static async swipeLeft(target: Locator, reference: Locator | null = null) {
    await this.waitForReady(target);
    const box = await (reference ?? target).boundingBox();
    if (box == null) { throw new Error("element doesn't have a bounding box"); }
    await this.swipe(box.x + box.width * 0.9, box.x + box.width * 0.1, box.y + box.height / 2, box.y + box.height / 2, target);
  }

  static async swipeRight(target: Locator, reference: Locator | null = null) {
    await this.waitForReady(target);
    const box = await (reference ?? target).boundingBox();
    if (box == null) { throw new Error("element doesn't have a bounding box"); }
    await this.swipe(box.x + box.width * 0.1, box.x + box.width * 0.9, box.y + box.height / 2, box.y + box.height / 2, target);
  }

  static async swipeUp(target: Locator, reference: Locator | null = null) {
    await this.waitForReady(target);
    const box = await (reference ?? target).boundingBox();
    if (box == null) { throw new Error("element doesn't have a bounding box"); }
    await this.swipe(box.x + box.width / 2, box.x + box.width / 2, box.y + box.height * 0.9, box.y + box.height * 0.1, target);
  }

  static async swipeDown(target: Locator, reference: Locator | null = null) {
    await this.waitForReady(target);
    const box = await (reference ?? target).boundingBox();
    if (box == null) { throw new Error("element doesn't have a bounding box"); }
    await this.swipe(box.x + box.width / 2, box.x + box.width / 2, box.y + box.height * 0.1, box.y + box.height * 0.9, target);
  }

  static async swipeLeftMouse(page: Page, target: Locator, reference: Locator | null = null) {
    await this.waitForReady(target);
    const box = await (reference ?? target).boundingBox();
    if (box == null) { throw new Error("element doesn't have a bounding box"); }
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.1, box.y + box.height / 2);
    await page.mouse.up();
  }

  static async swipeRightMouse(page: Page, target: Locator, reference: Locator | null = null) {
    await this.waitForReady(target);
    const box = await (reference ?? target).boundingBox();
    if (box == null) { throw new Error("element doesn't have a bounding box"); }
    await page.mouse.move(box.x + box.width * 0.1, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2);
    await page.mouse.up();
  }

  static async swipeUpMouse(page: Page, target: Locator, reference: Locator | null = null) {
    await this.waitForReady(target);
    const box = await (reference ?? target).boundingBox();
    if (box == null) { throw new Error("element doesn't have a bounding box"); }
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.9);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.1);
    await page.mouse.up();
  }

  static async swipeDownMouse(page: Page, target: Locator, reference: Locator | null = null) {
    await this.waitForReady(target);
    const box = await (reference ?? target).boundingBox();
    if (box == null) { throw new Error("element doesn't have a bounding box"); }
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.1);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.9);
    await page.mouse.up();
  }
}
