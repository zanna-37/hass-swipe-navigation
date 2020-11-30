let elem = {};
let attempts = 0;

function getElements() {
  if (attempts < 10) {
    try {
      elem.ha = document.querySelector("home-assistant");
      elem.main = elem.ha.shadowRoot.querySelector("home-assistant-main").shadowRoot;
      elem.panel = elem.main.querySelector("partial-panel-resolver");
      elem.ll = elem.main.querySelector("ha-panel-lovelace");
      elem.root = elem.ll.shadowRoot.querySelector("hui-root");
      elem.appLayout = elem.root.shadowRoot.querySelector("ha-app-layout");
    } catch {
      attempts++;
      setTimeout(() => getElements(), 50);
    }
  } else if (elem.ll && !elem.root) {
    console.log("hui-root not found.");
  } else if (elem.ll && !elem.appLayout) {
    console.log("ha-app-layout not found.");
  }
}

// Ignore swipes when initiated on these elements.
const ignored = [
  "APP-HEADER",
  "HA-SLIDER",
  "SWIPE-CARD",
  "HUI-MAP-CARD",
  "ROUND-SLIDER",
  "XIAOMI-VACUUM-MAP-CARD",
  "HA-SIDEBAR",
];

getElements();
attempts = 0;

function swipeNavigation() {
  if (
    !document
      .querySelector("home-assistant")
      .shadowRoot.querySelector("home-assistant-main")
      .shadowRoot.querySelector("ha-panel-lovelace")
  ) {
    return;
  }

  if (!elem.appLayout || !elem.appLayout.isConnected) {
    if (attempts == 0) {
      getElements();
      swipeNavigation();
      return;
    } else {
      return;
    }
  }

  const view = elem.appLayout.querySelector('[id="view"]');
  const tabContainer = elem.appLayout.querySelector("paper-tabs") || elem.appLayout.querySelector("ha-tabs");
  let tabs = tabContainer ? Array.from(tabContainer.querySelectorAll("paper-tab")) : [];
  const rtl = elem.ha.style.direction == "rtl";
  const config = elem.ll.lovelace.config.swipe_nav || {};

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
    elem.appLayout.addEventListener("touchstart", handleTouchStart, { passive: true });
    elem.appLayout.addEventListener("touchmove", handleTouchMove, { passive: false });
    elem.appLayout.addEventListener("touchend", handleTouchEnd, { passive: true });
    if (animate == "swipe") elem.appLayout.style.overflow = "hidden";
  }

  function handleTouchStart(event) {
    if (typeof event.path == "object") {
      for (let element of event.path) {
        if (element.nodeName == "HUI-VIEW") break;
        else if (ignored.indexOf(element.nodeName) > -1) return;
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
swipeNavigation();

// Watch for changes in partial-panel-resolver's children.
new MutationObserver(lovelaceWatch).observe(elem.panel, { childList: true });

// If new lovelace panel was added watch for hui-root to appear.
function lovelaceWatch(mutations) {
  for (let mutation of mutations) {
    for (let node of mutation.addedNodes) {
      if (node.localName == "ha-panel-lovelace") {
        new MutationObserver(rootWatch).observe(node.shadowRoot, {
          childList: true,
        });
        return;
      }
    }
  }
}

// When hui-root appears watch it's children.
function rootWatch(mutations) {
  for (let mutation of mutations) {
    for (let node of mutation.addedNodes) {
      if (node.localName == "hui-root") {
        new MutationObserver(appLayoutWatch).observe(node.shadowRoot, {
          childList: true,
        });
        return;
      }
    }
  }
}

// When ha-app-layout appears we can run.
function appLayoutWatch(mutations) {
  for (let mutation of mutations) {
    for (let node of mutation.addedNodes) {
      if (node.localName == "ha-app-layout") {
        swipeNavigation();
        return;
      }
    }
  }
}

// Overly complicated console tag.
const conInfo = { header: "%c≡ swipe-navigation".padEnd(27), ver: "%cversion *DEV " };
const br = "%c\n";
const maxLen = Math.max(...Object.values(conInfo).map((el) => el.length));
for (const [key] of Object.entries(conInfo)) {
  if (conInfo[key].length <= maxLen) conInfo[key] = conInfo[key].padEnd(maxLen);
  if (key == "header") conInfo[key] = `${conInfo[key].slice(0, -1)}⋮ `;
}
const header =
  "display:inline-block;border-width:1px 1px 0 1px;border-style:solid;border-color:#424242;color:white;background:#03a9f4;font-size:12px;padding:4px 4.5px 5px 6px;";
const info = "border-width:0px 1px 1px 1px;padding:7px;background:white;color:#424242;line-height:0.7;";
console.info(conInfo.header + br + conInfo.ver, header, "", `${header} ${info}`);
