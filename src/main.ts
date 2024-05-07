import { Logger } from "./logger";
import { LOG_TAG } from "./loggerUtils";
import { ConfigManager, ConfigObserver } from "./configManager";
import { SwipeManager } from "./swipeManager";
import { PageObjectManager } from "./pageObjectManager";

// Console tag
console.info("%c↔️ Swipe navigation ↔️ - VERSION_PLACEHOLDER", "color: #2980b9; font-weight: 700;");


async function run() {

  Logger.setLoggerLevel(ConfigManager.getCurrentConfig().getLoggerLevel());
  ConfigManager.registerConfigObserver(new ConfigObserver(() => {
    Logger.setLoggerLevel(ConfigManager.getCurrentConfig().getLoggerLevel());
    Logger.logi(LOG_TAG, "New configuration loaded.");
  }));

  await ConfigManager.readAndMonitorConfig();

  PageObjectManager.haAppLayout.addDomNodeAddedCallback(() => {
    SwipeManager.init();
  });
  SwipeManager.init();
}


// Initial run
void run();
