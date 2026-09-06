import { Logger } from "./logger";
import { LOG_TAG } from "./loggerUtils";


// Polling fallback (see `startNodePollingFallback`). On the Home Assistant
// 2026.9 shell some `childList` MutationObservers below no longer fire when the
// dashboard nodes are (re)added, so the added-callbacks that features rely on to
// (re)initialize would never run. We therefore also poll `getDomNode()` for a
// bounded window and fire the callbacks if the target node appears without the
// observer noticing.
const NODE_POLL_INTERVAL_MS = 100;
const NODE_POLL_MAX_ATTEMPTS = 50; // ~5 seconds


class PageObject {
  private selectorPaths: string[];
  private domNodes: (Element | ShadowRoot | null)[] = [];
  private observers: (MutationObserver | null)[] = [];
  private domNodeAddedCallbacks: ((domNode: (Element | ShadowRoot)) => void)[] = [];
  private domNodeRemovedCallbacks: (() => void)[] = [];

  // Last node for which the added-callbacks were delivered (by either the
  // observers or the polling fallback). Used to avoid delivering the same node
  // twice when both paths detect the same appearance.
  private lastNotifiedNode: Element | ShadowRoot | null = null;
  private nodePollTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private nodePollAttempts = 0;

  constructor(selectorsPaths: string[]) {
    this.selectorPaths = selectorsPaths;
    this.domNodes = new Array<null>(this.selectorPaths.length);
    this.observers = new Array<null>(this.selectorPaths.length);
  }


  public addDomNodeAddedCallback(callback: (domNode: Element | ShadowRoot) => void): void {
    Logger.logv(LOG_TAG, "Adding callback to PageObject: \"" + this.selectorPaths[this.selectorPaths.length - 1] + "\".");

    if (this.domNodeAddedCallbacks.length == 0 && this.domNodeRemovedCallbacks.length == 0) {
      this.createNodeObserversFrom(0);
    }

    // Push callbacks after creating the observers to avoid invoking the callback for the current
    // state of the DOM.
    this.domNodeAddedCallbacks.push(callback);

    // Observers alone are not reliable on newer HA shells (see the note on the
    // polling constants above), so back them up with a bounded poll.
    this.startNodePollingFallback();
  }

  /**
   * Bounded fallback for when the MutationObservers do not fire (observed on the
   * HA 2026.9 shell). Periodically re-resolves the target node and, if it
   * appears without having been reported by the observers, delivers the
   * added-callbacks. Mirrors the observers' contract of not invoking callbacks
   * for the node that is already present when the callback is registered.
   */
  private startNodePollingFallback(): void {
    // Extend the polling window whenever a new consumer registers.
    this.nodePollAttempts = 0;

    if (this.nodePollTimeoutId != null) {
      // A poll loop is already running; the reset above is enough.
      return;
    }

    // Baseline: treat the currently present node (if any) as already notified so
    // the poll only fires for nodes that appear from now on.
    this.lastNotifiedNode = this.getDomNode();
    this.scheduleNodePoll();
  }

  private scheduleNodePoll(): void {
    this.nodePollTimeoutId = setTimeout(() => {
      this.nodePollTimeoutId = null;
      this.nodePollAttempts++;

      const currentNode = this.getDomNode();
      if (currentNode != null && currentNode !== this.lastNotifiedNode) {
        Logger.logd(LOG_TAG, "DOM node detected via polling fallback: \"" + currentNode.nodeName.toLowerCase() + "\".");
        this.invokeDomNodeAddedCallbacks(currentNode);
      }

      if (this.nodePollAttempts < NODE_POLL_MAX_ATTEMPTS) {
        this.scheduleNodePoll();
      }
    }, NODE_POLL_INTERVAL_MS);
  }

  public toString(): string {
    return this.selectorPaths.join("→");
  }

  public getDomNode(): HTMLElement | null {
    const last = this.domNodes.length - 1;
    Logger.logv(LOG_TAG, "Getting DOM node " + this.toString() + ".");
    return this.getDomNodeAt(last) as HTMLElement; // TODO change
  }

  /**
   * Returns a copy of the selector paths.
   */
  public getSelectorPaths(): string[] {
    return this.selectorPaths.slice();
  }

  private getDomNodeAt(index: number): Element | ShadowRoot | null {
    const domNode = this.domNodes[index];

    if (domNode?.isConnected == true) {
      return domNode;
    }

    Logger.logv(LOG_TAG, "Recursively Getting DOM node " + index + " " + this.selectorPaths[index] + " in " + this.toString() + ".");
    const currentRootNode: Element | Document | ShadowRoot | null = (index == 0) ? document : this.getDomNodeAt(index - 1);

    if (this.selectorPaths[index] == "$") {
      this.domNodes[index] = currentRootNode instanceof HTMLElement && currentRootNode.shadowRoot ? currentRootNode.shadowRoot : null;
    } else {
      this.domNodes[index] = currentRootNode?.querySelector(this.selectorPaths[index]) ?? null;
    }

    return this.domNodes[index];
  }

  private createNodeObserversFrom(index: number): void {

    Logger.logv(LOG_TAG, "Creating observer for " + index + " " + this.selectorPaths[index] + " in " + this.toString() + ".");

    const currentRootNode = (index == 0) ? document : this.getDomNodeAt(index - 1);
    if (currentRootNode != null) {
      this.observers[index] = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const addedNode of mutation.addedNodes) {
            if (addedNode instanceof HTMLElement && (this.selectorPaths[index] == "$" || addedNode.matches(this.selectorPaths[index]))) {
              Logger.logd(LOG_TAG, "DOM node added: \"" + addedNode.nodeName.toLowerCase() + "\".");
              this.domNodes[index] = addedNode;

              if (index == this.selectorPaths.length - 1) {
                this.invokeDomNodeAddedCallbacks(addedNode);
              } else {
                this.createNodeObserversFrom(index + 1);
              }
            }
          }
          for (const removedNode of mutation.removedNodes) {
            if (removedNode instanceof HTMLElement && (this.selectorPaths[index] == "$" || removedNode.matches(this.selectorPaths[index]))) {
              Logger.logd(LOG_TAG, "DOM node removed: \"" + removedNode.nodeName.toLowerCase() + "\".");
              this.domNodes[index] = null;

              if (index < this.selectorPaths.length - 1) {
                this.destroyNodeObserversFrom(index + 1);
                this.invalidateDomNodesFrom(index + 1);
              }
              this.invokeDomNodeRemovedCallbacks();
            }
          }
        }
      });

      this.observers[index]?.observe(
        currentRootNode,
        {
          childList: true,
          // For performance reasons
          subtree: false
        }
      );

      if (index < this.observers.length - 1) {
        this.createNodeObserversFrom(index + 1);
      } else {
        // If we are recreating the last observer, we need to invoke the callbacks
        const currentNode = this.getDomNodeAt(index);
        if (currentNode != null) {
          this.invokeDomNodeAddedCallbacks(currentNode);
        }
      }
    }
  }

  private destroyNodeObserversFrom(index: number): void {
    if (this.observers[index] != null) {
      this.observers[index]?.disconnect();
      this.observers[index] = null;
    }

    if (index < this.observers.length - 1) {
      this.destroyNodeObserversFrom(index + 1);
    }
  }

  private invalidateDomNodesFrom(index: number): void {
    this.domNodes[index] = null;
    if (index < this.domNodes.length - 1) {
      this.invalidateDomNodesFrom(index + 1);
    }
  }

  private invokeDomNodeAddedCallbacks(domNode: Element | ShadowRoot): void {
    // Record the node so the polling fallback does not deliver it a second time.
    this.lastNotifiedNode = domNode;
    for (const callback of this.domNodeAddedCallbacks) {
      callback(domNode);
    }
  }

  private invokeDomNodeRemovedCallbacks(): void {
    for (const callback of this.domNodeRemovedCallbacks) {
      callback();
    }
  }

}

export { PageObject };
