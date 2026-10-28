import { ConfigManager } from "./configManager";
import { Logger } from "./logger";
import { LOG_TAG } from "./loggerUtils";
import { PageObjectManager } from "./pageObjectManager";
import { pinnedSelector } from "./pinnedElements";
import {
  plainSelectors,
  scrollDependentSelectors,
  allScopedSelectors,
  scopedExceptions,
  anyExceptionSelector,
} from "./swipeExceptions";

// Cap on how many classes reach the logs, so that a single debug line stays
// readable when an element stacks a long list of them.
const MAX_LOGGED_CLASSES = 4;

class SwipeManager {
  static #xDown: number | null;
  static #yDown: number | null;
  static #xDiff: number | null;
  static #yDiff: number | null;

  // Per-axis blocks from scroll-dependent exceptions. A non-null log marks
  // that axis as blocked; it is decided at pointer start from overflow, and
  // emitted at pointer end if the user's swipe direction matches the axis.
  static #blockedHorizontalLog: string | null = null;
  static #blockedVerticalLog: string | null = null;

  static #pointerEventsAbortController: AbortController | null = null;

  // Set while a `slide` animation is running; further swipes are ignored until it ends.
  static #slideInProgress = false;

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

  static #areBothAxesBlocked() {
    return this.#blockedHorizontalLog != null && this.#blockedVerticalLog != null;
  }

  /**
   * Renders an element the way the exception list is written — node name, id and
   * classes concatenated into a CSS selector — so that a log line can be matched
   * against the entries of swipeExceptions.ts.
   *
   * At most MAX_LOGGED_CLASSES classes are listed; the rest are only counted.
   */
  static #describeElement(element: Element) {
    const nodeName = element.nodeName.toLowerCase();
    const id = element.id ? `#${element.id}` : "";

    // classList, not className: on SVG elements the latter is an
    // SVGAnimatedString rather than a string.
    const classes = Array.from(element.classList);
    const listedClasses = classes.slice(0, MAX_LOGGED_CLASSES).map((c) => `.${c}`).join("");
    const omittedClasses = classes.length - MAX_LOGGED_CLASSES;
    const omittedSuffix = omittedClasses > 0 ? ` (+${omittedClasses} more)` : "";

    return `${nodeName}${id}${listedClasses}${omittedSuffix}`;
  }

  static #applyScrollDependentBlock(
    element: Element,
    interactionType: string,
    scopeSuffix: string = "",
  ) {
    const description = this.#describeElement(element);
    if (this.#blockedHorizontalLog == null && element.scrollWidth > element.clientWidth) {
      this.#blockedHorizontalLog = `Ignoring ${interactionType} on horizontally scrollable "${description}"${scopeSuffix}.`;
    }
    if (this.#blockedVerticalLog == null && element.scrollHeight > element.clientHeight) {
      this.#blockedVerticalLog = `Ignoring ${interactionType} on vertically scrollable "${description}"${scopeSuffix}.`;
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
      Logger.logd(LOG_TAG, `Ignoring ${interactionType}: Swipe navigation is disabled in the config.`);
      return; // Ignore swipe: Swipe is disabled in the config
    }

    if (ConfigManager.getCurrentConfig().getEnableOnSubviews() == false) {
      const views = ConfigManager.getViews();
      const activeTabIndex = ConfigManager.getCurrentViewIndex();

      if (views != null && activeTabIndex != null && views[activeTabIndex].subview) {
        Logger.logd(LOG_TAG, `Ignoring ${interactionType}: Swipe navigation on subviews is disabled in the config.`);
        return; // Ignore swipe: Swipe on subviews is disabled in the config
      }
    }

    if (window.TouchEvent != null && event instanceof TouchEvent && event.touches.length > 1) {
      this.#xDown = null;
      this.#yDown = null;
      Logger.logd(LOG_TAG, `Ignoring ${interactionType}: multiple touchpoints detected.`);
      return; // Ignore swipe: Multitouch detected
    } else if (event instanceof MouseEvent && !ConfigManager.getCurrentConfig().getEnableMouseSwipe()) {
      this.#xDown = null;
      this.#yDown = null;
      Logger.logd(LOG_TAG, `Ignoring ${interactionType}: swiping via mouse is disabled.`);
      return;
    }

    this.#blockedHorizontalLog = null;
    this.#blockedVerticalLog = null;

    const path = event.composedPath();
    if (typeof path == "object") {
      for (const element of path) {
        if (!(element instanceof Element)) continue;
        if (element.nodeName == "HUI-VIEW") {
          // hui-view is the root element of the Home Assistant dashboard, so we can stop here.
          break;
        }

        // Fast early-out: if the element doesn't match any exception selector,
        // skip the per-bucket checks entirely.
        if (!anyExceptionSelector || !element.matches(anyExceptionSelector)) continue;

        if (plainSelectors && element.matches(plainSelectors)) {
          Logger.logd(LOG_TAG, `Ignoring ${interactionType} on "${this.#describeElement(element)}".`);
          return; // Ignore swipe
        }

        if (!this.#areBothAxesBlocked() && scrollDependentSelectors && element.matches(scrollDependentSelectors)) {
          this.#applyScrollDependentBlock(element, interactionType);
        }

        if (allScopedSelectors && element.matches(allScopedSelectors)) {
          const root = element.getRootNode();
          if (root instanceof ShadowRoot) {
            for (const scoped of scopedExceptions) {
              if (!root.host.matches(scoped.host)) continue;
              if (!element.matches(scoped.selector)) continue;

              if (scoped.scrollDependent) {
                if (this.#areBothAxesBlocked()) continue;
                this.#applyScrollDependentBlock(element, interactionType, ` scoped to "${scoped.host}"`);
              } else {
                Logger.logd(LOG_TAG, `Ignoring ${interactionType} on "${this.#describeElement(element)}", matching scoped exception "${scoped.host} >> ${scoped.selector}".`);
                return; // Ignore swipe (scoped exception)
              }
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

      if (
        Math.abs(this.#xDiff) > Math.abs(this.#yDiff)
        && this.#blockedHorizontalLog == null // --> not blocked
        && ConfigManager.getCurrentConfig().getPreventDefault()
      ) {
        event.preventDefault();
      }
    }
  }

  static #handlePointerEnd() {
    if (this.#xDiff != null && this.#yDiff != null) {
      const isVerticalMovement = Math.abs(this.#xDiff) < Math.abs(this.#yDiff);
      const isHorizontalMovement = !isVerticalMovement;

      const swipeMagnitude = Math.abs(isVerticalMovement ? this.#yDiff : this.#xDiff);
      const screenSize = isVerticalMovement ? screen.height : screen.width;
      const isShortSwipe = swipeMagnitude < screenSize * ConfigManager.getCurrentConfig().getSwipeAmount();

      const blockedVerticalLog = this.#blockedVerticalLog;
      const blockedHorizontalLog = this.#blockedHorizontalLog;
      const blockVertical = blockedVerticalLog != null;
      const blockHorizontal = blockedHorizontalLog != null;

      if (isShortSwipe) {
        Logger.logd(LOG_TAG, "Swipe ignored, too short.");

      } else if (isVerticalMovement) {
        if (blockVertical) {
          Logger.logd(LOG_TAG, blockedVerticalLog);
        } else {
          Logger.logd(LOG_TAG, "Swipe ignored, vertical movement.");
        }

      } else if (isHorizontalMovement) {
        if (blockHorizontal) {
          Logger.logd(LOG_TAG, blockedHorizontalLog);
        } else {
          const directionLeft = this.#xDiff < 0;

          Logger.logi(LOG_TAG, "Swipe detected, changing tab to the " + (directionLeft ? "left" : "right") + ".");

          const rtl = PageObjectManager.ha.getDomNode()?.style.direction == "rtl";
          const nextViewName = this.#getNextViewName(rtl ? !directionLeft : directionLeft);
          if (nextViewName != null) {
            this.animatedNavigateTo(nextViewName, directionLeft);
          }
        }

      } else {
        // TypeScript will error at compile-time if a case is missing
        const exhaustiveCheck: never = isVerticalMovement;
        throw new Error(`Unhandled case: ${exhaustiveCheck}`);
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

    while (true) {
      nextTabIndex += incrementStep;

      if (nextTabIndex == -1 || nextTabIndex == views.length) {
        if (ConfigManager.getCurrentConfig().getWrap()) {
          nextTabIndex = (nextTabIndex + views.length) % views.length;
        } else {
          nextTabIndex = -1;
          stopReason = "Edge has been reached and wrap is disabled.";
          break;
        }
      }

      if (nextTabIndex == activeTabIndex) {
        // A complete cycle has been done. Stop to avoid infinite loop.
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

      break;
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

      } else if (configAnimate == "slide") {
        SwipeManager.slideNavigateTo(view, viewName, directionLeft);

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

  /**
   * Slide the outgoing view out and the incoming view in, keeping pinned
   * elements (see `pinnedElements.ts`) in place.
   *
   * Only `translate` is animated, so the animation runs on the compositor.
   * It is applied to the siblings of the path from the view to the pinned
   * element, never to the path itself: a transform on an ancestor would become
   * the containing block of the pinned element's `position: fixed` content.
   */
  private static slideNavigateTo(view: HTMLElement, viewName: string, directionLeft: boolean) {
    if (SwipeManager.#slideInProgress) {
      Logger.logd(LOG_TAG, "Ignoring swipe: a slide animation is still running.");
      return;
    }
    SwipeManager.#slideInProgress = true;
    // Safety net, in case the animation is interrupted before it can clean up.
    const inProgressGuard = setTimeout(() => { SwipeManager.#slideInProgress = false; }, 3000);

    const duration = ConfigManager.getCurrentConfig().getAnimateDuration();
    const haAppLayoutDomNode = PageObjectManager.haAppLayout.getDomNode();
    if (haAppLayoutDomNode != null) {
      // Clip horizontally, and keep it clipped after the animation: WebKit keeps the scrollable overflow of the
      // off-screen positions after the (compositor-driven) slide, so once unclipped the page would stay wider than
      // the screen, and the Home Assistant iOS app would hand left screen-edge pans to page scrolling instead of
      // opening the sidebar. `clip` does not create a scroll container, so sticky headers keep working.
      haAppLayoutDomNode.style.overflowX = "clip";
    }

    const outX = (directionLeft ? 1 : -1) * window.innerWidth;
    const inX = -outX;
    const savedStyles = new Map<HTMLElement, [string, string, string]>();
    const setTranslate = (elements: HTMLElement[], x: number, transition: string) => {
      for (const element of elements) {
        if (!savedStyles.has(element)) {
          savedStyles.set(element, [element.style.translate, element.style.transition, element.style.opacity]);
        }
        element.style.transition = transition;
        element.style.translate = `${x}px 0px`;
      }
    };
    const restoreStyles = (elements: HTMLElement[]) => {
      for (const element of elements) {
        const saved = savedStyles.get(element);
        if (saved != null) {
          [element.style.translate, element.style.transition, element.style.opacity] = saved;
          savedStyles.delete(element);
        }
      }
    };

    const oldView = view.lastElementChild;
    const oldMovers = oldView instanceof HTMLElement ? SwipeManager.getSlideMovers(oldView) : [];
    setTranslate(oldMovers, 0, "none");
    void view.offsetWidth; // Commit the start position so that the transition runs.
    setTranslate(oldMovers, outX, `translate ${duration}ms ease-in`);

    setTimeout(() => {
      // Park the view container off-screen, so that the incoming view is rendered out of sight while Home Assistant
      // swaps it in (pinned `position: fixed` content is not affected by `left`). The outgoing elements are
      // counter-shifted to stay off-screen, and hidden with `opacity` because, unlike `visibility`, descendants
      // cannot override it.
      // The container is always parked to the left, whatever the direction: parking it to the right broke the
      // left screen-edge gesture of the Home Assistant iOS app on the incoming view.
      const parkX = -window.innerWidth;
      for (const element of oldMovers) {
        element.style.transition = "none";
        element.style.translate = `${outX - parkX}px 0px`;
        element.style.opacity = "0";
      }
      view.style.transition = "none";
      view.style.left = `${parkX}px`;
      // The view background is a child of the container too: counter-shift it so that it stays on screen, otherwise
      // whatever is behind it (usually a different color) shows through until the incoming view slides in.
      // A `position: fixed` background is not affected by `left`.
      const background = view.firstElementChild;
      const parkedBackground =
        background instanceof HTMLElement &&
        background.localName == "hui-view-background" &&
        getComputedStyle(background).position != "fixed"
          ? [background]
          : [];
      setTranslate(parkedBackground, -parkX, "none");

      let slideInStarted = false;
      const slideIn = () => {
        if (slideInStarted) return;
        slideInStarted = true;
        observer.disconnect();
        clearTimeout(swapTimeout);

        // Give the incoming view a couple of frames to render.
        requestAnimationFrame(() => requestAnimationFrame(() => {
          restoreStyles(oldMovers);

          const newView = view.lastElementChild;
          const newMovers = newView instanceof HTMLElement ? SwipeManager.getSlideMovers(newView) : [];
          setTranslate(newMovers, inX, "none");
          view.style.left = "";
          restoreStyles(parkedBackground);
          void view.offsetWidth; // Commit the start position so that the transition runs.
          setTranslate(newMovers, 0, `translate ${duration}ms ease-out`);

          setTimeout(() => {
            restoreStyles(newMovers);
            view.style.transition = "";
            clearTimeout(inProgressGuard);
            SwipeManager.#slideInProgress = false;
          }, duration + 50);
        }));
      };

      // Home Assistant swaps the view asynchronously, so wait for it instead of guessing a delay.
      const observer = new MutationObserver(() => {
        if (view.lastElementChild !== oldView) slideIn();
      });
      observer.observe(view, { childList: true });
      const swapTimeout = setTimeout(slideIn, 500);

      SwipeManager.navigateTo(viewName);
    }, duration + 10);
  }

  /**
   * Return the elements to move so that the view slides while its pinned elements stay in place: the siblings,
   * in the flat tree, of every element on the path from `viewElement` to the first pinned element. If the view
   * has no pinned element, the whole view is returned.
   */
  private static getSlideMovers(viewElement: HTMLElement): HTMLElement[] {
    const path = SwipeManager.findPinnedPath(viewElement, 0);
    if (path == null) return [viewElement];

    const onPath = new Set<Element>(path);
    const movers: HTMLElement[] = [];
    const addMover = (element: Element) => {
      const display = getComputedStyle(element).display;
      if (display == "contents") {
        // A `display: contents` element has no box to transform, move its children instead.
        for (const child of SwipeManager.getFlatChildren(element)) addMover(child);
      } else if (display != "none" && element instanceof HTMLElement) {
        movers.push(element);
      }
    };
    for (const element of path.slice(0, -1)) {
      for (const child of SwipeManager.getFlatChildren(element)) {
        if (!onPath.has(child)) addMover(child);
      }
    }
    return movers;
  }

  private static findPinnedPath(element: Element, depth: number): Element[] | null {
    if (element.matches(pinnedSelector)) return [element];
    if (depth > 60) return null;
    for (const child of SwipeManager.getFlatChildren(element)) {
      const path = SwipeManager.findPinnedPath(child, depth + 1);
      if (path != null) {
        path.unshift(element);
        return path;
      }
    }
    return null;
  }

  /**
   * Children as rendered: an element's shadow root content replaces its light DOM children, and a slot is replaced
   * by the elements assigned to it.
   */
  private static getFlatChildren(element: Element): Element[] {
    if (element.shadowRoot != null) return Array.from(element.shadowRoot.children);
    if (element instanceof HTMLSlotElement) {
      const assigned = element.assignedElements({ flatten: true });
      return assigned.length > 0 ? assigned : Array.from(element.children);
    }
    return Array.from(element.children);
  }

  private static navigateTo(viewName: string) {
    const queryString = window.location.search;
    const hashFragment = window.location.hash;
    const panelName = ConfigManager.getPanel();

    const targetUrl = "/" + panelName + "/" + viewName + queryString + hashFragment;

    if (window.location.pathname + window.location.search + window.location.hash !== targetUrl) {
      window.history.pushState(null, "", targetUrl);
      window.dispatchEvent(new CustomEvent("location-changed"));
    }
  }
}

export { SwipeManager };
