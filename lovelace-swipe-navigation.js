// CONFIG START //////////////////////////////////////////////////////////////

let swipe_amount = 15 // Minimum percentage of screen to swipe to trigger.

// CONFIG END ////////////////////////////////////////////////////////////////

document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);
document.addEventListener("touchend", handleTouchEnd, false);

const tabContainer = getTabContainer();
const tabs = Array.from(tabContainer.querySelectorAll("paper-tab"));
let activeTabIndex, xDown, yDown, xDiff, yDiff;
swipe_amount /= Math.pow(10, 2);

function handleTouchStart(evt) {
  activeTabIndex = tabs.indexOf(tabContainer.querySelector(".iron-selected"));
  xDown = evt.touches[0].clientX;
  yDown = evt.touches[0].clientY;
  xDiff = null;
  yDiff = null;
}

function handleTouchEnd(evt) {
  if (xDiff > Math.abs(screen.width * swipe_amount)) {
    activeTabIndex == tabs.length - 1 ? click(0) : click(activeTabIndex + 1);
  } else if (xDiff < -Math.abs(screen.width * swipe_amount)) {
    activeTabIndex == 0 ? click(tabs.length - 1) : click(activeTabIndex - 1);
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
