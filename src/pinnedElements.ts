/**
 * Elements that must stay in place while the `slide` animation runs.
 *
 * These are typically cards that draw a `position: fixed` bar (e.g. a bottom
 * navigation bar). A transform on any of their ancestors would become the
 * containing block of the bar and drag it along with the view, so the `slide`
 * animation never transforms their ancestors and moves everything around them
 * instead.
 *
 * Each entry is a CSS selector matched against the elements of the view.
 */
const pinnedElements: readonly string[] = [
  // https://github.com/joseluis9595/lovelace-navbar-card
  "navbar-card",
];

const pinnedSelector = pinnedElements.join(", ");

export { pinnedSelector };
