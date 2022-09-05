const ha = document.querySelector("home-assistant");
const main = ha.shadowRoot.querySelector("home-assistant-main").shadowRoot;
const panel = main.querySelector("partial-panel-resolver");
let huiRoot, appLayout, view;
let llAttempts = 0;

const LOG_TAG = "↔️ Swipe navigation:";

const LOG_LEVELS = {
  VERBOSE: 1,
  DEBUG: 2,
  INFO: 3,
  WARN: 4,
  ERROR: 5,
}

class Config {
  static animate;
  static wrap;
  static prevent_default;
  static swipe_amount;
  static skip_hidden;
  static skip_tabs;

  static readConfig(config) {
    Config.animate = config.animate != undefined ? config.animate : "none";
    Config.wrap = config.wrap != undefined ? config.wrap : true;
    Config.prevent_default = config.prevent_default != undefined ? config.prevent_default : false;
    Config.swipe_amount = config.swipe_amount != undefined ? config.swipe_amount / Math.pow(10, 2) : 0.15;
    Config.skip_hidden = config.skip_hidden != undefined ? config.skip_hidden : true;
    Config.skip_tabs =
      config.skip_tabs != undefined
        ? String(config.skip_tabs)
          .replace(/\s+/g, "")
          .split(",")
          .map(function (item) {
            return parseInt(item, 10);
          })
        : [];
    Config.logger_level = LOG_LEVELS.WARN;
    if (config.logger_level != undefined) {
      switch (config.logger_level) {
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
          loge("Unknown logger_level: \"" + config.logger_level + "\"");
          break;
      }
    }
  }
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
  const lovelace = main.querySelector("ha-panel-lovelace");

  if (lovelace) {
    getConfig(lovelace);
  }
}

function getConfig(lovelace) {
  llAttempts++;
  try {
    const llConfig = lovelace.lovelace.config;
    let config = llConfig.swipe_nav || {};
    huiRoot = lovelace.shadowRoot.querySelector("hui-root");
    appLayout = huiRoot.shadowRoot.querySelector("ha-app-layout");
    view = appLayout.querySelector('[id="view"]');
    Config.readConfig(config);
    swipeNavigation();
  } catch (e) {
    logw("Error while obtaining config: " + e.message + "\nRetrying...");
    if (llAttempts < 40) setTimeout(() => getConfig(lovelace), 50);
  }
}

function swipeNavigation() {
  llAttempts = 0;
  const tabContainer = appLayout.querySelector("paper-tabs") || appLayout.querySelector("ha-tabs");
  let tabs = tabContainer ? Array.from(tabContainer.querySelectorAll("paper-tab")) : [];
  const rtl = ha.style.direction == "rtl";
  let xDown, yDown, xDiff, yDiff, activeTab, firstTab, lastTab, left;

  if (tabContainer) {
    appLayout.addEventListener("touchstart", handleTouchStart, { passive: true });
    appLayout.addEventListener("touchmove", handleTouchMove, { passive: false });
    appLayout.addEventListener("touchend", handleTouchEnd, { passive: true });
    if (Config.animate == "swipe") appLayout.style.overflow = "hidden";
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
    if (!lastTab) filterTabs();
    activeTab = tabs.indexOf(tabContainer.querySelector(".iron-selected"));
  }

  function handleTouchMove(event) {
    if (xDown && yDown) {
      xDiff = xDown - event.touches[0].clientX;
      yDiff = yDown - event.touches[0].clientY;
      if (Math.abs(xDiff) > Math.abs(yDiff) && Config.prevent_default) event.preventDefault();
    }
  }

  function handleTouchEnd() {
    // TODO do not log when any of xDown, yDown, xDiff, yDiff is null
    if (activeTab < 0) {
      xDown = yDown = xDiff = yDiff = null;
      logw("Ignoring swipe, no active tab found.");
      return;
    }

    if (Math.abs(xDiff) < Math.abs(yDiff)) {
      xDown = yDown = xDiff = yDiff = null;
      logd("Swipe ignored, vertical movement.");
      return;
    }

    if (rtl) xDiff = -xDiff;
    if (Math.abs(xDiff) > Math.abs(screen.width * Config.swipe_amount)) {

      logi("Swipe detected, changing tab.");

      if (xDiff > 0) {
        left = false;
        activeTab == tabs.length - 1 ? click(firstTab) : click(activeTab + 1);
      } else if (xDiff < 0) {
        left = true;
        activeTab == 0 ? click(lastTab) : click(activeTab - 1);
      }

      if (rtl) left = !left;
    } else {
      logd("Swipe ignored, too short.");
    }
    xDown = yDown = xDiff = yDiff = null;
  }

  function filterTabs() {
    if (Config.skip_hidden) {
      tabs = tabs.filter((element) => {
        return !Config.skip_tabs.includes(tabs.indexOf(element)) && getComputedStyle(element, null).display != "none";
      });
    } else {
      tabs = tabs.filter((element) => {
        return !Config.skip_tabs.includes(tabs.indexOf(element));
      });
    }
    firstTab = Config.wrap ? 0 : null;
    lastTab = Config.wrap ? tabs.length - 1 : null;
  }

  function click(index) {
    if ((activeTab == 0 && !Config.wrap && left) || (activeTab == tabs.length - 1 && !Config.wrap && !left)) return;
    if (Config.animate == "swipe") {
      const _in = left ? `${screen.width / 1.5}px` : `-${screen.width / 1.5}px`;
      const _out = left ? `-${screen.width / 1.5}px` : `${screen.width / 1.5}px`;
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



// Initial run
run();

// Run on element changes.
new MutationObserver(lovelaceWatch).observe(panel, { childList: true });

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
