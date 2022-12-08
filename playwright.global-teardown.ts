import { FullConfig } from "@playwright/test";
import { unlinkSync } from 'node:fs';

async function globalTeardown(config: FullConfig) {
  const { storageState } = config.projects[0].use;

  // Delete signed-in state
  if (storageState != null) {
    unlinkSync(storageState.toString());
    console.log("storageState deleted successfully.");
  } else {
    throw "Can't delete storageState file. The path it's null.";
  }
}

export default globalTeardown;
