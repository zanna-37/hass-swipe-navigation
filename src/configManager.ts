import { Config } from "./config";
import { Lovelace, LovelaceConfig, LovelaceViewConfig, PanelLovelace } from "./ha/data/lovelace";
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
  private static panel: string | null = null;
  private static views: LovelaceViewConfig[] | null = null;
  private static currentUserId: string | null = null;

  private static rawConfig: unknown | null = null;
  private static configObservers: ConfigObserver[] = [];

  public static getCurrentConfig(): Config {
    return ConfigManager.currentConfig;
  }
  public static getPanel(): string | null {
    return ConfigManager.panel;
  }
  public static getViews(): LovelaceViewConfig[] | null {
    const haPanelLovelace: (HTMLElement & PanelLovelaceCustom) | null = PageObjectManager.haPanelLovelace.getDomNode();
    const views = haPanelLovelace?.lovelace?.config?.views;
    if (views != null) {
      ConfigManager.views = views;
    }

    return ConfigManager.views;
  }
  public static getCurrentViewName(): string | null {
    const haPanelLovelace: (HTMLElement & PanelLovelaceCustom) | null = PageObjectManager.haPanelLovelace.getDomNode();
    return haPanelLovelace?.route?.path?.replace("/", "") ?? null;
  }
  public static getCurrentViewIndex(): number | null {
    const views = ConfigManager.views;
    const currentViewName = ConfigManager.getCurrentViewName();

    if (views == null || currentViewName == null) {
      return null;
    }

    for (let i = 0; i < views.length; i++) {
      const currPath = views[i].path;

      if (String(i) == currentViewName) {
        // If this view has no path, Home Assistant uses its index in the URL
        return i;
      }
      if (currPath == currentViewName) {
        return i;
      }
    }

    return null;
  }
  public static isViewVisible(views:LovelaceViewConfig[], index: number): boolean {
    const visibleOrEnabledUsers = views[index].visible;

    if (visibleOrEnabledUsers == null || visibleOrEnabledUsers == true) {
      return true;
    }
    if (visibleOrEnabledUsers == false) {
      return false;
    }

    if (visibleOrEnabledUsers instanceof Array) {
      for(const enabledUser of visibleOrEnabledUsers) {
        if (enabledUser.user == ConfigManager.currentUserId) {
          return true;
        }
      }
      return false;
    }

    const exhaustiveCheck: never = visibleOrEnabledUsers;
    throw new Error(`Unhandled case: ${exhaustiveCheck}`);
  }

  public static isViewHidden(views:LovelaceViewConfig[], index: number): boolean {
    return !ConfigManager.isViewVisible(views, index);
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
    if (JSON.stringify(rawConfig) != JSON.stringify(ConfigManager.rawConfig)) {
      ConfigManager.saveConfig(rawConfig);
    }

    const panel = haPanelLovelace?.route?.prefix;
    if (panel != null) {
      ConfigManager.panel = panel.replace("/", "");
    }

    const views = haPanelLovelace?.lovelace?.config?.views;
    if (views != null) {
      ConfigManager.views = views;
    }

    const currentUserId = haPanelLovelace?.hass?.user?.id;
    if (currentUserId != null) {
      ConfigManager.currentUserId = currentUserId;
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
