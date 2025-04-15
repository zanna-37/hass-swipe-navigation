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

  // Dashboard tabs
  "ha-tabs",
  "paper-tabs",
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
  "ha-slider", // Deprecated since HA v2023.11
  "input[type=range]",
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
  ".bubble-button-card",
  ".bubble-pop-up",
  // round-slider (https://github.com/thomasloven/round-slider)
  "round-slider",
  // Sankey Chart Card (https://github.com/MindFreeze/ha-sankey-chart)
  "sankey-chart",
  // Slide confirm (https://github.com/itsbrianburton/slide-confirm)
  ".slide-confirm",
  // Slider button card (https://github.com/mattieha/slider-button-card)
  "slider-button-card",
  // Swipe Card (https://github.com/bramkragten/swipe-card)
  "swipe-card",
  // Meteoalarm Card (https://github.com/MrBartusek/MeteoalarmCard)
  ".swiper",
  // Android TV Card touchpad (https://github.com/Nerwyn/android-tv-card)
  "toucharea",
  // Vehicle Status Card (https://github.com/ngocjohn/vehicle-info-card)
  "vehicle-info-card",
  // Vehicle Status Card (https://github.com/ngocjohn/vehicle-status-card)
  "vehicle-status-card",
  // Lovelace Vacuum Map card (https://github.com/PiotrMachowski/lovelace-xiaomi-vacuum-map-card)
  "xiaomi-vacuum-map-card",

  // DEPRECATED
  // will be removed after December 2023s

  // 🍄 Mushroom (https://github.com/piitaya/lovelace-mushroom)
  "mushroom-slider", // it uses the same id as built-in slider
  // Slider bar (used by the Tile card)
  "ha-bar-slider", // it uses the same id as built-in slider
].join(",");

export { exceptions };
