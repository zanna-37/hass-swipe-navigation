import { Config } from "./config";
import { Lovelace, LovelaceConfig, PanelLovelace } from "./ha/data/lovelace";
import { Logger } from "./logger";
import { LOG_TAG } from "./loggerUtils";
import { PageObjectManager } from "./pageObjectManager";

export interface PanelLovelaceCustom extends PanelLovelace {
  lovelace?: LovelaceCustom;
}

export interface LovelaceCustom extends Lovelace {
  config?: LovelaceConfigCustom;
}

export interface LovelaceConfigCustom extends LovelaceConfig {
  swipe_nav?: unknown;
}

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

    const haPanelLovelace: (HTMLElement & PanelLovelaceCustom) | null = PageObjectManager.haPanelLovelace.getDomNode();

    const rawConfig = haPanelLovelace?.lovelace?.config?.swipe_nav ?? {};
    // TODO const views = haPanelLovelace?.lovelace?.config?.views ?? [];
    // TODO const currentView = haPanelLovelace?.route?.path;

    if (JSON.stringify(rawConfig) != JSON.stringify(ConfigManager.rawConfig)) {
      ConfigManager.saveConfig(rawConfig);
    }
  }

  private static saveConfig(rawConfig: unknown) {
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
}

class ConfigObserver {
  callback: () => void;

  constructor(callback: () => void) {
    this.callback = callback;
  }
}

export { ConfigManager, ConfigObserver };
