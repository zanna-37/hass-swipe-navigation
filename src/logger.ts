enum LogLevel {
  _ALL = 0,
  VERBOSE = 1,
  DEBUG = 2,
  INFO = 3,
  WARN = 4,
  ERROR = 5,
}

class Logger {
  private static loggerLevel: LogLevel = LogLevel._ALL;

  private static instance: Logger;

  // Prevent creating new instance of this class
  private constructor() { }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }

    return Logger.instance;
  }

  public static setLoggerLevel(level: LogLevel) {
    Logger.loggerLevel = level;
  }

  public static getLoggerLevel() {
    return Logger.loggerLevel;
  }


  public static logv(tag: string, msg: string) { Logger.log(tag, msg, LogLevel.VERBOSE); }
  public static logd(tag: string, msg: string) { Logger.log(tag, msg, LogLevel.DEBUG); }
  public static logi(tag: string, msg: string) { Logger.log(tag, msg, LogLevel.INFO); }
  public static logw(tag: string, msg: string) { Logger.log(tag, msg, LogLevel.WARN); }
  public static loge(tag: string, msg: string) { Logger.log(tag, msg, LogLevel.ERROR); }

  private static log(tag: string, msg: string, level: Exclude<LogLevel, LogLevel._ALL>) {
    if (level >= this.loggerLevel) {
      let level_tag;
      switch (level) {
        case LogLevel.VERBOSE:
          level_tag = "[V]";
          break;
        case LogLevel.DEBUG:
          level_tag = "[D]";
          break;
        case LogLevel.INFO:
          level_tag = "[I]";
          break;
        case LogLevel.WARN:
          level_tag = "[W]";
          break;
        case LogLevel.ERROR:
          level_tag = "[E]";
          break;
        default: {
          const exhaustiveCheck: never = level;
          throw new Error(`Unhandled case: ${exhaustiveCheck}`);
          break;
        }
      }
      const line = tag + " " + level_tag + " " + msg;

      if (level < LogLevel.ERROR) {
        console.log(line);
      }
      else {
        console.error(line);
      }
    }
  }
}

export { Logger, LogLevel };
