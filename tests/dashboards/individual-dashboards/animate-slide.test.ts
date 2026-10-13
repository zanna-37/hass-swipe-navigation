import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

// Stand-in for navbar-card: a card that draws a `position: fixed` bar, like the real one.
const fakeNavbarCard = `
  customElements.define("navbar-card", class extends HTMLElement {
    setConfig() {}
    set hass(_hass) {}
    getCardSize() { return 1; }
    connectedCallback() {
      if (this.shadowRoot) return;
      this.attachShadow({ mode: "open" }).innerHTML =
        '<div class="navbar" style="position: fixed; left: 0; bottom: 0; width: 100vw; height: 60px; background: red;"></div>';
    }
  });
`;

test("should change, using animation slide", async ({ page }) => {
  const dashboardPath = "/animate-slide";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const haAppLayout = page.locator("[id='view']");

  await SwipeHelper.swipeRight(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/2");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/2");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/0");
});

test("should keep pinned elements in place, using animation slide", async ({ page }) => {
  const dashboardPath = "/animate-slide";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  // Defined once Home Assistant has loaded, which then rebuilds the cards using it.
  await page.evaluate(fakeNavbarCard);

  const navbar = page.locator("navbar-card .navbar");
  await expect(navbar).toBeVisible();
  const navbarBox = await navbar.boundingBox();
  if (navbarBox == null) { throw new Error("navbar doesn't have a bounding box"); }

  // Record, on every frame, where the visible navbar is drawn.
  await page.evaluate(() => {
    const positions: string[] = [];
    (window as unknown as { navbarPositions: string[] }).navbarPositions = positions;
    const findNavbar = (root: Element | ShadowRoot): Element | null => {
      for (const element of Array.from(root.querySelectorAll("*"))) {
        if (element.localName == "navbar-card" && element.isConnected) {
          return element.shadowRoot?.querySelector(".navbar") ?? null;
        }
        if (element.shadowRoot != null) {
          const found = findNavbar(element.shadowRoot);
          if (found != null) return found;
        }
      }
      return null;
    };
    const sample = () => {
      const bar = findNavbar(document.documentElement);
      if (bar != null) {
        const box = bar.getBoundingClientRect();
        positions.push(`${Math.round(box.x)},${Math.round(box.y)}`);
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });

  const haAppLayout = page.locator("[id='view']");
  await SwipeHelper.swipeLeft(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeRight(haAppLayout);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await page.waitForTimeout(1000);

  const positions = await page.evaluate(() => (window as unknown as { navbarPositions: string[] }).navbarPositions);
  expect(positions.length).toBeGreaterThan(0);
  expect(new Set(positions)).toEqual(new Set([`${Math.round(navbarBox.x)},${Math.round(navbarBox.y)}`]));
});
