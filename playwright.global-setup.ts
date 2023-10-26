import { chromium, FullConfig, expect } from "@playwright/test";


async function globalSetup(config: FullConfig) {
  const { baseURL, storageState } = config.projects[0].use;
  if (typeof baseURL !== "string") { throw new Error("baseURL should be a string"); }
  if (typeof storageState !== "string") { throw new Error("storageState should be a string"); }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  try {
    await page.goto(baseURL);
    await page.getByText("Username").fill("user");
    await page.getByText("Keep me logged in").click();
    await page.getByText("Password").fill("pass");
    await page.getByText("Log in", { exact: true }).click();

    await page.getByText("This is a test instance.").waitFor({ timeout: 30 * 1000 /* 30 seconds*/ });
  } catch (e) {
    await page.screenshot({ path: "test-results/failed-login.png" });
    throw (e);
  }
  // Save signed-in state
  await page.context().storageState({ path: storageState });


  // Check that the Swipe navigation js is loaded
  let matches = 0;
  const regexp = /.*↔️ Swipe navigation ↔️.*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches, "Swipe navigation library not found. Are you serving it?").toBeGreaterThanOrEqual(1);

  await browser.close();
}

export default globalSetup;
