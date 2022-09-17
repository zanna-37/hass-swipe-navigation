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
].join(',');


const LOG_TAG = "↔️ Swipe navigation:";

const LOG_LEVELS = {
  _ALL: 0,
  VERBOSE: 1,
  DEBUG: 2,
  INFO: 3,
  WARN: 4,
  ERROR: 5,
}

function logv(msg) { log(msg, LOG_LEVELS.VERBOSE); }
function logd(msg) { log(msg, LOG_LEVELS.DEBUG); }
function logi(msg) { log(msg, LOG_LEVELS.INFO); }
function logw(msg) { log(msg, LOG_LEVELS.WARN); }
function loge(msg) { log(msg, LOG_LEVELS.ERROR); }

function log(msg, level) {
  if (level >= Config.logger_level) {
    let level_tag;
    switch (level) {
      case LOG_LEVELS.VERBOSE:
        level_tag = "[V]";
        break;
      case LOG_LEVELS.DEBUG:
        level_tag = "[D]";
        break;
      case LOG_LEVELS.INFO:
        level_tag = "[I]";
        break;
      case LOG_LEVELS.WARN:
        level_tag = "[W]";
        break;
      case LOG_LEVELS.ERROR:
        level_tag = "[E]";
        break;
      default:
        level_tag = "[ ]";
        break;
    }
    let line = LOG_TAG + " " + level_tag + " " + msg;

    if (level < LOG_LEVELS.ERROR) {
      console.log(line);
    }
    else {
      console.error(line);
    }
  }
}

class Config {
  static animate = "none";
  static wrap = true;
  static prevent_default = false;
  static swipe_amount = 0.15;
  static skip_hidden = true;
  static skip_tabs = [];
  // Print all levels until the config is loaded, otherwise there is no way to see low level logs.
  // The real default is set below.
  static logger_level = LOG_LEVELS._ALL;

  static parseConfig(rawConfig) {
    if (rawConfig.animate != undefined) Config.animate = rawConfig.animate;
    if (rawConfig.wrap != undefined) Config.wrap = rawConfig.wrap;
    if (rawConfig.prevent_default != undefined) Config.prevent_default = rawConfig.prevent_default;
    if (rawConfig.swipe_amount != undefined) Config.swipe_amount = rawConfig.swipe_amount / 100.0;
    if (rawConfig.skip_hidden != undefined) Config.skip_hidden = rawConfig.skip_hidden;
    if (rawConfig.skip_tabs != undefined) {
      Config.skip_tabs =
        String(rawConfig.skip_tabs)
          .replace(/\s+/g, "")
          .split(",")
          .map(function (item) {
            return parseInt(item, 10);
          });
    }
    if (rawConfig.logger_level != undefined) {
      switch (rawConfig.logger_level) {
        case "verbose":
          Config.logger_level = LOG_LEVELS.VERBOSE;
          break;
        case "debug":
          Config.logger_level = LOG_LEVELS.DEBUG;
          break;
        case "info":
          Config.logger_level = LOG_LEVELS.INFO;
          break;
        case "warn":
          Config.logger_level = LOG_LEVELS.WARN;
          break;
        case "error":
          Config.logger_level = LOG_LEVELS.ERROR;
          break;
        default:
          Config.logger_level = LOG_LEVELS.WARN;
          loge("Unknown logger_level: \"" + rawConfig.logger_level + "\"");
          break;
      }
    } else {
      // The default value is set here because we want to print everything before reading the config.
      Config.logger_level = LOG_LEVELS.WARN;
    }
  }
}

class PageObject {
  #domNode = null;
  #parent = null;
  #selectors = null;
  #isSelectorsRootedInShadow = null;
  #keepAlive = false
  #onDomNodeRefreshedCallback = null;
  #onDomNodeRemovedCallback = null;

  #keepAliveChildren = new Map();

  constructor(parent, selectors, isSelectorsRootedInShadow,) {
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

  watchChanges(callbacks) {
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

  #addPageObjectToKeepAlive(pageObject) {
    if (!(this.#keepAliveChildren.has(pageObject))) {
      this.#keepAliveChildren.set(
        pageObject,
        new MutationObserver((mutations) => {
          for (let mutation of mutations) {
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
      if (this.#isStale(this.#domNode)) {
        logd("Stale object in cache: \"" + (this.#domNode?.nodeName?.toLowerCase() ?? "unknown") + "\". Invalidating...");
        this.invalidateDomNode();
        this.getDomNode();
      }
    }

    return this.#domNode
  }

  getParentNode() {
    let parentNode = (this.#parent instanceof PageObject) ? this.#parent.getDomNode() : this.#parent;

    if (parentNode != null && this.#isSelectorsRootedInShadow) {
      parentNode = parentNode.shadowRoot;
    }

    return parentNode;
  }

  #isStale() {
    return !(this.#domNode?.isConnected ?? false);
  }

  #refreshDomNode() {
    let parentNode = this.getParentNode();

    this.#domNode = (parentNode == null) ?
      null
      : (() => {
        for (const selector of this.#selectors) {
          let node = parentNode.querySelector(selector);
          if (node != null) {
            return node;
          }
        }
        return null;
      })()
      ;

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

  #connectChildObserver(pageObject) {
    if (this.#domNode != null) {
      let observer = this.#keepAliveChildren.get(pageObject);

      // Note: pageObject is a child of this object, so parentNode is this object (with or without
      // the shadowRoot depending on where the child is placed)
      let parentNode = pageObject.getParentNode();
      observer.observe(parentNode, { childList: true });

      pageObject.getDomNode();
    }
  }

  #disconnectAllChildrenObservers() {
    if (this.#keepAliveChildren.size > 0) {
      logv(
        "Disconnecting " + this.#keepAliveChildren.size + " observers from \""
        + (this.#domNode?.nodeName?.toLowerCase() ?? "unknown") + "\""
      );

      this.#keepAliveChildren.forEach((value, key) => {
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
    ['[id="view"]'],
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
  static #xDown;
  static #yDown;
  static #xDiff;
  static #yDiff;

  static #touchStartController = null;
  static #touchMoveController = null;
  static #touchEndController = null;

  static init() {
    this.#touchStartController?.abort();
    this.#touchMoveController?.abort();
    this.#touchEndController?.abort();
    this.#touchStartController = new AbortController();
    this.#touchMoveController = new AbortController();
    this.#touchEndController = new AbortController();

    if (PageObjectManager.tabsContainer.getDomNode()) {
      logd("Initializing SwipeManger...");

      PageObjectManager.haAppLayout.getDomNode().addEventListener(
        "touchstart",
        (event) => { this.#handleTouchStart(event); },
        { signal: this.#touchStartController.signal, passive: true }
      );
      PageObjectManager.haAppLayout.getDomNode().addEventListener(
        "touchmove",
        (event) => { this.#handleTouchMove(event); },
        { signal: this.#touchMoveController.signal, passive: false }
      );
      PageObjectManager.haAppLayout.getDomNode().addEventListener(
        "touchend",
        (event) => { this.#handleTouchEnd(); },
        { signal: this.#touchEndController.signal, passive: true }
      );
      if (Config.animate == "swipe") PageObjectManager.haAppLayout.getDomNode().style.overflow = "hidden";
    }
  }

  static #handleTouchStart(event) {
    if (typeof event.composedPath() == "object") {
      for (let element of event.composedPath()) {
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
    this.#xDown = event.touches[0].clientX;
    this.#yDown = event.touches[0].clientY;
  }

  static #handleTouchMove(event) {
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
          let directionLeft = this.#xDiff < 0;

          logi("Swipe detected, changing tab to the " + (directionLeft ? "left" : "right") + ".");

          const rtl = PageObjectManager.ha.getDomNode().style.direction == "rtl";
          let nextTabIndex = this.#getNextTabIndex(rtl ? !directionLeft : directionLeft);
          this.#click(nextTabIndex, directionLeft);
        }
      }
    }
    this.#xDown = this.#yDown = this.#xDiff = this.#yDiff = null;
  }

  static #getTabsArray() {
    return Array.from(PageObjectManager.tabsContainer.getDomNode()?.querySelectorAll("paper-tab") ?? []);
  }

  static #getNextTabIndex(directionLeft) {
    let tabs = this.#getTabsArray();
    let activeTabIndex = tabs.indexOf(PageObjectManager.tabsContainer.getDomNode().querySelector(".iron-selected"));
    let nextTabIndex = activeTabIndex;
    let stopReason = null;

    if (activeTabIndex == -1) {
      stopReason = "Can't determine the active tab";

    } else {
      let increment = directionLeft ? -1 : 1;
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
      )
    }

    if (stopReason != null) {
      logw(stopReason);
      return -1;
    } else {
      return nextTabIndex;
    }
  }

  static #click(index, directionLeft) {
    if (index != -1) {
      const view = PageObjectManager.haAppLayoutView.getDomNode();
      const tabs = this.#getTabsArray();

      if (Config.animate == "swipe") {
        const _in = directionLeft ? `${screen.width / 1.5}px` : `-${screen.width / 1.5}px`;
        const _out = directionLeft ? `-${screen.width / 1.5}px` : `${screen.width / 1.5}px`;
        view.style.transitionDuration = "200ms";
        view.style.opacity = 0;
        view.style.transform = `translate(${_in}, 0)`;
        view.style.transition = "transform 0.20s, opacity 0.18s";
        setTimeout(function () {
          tabs[index].dispatchEvent(new MouseEvent("click", { bubbles: false, cancelable: true }));
          view.style.transitionDuration = "0ms";
          view.style.transform = `translate(${_out}, 0)`;
          view.style.transition = "transform 0s";
        }, 210);
        setTimeout(function () {
          view.style.transitionDuration = "200ms";
          view.style.opacity = 1;
          view.style.transform = `translate(0px, 0)`;
          view.style.transition = "transform 0.20s, opacity 0.18s";
        }, 250);
      } else if (Config.animate == "fade") {
        view.style.transitionDuration = "200ms";
        view.style.transition = "opacity 0.20s";
        view.style.opacity = 0;
        setTimeout(function () {
          tabs[index].dispatchEvent(new MouseEvent("click", { bubbles: false, cancelable: true }));
          view.style.transitionDuration = "0ms";
          view.style.opacity = 0;
          view.style.transition = "opacity 0s";
        }, 210);
        setTimeout(function () {
          view.style.transitionDuration = "200ms";
          view.style.transition = "opacity 0.20s";
          view.style.opacity = 1;
        }, 250);
      } else if (Config.animate == "flip") {
        view.style.transitionDuration = "200ms";
        view.style.transform = "rotatey(90deg)";
        view.style.transition = "transform 0.20s, opacity 0.20s";
        view.style.opacity = 0.25;
        setTimeout(function () {
          tabs[index].dispatchEvent(new MouseEvent("click", { bubbles: false, cancelable: true }));
        }, 210);
        setTimeout(function () {
          view.style.transitionDuration = "200ms";
          view.style.transform = "rotatey(0deg)";
          view.style.transition = "transform 0.20s, opacity 0.20s";
          view.style.opacity = 1;
        }, 250);
      } else {
        tabs[index].dispatchEvent(new MouseEvent("click", { bubbles: false, cancelable: true }));
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
        const rawConfig = PageObjectManager.haPanelLovelace.getDomNode().lovelace.config.swipe_nav || {};
        Config.parseConfig(rawConfig);
        configRead = true;
      } catch (e) {
        logw("Error while obtaining config: " + e.message + ". Retrying...");
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
      let configurationLoading = getConfiguration();
      configurationLoading.then((configRead) => {
        if (configRead) {
          // Re-init swipeManager to load new config
          swipeManager.init();
        }
      });
    },
    onDomNodeRemovedCallback: null  // TODO
  });

  let configurationLoading = getConfiguration();
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
console.info(`%c↔️ Swipe navigation ↔️ - VERSION_PLACEHOLDER`, "color: #2980b9; font-weight: 700;");
