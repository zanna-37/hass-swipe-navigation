# Contributing
⚠️ **This file is a draft. Please open an issue if you find difficult to follow the instruction or if you have ideas to improve it.**

First of all, thank you for taking the time to contribute to this project. It is very much appreciated.
This document helps you get started to make your contribution as smooth as possible.

There are 4 steps to start this project:
- [Build the project](#build)
- (Optional) [Start a test instance of Home Assistant](#start-hass)
- (Optional) [Use a test instance of Home Assistant](#use-hass)
- (Optional) [Use your real Home Assistant instance](#use-real-hass)
- (Optional) [Run the tests](#test)

-----

## How to build the project {#build}
There are different ways to run the project based on your preferences.

### Using Docker {#build-docker}
Docker is the official and supported way to run the project. It is also the easiest to get started.

On the root of this repository, run the following command:
```bash
docker compose up
```

This will start the project and expose port `3000`.
The compiled `swipe-navigation.js` file at `http://localhost:3000/swipe-navigation.js`.
The files is continuously compiled as you make changes to the source code.

Now go to [start a test instance of Home Assistant with Docker](#start-hass-docker) or [use your own real installation of Home Assistant](#use-real-hass).

### Native compilation {#build-native}
Open a terminal in the root of this repository and run
```bash
./scripts/build.sh --serve
```
to enable the continuous compilation of the source code.

The compiled `swipe-navigation.js` file at `http://localhost:3000/swipe-navigation.js`.

Now go to [start a test instance of Home Assistant for native compilation](#start-hass-native) or [use your own real installation of Home Assistant](#use-real-hass).

-----

## Start a test instance of Home Assistant {#start-hass}

### Using Docker {#start-hass-docker}
If you used [Docker compilation](#build-docker), the test instance of Home Assistant is already running on port `8123`.

Now go to [use a test instance of Home Assistant](#use-hass).

### Native compilation {#start-hass-native}
If you used [native compilation](#build-native), you need to start the test instance of Home Assistant manually.
Open a new terminal in the root of the project and run
```bash
docker compose up hass
```
to start the test instance of Home Assistant.

Now go to [use a test instance of Home Assistant](#use-hass).

-----

## Use a test instance of Home Assistant {#use-hass}
You can access the test instance of Home Assistant at `http://localhost:8123`.
- Default credentials are
  - username: `user`
  - password: `pass`

This test instance is already configured to use the compiled `swipe-navigation.js` file.

Remember to enable to "mobile" mode in your browser to simulate touch events, unless you have a native touch display of course.
Remember also to disable the network cache in your browser to make sure you are using the latest version of the compiled `swipe-navigation.js` file.

-----

## Use your own real installation of Home Assistant {#use-real-hass}
If you prefer to use your own real installation of Home Assistant, you can do so by following these steps:
- Remove the official plugin from HACS (or any other place you installed it from)
- Add the resource in the Home Assistant UI: _Settings_ → _Dashboards_ → _More Options icon_ → _Resources_ → _Add resource_ → Set _URL_ as `http://localhost:3000/swipe-navigation.js` → Set _Resource type_ as `JavaScript module`.
- Remember also to disable the network cache in your browser to make sure you are using the latest version of the compiled `swipe-navigation.js` file.
- Remember to remove the resource when you are done.

-----

## Run the tests {#test}

### Using Docker
To run tests use the following command:
```bash
docker compose -f docker-compose.yml -f docker-compose.test.yml up --exit-code-from tester
```

### Native compilation
[Ensure that you are serving `swipe-navigation.js`](#build-native).
[Ensure that the test instance of Home Assistant is running](#start-hass-native).

Open a terminal in the root of this repository and run
```bash
./scripts/run-playwright.sh
```
to run the tests.

-----

## Troubleshooting
If the compiled code doesn't update, try to delete the `/dist/` folder.
