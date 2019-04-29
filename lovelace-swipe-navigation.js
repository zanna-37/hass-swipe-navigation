document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);
document.addEventListener("touchend", handleTouchEnd, false);

const tabContainer = getTabContainer();
const tabs = Array.from(tabContainer.querySelectorAll("paper-tab"));
let activeTabIndex, xDown, yDown, xDiff, yDiff, swipe;

function handleTouchStart(evt) {
  activeTabIndex = tabs.indexOf(tabContainer.querySelector(".iron-selected"));
  xDown = evt.touches[0].clientX;
  yDown = evt.touches[0].clientY;
  swipe = false;
}

function handleTouchEnd(evt) {
  if (xDiff > 5 && swipe) {
    activeTabIndex == tabs.length - 1 ? click(0) : click(activeTabIndex + 1);
  } else if (xDiff < -5 && swipe) {
    activeTabIndex == 0 ? click(tabs.length - 1) : click(activeTabIndex - 1);
  }
}

function handleTouchMove(evt) {
  if (xDown && yDown && !swipe) {
    xDiff = xDown - evt.touches[0].clientX;
    yDiff = yDown - evt.touches[0].clientY;
    swipe = Math.abs(xDiff) > Math.abs(yDiff) ? true : false;
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
