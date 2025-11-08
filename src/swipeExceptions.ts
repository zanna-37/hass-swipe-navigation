/**
 * Ignore swipes when initiated on elements that match at least one of these CSS selectors.
 *
 * Learn more on CSS selectors
 * [here](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Selectors).
 */
const exceptions = [

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
  // Scrollbar
  ".ha-scrollbar",
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
  // Lovelace Vacuum Map card (https://github.com/PiotrMachowski/lovelace-xiaomi-vacuum-map-card)
  "xiaomi-vacuum-map-card",
].join(",");

export { exceptions };
