import { Logger } from "./logger";
import { LOG_TAG } from "./loggerUtils";
import { Config, ConfigObserver } from "./config";
import { SwipeManager } from "./swipeManager";
import { PageObjectManager } from "./pageObjectManager";

// Console tag
console.info("%c↔️ Swipe navigation ↔️ - VERSION_PLACEHOLDER", "color: #2980b9; font-weight: 700;");


async function run() {

  Logger.setLoggerLevel(Config.current().getLoggerLevel());
  Config.registerConfigObserver(new ConfigObserver(() => {
    Logger.setLoggerLevel(Config.current().getLoggerLevel());
    Logger.logi(LOG_TAG, "New configuration loaded.");
  }));

  await Config.readAndMonitorConfig();

  PageObjectManager.haAppLayout.addDomNodeAddedCallback(() => {
    SwipeManager.init();
  });
  SwipeManager.init();
}


// Initial run
void run();
