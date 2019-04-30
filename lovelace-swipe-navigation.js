// CONFIG START //////////////////////////////////////////////////////////////

let swipe_amount = 15; // Minimum percent of screen needed to swipe, 1-100.
let wrap = true; // Wrap around first and last tabs. Set as false to disable.

// CONFIG END ////////////////////////////////////////////////////////////////

document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);
document.addEventListener("touchend", handleTouchEnd, false);

let activeTab, xDown, yDown, xDiff, yDiff, tabs, firstTab, lastTab;
const tabContainer = getTabContainer();
swipe_amount /= Math.pow(10, 2);

function handleTouchStart(evt) {
  xDown = evt.touches[0].clientX;
  yDown = evt.touches[0].clientY;
  xDiff = null;
  yDiff = null;
  getTabs();
}

function handleTouchEnd() {
  if (xDiff > Math.abs(screen.width * swipe_amount)) {
    activeTab == tabs.length - 1 ? click(firstTab) : click(activeTab + 1);
  } else if (xDiff < -Math.abs(screen.width * swipe_amount)) {
    activeTab == 0 ? click(lastTab) : click(activeTab - 1);
  }
}

function handleTouchMove(evt) {
  if (xDown && yDown) {
    xDiff = xDown - evt.touches[0].clientX;
    yDiff = yDown - evt.touches[0].clientY;
  }
}

function getTabContainer() {
  try {
    let panelResolver = document
      .querySelector("home-assistant")
      .shadowRoot.querySelector("home-assistant-main")
      .shadowRoot.querySelector("app-drawer-layout partial-panel-resolver");
    if (panelResolver.shadowRoot) {
      return panelResolver.shadowRoot
        .querySelector("ha-panel-lovelace")
        .shadowRoot.querySelector("hui-root")
        .shadowRoot.querySelector("ha-app-layout paper-tabs");
    } else {
      return document
        .querySelector("home-assistant")
        .shadowRoot.querySelector("home-assistant-main")
        .shadowRoot.querySelector("ha-panel-lovelace")
        .shadowRoot.querySelector("hui-root")
        .shadowRoot.querySelector("ha-app-layout paper-tabs");
    }
  } catch (e) {
    console.log("Can't find 'paper-tabs' element.");
  }
}

function getTabs() {
  if (!tabs) {
    tabs = Array.from(
      tabContainer.querySelectorAll("paper-tab:not([style*='display: none'])")
    );
    firstTab = wrap ? 0 : null;
    lastTab = wrap ? tabs.length - 1 : null;
  }
  activeTab = tabs.indexOf(tabContainer.querySelector(".iron-selected"));
}

function simulateClick(elem) {
  const evt = new MouseEvent("click", { bubbles: false, cancelable: true });
  const canceled = !elem.dispatchEvent(evt);
}

function click(tabIndex) {
  simulateClick(tabs[tabIndex]);
}
