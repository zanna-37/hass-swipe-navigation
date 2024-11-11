import { z } from "zod";
import { LogLevel, Logger } from "./logger";
import { LOG_TAG } from "./loggerUtils";

class Config {
  private animate: "none" | "swipe" | "fade" | "flip" = "none";
  private animate_duration = 200;
  private enable = true;
  private enable_mouse_swipe = false;
  private enable_on_subviews = true;
  // Note that this is the level that is in force before the config is parsed.
  // This means that all logs below this level will be ignored until the config is parsed.
  private logger_level: LogLevel = LogLevel.WARN;
  private prevent_default = false;
  private skip_hidden = true;
  private skip_subviews = true;
  private skip_tabs: readonly number[] = [];
  private swipe_amount = 0.15;
  private wrap = true;

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

  public getEnableOnSubviews(): boolean {
    return this.enable_on_subviews;
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

  public getSkipSubviews(): boolean {
    return this.skip_subviews;
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


  public static parseConfig(rawConfig: unknown): Config | null {
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

    if (rawConfig.enable_on_subviews != null) { newConfig.enable_on_subviews = rawConfig.enable_on_subviews; }

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
    if (rawConfig.skip_subviews != null) { newConfig.skip_subviews = rawConfig.skip_subviews; }
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
  enable_on_subviews: z.boolean().optional(),
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
  skip_subviews: z.boolean().optional(),
  skip_tabs: z.coerce.string().optional(),
  swipe_amount: z.number().optional(),
  wrap: z.boolean().optional()
});

type SwipeNavigationConfig = z.infer<typeof SwipeNavigationConfigSchema>;

function instanceOfSwipeNavigationConfig(obj: unknown): obj is SwipeNavigationConfig {
  return SwipeNavigationConfigSchema.safeParse(obj).success;
}

export { Config };
