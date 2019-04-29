// CONFIG START //////////////////////////////////////////////////////////////

let swipe_amount = 15; // Minimum percent of screen needed to swipe, 1-100.
let wrap = true; // Wrap around first and last tabs. Set as false to disable.

// CONFIG END ////////////////////////////////////////////////////////////////

document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);
document.addEventListener("touchend", handleTouchEnd, false);

const tabContainer = getTabContainer();
let activeTabIndex, xDown, yDown, xDiff, yDiff, tabs;
swipe_amount /= Math.pow(10, 2);

function handleTouchStart(evt) {
  if (!tabs) {
    // Create array of visible tabs so we don't swipe to one hidden by CCH.
    tabs = Array.from(
      tabContainer.querySelectorAll("paper-tab:not([style*='display: none'])")
    );
  }
  activeTabIndex = tabs.indexOf(tabContainer.querySelector(".iron-selected"));
  xDown = evt.touches[0].clientX;
  yDown = evt.touches[0].clientY;
  xDiff = null;
  yDiff = null;
}

function handleTouchEnd(evt) {
  if (xDiff > Math.abs(screen.width * swipe_amount)) {
    let wrapAround = wrap ? click(0) : false;
    activeTabIndex == tabs.length - 1 ? wrapAround : click(activeTabIndex + 1);
  } else if (xDiff < -Math.abs(screen.width * swipe_amount)) {
    wrapAround = wrap ? click(tabs.length - 1) : false;
    activeTabIndex == 0 ? wrapAround : click(activeTabIndex - 1);
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

function simulateClick(elem) {
  const evt = new MouseEvent("click", { bubbles: false, cancelable: true });
  const canceled = !elem.dispatchEvent(evt);
}

function click(tabIndex) {
  simulateClick(tabs[tabIndex]);
}
