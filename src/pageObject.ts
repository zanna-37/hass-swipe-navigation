import { Logger } from "./logger";
import { LOG_TAG } from "./loggerUtils";


class PageObject {
  private selectorPaths: string[];
  private domNodes: (Element | ShadowRoot | null)[] = [];
  private observers: (MutationObserver | null)[] = [];
  private domNodeAddedCallbacks: ((domNode: (Element | ShadowRoot)) => void)[] = [];
  private domNodeRemovedCallbacks: (() => void)[] = [];

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

    this.selectorPaths[index] == "$"
      ? this.domNodes[index] = currentRootNode instanceof HTMLElement && currentRootNode.shadowRoot ? currentRootNode.shadowRoot : null
      : this.domNodes[index] = currentRootNode?.querySelector(this.selectorPaths[index]) ?? null;

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
        currentRootNode, {
          childList: true,
          // For performance reasons
          subtree: false
        });

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
