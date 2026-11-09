/**
 * Ignore swipes when initiated on elements that match one of these entries.
 *
 * Each entry can be:
 * - A bare CSS selector string. Matches block swipes unconditionally.
 * - An object with `selector` plus optional modifiers:
 *   - `host`: require the matched element's shadow-root host to also match
 *     this selector. Use this to keep generic class names (e.g. `.forecast`)
 *     from leaking into unrelated cards.
 *   - `scrollDependent: true`: only block the swipe on the axes on which the
 *     matched element actually overflows. An element that overflows
 *     horizontally blocks horizontal swipes; one that overflows vertically
 *     blocks vertical swipes.
 *
 * `host` and `scrollDependent` are independent and can be combined: use both
 * when a generically-named scrollable inside a specific card should only block
 * on actual overflow.
 *
 * Learn more on CSS selectors
 * [here](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors).
 */
interface Exception {
  selector: string;
  host?: string;
  scrollDependent?: boolean;
}

type ExceptionEntry = string | Exception;

const exceptions: ExceptionEntry[] = [

  // INTERNALS
  // 💡 Name each group after its UI element (e.g. "Map", "Tile slider") and keep the list sorted
  // alphabetically by that name. Keep all the selectors of one element under one comment.

  // Badges scroll behavior
  { selector: ".badges",
    host: "hui-heading-card",
    scrollDependent: true },
  { selector: ".badges.scroll",
    host: "hui-view-header",
    scrollDependent: true },
  // Dashboard tabs
  "ha-tabs", // removed in HA v2025.5
  "paper-tabs", // removed in HA v2025.5
  "sl-tab-group", // removed in HA v2025.10
  "ha-tab-group",
  // Draggable elements when in editing mode
  "hui-badge-edit-mode",
  "hui-card-edit-mode",
  ".section-actions .handle",
  // Map
  "hui-map-card",
  // Scrollbar (used on many elements that may or may not actually overflow)
  { selector: ".ha-scrollbar", scrollDependent: true },
  // Sidebar (contains dashboards)
  "ha-sidebar",
  // Slider
  "ha-slider",
  "input[type=range]", // Sliders no longer use this after HA v2025.10
  // Tile scrubber
  "ha-control-scrubber",
  // Tile slider
  "#slider",
  // Weather forecast card (forecast strip, scrolls horizontally only when its slots don't fit)
  { selector: ".forecast",
    host: "hui-weather-forecast-card",
    scrollDependent: true },


  // THIRD PARTIES
  // 💡 Please keep this list sorted alphabetically by the card's custom element name, after
  // removing all symbols. Keep all the selectors of one card together, under one comment.

  // Advanced Camera Card (https://github.com/dermotduffy/advanced-camera-card)
  //   The timeline pans on horizontal drag. One camera or many, the media sits in the same Embla
  //   carousel, so the container is excluded only while its slides actually overflow. The class is
  //   Embla's default, hence the host gate. Don't widen this to the whole card: its menu and status
  //   chrome are not gesture surfaces and must keep navigating.
  "advanced-camera-card-timeline-core",
  { selector: ".embla__container",
    host: "advanced-camera-card-carousel",
    scrollDependent: true },
  // ApexCharts Card by RomRider (https://github.com/RomRider/apexcharts-card)
  "#graph-wrapper svg.apexcharts-svg",
  // UI Card for Better Thermostat (https://github.com/KartoffelToby/better-thermostat-ui-card)
  "better-thermostat-ui-card",
  // Big Slider Card (https://github.com/nicufarmache/lovelace-big-slider-card)
  "big-slider-card",
  // Bubble Card (https://github.com/Clooos/Bubble-Card)
  ".range-slider",
  ".bubble-button-slider-container",
  ".bubble-pop-up",
  //   Horizontal buttons stack
  ".horizontal-buttons-stack-container",
  // CSS-Swipe-Card (https://github.com/Nemuritor01/css-swipe-card)
  "css-swipe-card",
  // floor3d-card aka Your Home Digital Twin (https://github.com/adizanni/floor3d-card)
  "floor3d-card",
  // Gallery Card (https://github.com/TarheelGrad1998/gallery-card)
  "gallery-card",
  // History explorer card (https://github.com/alexarch21/history-explorer-card)
  "history-explorer-card",
  // Lunar Phase Card (https://github.com/ngocjohn/lunar-phase-card)
  "#swiper",
  // Map Card (https://github.com/nathan-gs/ha-map-card)
  "map-card",
  // Meteoalarm Card (https://github.com/MrBartusek/MeteoalarmCard)
  ".swiper",
  // @material/mwc-tab-bar (https://www.npmjs.com/package/@material/mwc-tab-bar)
  //   Used by: Tabbed Card (https://github.com/kinghat/tabbed-card)
  "mwc-tab-bar",
  // my-cards (https://github.com/AnthonMS/my-cards)
  "my-slider",
  "my-slider-v2",
  // Navbar Card (https://github.com/joseluis9595/lovelace-navbar-card)
  "navbar-card",
  // Paper Buttons Row (https://github.com/jcwillox/lovelace-paper-buttons-row)
  //   The card ships no scrolling of its own: .flex-box becomes scrollable only through
  //   custom CSS, from the card's `styles` option or card-mod. The host can't be the
  //   target: with no `:host` rule it stays `display: inline` and measures zero.
  { selector: ".flex-box",
    host: "paper-buttons-row",
    scrollDependent: true },
  // Plotly Graph Card (https://github.com/dbuezas/lovelace-plotly-graph-card)
  "#plotly g.draglayer",
  "#plotly .gl-container", // 3D plots: the WebGL scene canvas lives here, outside the SVG drag layer
  // round-slider (https://github.com/thomasloven/round-slider)
  "round-slider",
  // Sankey Chart Card (https://github.com/MindFreeze/ha-sankey-chart)
  "sankey-chart",
  // Simple Swipe Card (https://github.com/nutteloost/simple-swipe-card)
  "simple-swipe-card",
  // Slide confirm (https://github.com/itsbrianburton/slide-confirm)
  ".slide-confirm",
  // Slider button card (https://github.com/mattieha/slider-button-card)
  "slider-button-card",
  // Slide Toggle Card (https://github.com/ChadH360/slide-toggle-card)
  //   The whole slider track, not only the knob: it is the visible slide affordance and the
  //   card sets `touch-action: none` on it. The id is generic, hence the host gate.
  { selector: "#track",
    host: "slide-toggle-card" },
  // Statistics Graph Chart Card (https://github.com/cataseven/Statistics-Graph-Chart-Card)
  { selector: ".sgc-plot-wrap",
    host: "statistics-graph-chart-card" },
  // Swipe Card (https://github.com/bramkragten/swipe-card)
  "swipe-card",
  // Swipe Navigation Card (https://github.com/Tjstock/swipe-navigation-card)
  "swipe-navigation-card",
  // Todo Swipe Card (https://github.com/nutteloost/todo-swipe-card)
  "todo-swipe-card",
  // Universal Remote Card (https://github.com/Nerwyn/universal-remote-card)
  "remote-touchpad",
  //   Android TV Card touchpad
  "toucharea",
  ".circlepad",
  // Vehicle Status Card (https://github.com/ngocjohn/vehicle-info-card)
  "vehicle-info-card",
  // Vehicle Status Card (https://github.com/ngocjohn/vehicle-status-card)
  "vehicle-status-card",
  // Weather Forecast Card (https://github.com/troinine/ha-weather-forecast-card)
  { selector: ".wfc-scroll-container",
    host: "weather-forecast-card",
    scrollDependent: true },
  // Weather Forecast Extended Card (https://github.com/Thyraz/weather-forecast-extended)
  { selector: ".forecast.daily, .forecast.hourly, .header-pages",
    host: "weather-forecast-extended-card" },
  // Lovelace Vacuum Map card (https://github.com/PiotrMachowski/lovelace-xiaomi-vacuum-map-card)
  "xiaomi-vacuum-map-card",
];

/**
 * Pre-compiled buckets, computed once at module load. Per-element matching in
 * `swipeManager` uses these so the cost stays constant as the exceptions list
 * grows.
 */
interface CompiledScopedException {
  selector: string;
  host: string;
  scrollDependent: boolean;
}

const _plain: string[] = [];
const _scrollDependent: string[] = [];
const _scoped: string[] = [];
const _scopedCompiled: CompiledScopedException[] = [];

for (const entry of exceptions) {
  if (typeof entry === "string") {
    _plain.push(entry);
  } else if (entry.host != null && entry.host.trim() !== "") {
    _scoped.push(entry.selector);
    _scopedCompiled.push({
      selector: entry.selector,
      host: entry.host,
      scrollDependent: entry.scrollDependent === true,
    });
  } else if (entry.scrollDependent === true) {
    _scrollDependent.push(entry.selector);
  } else {
    _plain.push(entry.selector);
  }
}

const plainSelectors = _plain.join(",");
const scrollDependentSelectors = _scrollDependent.join(",");
const allScopedSelectors = _scoped.join(",");
const scopedExceptions: ReadonlyArray<CompiledScopedException> = _scopedCompiled;

/**
 * Union of all three bucket selectors. Used as a fast early-out per element:
 * if the element doesn't match this combined selector, no further per-bucket
 * matching is needed.
 */
const anyExceptionSelector = [plainSelectors, scrollDependentSelectors, allScopedSelectors]
  .filter(s => s.length > 0)
  .join(",");

export {
  plainSelectors,
  scrollDependentSelectors,
  allScopedSelectors,
  scopedExceptions,
  anyExceptionSelector,
};
