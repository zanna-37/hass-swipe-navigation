import { z } from "zod";
import { LogLevel, Logger } from "./logger";
import { LOG_TAG } from "./loggerUtils";
import { PageObjectManager } from "./pageObjectManager";

class Config {
  private animate: "none" | "swipe" | "fade" | "flip" = "none";
  private animate_duration = 200;
  private enable = true;
  private enable_mouse_swipe = false;
  // Note that this is the level that is in force before the config is parsed.
  // This means that all logs below this level will be ignored until the config is parsed.
  private logger_level: LogLevel = LogLevel.WARN;
  private prevent_default = false;
  private skip_hidden = true;
  private skip_tabs: readonly number[] = [];
  private swipe_amount = 0.15;
  private wrap = true;

  private static currentConfig: Config = new Config();
  private static rawConfig: unknown | null = null;
  private static configObservers: ConfigObserver[] = [];

  public static current(): Config {
    return Config.currentConfig;
  }

  public static async readAndMonitorConfig() {
    // When changing dashboards and when updating the config via the UI, the hui-root element is
    // replaced. We therefore listen for its changes.
    PageObjectManager.huiRoot.watchChanges({
      onDomNodeRefreshedCallback: () => {
        void Config.readConfig();
      },
      onDomNodeRemovedCallback: null
    });

    await Config.readConfig();
  }

  public static registerConfigObserver(configObserver: ConfigObserver) {
    Config.configObservers.push(configObserver);
  }

  public static unregisterConfigObserver(configObserver: ConfigObserver) {
    const index = Config.configObservers.indexOf(configObserver);
    if (index > -1) {
      Config.configObservers.splice(index, 1);
    } else {
      Logger.loge(LOG_TAG, "Internal error while unregistering a configObserver: not found.");
    }
  }

  public getAnimate(): "none" | "swipe" | "fade" | "flip" {
    return this.animate;
  }

  public getAnimateDuration(): number {
    return this.animate_duration;
  }

  public getEnable(): boolean {
    return this.enable;
  }

  public getEnableMouseSwipe(): boolean {
    return this.enable_mouse_swipe;
  }

  public getLoggerLevel(): LogLevel {
    return this.logger_level;
  }

  public getPreventDefault(): boolean {
    return this.prevent_default;
  }

  public getSkipHidden(): boolean {
    return this.skip_hidden;
  }

  public getSkipTabs(): readonly number[] {
    return this.skip_tabs;
  }

  public getSwipeAmount(): number {
    return this.swipe_amount;
  }

  public getWrap(): boolean {
    return this.wrap;
  }

  private static async readConfig() {
    Logger.logd(LOG_TAG, "Attempting to read config...");

    const rawConfig = await Config.getRawConfigOrNull();

    if (JSON.stringify(rawConfig) == JSON.stringify(Config.rawConfig)) {
      Logger.logd(LOG_TAG, "Config is identical.");
      return;
    }

    // Save the new raw config.
    Config.rawConfig = rawConfig;

    const newConfig = Config.parseConfig(rawConfig);
    if (newConfig == null) {
      // Couldn't parse config, error already logged.
      return;
    }

    if (JSON.stringify(newConfig) == JSON.stringify(Config.currentConfig)) {
      Logger.logd(LOG_TAG, "Config is equivalent.");
      return;
    }

    // Save the new config.
    Config.currentConfig = newConfig;

    // Notify all observers that the config has changed.
    Config.configObservers.forEach((configObserver) => {
      configObserver.callback();
    });
  }

  private static parseConfig(rawConfig: unknown): Config | null {
    if (!instanceOfSwipeNavigationConfig(rawConfig)) {
      Logger.loge(LOG_TAG, "Found invalid configuration.");
      // TODO log why the config is wrong

      return null;
    }

    const newConfig = new Config();

    if (rawConfig.animate != null) { newConfig.animate = rawConfig.animate; }

    if (rawConfig.animate_duration != null) { newConfig.animate_duration = rawConfig.animate_duration; }

    if (rawConfig.enable != null) { newConfig.enable = rawConfig.enable; }

    if (rawConfig.enable_mouse_swipe != null) { newConfig.enable_mouse_swipe = rawConfig.enable_mouse_swipe; }

    switch (rawConfig.logger_level) {
      case "verbose":
        newConfig.logger_level = LogLevel.VERBOSE;
        break;
      case "debug":
        newConfig.logger_level = LogLevel.DEBUG;
        break;
      case "info":
        newConfig.logger_level = LogLevel.INFO;
        break;
      case "warn":
        newConfig.logger_level = LogLevel.WARN;
        break;
      case "error":
        newConfig.logger_level = LogLevel.ERROR;
        break;
      case null:
      case undefined:
        break;
      default: {
        const exhaustiveCheck: never = rawConfig.logger_level;
        throw new Error(`Unhandled case: ${exhaustiveCheck}`);
        break;
      }
    }
    if (rawConfig.prevent_default != null) { newConfig.prevent_default = rawConfig.prevent_default; }
    if (rawConfig.skip_hidden != null) { newConfig.skip_hidden = rawConfig.skip_hidden; }
    if (rawConfig.skip_tabs != undefined) {
      newConfig.skip_tabs =
        String(rawConfig.skip_tabs)
          .replace(/\s+/g, "")
          .split(",")
          .map((item) => { return parseInt(item); });
    }
    if (rawConfig.swipe_amount != null) { newConfig.swipe_amount = rawConfig.swipe_amount / 100.0; }
    if (rawConfig.wrap != null) { newConfig.wrap = rawConfig.wrap; }

    return newConfig;
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

const SwipeNavigationConfigSchema = z.object({
  animate: z
    .union([
      z.literal("none"),
      z.literal("swipe"),
      z.literal("fade"),
      z.literal("flip"),
    ]).optional(),
  animate_duration: z.number().optional(),
  enable: z.boolean().optional(),
  enable_mouse_swipe: z.boolean().optional(),
  logger_level: z
    .union([
      z.literal("verbose"),
      z.literal("debug"),
      z.literal("info"),
      z.literal("warn"),
      z.literal("error")
    ])
    .optional(),
  prevent_default: z.boolean().optional(),
  skip_hidden: z.boolean().optional(),
  skip_tabs: z.coerce.string().optional(),
  swipe_amount: z.number().optional(),
  wrap: z.boolean().optional()
});

type SwipeNavigationConfig = z.infer<typeof SwipeNavigationConfigSchema>;

function instanceOfSwipeNavigationConfig(obj: unknown): obj is SwipeNavigationConfig {
  return SwipeNavigationConfigSchema.safeParse(obj).success;
}

class ConfigObserver {
  callback: () => void;

  constructor(callback: () => void) {
    this.callback = callback;
  }
}

export { Config, ConfigObserver };
