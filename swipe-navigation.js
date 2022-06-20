const ha = document.querySelector("home-assistant");
const main = ha.shadowRoot.querySelector("home-assistant-main").shadowRoot;
const panel = main.querySelector("partial-panel-resolver");
let huiRoot, appLayout, view;
let llAttempts = 0;
let config = {};

/**
 * Ignore swipes when initiated on elements that match at least one of these CSS selectors.
 *
 * Learn more on CSS selectors
 * [here](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors).
 */
const exceptions = [

  // INTERNALS

  // Header bar (contains tabs)
  "app-header",
  // Map
  "hui-map-card",
  // Sidebar (contains dashboards)
  "ha-sidebar",
  // Slider
  "ha-slider",

  // THIRD PARTIES

  // Plotly Graph Card (https://github.com/dbuezas/lovelace-plotly-graph-card)
  "g.draglayer",
  // 🍄 Mushroom (https://github.com/piitaya/lovelace-mushroom)
  "mushroom-slider",
  // round-slider (https://github.com/thomasloven/round-slider)
  "round-slider",
  // Slider button card (https://github.com/mattieha/slider-button-card)
  "slider-button-card",
  // Swipe Card (https://github.com/bramkragten/swipe-card)
  "swipe-card",
  // Lovelace Vacuum Map card (https://github.com/PiotrMachowski/lovelace-xiaomi-vacuum-map-card)
  "xiaomi-vacuum-map-card",
  // my-slider (https://github.com/AnthonMS/my-cards/blob/main/src/my-slider.ts)
  "my-slider",
].join(',');

function run() {
  const lovelace = main.querySelector("ha-panel-lovelace");

  if (lovelace) {
    config = {};
    getConfig(lovelace);
  }
}

function getConfig(lovelace) {
  llAttempts++;
  try {
    const llConfig = lovelace.lovelace.config;
    config = llConfig.swipe_nav || {};
    huiRoot = lovelace.shadowRoot.querySelector("hui-root");
    appLayout = huiRoot.shadowRoot.querySelector("ha-app-layout");
    view = appLayout.querySelector('[id="view"]');
    swipeNavigation();
  } catch {
    if (llAttempts < 40) setTimeout(() => getConfig(lovelace), 50);
  }
}

function swipeNavigation() {
  llAttempts = 0;
  const tabContainer = appLayout.querySelector("paper-tabs") || appLayout.querySelector("ha-tabs");
  let tabs = tabContainer ? Array.from(tabContainer.querySelectorAll("paper-tab")) : [];
  const rtl = ha.style.direction == "rtl";
  const animate = config.animate != undefined ? config.animate : "none";
  const wrap = config.wrap != undefined ? config.wrap : true;
  const prevent_default = config.prevent_default != undefined ? config.prevent_default : false;
  const swipe_amount = config.swipe_amount != undefined ? config.swipe_amount / Math.pow(10, 2) : 0.15;
  const skip_hidden = config.skip_hidden != undefined ? config.skip_hidden : true;
  const skip_tabs =
    config.skip_tabs != undefined
      ? String(config.skip_tabs)
        .replace(/\s+/g, "")
        .split(",")
        .map(function (item) {
          return parseInt(item, 10);
        })
      : [];

  let xDown, yDown, xDiff, yDiff, activeTab, firstTab, lastTab, left;

  if (tabContainer) {
    appLayout.addEventListener("touchstart", handleTouchStart, { passive: true });
    appLayout.addEventListener("touchmove", handleTouchMove, { passive: false });
    appLayout.addEventListener("touchend", handleTouchEnd, { passive: true });
    if (animate == "swipe") appLayout.style.overflow = "hidden";
  }

  function handleTouchStart(event) {
    if (typeof event.composedPath() == "object") {
      for (let element of event.composedPath()) {
        if (element.nodeName == "HUI-VIEW") {
          // hui-view is the root element of the Home Assistant dashboard, so we can stop here.
          break;
        } else {
          if (element.matches && element.matches(exceptions)) {
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
      if (Math.abs(xDiff) > Math.abs(yDiff) && prevent_default) event.preventDefault();
    }
  }

  function handleTouchEnd() {
    if (activeTab < 0 || Math.abs(xDiff) < Math.abs(yDiff)) {
      xDown = yDown = xDiff = yDiff = null;
      return;
    }
    if (rtl) xDiff = -xDiff;
    if (xDiff > Math.abs(screen.width * swipe_amount)) {
      left = false;
      activeTab == tabs.length - 1 ? click(firstTab) : click(activeTab + 1);
    } else if (xDiff < -Math.abs(screen.width * swipe_amount)) {
      left = true;
      activeTab == 0 ? click(lastTab) : click(activeTab - 1);
    }
    if (rtl) left = !left;
    xDown = yDown = xDiff = yDiff = null;
  }

  function filterTabs() {
    if (skip_hidden) {
      tabs = tabs.filter((element) => {
        return !skip_tabs.includes(tabs.indexOf(element)) && getComputedStyle(element, null).display != "none";
      });
    } else {
      tabs = tabs.filter((element) => {
        return !skip_tabs.includes(tabs.indexOf(element));
      });
    }
    firstTab = wrap ? 0 : null;
    lastTab = wrap ? tabs.length - 1 : null;
  }

  function click(index) {
    if ((activeTab == 0 && !wrap && left) || (activeTab == tabs.length - 1 && !wrap && !left)) return;
    if (animate == "swipe") {
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
    } else if (animate == "fade") {
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
    } else if (animate == "flip") {
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
