const LOG_TAG = "↔️ Swipe navigation:";

const LOG_LEVELS = {
  ALL: 0,
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
  static logger_level = LOG_LEVELS.ALL;

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
      logger_level = LOG_LEVELS.WARN;
    }
  }
}

class PageObjects {
  static ha = null;
  static haMain = null;
  static partialPanelResolver = null;
  static lovelace = null;
  static haAppLayout = null;
  static haAppLayoutView = null;
  static tabsContainer = null;
  static tabsArray = null;

  static #getObjectX(getObject, setObject, getFreshValue) {

    // Refresh if object is not in cache
    if (getObject() == null) {
      setObject(getFreshValue());
    }

    // Stale detection
    let objects = Array.isArray(getObject()) ? getObject() : [getObject()];
    for (let i = 0, found = false; i < objects.length && !found; i++) {
      if (!(objects[i]?.isConnected ?? false)) {
        found = true;
        logd("Stale object detected: \"" + objects[i]?.nodeName?.toLowerCase() ?? "unknown" + "\". Refreshing...");
        setObject(null);
        PageObjects.#getObjectX(getObject, setObject, getFreshValue);
      }
    }

    return getObject();
  }

  static getHa() {
    return PageObjects.#getObjectX(
      () => { return PageObjects.ha; },
      (x) => { PageObjects.ha = x; },
      () => { return document.querySelector("home-assistant"); }
    )
  }
  static getHaMain() {
    return PageObjects.#getObjectX(
      () => { return PageObjects.haMain; },
      (x) => { PageObjects.haMain = x; },
      () => { return PageObjects.getHa().shadowRoot.querySelector("home-assistant-main"); }
    )
  }
  static getPartialPanelResolver() {
    return PageObjects.#getObjectX(
      () => { return PageObjects.partialPanelResolver; },
      (x) => { PageObjects.partialPanelResolver = x; },
      () => { return PageObjects.getHaMain().shadowRoot.querySelector("partial-panel-resolver"); }
    )
  }
  static getLovelace() {
    return PageObjects.#getObjectX(
      () => { return PageObjects.lovelace; },
      (x) => { PageObjects.lovelace = x; },
      () => { return PageObjects.getPartialPanelResolver().querySelector("ha-panel-lovelace"); }
    )
  }
  static getHaAppLayout() {
    return PageObjects.#getObjectX(
      () => { return PageObjects.haAppLayout; },
      (x) => { PageObjects.haAppLayout = x; },
      () => {
        const huiRoot = PageObjects.getLovelace().shadowRoot.querySelector("hui-root");
        return huiRoot.shadowRoot.querySelector("ha-app-layout");
      }
    )
  }
  static getHaAppLayoutView() {
    return PageObjects.#getObjectX(
      () => { return PageObjects.haAppLayoutView; },
      (x) => { PageObjects.haAppLayoutView = x; },
      () => { return PageObjects.getHaAppLayout().querySelector('[id="view"]'); }
    )
  }
  static getTabsContainer() {
    return PageObjects.#getObjectX(
      () => { return PageObjects.tabsContainer; },
      (x) => { PageObjects.tabsContainer = x; },
      () => {
        return PageObjects.getHaAppLayout().querySelector("paper-tabs")  // When in edit mode
          || PageObjects.getHaAppLayout().querySelector("ha-tabs");  // When in standard mode
      }
    )
  }
  static getTabsArray() {
    return PageObjects.#getObjectX(
      () => { return PageObjects.tabsArray; },
      (x) => { PageObjects.tabsArray = x; },
      () => {
        return PageObjects.tabsArray = Array.from(PageObjects.getTabsContainer()?.querySelectorAll("paper-tab") ?? []);
      }
    )
  }
}

async function getConfiguration() {
  let configReadingAttempts = 0;
  let configRead = false;

  while (!configRead && configReadingAttempts < 300) {
    configReadingAttempts++;
    try {
      const rawConfig = PageObjects.getLovelace().lovelace.config.swipe_nav || {};
      Config.parseConfig(rawConfig);
      configRead = true;
    } catch (e) {
      logw("Error while obtaining config: " + e.message + ". Retrying...");
      await new Promise(resolve => setTimeout(resolve, 100));  // Sleep 100ms
    }
  }

  return configRead;
}

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



function run() {
  if (PageObjects.getLovelace()) {
    // A dashboard is visible

    let configurationLoading = getConfiguration();
    configurationLoading.then((configRead) => {
      if (!configRead) {
        loge("Can't read configuration, exiting.");
      } else {
        logi("Configuration read.");
        swipeNavigation();
      }
    });

  } // else we are in another panel, e.g. Settings
}

function swipeNavigation() {
  let xDown, yDown, xDiff, yDiff;

  if (PageObjects.getTabsContainer()) {
    PageObjects.getHaAppLayout().addEventListener("touchstart", handleTouchStart, { passive: true });
    PageObjects.getHaAppLayout().addEventListener("touchmove", handleTouchMove, { passive: false });
    PageObjects.getHaAppLayout().addEventListener("touchend", handleTouchEnd, { passive: true });
    if (Config.animate == "swipe") PageObjects.getHaAppLayout().style.overflow = "hidden";
  }

  function handleTouchStart(event) {
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
    xDown = event.touches[0].clientX;
    yDown = event.touches[0].clientY;
  }

  function handleTouchMove(event) {
    if (xDown && yDown) {
      xDiff = xDown - event.touches[0].clientX;
      yDiff = yDown - event.touches[0].clientY;
      if (Math.abs(xDiff) > Math.abs(yDiff) && Config.prevent_default) event.preventDefault();
    }
  }

  function handleTouchEnd() {
    if (xDiff != null && yDiff != null) {
      if (Math.abs(xDiff) < Math.abs(yDiff)) {
        logd("Swipe ignored, vertical movement.");

      } else {  // Horizontal movement
        if (Math.abs(xDiff) < Math.abs(screen.width * Config.swipe_amount)) {
          logd("Swipe ignored, too short.");

        } else {
          let directionLeft = xDiff < 0;

          logi("Swipe detected, changing tab to the " + (directionLeft ? "left" : "right") + ".");

          const rtl = PageObjects.getHa().style.direction == "rtl";
          let nextTabIndex = getNextTabIndex(rtl ? !directionLeft : directionLeft);
          click(nextTabIndex, directionLeft);
        }
      }
    }
    xDown = yDown = xDiff = yDiff = null;
  }

  function getNextTabIndex(directionLeft) {
    let tabs = PageObjects.getTabsArray();
    let activeTabIndex = tabs.indexOf(PageObjects.getTabsContainer().querySelector(".iron-selected"));
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
        // Cycle if...
        (
          Config.skip_tabs.includes(nextTabIndex)  // ...the tab should be skipped or...
          || (
            Config.skip_hidden  // ...if skip hidden is enabled and...
            && getComputedStyle(tabs[nextTabIndex], null).display == "none"  // ...the tab is hidden...
          )
        ) && stopReason == null  // ...and the is no reason to stop
      )
    }

    if (stopReason != null) {
      logw(stopReason);
      return -1;
    } else {
      return nextTabIndex;
    }
  }

  function click(index, directionLeft) {
    if (index != -1) {
      const view = PageObjects.getHaAppLayoutView();
      const tabs = PageObjects.getTabsArray();

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



// Initial run
run();

// Run on element changes.
new MutationObserver(lovelaceWatch).observe(PageObjects.getPartialPanelResolver(), { childList: true });

// If new lovelace panel was added watch for hui-root to appear.
function lovelaceWatch(mutations) {
  mutationWatch(mutations, "ha-panel-lovelace", rootWatch);
}

// When hui-root appears watch it's children.
function rootWatch(mutations) {
  mutationWatch(mutations, "hui-root", appLayoutWatch);
}

// When ha-app-layout appears we can run.
function appLayoutWatch(mutations) {
  mutationWatch(mutations, "ha-app-layout", null);
}

function mutationWatch(mutations, nodename, observeElem) {
  for (let mutation of mutations) {
    for (let node of mutation.addedNodes) {
      if (node.localName == nodename) {
        if (observeElem) {
          new MutationObserver(observeElem).observe(node.shadowRoot, {
            childList: true,
          });
        } else {
          run();
        }
        return;
      }
    }
  }
}

// Console tag
console.info(`%c↔️ Swipe navigation ↔️ - VERSION_PLACEHOLDER`, "color: #2980b9; font-weight: 700;");
