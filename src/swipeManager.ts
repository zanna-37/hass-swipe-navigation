import { ConfigManager } from "./configManager";
import { Logger } from "./logger";
import { LOG_TAG } from "./loggerUtils";
import { PageObjectManager } from "./pageObjectManager";
import { exceptions } from "./swipeExceptions";

class SwipeManager {
  static #xDown: number | null;
  static #yDown: number | null;
  static #xDiff: number | null;
  static #yDiff: number | null;

  static #pointerEventsAbortController: AbortController | null = null;

  static init() {
    this.#pointerEventsAbortController?.abort();
    this.#pointerEventsAbortController = new AbortController();

    const haAppLayoutDomNode = PageObjectManager.haAppLayout.getDomNode();
    if (haAppLayoutDomNode != null) {
      Logger.logd(LOG_TAG, "Initializing SwipeManger...");

      haAppLayoutDomNode.addEventListener(
        "touchstart",
        (event) => { this.#handlePointerStart(event); },
        { signal: this.#pointerEventsAbortController.signal, passive: true }
      );
      haAppLayoutDomNode.addEventListener(
        "touchmove",
        (event) => { this.#handlePointerMove(event); },
        { signal: this.#pointerEventsAbortController.signal, passive: false }
      );
      haAppLayoutDomNode.addEventListener(
        "touchend",
        () => { this.#handlePointerEnd(); },
        { signal: this.#pointerEventsAbortController.signal, passive: true }
      );
      haAppLayoutDomNode.addEventListener(
        "mousedown",
        (event) => { this.#handlePointerStart(event); },
        { signal: this.#pointerEventsAbortController.signal, passive: true }
      );
      if (ConfigManager.getCurrentConfig().getEnableMouseSwipe()) {
        haAppLayoutDomNode.addEventListener(
          "mousemove",
          (event) => { this.#handlePointerMove(event); },
          { signal: this.#pointerEventsAbortController.signal, passive: false }
        );
        haAppLayoutDomNode.addEventListener(
          "mouseup",
          () => { this.#handlePointerEnd(); },
          { signal: this.#pointerEventsAbortController.signal, passive: true }
        );
      }
    }
  }

  static #handlePointerStart(event: TouchEvent | MouseEvent) {

    let interactionType;
    if (window.TouchEvent != null && event instanceof TouchEvent) {
      interactionType = "touch";
    } else if (event instanceof MouseEvent) {
      interactionType = "click";
    } else {
      const eventCheck/*: never*/ = event; // Firefox doesn't always set TouchEvent type
      throw new Error(`Unhandled case: ${eventCheck}`);
    }

    if (ConfigManager.getCurrentConfig().getEnable() == false) {
      Logger.logd(LOG_TAG, "Ignoring " + interactionType + ": Swipe navigation is disabled in the config.");
      return; // Ignore swipe: Swipe is disabled in the config
    }

    if (ConfigManager.getCurrentConfig().getEnableOnSubviews() == false) {
      const views = ConfigManager.getViews();
      const activeTabIndex = ConfigManager.getCurrentViewIndex();

      if (views != null && activeTabIndex != null && views[activeTabIndex].subview) {
        Logger.logd(LOG_TAG, "Ignoring " + interactionType + ": Swipe navigation on subviews is disabled in the config.");
        return; // Ignore swipe: Swipe on subviews is disabled in the config
      }
    }

    if (window.TouchEvent != null && event instanceof TouchEvent && event.touches.length > 1) {
      this.#xDown = null;
      this.#yDown = null;
      Logger.logd(LOG_TAG, "Ignoring " + interactionType + ": multiple touchpoints detected.");
      return; // Ignore swipe: Multitouch detected
    } else if (event instanceof MouseEvent && !ConfigManager.getCurrentConfig().getEnableMouseSwipe()) {
      this.#xDown = null;
      this.#yDown = null;
      Logger.logd(LOG_TAG, "Ignoring " + interactionType + ": swiping via mouse is disabled.");
      return;
    }

    if (typeof event.composedPath() == "object") {
      for (const element of event.composedPath()) {
        if (element instanceof Element) {
          if (element.nodeName == "HUI-VIEW") {
            // hui-view is the root element of the Home Assistant dashboard, so we can stop here.
            break;
          } else {
            if (element.matches && element.matches(exceptions)) {
              Logger.logd(LOG_TAG, "Ignoring " + interactionType + " on \""
                + (element.nodeName != null ? element.nodeName.toLowerCase() : "unknown")
                + "\".");
              return; // Ignore swipe
            }
          }
        }
      }
    }
    if (window.TouchEvent != null && event instanceof TouchEvent) {
      this.#xDown = event.touches[0].clientX;
      this.#yDown = event.touches[0].clientY;
    } else if (event instanceof MouseEvent) {
      this.#xDown = event.clientX;
      this.#yDown = event.clientY;
    } else {
      const eventCheck/*: never*/ = event; // Firefox doesn't always set TouchEvent type
      throw new Error(`Unhandled case: ${eventCheck}`);
    }
  }

  static #handlePointerMove(event: TouchEvent | MouseEvent) {
    if (this.#xDown && this.#yDown) {
      if (window.TouchEvent != null && event instanceof TouchEvent) {
        this.#xDiff = this.#xDown - event.touches[0].clientX;
        this.#yDiff = this.#yDown - event.touches[0].clientY;
      } else if (event instanceof MouseEvent) {
        this.#xDiff = this.#xDown - event.clientX;
        this.#yDiff = this.#yDown - event.clientY;
      } else {
        const eventCheck/*: never*/ = event; // Firefox doesn't always set TouchEvent type
        throw new Error(`Unhandled case: ${eventCheck}`);
      }

      if (Math.abs(this.#xDiff) > Math.abs(this.#yDiff) && ConfigManager.getCurrentConfig().getPreventDefault()) event.preventDefault();
    }
  }

  static #handlePointerEnd() {
    if (this.#xDiff != null && this.#yDiff != null) {
      if (Math.abs(this.#xDiff) < Math.abs(this.#yDiff)) {
        Logger.logd(LOG_TAG, "Swipe ignored, vertical movement.");

      } else {  // Horizontal movement
        if (Math.abs(this.#xDiff) < Math.abs(screen.width * ConfigManager.getCurrentConfig().getSwipeAmount())) {
          Logger.logd(LOG_TAG, "Swipe ignored, too short.");

        } else {
          const directionLeft = this.#xDiff < 0;

          Logger.logi(LOG_TAG, "Swipe detected, changing tab to the " + (directionLeft ? "left" : "right") + ".");

          const rtl = PageObjectManager.ha.getDomNode()?.style.direction == "rtl";
          const nextViewName = this.#getNextViewName(rtl ? !directionLeft : directionLeft);
          if (nextViewName != null) {
            this.animatedNavigateTo(nextViewName, directionLeft);
          }
        }
      }
    }
    this.#xDown = this.#yDown = this.#xDiff = this.#yDiff = null;
  }

  static #getNextViewName(directionLeft: boolean): string | null {
    const views = ConfigManager.getViews();
    const activeTabIndex = ConfigManager.getCurrentViewIndex();

    if (views == null || activeTabIndex == null) {
      Logger.loge(LOG_TAG, "Can't determine the active tab.");
      return null;
    }

    let nextTabIndex = activeTabIndex;
    let stopReason = null;

    const incrementStep = directionLeft ? -1 : 1;

    let found = false;

    while (!found) {
      nextTabIndex += incrementStep;

      if (nextTabIndex == -1 || nextTabIndex == views.length) {
        if (ConfigManager.getCurrentConfig().getWrap()) {
          nextTabIndex = (nextTabIndex + views.length) % views.length;
        } else {
          found = true;
          nextTabIndex = -1;
          stopReason = "Edge has been reached and wrap is disabled.";
          break;
        }
      }

      if (nextTabIndex == activeTabIndex) {
        // A complete cycle has been done. Stop to avoid infinite loop.
        found = true;
        nextTabIndex = -1;
        stopReason = "Error, no viable tabs found for swiping.";
        break;
      }

      if (ConfigManager.getCurrentConfig().getSkipTabs().includes(nextTabIndex)) {
        continue;
      }
      if (ConfigManager.getCurrentConfig().getSkipHidden() && ConfigManager.isViewHidden(views, nextTabIndex)) {
        continue;
      }
      if (ConfigManager.getCurrentConfig().getSkipSubviews() && views[nextTabIndex].subview == true) {
        continue;
      }

      found = true;
    }

    if (stopReason != null) {
      Logger.logw(LOG_TAG, stopReason);
      return null;
    } else {
      const nextPath = views[nextTabIndex].path;
      const isPathEmpty = nextPath == null || nextPath.trim() == "";
      return isPathEmpty ? String(nextTabIndex) : nextPath;
    }
  }

  private static animatedNavigateTo(viewName: string, directionLeft: boolean) {
    const view = PageObjectManager.haAppLayoutView.getDomNode();

    if (view == null) {
      Logger.loge(LOG_TAG, "view is null when attempting to change tab.");

    } else {
      const configAnimate = ConfigManager.getCurrentConfig().getAnimate();
      if (configAnimate == "none") {
        SwipeManager.navigateTo(viewName);

      } else {
        const duration = ConfigManager.getCurrentConfig().getAnimateDuration();
        view.style.transition = `transform ${duration}ms ease-in, opacity ${duration}ms ease-in`;

        if (configAnimate == "swipe") {
          const haAppLayoutDomNode = PageObjectManager.haAppLayout.getDomNode();
          if (haAppLayoutDomNode != null) {
            haAppLayoutDomNode.style.overflow = "hidden";
          }
          const _in = directionLeft ? `${screen.width / 2}px` : `-${screen.width / 2}px`;
          const _out = directionLeft ? `-${screen.width / 2}px` : `${screen.width / 2}px`;
          view.style.opacity = "0";
          view.style.transform = `translate(${_in}, 0)`;
          setTimeout(function () {
            view.style.transition = "";
            view.style.transform = `translate(${_out}, 0)`;
            SwipeManager.navigateTo(viewName);
          }, duration + 10);

        } else if (configAnimate == "fade") {
          view.style.opacity = "0";
          setTimeout(function () {
            view.style.transition = "";
            SwipeManager.navigateTo(viewName);
            view.style.opacity = "0";
          }, duration + 10);

        } else if (configAnimate == "flip") {
          view.style.transform = "rotatey(90deg)";
          view.style.opacity = "0.25";
          setTimeout(function () {
            view.style.transition = "";
            SwipeManager.navigateTo(viewName);
          }, duration + 10);

        } else {
          const exhaustiveCheck: never = configAnimate;
          throw new Error(`Unhandled case: ${exhaustiveCheck}`);
        }

        setTimeout(function () {
          view.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
          view.style.opacity = "1";
          view.style.transform = "";
        }, duration + 50);

        if (configAnimate == "swipe") {
          setTimeout(function () {
            const haAppLayoutDomNode = PageObjectManager.haAppLayout.getDomNode();
            if (haAppLayoutDomNode != null) {
              haAppLayoutDomNode.style.overflow = "";
            }
          }, duration * 2 + 100);
        }
      }
    }
  }

  private static navigateTo(viewName: string) {
    const queryString = window.location.search;
    const hashFragment = window.location.hash;
    const panelName = ConfigManager.getPanel();

    const targetUrl = "/" + panelName + "/" + viewName + queryString + hashFragment;

    if (window.location.pathname + window.location.search + window.location.hash !== targetUrl) {
      window.history.pushState(null,"",targetUrl);
      window.dispatchEvent(new CustomEvent("location-changed"));
    }
  }
}

export { SwipeManager };
