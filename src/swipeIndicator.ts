
import { ConfigManager } from "./configManager";

class SwipeIndicator {
  private static INDICATOR_ID = "hsn-slide-indicator";

  // Typed timer IDs
  private static fadeTid: ReturnType<typeof setTimeout> | null = null;
  private static DurationTid: ReturnType<typeof setTimeout> | null = null;
  private static freezeResyncTid: ReturnType<typeof setTimeout> | null = null;

  private static freezeUntilTs = 0;
  private static currentIndex: number | null = null;
  private static activeColor: string | null = null;
  private static inactiveColor: string | null = null;

  // Enabled toggle (new name only): getIndicator()
  private static isEnabled(): boolean {
    const cfg = ConfigManager.getCurrentConfig() as { getIndicator?: () => boolean };
    return cfg.getIndicator ? Boolean(cfg.getIndicator()) : true;
  }

  private static readThemeColors(): void {
    const rootStyle = getComputedStyle(document.documentElement);
    const primary = rootStyle.getPropertyValue("--border-neutral-quiet").trim();
    const secondary = rootStyle.getPropertyValue("--color-text-disabled").trim();
    SwipeIndicator.activeColor = primary.length > 0 ? primary : "rgba(255,255,255,1)";
    SwipeIndicator.inactiveColor = secondary.length > 0 ? secondary : "rgba(255,255,255,0.5)";
  }

  // Public so resize handler can call it without hacks
  static dotSizePx(): number {
    const w = window.innerWidth || screen.width || 0;
    if (w >= 1600) return 12;
    if (w >= 1024) return 10;
    return 8;
  }

  private static ensureIndicator(total: number): HTMLDivElement | null {
    if (!SwipeIndicator.isEnabled()) return null;
    if (!Number.isFinite(total) || total <= 0) return null;

    if (SwipeIndicator.activeColor == null || SwipeIndicator.inactiveColor == null) {
      SwipeIndicator.readThemeColors();
    }

    let el = document.getElementById(SwipeIndicator.INDICATOR_ID) as HTMLDivElement | null;
    if (!el) {
      el = document.createElement("div");
      el.id = SwipeIndicator.INDICATOR_ID;
      el.style.position = "fixed";
      el.style.left = "50%";
      el.style.bottom = "12px";
      el.style.transform = "translateX(-50%)";
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.gap = "8px";
      el.style.padding = "6px 10px";
      el.style.borderRadius = "9999px";
      el.style.background = "rgba(0,0,0,0.30)";
      el.style.backdropFilter = "blur(2px)";
      el.style.zIndex = "2147483647";
      el.style.pointerEvents = "none";
      (document.body || document.documentElement).appendChild(el);
    }

    // Normalize dot count
    const children = Array.from(el.children);
    const diff = total - children.length;
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        const dot = document.createElement("span");
        dot.className = "hsn-dot";
        const size = `${SwipeIndicator.dotSizePx()}px`;
        dot.style.width = size;
        dot.style.height = size;
        dot.style.borderRadius = "50%";
        dot.style.background = SwipeIndicator.inactiveColor!;
        dot.style.display = "inline-block";
        el.appendChild(dot);
      }
    } else if (diff < 0) {
      for (let i = 0; i < Math.abs(diff); i++) el.lastElementChild?.remove();
    }

    // Normalize sizing (orientation / resize)
    const sizeNow = `${SwipeIndicator.dotSizePx()}px`;
    (Array.from(el.children) as HTMLSpanElement[]).forEach((dot) => {
      if (dot.style.width !== sizeNow) {
        dot.style.width = sizeNow;
        dot.style.height = sizeNow;
      }
    });

    // Cancel fade if re-showing
    if (SwipeIndicator.fadeTid) {
      clearTimeout(SwipeIndicator.fadeTid);
      SwipeIndicator.fadeTid = null;
    }
    el.style.opacity = "1";
    el.style.transition = "opacity 150ms ease";
    return el;
  }

  private static highlight(activeIndex: number): void {
    if (!SwipeIndicator.isEnabled()) return;
    if (Date.now() < SwipeIndicator.freezeUntilTs) return;

    const views = ConfigManager.getViews();
    if (!views) return;
    if (SwipeIndicator.currentIndex === activeIndex) return;

    const el = SwipeIndicator.ensureIndicator(views.length);
    if (!el) return;

    const dots = Array.from(el.children) as HTMLSpanElement[];
    dots.forEach((dot, idx) => {
      if (idx === activeIndex) {
        dot.style.background = SwipeIndicator.activeColor!;
        dot.style.boxShadow = `0 0 4px ${SwipeIndicator.activeColor}`;
        dot.style.transform = "scale(1.15)";
      } else {
        dot.style.background = SwipeIndicator.inactiveColor!;
        dot.style.boxShadow = "none";
        dot.style.transform = "scale(1)";
      }
    });
    SwipeIndicator.currentIndex = activeIndex;
  }

  private static update(): void {
    if (!SwipeIndicator.isEnabled()) return;
    if (Date.now() < SwipeIndicator.freezeUntilTs) return;
    const idx = ConfigManager.getCurrentViewIndex();
    if (idx == null) return;
    SwipeIndicator.highlight(idx);
  }

  private static removeNow(): void {
    const el = document.getElementById(SwipeIndicator.INDICATOR_ID) as HTMLDivElement | null;
    if (el) {
      el.style.transition = "opacity 150ms ease";
      el.style.opacity = "0";
      SwipeIndicator.fadeTid = setTimeout(() => {
        if (el && el.parentNode) el.parentNode.removeChild(el);
        SwipeIndicator.fadeTid = null;
        SwipeIndicator.currentIndex = null;
      }, 160);
    }
  }

  private static removeAfter(ms: number): void {
    const el = document.getElementById(SwipeIndicator.INDICATOR_ID) as HTMLDivElement | null;
    if (!el) return;
    if (SwipeIndicator.DurationTid) {
      clearTimeout(SwipeIndicator.DurationTid);
      SwipeIndicator.DurationTid = null;
    }
    SwipeIndicator.DurationTid = setTimeout(() => {
      SwipeIndicator.DurationTid = null;
      SwipeIndicator.removeNow();
    }, Math.max(0, ms));
  }

  private static freezeAndResync(ms: number): void {
    const delay = Math.max(0, ms);
    SwipeIndicator.freezeUntilTs = Date.now() + delay;
    if (SwipeIndicator.freezeResyncTid) {
      clearTimeout(SwipeIndicator.freezeResyncTid);
      SwipeIndicator.freezeResyncTid = null;
    }
    SwipeIndicator.freezeResyncTid = setTimeout(() => {
      SwipeIndicator.freezeResyncTid = null;
      SwipeIndicator.freezeUntilTs = 0;
      SwipeIndicator.update();
    }, delay);
  }

  static onPointerStart(): void {
    if (SwipeIndicator.DurationTid) {
      clearTimeout(SwipeIndicator.DurationTid);
      SwipeIndicator.DurationTid = null;
    }
    SwipeIndicator.update();
  }

  static onPointerMove(): void {
    SwipeIndicator.update();
  }

  static onPointerEnd(): void {
    const cfg = ConfigManager.getCurrentConfig() as {
      getAnimateDuration: () => number;
      getIndicatorResyncBuffer?: () => number;
      getIndicatorDuration?: () => number;
    };
    const animationDuration = cfg.getAnimateDuration();
    const buffer = cfg.getIndicatorResyncBuffer ? cfg.getIndicatorResyncBuffer() : 50;
    const indicatorDuration = cfg.getIndicatorDuration ? cfg.getIndicatorDuration() : 1500;

    SwipeIndicator.freezeAndResync(animationDuration + buffer);
    SwipeIndicator.removeAfter(indicatorDuration);
  }
}

// Normalize sizes on resize automatically
window.addEventListener("resize", () => {
  const el = document.getElementById("hsn-slide-indicator") as HTMLDivElement | null;
  if (!el) return;
  const sizeNow = `${SwipeIndicator.dotSizePx()}px`;
  (Array.from(el.children) as HTMLSpanElement[]).forEach((dot) => {
    if (dot.style.width !== sizeNow) {
      dot.style.width = sizeNow;
      dot.style.height = sizeNow;
    }
  });
});

export { SwipeIndicator };
