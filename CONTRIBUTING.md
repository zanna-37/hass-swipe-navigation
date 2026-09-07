# Contributing

Thank you for taking the time to contribute. If anything in this guide is unclear, please open an issue.

Pick one of the two setups below, then jump to [Use the test instance](#use-the-test-instance) or [Run the tests](#run-the-tests).

-----

## Setup with Docker (recommended)

From the repository root run:
```bash
docker compose up
```

This starts two containers:
- `builder` rebuilds `swipe-navigation.js` on every source change and serves it at `http://localhost:3000/swipe-navigation.js`.
- `hass` is a test instance of Home Assistant on `http://localhost:8123`, already configured to load the served file.

-----

## Native setup

Requires Node.js (the Docker image uses version 24). Docker is still needed for the Home Assistant test instance.

Build and serve the file (installs dependencies, lints, then rebuilds on every source change):
```bash
./scripts/build.sh --serve
```

In a second terminal, start the Home Assistant test instance:
```bash
docker compose up hass
```

-----

## Use the test instance

Open `http://localhost:8123` and log in with username `user` and password `pass`.
The instance already loads `swipe-navigation.js` from port `3000` and ships with a few test dashboards.

Tips:
- Enable your browser's mobile/touch emulation to simulate touch events, unless you have a touch screen.
- Disable the browser cache (DevTools → Network → _Disable cache_) so you always get the latest build.

-----

## Use your own Home Assistant instead

You can point a real Home Assistant installation at the locally served file.
Open Home Assistant in a browser on the same machine that runs the build, because the resource URL points to `localhost`.

1. Remove the plugin installed via HACS (or however you installed it), so the two copies don't conflict.
2. Add a resource: _Settings_ → _Dashboards_ → _More options_ (⋮) → _Resources_ → _Add resource_, with URL `http://localhost:3000/swipe-navigation.js` and type _JavaScript module_.
3. Disable the browser cache as described above.
4. Remove the resource when you are done.

-----

## Run the tests

The tests are Playwright end-to-end tests that run against the Home Assistant test instance.

### With Docker
```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml up --exit-code-from tester
```
The command starts the containers it needs, runs the tests, then stops **every** container of the project.

> ⚠️ **This interrupts a running `docker compose up`.** The dev `hass` container is killed right away and recreated with the test configuration; `builder` keeps running during the tests but is stopped when they finish. Run `docker compose up` again afterwards to resume developing.

### Native
With `./scripts/build.sh --serve` and `docker compose up hass` running, run:
```bash
./scripts/run-playwright.sh
```
The script installs the Playwright browsers on first run and waits for both services to be reachable.

-----

## Troubleshooting

- The served file doesn't update: delete the `dist/` folder and restart the build.
