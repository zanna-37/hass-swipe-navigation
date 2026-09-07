# CLAUDE.md

## Adding Swipe Exceptions

When adding a new swipe exception to the project:

### 0. Choose the right selector and modifiers

Before writing any code, decide *what* to match and *which* modifiers (if any) to apply. Getting this wrong silently kills valid swipes.

#### Find the gesture surface from the card's source

- Read the card's source on GitHub (use the URL from the issue or ask the user for it). Use `WebFetch` to fetch the main render file (typically `src/*.ts` or `dist/*.js`).
- Find the element that owns the gesture: the slider thumb, scrollable strip, swiper container, touchpad, drag handle, click-wheel, popup overlay, etc. — **not** the root card element.
- Note its custom element name, `id`, or stable CSS class — whichever is most specific.
- If the source is unclear or minified beyond reading, ask the user for the selector rather than guessing.

#### Never add the whole custom element

Do not add the card's root tag (e.g. `weather-forecast-extended-card`, `entities-card`) unless the card's **entire** rendered surface is a swipeable canvas. The only precedents are cards that are themselves swipers/galleries. A whole-card exception silently kills valid swipes on the card's header, padding, buttons, and chrome.

#### Pick the narrowest unique selector

In order of preference:
1. The custom element name of the **sub-component** (e.g. `remote-touchpad`, `round-slider`, `mwc-tab-bar`).
2. An `id` (`#swiper`, `#slider`, `#graph-wrapper svg.chart-svg`).
3. A stable class (`.circlepad`, `.badges-scroll`, `.bubble-pop-up`).

Avoid generic class names (`.slider`, `.scroll`, `.forecast`, `.header`) — they leak into unrelated cards. If the only available selector is generic, add the `host` modifier (see below).

#### Decide the modifiers

A bare string blocks unconditionally. Add `host` when the selector is generic and `scrollDependent: true` when the element only sometimes overflows. See [Swipe Exception Types](#swipe-exception-types) for what each modifier does and examples.

#### Check for duplicates

Before adding, scan the existing lists. If the new card already matches an entry (e.g. uses `#slider`, `.ha-scrollbar`), don't add a redundant entry — mention it in the PR/commit instead.

#### Test built-in HA elements and project code, not third-party cards

Third-party cards are **not tested**: their exception is verified manually by the reporter, so do not write a Playwright test or add a mock dashboard for them.

Built-in HA elements and the project's own logic (modifiers, the exception check flow, tab skipping, animations) **are** tested. When the exception targets a built-in HA element, add a test under `tests/dashboards/individual-dashboards/` with a matching dashboard in `.hass/config/dashboards/`. The test must assert the gesture is blocked on the target element **and allowed on the surrounding chrome** (this is what catches over-broad selectors). See `one-slider.test.ts` and `scroll-dependent.test.ts` for the pattern.

#### Comment the *why* when the selector is non-obvious

Existing entries comment the card name + GitHub URL. When the selector is a narrow sub-element of a bigger card, also note why it was chosen, so future maintainers don't widen it by mistake. Example:
```typescript
"toucharea",   // dpad touchpad
".circlepad",  // click-wheel only
```

### 1. Code Change
- Add exception to `src/swipeExceptions.ts`
- Include a comment with the card name and GitHub URL
- Format: `// Card Name (GitHub URL)`
- Example:
  ```typescript
  // Todo Swipe Card (https://github.com/nutteloost/todo-swipe-card)
  "todo-swipe-card",
  ```

### 2. Commit Message
- Format: `fix(swipe-exception): add '<Card Name>' to the swipe exception list`
- Examples from history:
  - `fix(swipe-exception): add 'badges-scroll' class to the swipe exception list`
  - `fix(swipe-exception): add 'Simple Swipe Card' to the swipe exception list`
  - `fix(swipe-exception): add 'Lunar Phase Card' to the swipe exception list`

Do no commit automatically, suggest the commit message.

## Swipe Exception Types

`src/swipeExceptions.ts` exports a single unified `exceptions` list. Each entry is either a bare selector string or an object `{ selector, host?, scrollDependent? }`. The behavior depends on which modifiers are set:

- **Bare string / no modifiers** — any element matching the selector blocks the swipe unconditionally. Use when the selector is unique to the card.
- **`host`** — requires the matched element's shadow-root host to also match this selector. Use when the selector is a generic class name that could plausibly appear in another card, and set `host` to the card's custom element. Example: `{ selector: ".forecast.daily", host: "weather-forecast-extended-card" }`.
- **`scrollDependent: true`** — blocks only when the element actually overflows on the axis being swiped (`scrollWidth > clientWidth` for horizontal, `scrollHeight > clientHeight` for vertical), so a vertically scrollable list won't block horizontal navigation. Use when the selector matches elements that sometimes scroll and sometimes don't (HA reuses `.ha-scrollbar` on non-scrolling wrappers). Example: `{ selector: ".ha-scrollbar", scrollDependent: true }`.
- **`host` + `scrollDependent: true`** — combines both: the host gate plus the per-axis overflow check. Use when a generically-named scrollable inside a specific card should only block on actual overflow.

Internally the list is compiled once at module load into three pre-joined CSS selector strings (`plainSelectors`, `scrollDependentSelectors`, `allScopedSelectors`) plus a `scopedExceptions` array with the per-entry data. A fourth derived constant, `anyExceptionSelector`, unions all three for a fast early-out per element.

## Exception Check Flow (`src/swipeManager.ts`)

The `composedPath()` is walked from inner to outer (stops at `hui-view`). For each element:

- **Early-out** — `element.matches(anyExceptionSelector)`. If false, skip the per-bucket checks for this element. This is the common case and keeps per-element cost constant as the list grows.
- **Plain** — `element.matches(plainSelectors)` → block unconditionally, return.
- **Scroll-dependent (unscoped)** — `element.matches(scrollDependentSelectors)` → per-axis overflow check, set the appropriate blocked-log. Skipped entirely once both axes are already blocked.
- **Scoped** — `element.matches(allScopedSelectors)` early-out, then walk `scopedExceptions` to find which entry matched (inner selector + shadow host). On a match, behavior depends on the entry's `scrollDependent` flag: unconditional block or per-axis overflow check.

## Testing

- Tests use Playwright against a real HA instance running in Docker.
- HA is reachable from this environment at `http://host.docker.internal:8123` (login: `user`/`pass`).
- The built JS must be served on port 3000 (`python3 -m http.server 3000 --directory dist`). The global setup verifies it's loaded.
- Dashboard YAML files live in `.hass/config/dashboards/` and must be registered in `.hass/config/dashboards.yaml`. HA must be restarted to pick up new dashboard registrations (use the HA REST API: auth flow → token → `POST /api/services/homeassistant/restart`).
- Run tests with: `HOMEASSISTANT_URL=http://host.docker.internal:8123 npx playwright test <pattern> --project=chromium --project="Mobile Chrome"`
- Chromium system deps must be installed first: `npx playwright install chromium && npx playwright install-deps chromium`
