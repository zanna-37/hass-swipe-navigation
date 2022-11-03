import { z } from "zod";

/**
 * Ignore swipes when initiated on elements that match at least one of these CSS selectors.
 *
 * Learn more on CSS selectors
 * [here](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors).
 */
const exceptions = [

  // INTERNALS
  // 💡 Please keep this list sorted alphabetically. Consider the selector as the key after removing
  // all symbols. Only consider letters and numbers.

  // Header bar (contains tabs)
  "app-header",
  // Sidebar (contains dashboards)
  "ha-sidebar",
  // Slider
  "ha-slider",
  // Map
  "hui-map-card",


  // THIRD PARTIES
  // 💡 Please keep this list sorted alphabetically. Consider the selector as the key after removing
  // all symbols. Only consider letters and numbers.

  // 🍄 Mushroom (https://github.com/piitaya/lovelace-mushroom)
  "mushroom-slider",
  // my-slider (https://github.com/AnthonMS/my-cards/blob/main/src/my-slider.ts)
  "my-slider",
  // Plotly Graph Card (https://github.com/dbuezas/lovelace-plotly-graph-card)
  "#plotly g.draglayer",
  // round-slider (https://github.com/thomasloven/round-slider)
  "round-slider",
  // Slider button card (https://github.com/mattieha/slider-button-card)
  "slider-button-card",
  // Swipe Card (https://github.com/bramkragten/swipe-card)
  "swipe-card",
  // Lovelace Vacuum Map card (https://github.com/PiotrMachowski/lovelace-xiaomi-vacuum-map-card)
  "xiaomi-vacuum-map-card",
].join(",");


const LOG_TAG = "↔️ Swipe navigation:";

enum LogLevel {
  _ALL = 0,
  VERBOSE = 1,
  DEBUG = 2,
  INFO = 3,
  WARN = 4,
  ERROR = 5,
}

function logv(msg: string) { log(msg, LogLevel.VERBOSE); }
function logd(msg: string) { log(msg, LogLevel.DEBUG); }
function logi(msg: string) { log(msg, LogLevel.INFO); }
function logw(msg: string) { log(msg, LogLevel.WARN); }
function loge(msg: string) { log(msg, LogLevel.ERROR); }

function log(msg: string, level: Exclude<LogLevel, LogLevel._ALL>) {
  if (level >= Config.logger_level) {
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
    const line = LOG_TAG + " " + level_tag + " " + msg;

    if (level < LogLevel.ERROR) {
      console.log(line);
    }
    else {
      console.error(line);
    }
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
  skip_tabs: z.string().optional(),
  swipe_amount: z.number().optional(),
  wrap: z.boolean().optional()
});
type SwipeNavigationConfig = z.infer<typeof SwipeNavigationConfigSchema>;
function instanceOfSwipeNavigationConfig(obj: unknown): obj is SwipeNavigationConfig {
  return SwipeNavigationConfigSchema.safeParse(obj).success;
}


class Config {
  static animate: "none" | "swipe" | "fade" | "flip" = "none";
  // Print all levels until the config is loaded, otherwise there is no way to see low level logs.
  // The real default is set below.
  static logger_level: LogLevel = LogLevel._ALL;
  static prevent_default = false;
  static skip_hidden = true;
  static skip_tabs: number[] = [];
  static swipe_amount = 0.15;
  static wrap = true;

  static parseConfig(rawConfig: unknown) {
    if (instanceOfSwipeNavigationConfig(rawConfig)) {
      if (rawConfig?.animate != undefined) Config.animate = rawConfig.animate;
      if (rawConfig.logger_level != undefined) {
        switch (rawConfig.logger_level) {
          case "verbose":
            Config.logger_level = LogLevel.VERBOSE;
            break;
          case "debug":
            Config.logger_level = LogLevel.DEBUG;
            break;
          case "info":
            Config.logger_level = LogLevel.INFO;
            break;
          case "warn":
            Config.logger_level = LogLevel.WARN;
            break;
          case "error":
            Config.logger_level = LogLevel.ERROR;
            break;
          default: {
            const exhaustiveCheck: never = rawConfig.logger_level;
            throw new Error(`Unhandled case: ${exhaustiveCheck}`);
            break;
          }
        }
      } else {
        // The default value is set here because we want to print everything before reading the config.
        Config.logger_level = LogLevel.WARN;
      }
      if (rawConfig?.prevent_default != undefined) Config.prevent_default = rawConfig.prevent_default;
      if (rawConfig?.skip_hidden != undefined) Config.skip_hidden = rawConfig.skip_hidden;
      if (rawConfig?.skip_tabs != undefined) {
        Config.skip_tabs =
          String(rawConfig.skip_tabs)
            .replace(/\s+/g, "")
            .split(",")
            .map((item) => { return parseInt(item); });
      }
      if (rawConfig?.swipe_amount != undefined) Config.swipe_amount = rawConfig.swipe_amount / 100.0;
      if (rawConfig?.wrap != undefined) Config.wrap = rawConfig.wrap;

      return true;
    } else {
      loge("Found invalid configuration.");
      // TODO log why the config is wrong
      return false;
    }
  }
}

class PageObject {
  #domNode: HTMLElement | null = null;
  #parent: PageObject | HTMLElement | Document;
  #selectors: string[];
  #isSelectorsRootedInShadow: boolean;
  #keepAlive = false;
  #onDomNodeRefreshedCallback: (() => void) | null = null;
  #onDomNodeRemovedCallback: (() => void) | null = null;

  #keepAliveChildren = new Map<PageObject, MutationObserver>();

  constructor(parent: PageObject | HTMLElement | Document, selectors: string[], isSelectorsRootedInShadow: boolean) {
    this.#parent = parent;
    this.#selectors = selectors;
    this.#isSelectorsRootedInShadow = isSelectorsRootedInShadow;
  }

  invalidateDomNode() {
    this.#disconnectAllChildrenObservers();
    if (this.#onDomNodeRemovedCallback != null) {
      this.#onDomNodeRemovedCallback();
    }
    this.#domNode = null;
  }

  watchChanges(callbacks: { onDomNodeRefreshedCallback: (() => void), onDomNodeRemovedCallback: (() => void) | null }) {
    this.#setKeepAlive();
    this.#onDomNodeRefreshedCallback = callbacks.onDomNodeRefreshedCallback;
    this.#onDomNodeRemovedCallback = callbacks.onDomNodeRemovedCallback;
  }

  #setKeepAlive() {
    if (!this.#keepAlive) {
      this.#keepAlive = true;
      this.#ensureKeepAliveWhenNeeded();
    }
  }

  #ensureKeepAliveWhenNeeded() {
    if (this.#keepAlive && this.#parent != null && this.#parent instanceof PageObject) {
      this.#parent.#addPageObjectToKeepAlive(this);
    }
  }

  #addPageObjectToKeepAlive(pageObject: PageObject) {
    if (!(this.#keepAliveChildren.has(pageObject))) {
      this.#keepAliveChildren.set(
        pageObject,
        new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
              logv(
                mutation.addedNodes.length + " new element(s) appeared under \""
                + (this.#domNode?.nodeName?.toLowerCase() ?? "unknown") + "\". Checking..."
              );
              pageObject.getDomNode();
            }
          }
        })
      );

      // Keep alive self since it must be alive to revive its children
      this.#setKeepAlive();

      // Connect child if possible, otherwise it should be reconnected when refreshed.
      this.#connectChildObserver(pageObject);
    }
  }

  getDomNode() {
    // Refresh if object is not in cache
    if (this.#domNode == null) {
      this.#refreshDomNode();
    } else {
      // Stale detection
      if (this.#isStale()) {
        logd("Stale object in cache: \"" + this.#domNode.nodeName.toLowerCase() + "\". Invalidating...");
        this.invalidateDomNode();
        this.getDomNode();
      }
    }

    return this.#domNode;
  }

  getParentNode() {
    let parentNode: HTMLElement | Document | ShadowRoot | null =
      (this.#parent instanceof PageObject) ?
        this.#parent.getDomNode()
        : this.#parent;

    if (parentNode != null && this.#isSelectorsRootedInShadow) {
      if ("shadowRoot" in parentNode) {
        parentNode = parentNode.shadowRoot;
      } else {
        loge(parentNode.nodeName + " is expected to have a shadowRoot, but it is missing.");
        parentNode = null;
      }
    }

    return parentNode;
  }

  #isStale() {
    return !(this.#domNode?.isConnected ?? false);
  }

  #refreshDomNode() {
    const parentNode = this.getParentNode();

    this.#domNode = (parentNode == null) ?
      null
      : (() => {
        for (const selector of this.#selectors) {
          const node = parentNode.querySelector(selector);
          if (node != null && node instanceof HTMLElement) {
            return node;
          }
        }
        return null;
      })();

    if (this.#domNode != null) {
      logd("Object refreshed: \"" + (this.#domNode?.nodeName?.toLowerCase() ?? "unknown") + "\".");

      this.#ensureKeepAliveWhenNeeded();
      this.#connectAllChildrenObservers();

      if (this.#onDomNodeRefreshedCallback != null) {
        this.#onDomNodeRefreshedCallback();
      }
    }
  }

  #connectAllChildrenObservers() {
    if (this.#domNode != null && this.#keepAliveChildren.size > 0) {
      logv("Reconnecting " + this.#keepAliveChildren.size + " observers to " + (this.#domNode?.nodeName?.toLowerCase() ?? "unknown"));

      this.#keepAliveChildren.forEach((value, key) => {
        this.#connectChildObserver(key);
      });
    }
  }

  #connectChildObserver(pageObject: PageObject) {
    if (this.#domNode != null) {
      const observer = this.#keepAliveChildren.get(pageObject);

      // Note: pageObject is a child of this object, so parentNode is this object (with or without
      // the shadowRoot depending on where the child is placed)
      const parentNode = pageObject.getParentNode();

      if (observer == null) {
        loge("Illegal state: observer is not defined when connecting a child observer.");
      } else if (parentNode == null) {
        loge("Illegal state: parent is not defined when connecting a child observer.");
      } else {
        observer.observe(parentNode, { childList: true });
      }

      pageObject.getDomNode();
    }
  }

  #disconnectAllChildrenObservers() {
    if (this.#keepAliveChildren.size > 0) {
      logv(
        "Disconnecting " + this.#keepAliveChildren.size + " observers from \""
        + (this.#domNode?.nodeName?.toLowerCase() ?? "unknown") + "\""
      );

      this.#keepAliveChildren.forEach((value) => {
        value.disconnect();
      });
    }
  }
}

class PageObjectManager {
  static ha = new PageObject(
    document,
    ["home-assistant"],
    false,
  );
  static haMain = new PageObject(
    PageObjectManager.ha,
    ["home-assistant-main"],
    true,
  );
  static partialPanelResolver = new PageObject(
    PageObjectManager.haMain,
    ["partial-panel-resolver"],
    true,
  );
  static haPanelLovelace = new PageObject(
    PageObjectManager.partialPanelResolver,
    ["ha-panel-lovelace"],
    false,
  );
  static huiRoot = new PageObject(
    PageObjectManager.haPanelLovelace,
    ["hui-root"],
    true,
  );
  static haAppLayout = new PageObject(
    PageObjectManager.huiRoot,
    ["ha-app-layout"],
    true,
  );
  static haAppLayoutView = new PageObject(
    PageObjectManager.haAppLayout,
    ["[id=\"view\"]"],
    false,
  );
  static tabsContainer = new PageObject(
    PageObjectManager.haAppLayout,
    [
      "paper-tabs",  // When in edit mode
      "ha-tabs"  // When in standard mode
    ],
    false,
  );
}

class swipeManager {
  static #xDown: number | null;
  static #yDown: number | null;
  static #xDiff: number | null;
  static #yDiff: number | null;

  static #touchStartController: AbortController | null = null;
  static #touchMoveController: AbortController | null = null;
  static #touchEndController: AbortController | null = null;

  static init() {
    this.#touchStartController?.abort();
    this.#touchMoveController?.abort();
    this.#touchEndController?.abort();
    this.#touchStartController = new AbortController();
    this.#touchMoveController = new AbortController();
    this.#touchEndController = new AbortController();

    const haAppLayoutDomNode = PageObjectManager.haAppLayout.getDomNode();
    if (haAppLayoutDomNode != null) {
      logd("Initializing SwipeManger...");

      haAppLayoutDomNode.addEventListener(
        "touchstart",
        (event) => { this.#handleTouchStart(event); },
        { signal: this.#touchStartController.signal, passive: true }
      );
      haAppLayoutDomNode.addEventListener(
        "touchmove",
        (event) => { this.#handleTouchMove(event); },
        { signal: this.#touchMoveController.signal, passive: false }
      );
      haAppLayoutDomNode.addEventListener(
        "touchend",
        () => { this.#handleTouchEnd(); },
        { signal: this.#touchEndController.signal, passive: true }
      );
      if (Config.animate == "swipe") haAppLayoutDomNode.style.overflow = "hidden";
    }
  }

  static #handleTouchStart(event: TouchEvent) {
    if (event.touches.length > 1) {
      this.#xDown = null;
      this.#yDown = null;
      logd("Ignoring touch: multiple touchpoints detected.");
      return; // Ignore swipe: Multitouch detected
    }
    
    if (typeof event.composedPath() == "object") {
      for (const element of event.composedPath()) {
        if (element instanceof Element) {
          if (element.nodeName == "HUI-VIEW") {
            // hui-view is the root element of the Home Assistant dashboard, so we can stop here.
            break;
          } else {
            if (element.matches && element.matches(exceptions)) {
              logd("Ignoring touch on \""
                + (element.nodeName != null ? element.nodeName.toLowerCase() : "unknown")
                + "\".");
              return; // Ignore swipe
            }
          }
        }
      }
    }
    this.#xDown = event.touches[0].clientX;
    this.#yDown = event.touches[0].clientY;
  }

  static #handleTouchMove(event: TouchEvent) {
    if (this.#xDown && this.#yDown) {
      this.#xDiff = this.#xDown - event.touches[0].clientX;
      this.#yDiff = this.#yDown - event.touches[0].clientY;
      if (Math.abs(this.#xDiff) > Math.abs(this.#yDiff) && Config.prevent_default) event.preventDefault();
    }
  }

  static #handleTouchEnd() {
    if (this.#xDiff != null && this.#yDiff != null) {
      if (Math.abs(this.#xDiff) < Math.abs(this.#yDiff)) {
        logd("Swipe ignored, vertical movement.");

      } else {  // Horizontal movement
        if (Math.abs(this.#xDiff) < Math.abs(screen.width * Config.swipe_amount)) {
          logd("Swipe ignored, too short.");

        } else {
          const directionLeft = this.#xDiff < 0;

          logi("Swipe detected, changing tab to the " + (directionLeft ? "left" : "right") + ".");

          const rtl = PageObjectManager.ha.getDomNode()?.style.direction == "rtl";
          const nextTabIndex = this.#getNextTabIndex(rtl ? !directionLeft : directionLeft);
          this.#click(nextTabIndex, directionLeft);
        }
      }
    }
    this.#xDown = this.#yDown = this.#xDiff = this.#yDiff = null;
  }

  static #getTabsArray() {
    return Array.from(PageObjectManager.tabsContainer.getDomNode()?.querySelectorAll("paper-tab") ?? []);
  }

  static #getNextTabIndex(directionLeft: boolean) {
    const tabs = this.#getTabsArray();
    const activeTab = PageObjectManager.tabsContainer.getDomNode()?.querySelector(".iron-selected");
    const activeTabIndex = activeTab != null ? tabs.indexOf(activeTab) : -1;
    let nextTabIndex = activeTabIndex;
    let stopReason = null;

    if (activeTabIndex == -1) {
      stopReason = "Can't determine the active tab";

    } else {
      const increment = directionLeft ? -1 : 1;
      do {
        nextTabIndex += increment;

        if (nextTabIndex == -1) {
          nextTabIndex = Config.wrap ? tabs.length - 1 : -1;
        } else if (nextTabIndex == tabs.length) {
          nextTabIndex = Config.wrap ? 0 : -1;
        }

        if (nextTabIndex == activeTabIndex) {
          // A complete cycle has been done. Stop to avoid infinite loop.
          stopReason = "Error, no viable tabs found for swiping.";
        } else if (nextTabIndex == -1) {
          stopReason = "Edge has been reached and wrap is disabled.";
        }

      } while (
        // Note: stopReason must be the first condition to short circuit the rest that will probably
        // raise exception due to they dirty state.
        //
        // Cycle if...
        // ...the is no reason to stop and...
        stopReason == null
        && (
          // ...the current tab should be skipped or...
          Config.skip_tabs.includes(nextTabIndex)
          || (
            // ...if skip hidden is enabled and the tab is hidden
            Config.skip_hidden
            && getComputedStyle(tabs[nextTabIndex], null).display == "none"
          )
        )
      );
    }

    if (stopReason != null) {
      logw(stopReason);
      return -1;
    } else {
      return nextTabIndex;
    }
  }

  static #click(index: number, directionLeft: boolean) {
    if (index != -1) {
      const view = PageObjectManager.haAppLayoutView.getDomNode();
      const tabs = this.#getTabsArray();

      if (view != null) {
        const duration = 200;
        if (Config.animate) {
          view.style.transition = `transform ${duration}ms ease-in, opacity ${duration}ms ease-in`;
          if (Config.animate == "swipe") {
            const _in = directionLeft ? `${screen.width / 2}px` : `-${screen.width / 2}px`;
            const _out = directionLeft ? `-${screen.width / 2}px` : `${screen.width / 2}px`;
            view.style.opacity = "0";
            view.style.transform = `translate(${_in}, 0)`;
            setTimeout(function () {
              view.style.transition = ""
              view.style.transform = `translate(${_out}, 0)`;
              tabs[index].dispatchEvent(new MouseEvent("click", { bubbles: false, cancelable: true }));
            }, duration + 10);
          } else if (Config.animate == "fade") {
            view.style.opacity = "0";
            setTimeout(function () {
              view.style.transition = ""
              tabs[index].dispatchEvent(new MouseEvent("click", { bubbles: false, cancelable: true }));
              view.style.opacity = "0";
            }, duration + 10);
          } else if (Config.animate == "flip") {
            view.style.transform = "rotatey(90deg)";
            view.style.opacity = "0.25";
            setTimeout(function () {
              view.style.transition = ""
              tabs[index].dispatchEvent(new MouseEvent("click", { bubbles: false, cancelable: true }));
            }, duration + 10);
          }
          setTimeout(function () {
            view.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
            view.style.opacity = "1";
            view.style.transform = "";
          }, duration + 50);
        } else {
          tabs[index].dispatchEvent(new MouseEvent("click", { bubbles: false, cancelable: true }));
        }
      }
    }
  }
}



async function getConfiguration() {
  let configRead = false;

  if (PageObjectManager.haPanelLovelace.getDomNode() != null) {
    let configReadingAttempts = 0;

    while (!configRead && configReadingAttempts < 300) {
      configReadingAttempts++;
      try {
        const rawConfig = (
          (
            PageObjectManager.haPanelLovelace.getDomNode() as (
              HTMLElement & { lovelace: undefined | { config: undefined | { swipe_nav: unknown } } }
            )
          )?.lovelace?.config?.swipe_nav
        ) ?? {};
        Config.parseConfig(rawConfig);
        configRead = true;
      } catch (e) {
        logw("Error while obtaining config: " + (e instanceof Error ? e.message : e) + ". Retrying...");
        await new Promise(resolve => setTimeout(resolve, 100));  // Sleep 100ms
      }
    }
  }

  if (configRead) {
    logd("Configuration read.");
    return true;
  } else {
    loge("Can't read configuration.");
    return false;
  }
}


function run() {
  PageObjectManager.haPanelLovelace.watchChanges({
    onDomNodeRefreshedCallback: () => {
      const configurationLoading = getConfiguration();
      configurationLoading.then((configRead) => {
        if (configRead) {
          // Re-init swipeManager to load new config
          swipeManager.init();
        }
      });
    },
    onDomNodeRemovedCallback: null  // TODO
  });

  const configurationLoading = getConfiguration();
  configurationLoading.then((configRead) => {
    PageObjectManager.haAppLayout.watchChanges({
      onDomNodeRefreshedCallback: () => {
        swipeManager.init();
      },
      onDomNodeRemovedCallback: null  // TODO
    });

    if (configRead && PageObjectManager.haAppLayout.getDomNode() != null) {
      swipeManager.init();
    }
  });
}



// Initial run
run();

// Console tag
console.info("%c↔️ Swipe navigation ↔️ - VERSION_PLACEHOLDER", "color: #2980b9; font-weight: 700;");
