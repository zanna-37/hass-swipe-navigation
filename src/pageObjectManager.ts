import { PageObject } from "./pageObject";
import { isLessThan2023_4 } from "./versionUtils";


class PageObjectManager {
  public static ha = new PageObject([
    "home-assistant"
  ]);
  public static haMain = new PageObject([
    "home-assistant",
    "$",
    "home-assistant-main"
  ]);
  public static partialPanelResolver = new PageObject([
    "home-assistant",
    "$",
    "home-assistant-main",
    "$",
    "partial-panel-resolver"
  ]);
  public static haPanelLovelace = new PageObject([
    "home-assistant",
    "$",
    "home-assistant-main",
    "$",
    "partial-panel-resolver",
    "ha-panel-lovelace"
  ]);
  public static huiRoot = new PageObject([
    "home-assistant",
    "$",
    "home-assistant-main",
    "$",
    "partial-panel-resolver",
    "ha-panel-lovelace",
    "$",
    "hui-root"
  ]);
  public static haAppLayout = new PageObject([
    "home-assistant",
    "$",
    "home-assistant-main",
    "$",
    "partial-panel-resolver",
    "ha-panel-lovelace",
    "$",
    "hui-root",
    "$",
    (isLessThan2023_4() ? "ha-app-layout" : "div")
  ]);
  public static haAppLayoutView = new PageObject([
    "home-assistant",
    "$",
    "home-assistant-main",
    "$",
    "partial-panel-resolver",
    "ha-panel-lovelace",
    "$",
    "hui-root",
    "$",
    "[id=\"view\"]"
  ]);
  public static tabsContainer = new PageObject([
    "home-assistant",
    "$",
    "home-assistant-main",
    "$",
    "partial-panel-resolver",
    "ha-panel-lovelace",
    "$",
    "hui-root",
    "$",
    "ha-tabs,paper-tabs" // ha-tabs for standard mode and paper-tabs when in edit mode
  ]);
}

export { PageObjectManager };
