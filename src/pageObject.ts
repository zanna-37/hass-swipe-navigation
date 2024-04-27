import { Logger } from "./logger";
import { LOG_TAG } from "./loggerUtils";


class PageObject {
  #domNode: HTMLElement | null = null;
  #parent: PageObject | HTMLElement | Document;
  #selectors: string[];
  #isSelectorsRootedInShadow: boolean;
  #keepAlive = false;
  #onDomNodeRefreshedCallback: (() => void) | null = null;
  #onDomNodeRemovedCallback: (() => void) | null = null;

  #keepAliveChildren = new Map<PageObject, MutationObserver>();

  constructor(parent: PageObject | HTMLElement | Document, selectors: string[], isSelectorsRootedInShadow: boolean) {
    this.#parent = parent;
    this.#selectors = selectors;
    this.#isSelectorsRootedInShadow = isSelectorsRootedInShadow;
  }

  invalidateDomNode() {
    this.#disconnectAllChildrenObservers();
    if (this.#onDomNodeRemovedCallback != null) {
      this.#onDomNodeRemovedCallback();
    }
    this.#domNode = null;
  }

  watchChanges(callbacks: { onDomNodeRefreshedCallback: (() => void), onDomNodeRemovedCallback: (() => void) | null }) {
    this.#setKeepAlive();
    this.#onDomNodeRefreshedCallback = callbacks.onDomNodeRefreshedCallback;
    this.#onDomNodeRemovedCallback = callbacks.onDomNodeRemovedCallback;
  }

  #setKeepAlive() {
    if (!this.#keepAlive) {
      this.#keepAlive = true;
      this.#ensureKeepAliveWhenNeeded();
    }
  }

  #ensureKeepAliveWhenNeeded() {
    if (this.#keepAlive && this.#parent != null && this.#parent instanceof PageObject) {
      this.#parent.#addPageObjectToKeepAlive(this);
    }
  }

  #addPageObjectToKeepAlive(pageObject: PageObject) {
    if (!(this.#keepAliveChildren.has(pageObject))) {
      this.#keepAliveChildren.set(
        pageObject,
        new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
              Logger.logv(LOG_TAG,
                mutation.addedNodes.length + " new element(s) appeared under \""
                + (this.#domNode?.nodeName?.toLowerCase() ?? "unknown") + "\". Checking..."
              );
              pageObject.getDomNode();
            }
          }
        })
      );

      // Keep alive self since it must be alive to revive its children
      this.#setKeepAlive();

      // Connect child if possible, otherwise it should be reconnected when refreshed.
      this.#connectChildObserver(pageObject);
    }
  }

  getDomNode() {
    // Refresh if object is not in cache
    if (this.#domNode == null) {
      this.#refreshDomNode();
    } else {
      // Stale detection
      if (this.#isStale()) {
        Logger.logd(LOG_TAG, "Stale object in cache: \"" + this.#domNode.nodeName.toLowerCase() + "\". Invalidating...");
        this.invalidateDomNode();
        this.getDomNode();
      }
    }

    return this.#domNode;
  }

  getParentNode() {
    let parentNode: HTMLElement | Document | ShadowRoot | null =
      (this.#parent instanceof PageObject) ?
        this.#parent.getDomNode()
        : this.#parent;

    if (parentNode != null && this.#isSelectorsRootedInShadow) {
      if ("shadowRoot" in parentNode) {
        parentNode = parentNode.shadowRoot;
      } else {
        Logger.loge(LOG_TAG, parentNode.nodeName + " is expected to have a shadowRoot, but it is missing.");
        parentNode = null;
      }
    }

    return parentNode;
  }

  #isStale() {
    return !(this.#domNode?.isConnected ?? false);
  }

  #refreshDomNode() {
    const parentNode = this.getParentNode();

    this.#domNode = (parentNode == null) ?
      null
      : (() => {
        for (const selector of this.#selectors) {
          const node = parentNode.querySelector(selector);
          if (node != null && node instanceof HTMLElement) {
            return node;
          }
        }
        return null;
      })();

    if (this.#domNode != null) {
      Logger.logd(LOG_TAG, "Object refreshed: \"" + (this.#domNode?.nodeName?.toLowerCase() ?? "unknown") + "\".");

      this.#ensureKeepAliveWhenNeeded();
      this.#connectAllChildrenObservers();

      if (this.#onDomNodeRefreshedCallback != null) {
        this.#onDomNodeRefreshedCallback();
      }
    }
  }

  #connectAllChildrenObservers() {
    if (this.#domNode != null && this.#keepAliveChildren.size > 0) {
      Logger.logv(LOG_TAG, "Reconnecting " + this.#keepAliveChildren.size + " observers to " + (this.#domNode?.nodeName?.toLowerCase() ?? "unknown"));

      this.#keepAliveChildren.forEach((value, key) => {
        this.#connectChildObserver(key);
      });
    }
  }

  #connectChildObserver(pageObject: PageObject) {
    if (this.#domNode != null) {
      const observer = this.#keepAliveChildren.get(pageObject);

      // Note: pageObject is a child of this object, so parentNode is this object (with or without
      // the shadowRoot depending on where the child is placed)
      const parentNode = pageObject.getParentNode();

      if (observer == null) {
        Logger.loge(LOG_TAG, "Illegal state: observer is not defined when connecting a child observer.");
      } else if (parentNode == null) {
        Logger.loge(LOG_TAG, "Illegal state: parent is not defined when connecting a child observer.");
      } else {
        observer.observe(parentNode, { childList: true });
      }

      pageObject.getDomNode();
    }
  }

  #disconnectAllChildrenObservers() {
    if (this.#keepAliveChildren.size > 0) {
      Logger.logv(LOG_TAG,
        "Disconnecting " + this.#keepAliveChildren.size + " observers from \""
        + (this.#domNode?.nodeName?.toLowerCase() ?? "unknown") + "\""
      );

      this.#keepAliveChildren.forEach((value) => {
        value.disconnect();
      });
    }
  }
}

export { PageObject };
