// CONFIG START //////////////////////////////////////////////////////////////

let swipe_amount = 15; // Minimum percent of screen needed to swipe, 1-100.
let skip_tabs = []; // List of tabs to skip over. e.g., [1,3,5].
let wrap = true; // Wrap around first and last tabs. Set as false to disable.

// CONFIG END ////////////////////////////////////////////////////////////////

document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);
document.addEventListener("touchend", handleTouchEnd, false);

swipe_amount /= Math.pow(10, 2);
const tabContainer = getTabContainer();
let xDown, yDown, xDiff, yDiff, activeTab, firstTab, lastTab;
let tabs = Array.from(tabContainer.querySelectorAll("paper-tab"));

function handleTouchStart(evt) {
  evt.path.forEach(function(element) {
    if (element.nodeName == "SWIPE-CARD") return;
  });
  xDown = evt.touches[0].clientX;
  yDown = evt.touches[0].clientY;
  xDiff = null;
  yDiff = null;
  getTabs();
}

function handleTouchMove(evt) {
  if (xDown && yDown) {
    xDiff = xDown - evt.touches[0].clientX;
    yDiff = yDown - evt.touches[0].clientY;
  }
}

function handleTouchEnd() {
  if (activeTab < 0) return;
  if (xDiff > Math.abs(screen.width * swipe_amount)) {
    activeTab == tabs.length - 1 ? click(firstTab) : click(activeTab + 1);
  } else if (xDiff < -Math.abs(screen.width * swipe_amount)) {
    activeTab == 0 ? click(lastTab) : click(activeTab - 1);
  }
  xDown = null;
  yDown = null;
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
  if (!lastTab) {
    tabs = tabs.filter(el => {
      return (
        !skip_tabs.includes(tabs.indexOf(el)) &&
        getComputedStyle(el, null).display != "none"
      );
    });
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
