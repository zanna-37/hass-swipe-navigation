import { PageObject } from "./pageObject";
import { isLessThan2023_4 } from "./versionUtils";

// Since we are using `subtree: false` in the observer for performance reasons, we need to observe
// each element in the path
class PageObjectManager {
  public static ha = new PageObject([
    "home-assistant"
  ]);
  public static haMain = new PageObject([
    ...PageObjectManager.ha.getSelectorPaths(),
    "$",
    "home-assistant-main"
  ]);
  public static partialPanelResolver = new PageObject([
    ...PageObjectManager.haMain.getSelectorPaths(),
    "$",
    "partial-panel-resolver"
  ]);
  public static haPanelLovelace = new PageObject([
    ...PageObjectManager.partialPanelResolver.getSelectorPaths(),
    "ha-panel-lovelace"
  ]);
  public static huiRoot = new PageObject([
    ...PageObjectManager.haPanelLovelace.getSelectorPaths(),
    "$",
    "hui-root"
  ]);
  public static haAppLayout = new PageObject([
    ...PageObjectManager.huiRoot.getSelectorPaths(),
    "$",
    (isLessThan2023_4() ? "ha-app-layout" : "div")
  ]);
  public static haAppLayoutView = new PageObject([
    ...PageObjectManager.huiRoot.getSelectorPaths(),
    "$",
    "[id=\"view\"]"
  ]);
  public static tabsContainer = new PageObject([
    ...PageObjectManager.huiRoot.getSelectorPaths(),
    "$",
    "ha-tabs,paper-tabs" // ha-tabs for standard mode and paper-tabs when in edit mode
  ]);
}

export { PageObjectManager };
