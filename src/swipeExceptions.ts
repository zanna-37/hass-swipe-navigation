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
  // 💡 Please keep this list sorted alphabetically. Consider the selector as the key after removing
  // all symbols. Only consider letters and numbers.

  // Badges scroll behavior
  ".badges-scroll",
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
  // Tile slider
  "#slider",


  // THIRD PARTIES
  // 💡 Please keep this list sorted alphabetically. Consider the selector as the key after removing
  // all symbols. Only consider letters and numbers.

  // UI Card for Better Thermostat (https://github.com/KartoffelToby/better-thermostat-ui-card)
  "better-thermostat-ui-card",
  // Big Slider Card (https://github.com/nicufarmache/lovelace-big-slider-card)
  "big-slider-card",
  // floor3d-card aka Your Home Digital Twin (https://github.com/adizanni/floor3d-card)
  "floor3d-card",
  // Weather Forecast Extended Card (https://github.com/Thyraz/weather-forecast-extended)
  { selector: ".forecast.daily, .forecast.hourly, .header-pages",
    host: "weather-forecast-extended-card" },
  // Gallery Card (https://github.com/TarheelGrad1998/gallery-card)
  "gallery-card",
  // ApexCharts Card by RomRider (https://github.com/RomRider/apexcharts-card)
  "#graph-wrapper svg.apexcharts-svg",
  // History explorer card (https://github.com/alexarch21/history-explorer-card)
  "history-explorer-card",
  // Bubble Card horizontal buttons stack (https://github.com/Clooos/Bubble-Card)
  ".horizontal-buttons-stack-container",
  // Map Card (https://github.com/nathan-gs/ha-map-card)
  "map-card",
  // my-cards (https://github.com/AnthonMS/my-cards)
  "my-slider",
  "my-slider-v2",
  // @material/mwc-tab-bar (https://www.npmjs.com/package/@material/mwc-tab-bar)
  //   Used by: Tabbed Card (https://github.com/kinghat/tabbed-card)
  "mwc-tab-bar",
  // Plotly Graph Card (https://github.com/dbuezas/lovelace-plotly-graph-card)
  "#plotly g.draglayer",
  // Bubble Card (https://github.com/Clooos/Bubble-Card)
  ".range-slider",
  ".bubble-button-slider-container",
  ".bubble-pop-up",
  // Universal Remote Card (https://github.com/Nerwyn/universal-remote-card)
  "remote-touchpad",
  // round-slider (https://github.com/thomasloven/round-slider)
  "round-slider",
  // Sankey Chart Card (https://github.com/MindFreeze/ha-sankey-chart)
  "sankey-chart",
  // Slide confirm (https://github.com/itsbrianburton/slide-confirm)
  ".slide-confirm",
  // Simple Swipe Card (https://github.com/nutteloost/simple-swipe-card)
  "simple-swipe-card",
  // Slider button card (https://github.com/mattieha/slider-button-card)
  "slider-button-card",
  // Swipe Card (https://github.com/bramkragten/swipe-card)
  "swipe-card",
  // Swipe Navigation Card (https://github.com/Tjstock/swipe-navigation-card)
  "swipe-navigation-card",
  // Meteoalarm Card (https://github.com/MrBartusek/MeteoalarmCard)
  ".swiper",
  // Lunar Phase Card (https://github.com/ngocjohn/lunar-phase-card)
  "#swiper",
  // Todo Swipe Card (https://github.com/nutteloost/todo-swipe-card)
  "todo-swipe-card",
  // Android TV Card touchpad (https://github.com/Nerwyn/universal-remote-card)
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
  // Lovelace Vacuum Map card (https://github.com/PiotrMachowski/lovelace-xiaomi-vacuum-map-card)
  "xiaomi-vacuum-map-card",
  // CSS-Swipe-Card (https://github.com/Nemuritor01/css-swipe-card)
  "css-swipe-card",
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
