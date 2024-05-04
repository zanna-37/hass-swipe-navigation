import { Logger } from "./logger";
import { LOG_TAG } from "./loggerUtils";
import { PageObjectManager } from "./pageObjectManager";
import { Config } from "./config";

class ConfigManager {
  private static currentConfig: Config = new Config();
  private static rawConfig: unknown | null = null;
  private static configObservers: ConfigObserver[] = [];

  public static current(): Config {
    return ConfigManager.currentConfig;
  }

  public static async readAndMonitorConfig() {
    // When changing dashboards and when updating the config via the UI, the hui-root element is
    // replaced. We therefore listen for its changes.
    PageObjectManager.huiRoot.addDomNodeAddedCallback(() => {
      void ConfigManager.readConfig();
    });

    await ConfigManager.readConfig();
  }

  public static registerConfigObserver(configObserver: ConfigObserver) {
    ConfigManager.configObservers.push(configObserver);
  }

  public static unregisterConfigObserver(configObserver: ConfigObserver) {
    const index = ConfigManager.configObservers.indexOf(configObserver);
    if (index > -1) {
      ConfigManager.configObservers.splice(index, 1);
    } else {
      Logger.loge(LOG_TAG, "Internal error while unregistering a configObserver: not found.");
    }
  }

  private static async readConfig() {
    Logger.logd(LOG_TAG, "Attempting to read config...");

    const rawConfig = await ConfigManager.getRawConfigOrNull();

    if (JSON.stringify(rawConfig) == JSON.stringify(ConfigManager.rawConfig)) {
      Logger.logd(LOG_TAG, "Config is identical.");
      return;
    }

    // Save the new raw config.
    ConfigManager.rawConfig = rawConfig;

    const newConfig = Config.parseConfig(rawConfig);
    if (newConfig == null) {
      // Couldn't parse config, error already logged.
      return;
    }

    if (JSON.stringify(newConfig) == JSON.stringify(ConfigManager.currentConfig)) {
      Logger.logd(LOG_TAG, "Config is equivalent.");
      return;
    }

    // Save the new config.
    ConfigManager.currentConfig = newConfig;

    // Notify all observers that the config has changed.
    ConfigManager.configObservers.forEach((configObserver) => {
      configObserver.callback();
    });
  }

  /**
   * Tries to get the raw config from the config file until it succeed or until a timeout is
   * reached.
   *
   * @returns the swipe_nav raw config if the section can be read from the config file. An empty
   * object if the swipe_nav section is missing in the config file. `null` if the config file cannot
   * be read.
   */
  private static async getRawConfigOrNull(): Promise<unknown | null> {
    const timeout = new Date(Date.now() + 15 * 1000);  // 15 seconds
    let configContainer = null;

    while (configContainer == null && Date.now() < timeout.getTime()) {
      if (PageObjectManager.haPanelLovelace.getDomNode() != null) {
        configContainer = (
          (
            PageObjectManager.haPanelLovelace.getDomNode() as (
              HTMLElement & { lovelace: undefined | { config: undefined | { swipe_nav: unknown } } }
            )
          )?.lovelace?.config
        ) ?? null;
      }

      if (configContainer == null) {
        await new Promise(resolve => setTimeout(resolve, 1000));  // Sleep 1s
      }
    }

    let rawConfig = null;
    if (configContainer != null) {
      rawConfig = configContainer.swipe_nav ?? {};
    } else {
      Logger.loge(LOG_TAG, "Can't find dashboard configuration");
    }

    return rawConfig;
  }
}

class ConfigObserver {
  callback: () => void;

  constructor(callback: () => void) {
    this.callback = callback;
  }
}

export { ConfigManager, ConfigObserver };
